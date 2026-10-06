import { Ajv } from 'ajv';
import { buildTile, verifyTileIntegrity, type ObservationPayload, type TileEnvelope } from '@entif-ai/rosetta-core';
import { isProfileTimestamp } from '@entif-ai/rosetta-schemas';
import { verifySignedReceipt, type SignedReceiptEnvelope } from '@entif-ai/rosetta-receipts';
import type { AuthorityActorResolver } from './authority-state.js';

/** A controlled workload assertion, authenticated with the existing signed Receipt primitive. */
export interface WorkloadActorAssertion {
  subjectRef: string; issuerRef: string; keyId: string; sessionRef: string; workloadRef: string;
  sourceFrontierRef: string; methodRef: 'rrp.ed25519-receipt.v1';
  issuedAt: string; notBefore: string; expiresAt: string;
}
export interface WorkloadActorAssertionObservation extends ObservationPayload { actorAssertion: WorkloadActorAssertion }
export interface ActorTrustAnchor { issuerRef: string; keyId: string; publicKeyPem: string; anchorRef: string }
export interface ActorRuntimeBinding { sessionRef: string; workloadRef: string; sourceFrontierRef: string }
export interface AuthenticatedActorEvidencePayload extends ObservationPayload {
  actorEvidence: WorkloadActorAssertion & { authenticationEvidenceRefs: string[] };
}
const ref = { type: 'string', minLength: 1, maxLength: 2048, pattern: '\\S' };
const timestamp = { type: 'string', format: 'date-time' };
const ajv = new Ajv({ ownProperties: true }); ajv.addFormat('date-time', isProfileTimestamp);
const properties = { subjectRef: ref, issuerRef: ref, keyId: ref, sessionRef: ref, workloadRef: ref, sourceFrontierRef: ref,
  methodRef: { const: 'rrp.ed25519-receipt.v1' }, issuedAt: timestamp, notBefore: timestamp, expiresAt: timestamp };
const validAssertion = ajv.compile<WorkloadActorAssertion>({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });
function validInterval(value: WorkloadActorAssertion) { return Date.parse(value.notBefore) < Date.parse(value.expiresAt) && Date.parse(value.issuedAt) < Date.parse(value.expiresAt); }

export function createWorkloadActorAssertion(input: WorkloadActorAssertion): TileEnvelope<WorkloadActorAssertionObservation> {
  if (!validAssertion(input) || !validInterval(input)) throw new Error('UNAUTHENTICATED_ACTOR_ASSERTION');
  return buildTile('rosetta.observation', { observationId: `${input.issuerRef}:${input.subjectRef}:${input.issuedAt}`,
    source: input.issuerRef, signal: 'Authenticated workload assertion', actorAssertion: structuredClone(input) });
}

/** NOT_AGENT_FACING. Trust anchors and runtime bindings are injected by the owning authenticator,
 * never by a task/prompt. This bounded in-process reference source is not a universal IdP or a
 * replacement for #703/#1077/#96/#1296. A signed historical receipt is checked against live state.
 */
export class SignedActorEvidenceRegistry implements AuthorityActorResolver {
  private readonly anchors: ActorTrustAnchor[];
  private readonly binding: ActorRuntimeBinding;
  private readonly entries = new Map<string, TileEnvelope<AuthenticatedActorEvidencePayload>>();
  private readonly revoked = new Set<string>();
  private readonly revokedIssuers = new Set<string>();
  private revision = 0;
  private frontierRef = 'urn:rosetta:actor-evidence:empty';
  constructor(anchors: ActorTrustAnchor[], binding: ActorRuntimeBinding) {
    if (new Set(anchors.map(value => `${value.issuerRef}:${value.keyId}`)).size !== anchors.length) throw new Error('AMBIGUOUS_ACTOR_TRUST_ANCHOR');
    this.anchors = structuredClone(anchors); this.binding = structuredClone(binding);
  }
  private advance(event: object) {
    const observation = buildTile('rosetta.observation', { observationId: `actor-source:${this.revision + 1}`,
      source: 'urn:rosetta:signed-workload-source', signal: 'Actor source current-state change', actorSource: { revision: this.revision + 1, event } },
      { parents: this.revision ? [this.frontierRef] : [] });
    this.revision++; this.frontierRef = observation.cid;
    return observation;
  }
  bind(assertionInput: unknown, signedInput: unknown): TileEnvelope<AuthenticatedActorEvidencePayload> {
    let assertion: TileEnvelope<WorkloadActorAssertionObservation>; let signed: SignedReceiptEnvelope;
    try {
      if (Buffer.byteLength(JSON.stringify([assertionInput, signedInput])) > 262_144) throw new Error();
      assertion = assertionInput as typeof assertion; signed = signedInput as typeof signed;
      if (assertion.kind !== 'rosetta.observation' || !verifyTileIntegrity(assertion).ok ||
        !validAssertion(assertion.payload.actorAssertion) || !validInterval(assertion.payload.actorAssertion) ||
        assertion.payload.source !== assertion.payload.actorAssertion.issuerRef || assertion.payload.signal !== 'Authenticated workload assertion' ||
        Object.keys(assertion.payload).some(key => !['source', 'signal', 'observationId', 'actorAssertion'].includes(key)) ||
        signed.signature.algorithm !== 'ed25519' || signed.receipt.kind !== 'rosetta.receipt' || !verifySignedReceipt(signed).ok) throw new Error();
    } catch { throw new Error('UNAUTHENTICATED_ACTOR_ASSERTION'); }
    const value = assertion.payload.actorAssertion;
    const anchor = this.anchors.find(a => a.issuerRef === value.issuerRef && a.keyId === value.keyId);
    if (!anchor || signed.signature.keyId !== anchor.keyId || signed.signature.publicKeyPem !== anchor.publicKeyPem) throw new Error('UNTRUSTED_ACTOR_ISSUER');
    const receipt = signed.receipt.payload;
    if (receipt.receiptType !== 'authz.actor-authentication.v1' || !receipt.policyRefs.includes(anchor.anchorRef) ||
      receipt.subjects.length !== 1 || receipt.subjects[0].cid !== assertion.cid ||
      receipt.claims.length !== 1 || receipt.claims[0].claimType !== 'authz.actor-authentication' || receipt.claims[0].verdict !== 'pass' ||
      receipt.claims[0].evidence.length !== 1 || receipt.claims[0].evidence[0].cid !== assertion.cid) throw new Error('ACTOR_ASSERTION_CLOSURE_MISMATCH');
    const evidence = buildTile<AuthenticatedActorEvidencePayload>('rosetta.observation', { observationId: assertion.cid,
      source: value.issuerRef, signal: 'Authenticated actor evidence', actorEvidence: { ...value, authenticationEvidenceRefs: [assertion.cid, signed.receipt.cid, anchor.anchorRef] } },
      { parents: [assertion.cid, signed.receipt.cid] });
    if (!this.entries.has(evidence.cid)) { this.entries.set(evidence.cid, evidence); this.advance({ type: 'bind', evidenceRef: evidence.cid }); }
    return structuredClone(evidence);
  }
  revoke(evidenceRef: string, revocationRef: string) {
    if (!this.entries.has(evidenceRef) || !revocationRef.trim()) throw new Error('ACTOR_EVIDENCE_UNRESOLVED');
    this.revoked.add(evidenceRef); return this.advance({ type: 'revoke', evidenceRef, revocationRef });
  }
  revokeIssuer(issuerRef: string, invalidityRef: string) {
    if (!this.anchors.some(a => a.issuerRef === issuerRef) || !invalidityRef.trim()) throw new Error('UNTRUSTED_ACTOR_ISSUER');
    this.revokedIssuers.add(issuerRef); return this.advance({ type: 'issuer-invalidity', issuerRef, invalidityRef });
  }
  evidence() { return [...this.entries.values()].map(value => structuredClone(value)); }
  resolve(subjectRef: string, refs: string[], now: string) {
    const status = { revision: this.revision, frontierRef: this.frontierRef };
    const deny = (code: string) => ({ ...status, ok: false, evidenceRefs: [], reasonCodes: [code] });
    if (!isProfileTimestamp(now) || refs.length > 256) return deny('UNINTERPRETABLE_ACTOR_QUERY');
    for (const ref of refs) {
      const evidence = this.entries.get(ref); if (!evidence) return deny('ACTOR_EVIDENCE_UNRESOLVED');
      const value = evidence.payload.actorEvidence;
      if (this.revoked.has(ref)) return deny('ACTOR_EVIDENCE_REVOKED');
      if (this.revokedIssuers.has(value.issuerRef)) return deny('ACTOR_ISSUER_REVOKED');
      if (value.subjectRef !== subjectRef) return deny('ACTOR_SUBJECT_MISMATCH');
      if (value.sessionRef !== this.binding.sessionRef || value.workloadRef !== this.binding.workloadRef) return deny('ACTOR_BINDING_MISMATCH');
      if (value.sourceFrontierRef !== this.binding.sourceFrontierRef) return deny('ACTOR_EVIDENCE_STALE');
      if (Date.parse(now) < Math.max(Date.parse(value.issuedAt), Date.parse(value.notBefore))) return deny('ACTOR_EVIDENCE_NOT_YET_VALID');
      if (Date.parse(now) >= Date.parse(value.expiresAt)) return deny('ACTOR_EVIDENCE_EXPIRED');
    }
    return { ...status, ok: true, evidenceRefs: [...new Set(refs)], reasonCodes: [] };
  }
}
