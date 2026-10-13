import { buildTile, verifyTileIntegrity, type ObservationPayload, type TileEnvelope } from '@entif-ai/rosetta-core';
import { createLifecycleReceipt, verifySignedReceipt, type SignedReceiptEnvelope } from '@entif-ai/rosetta-receipts';
import { LocalAuthorityState, parseAuthorityStateEvent, type AuthorityActorResolver, type AuthorityFact, type AuthorityStateEvent } from './authority-state.js';
import type { ActorTrustAnchor } from './actor-evidence.js';
import type { EffectiveAuthorityRequest } from './effective-authority.js';
import { AdmissionClosureError, createAdmissionProposal, resolveWriteAuthorization, type AdmissionProposal, type LocalWriteAdmission, type WriteAuthorization, type WriteAdmissionResult } from './write-admission.js';
import type { WorkflowPolicyGateRequest } from './rosetta-guard.js';

export interface RootSourceConfiguration { sourceRef: string; anchor: ActorTrustAnchor; root: AuthorityFact }
export interface RootSourceProof { observation: TileEnvelope<ObservationPayload & { authorityRoot: AuthorityFact }>; signedReceipt: SignedReceiptEnvelope }
/** An independently installed operator configuration is authority; the signed Receipt authenticates
 * its witness only. A signer/identity/Receipt alone never grants powers. Model input cannot install it.
 * #1758 is reused for real current resolution of this bounded reference source, not fixture snapshots.
 */
export class ConfiguredRootAuthoritySource {
  private readonly storage: LocalAuthorityState;
  private readonly configuration: RootSourceConfiguration;
  private readonly proof: RootSourceProof;
  constructor(directory: string, configuration: RootSourceConfiguration, proof: RootSourceProof, actors?: AuthorityActorResolver) {
    try {
      parseAuthorityStateEvent({ id: configuration.sourceRef, type: 'fact', fact: configuration.root });
      const { anchor, root } = configuration; const receipt = proof.signedReceipt;
      if (root.parentRef !== null || proof.observation.kind !== 'rosetta.observation' || !verifyTileIntegrity(proof.observation).ok ||
        Object.keys(proof.observation.payload).some(key => !['observationId', 'source', 'signal', 'authorityRoot'].includes(key)) ||
        proof.observation.payload.source !== anchor.issuerRef || !isDeepStrictEqual(proof.observation.payload.authorityRoot, root) ||
        receipt.signature.algorithm !== 'ed25519' || receipt.signature.keyId !== anchor.keyId || receipt.signature.publicKeyPem !== anchor.publicKeyPem || !verifySignedReceipt(receipt).ok ||
        receipt.receipt.payload.receiptType !== 'authz.root-source-attestation.v1' || !receipt.receipt.payload.policyRefs.includes(anchor.anchorRef) ||
        receipt.receipt.payload.subjects.length !== 1 || receipt.receipt.payload.subjects[0].cid !== proof.observation.cid ||
        receipt.receipt.payload.claims.length !== 1 || receipt.receipt.payload.claims[0].claimType !== 'authz.root-source-attestation' || receipt.receipt.payload.claims[0].verdict !== 'pass' ||
        receipt.receipt.payload.claims[0].evidence.length !== 1 || receipt.receipt.payload.claims[0].evidence[0].cid !== proof.observation.cid) throw new Error();
    } catch { throw new Error('UNTRUSTED_ROOT_SOURCE'); }
    this.configuration = structuredClone(configuration); this.proof = structuredClone(proof);
    this.storage = new LocalAuthorityState(directory, actors);
    // Installing the already-authoritative pinned source is separate from mutations of target state.
    // Restart reconciles these exact immutable source records; it never erases later invalidity.
    for (const event of [
      { id: `${configuration.sourceRef}:policy`, type: 'policy' as const, policy: configuration.root.policy },
      { id: `${configuration.sourceRef}:root`, type: 'fact' as const, fact: configuration.root }
    ]) {
      const prior = this.storage.findMutation(event.id);
      if (prior && !isDeepStrictEqual(prior.observation.payload.authorityState.event, event)) throw new Error('ROOT_SOURCE_CONFIGURATION_MISMATCH');
      if (!prior) this.storage.append(event, this.storage.inspect().revision);
    }
  }
  get root() { return structuredClone(this.configuration.root); }
  evidence(): TileEnvelope[] { return [this.proof.observation, this.proof.signedReceipt.receipt, ...this.storage.observations()].map(tile => structuredClone(tile)); }
  validateRootGrant(fact: AuthorityFact) {
    this.storage.previewAppend({ id: `preview:${fact.ref}`, type: 'fact', fact: { ...fact, parentRef: this.root.ref } }, this.storage.inspect().revision);
  }
  authorize(p: AdmissionProposal, now: string, gates: EffectiveAuthorityRequest['gates'], workflow: WorkflowPolicyGateRequest) {
    return resolveWriteAuthorization(this.storage, { query: { authorityRefs: [this.root.ref], subjectRef: p.intent.subjectRef, now }, operation: p.intent.operation,
      effect: p.intent.effect, target: p.intent.target, context: {}, providerCapabilities: [this.root.scope], ceilings: [], gates, intentRefs: [p.action.cid] }, p, workflow);
  }
}
export interface AuthorityMutationRequest { event: AuthorityStateEvent; authorizerRef?: string }
export interface AuthorityMutationResult {
  status: WriteAdmissionResult['status'] | 'reconciled' | 'safe-hold'; revision: number; frontierRef: string;
  eventRef: string | null; receiptRef: string | null; reasonCodes: string[];
}
export interface AuthorityMutationOptions { subjectRef: string; now(): string; workflow: WorkflowPolicyGateRequest; gates: EffectiveAuthorityRequest['gates'] }
function operation(event: AuthorityStateEvent) {
  if (event.type === 'policy') return 'authority.policy-update';
  if (event.type === 'fact') return event.fact.parentRef === null ? 'authority.grant' : 'authority.delegate';
  return event.state === 'revoked' ? 'authority.revoke' : event.state === 'invalid' ? 'authority.invalidate' : 'authority.supersede';
}
function denied(auth: WriteAuthorization, reason: string): WriteAuthorization {
  return { ...auth, iamDecision: undefined, evaluation: buildTile('rosetta.evaluation', { ...auth.evaluation.payload, effect: 'deny', verdict: 'deny', reasonCodes: [reason] }, { parents: [auth.evaluation.cid] }) };
}

/** NOT_AGENT_FACING. This owner admits all target authority changes through #994/#1765.
 * It never treats proposed authority, task claims, old decisions, or credentials as mutation authority.
 */
export class GovernedAuthorityMutator {
  constructor(private readonly state: LocalAuthorityState, private readonly rootSource: ConfiguredRootAuthoritySource,
    private readonly admission: LocalWriteAdmission, private readonly options: AuthorityMutationOptions) {}
  private acknowledge(event: AuthorityStateEvent, eventRef: string, receiptRef: string) {
    this.admission.journal.persist(buildTile('rosetta.observation', { observationId: `ack:${event.id}`, source: 'urn:rosetta:authority-mutation', signal: 'Mutation acknowledgement reconciler',
      mutationAck: { eventRef, receiptRef } }, { parents: [eventRef, receiptRef] }));
  }
  /** Reconstruct closure only from an already-persisted successful check and measured readback.
   * Missing checkpoint/readback/check remains held. This operation never appends authority.
   */
  private reconcileReceipt(event: AuthorityStateEvent, eventRef: string): string | null {
    const all = this.admission.journal.all(); const byCid = new Map(all.map(tile => [tile.cid, tile]));
    const readback = all.find(tile => (tile.payload as { mutationReadback?: { eventRef: string } }).mutationReadback?.eventRef === eventRef);
    if (!readback) return null;
    const action = byCid.get((readback.payload as { writeObservation: { proposalRef: string } }).writeObservation.proposalRef);
    const value = (action?.payload as { runCid?: string; writeIntent?: { value?: { event?: unknown; expectedRevision?: number } } } | undefined);
    if (!action || action.kind !== 'rosetta.action' || !isDeepStrictEqual(value?.writeIntent?.value?.event, event)) return null;
    const run = byCid.get(value?.runCid ?? ''); const checkpointRef = (readback.payload as { mutationReadback: { checkpointRef: string } }).mutationReadback.checkpointRef;
    const checkpoint = byCid.get(checkpointRef); if (!run || !checkpoint || (checkpoint.payload as { admissionCheckpoint?: { proposalRef: string } }).admissionCheckpoint?.proposalRef !== action.cid) return null;
    const check = all.find(tile => tile.kind === 'rosetta.evaluation' && tile.parents.includes(action.cid) && tile.parents.includes(readback.cid) &&
      (tile.payload as { admission?: { status: string; effect: string } }).admission?.status === 'pass' && (tile.payload as { admission: { effect: string } }).admission.effect === 'committed');
    if (!check || check.parents.some(cid => !byCid.has(cid))) return null;
    const receipt = createLifecycleReceipt({ run, step: action, artifacts: check.parents.filter(cid => cid !== action.cid).map(cid => byCid.get(cid)!), check, policies: [], outcome: 'pass', statement: 'Write admission pass; target effect committed.' });
    this.admission.journal.persist(receipt); this.acknowledge(event, eventRef, receipt.cid); return receipt.cid;
  }
  async mutate(input: unknown): Promise<AuthorityMutationResult> {
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => !['event', 'authorizerRef'].includes(k))) throw new Error('UNINTERPRETABLE_AUTHORITY_EVENT');
    const request = input as AuthorityMutationRequest; const event = parseAuthorityStateEvent(request.event);
    if (request.authorizerRef !== undefined && (typeof request.authorizerRef !== 'string' || !request.authorizerRef.trim())) throw new Error('UNINTERPRETABLE_AUTHORITY_EVENT');
    const initial = this.state.inspect(); const prior = this.state.findMutation(event.id);
    const response = (status: AuthorityMutationResult['status'], receiptRef: string | null, reasonCodes: string[], eventRef: string | null = null): AuthorityMutationResult => {
      const current = this.state.inspect(); return { status, revision: current.revision, frontierRef: current.frontierRef, receiptRef, reasonCodes, eventRef };
    };
    if (prior && isDeepStrictEqual(prior.observation.payload.authorityState.event, event)) {
      const ack = this.admission.journal.all().find(tile => (tile.payload as { mutationAck?: { eventRef: string } }).mutationAck?.eventRef === prior.frontierRef);
      if (!ack) {
        const receiptRef = this.reconcileReceipt(event, prior.frontierRef);
        return receiptRef ? response('reconciled', receiptRef, ['PRIOR_EFFECT_RECONCILED'], prior.frontierRef) : response('safe-hold', null, ['MUTATION_ACKNOWLEDGEMENT_UNKNOWN'], prior.frontierRef);
      }
      const ref = (ack.payload as { mutationAck: { receiptRef: string } }).mutationAck.receiptRef;
      const receipt = this.admission.journal.read(ref); if (receipt.kind !== 'rosetta.receipt') throw new Error('MUTATION_ACKNOWLEDGEMENT_INVALID');
      return response('reconciled', ref, ['PRIOR_EFFECT_RECONCILED'], prior.frontierRef);
    }
    const rootOperation = event.type === 'policy' || (event.type === 'fact' && event.fact.parentRef === null);
    const parentRef = event.type === 'fact' ? event.fact.parentRef : request.authorizerRef;
    const target = event.type === 'fact' ? event.fact.scope.target : event.type === 'policy' ? this.rootSource.root.scope.target : initial.facts.find(f => f.ref === event.ref)?.scope.target;
    if (!target) return response('deny', null, ['AUTHORITY_SOURCE_NOT_FOUND']);
    let appliedRef: string | null = null;
    try {
      const result = await this.admission.execute({ id: event.id, subjectRef: this.options.subjectRef, operation: operation(event), effect: 'local-write', target,
        value: { event, expectedRevision: initial.revision, expectedFrontierRef: initial.frontierRef } }, {
        normalize: createAdmissionProposal,
        authorize: p => {
          const now = this.options.now(); const auth = rootOperation ? this.rootSource.authorize(p, now, this.options.gates, this.options.workflow) :
            resolveWriteAuthorization(this.state, { query: { authorityRefs: parentRef ? [parentRef] : [], subjectRef: this.options.subjectRef, now },
              operation: p.intent.operation, effect: 'local-write', target, context: {}, providerCapabilities: [this.rootSource.root.scope], ceilings: [], gates: this.options.gates, intentRefs: [p.action.cid] }, p, this.options.workflow);
          if (auth.evaluation.payload.effect !== 'allow') return auth;
          try {
            const current = this.state.inspect(); if (current.revision !== initial.revision || current.frontierRef !== initial.frontierRef) throw new Error('AUTHORITY_REVISION_CONFLICT');
            if (event.type === 'policy' && !isDeepStrictEqual(event.policy, this.rootSource.root.policy)) throw new Error('POLICY_FRONTIER_MISMATCH');
            if (event.type === 'fact' && event.fact.parentRef === null) this.rootSource.validateRootGrant(event.fact);
            if (event.type === 'fact' && event.fact.parentRef !== null && request.authorizerRef && request.authorizerRef !== event.fact.parentRef) throw new Error('AUTHORITY_PARENT_MISMATCH');
            this.state.previewAppend(event, initial.revision);
            return auth;
          } catch (error) {
            const code = error instanceof Error && /^[A-Z_]{3,80}$/.test(error.message) ? error.message : 'AUTHORITY_MUTATION_REFUSED';
            this.admission.journal.persist(auth.evaluation); return denied(auth, code);
          }
        },
        ground: (p, a) => {
          const sources = [...this.rootSource.evidence(), ...this.state.observations()];
          for (const tile of sources) this.admission.journal.persist(tile);
          if (!sources.some(tile => tile.cid === a.frontierRef)) throw new Error('AUTHORITY_SOURCE_UNRESOLVED');
          return buildTile('rosetta.observation', { observationId: `ground:${event.id}`, source: 'urn:rosetta:authority-mutation', signal: 'Current authority and target frontier grounded',
            admissionGrounding: { proposalRef: p.action.cid, frontierRef: a.frontierRef, sourceRefs: sources.map(t => t.cid), targetFrontierRef: initial.frontierRef } }, { parents: [p.action.cid, a.frontierRef] });
        },
        apply: (_p, _a, checkpoint) => {
          this.admission.journal.read(checkpoint.cid); const result = this.state.append(event, initial.revision); appliedRef = result.frontierRef;
          return { result, checkpointRef: checkpoint.cid };
        },
        observe: (p, value) => {
          const applied = value as { result: { frontierRef: string }; checkpointRef: string }; const observed = this.state.findMutation(event.id);
          if (!observed || observed.frontierRef !== applied.result.frontierRef || !isDeepStrictEqual(observed.observation.payload.authorityState.event, event)) throw new Error('AUTHORITY_READBACK_MISMATCH');
          this.admission.journal.persist(observed.observation);
          return buildTile('rosetta.observation', { observationId: `readback:${event.id}`, source: 'urn:rosetta:authority-mutation', signal: 'Authority mutation read back',
            writeObservation: { proposalRef: p.action.cid, matched: true }, mutationReadback: { eventRef: observed.frontierRef, checkpointRef: applied.checkpointRef } },
            { parents: [observed.frontierRef, applied.checkpointRef, p.action.cid] });
        },
        project: receipt => this.admission.journal.persist(buildTile('rosetta.observation', { observationId: `queue:${receipt.cid}`, source: 'urn:rosetta:authority-mutation', signal: 'Projection queued', projectionJob: { receiptRef: receipt.cid, adapterRef: 'urn:projection:authority-reference' } }, { parents: [receipt.cid] })).cid
      });
      if (result.status === 'pass' && appliedRef) this.acknowledge(event, appliedRef, result.receipt.cid);
      return response(result.status, result.receipt.cid, result.reasonCodes, appliedRef);
    } catch (error) {
      if (error instanceof AdmissionClosureError) return response('safe-hold', null, ['MUTATION_ACKNOWLEDGEMENT_UNKNOWN'], appliedRef);
      throw new Error('MUTATION_ACKNOWLEDGEMENT_UNKNOWN');
    }
  }
}
import { isDeepStrictEqual } from 'node:util';
