import { createHash } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { Ajv } from 'ajv';
import { buildTile, type ObservationPayload, type TileEnvelope } from '@entif-ai/rosetta-core';
import { AUTHORITY_ENVELOPE_SCHEMA, isProfileTimestamp, parseAuthorityEnvelope, type AuthorityScope } from '@entif-ai/rosetta-schemas';
import { authorizeCurrentOperation, type CurrentAuthorityOperation, type LocalAuthorityState } from './authority-state.js';
import type { EffectiveAuthorityRequest } from './effective-authority.js';
import { AdmissionClosureError, createAdmissionProposal, resolveWriteAuthorization, type AdmissionProposal, type LocalWriteAdmission, type WriteAuthorization, type WriteAdmissionResult } from './write-admission.js';
import type { WorkflowPolicyGateRequest } from './rosetta-guard.js';

export interface ProviderSnapshot { effectCount: number; stateDigest: string }
export interface CredentialProviderAdapter {
  execute(input: { id: string; operation: string; target: AuthorityScope['target']; credential: string }): void | Promise<void>;
  inspect(): ProviderSnapshot;
}
export interface ProviderCredentialMetadata {
  providerRef: string; accountRef: string; credentialHandle: string; target: AuthorityScope['target']; capabilities: AuthorityScope[]; expiresAt: string; revoked: boolean;
}
export interface CredentialProviderBinding { metadata(): ProviderCredentialMetadata; resolveSecret(): string; adapter: CredentialProviderAdapter }
export interface CredentialMediatorOptions extends Pick<EffectiveAuthorityRequest, 'context' | 'ceilings' | 'gates'> {
  authorityRefs: string[]; subjectRef: string; target: AuthorityScope['target']; operations: string[]; providerRef: string; accountRef: string;
  now(): string; workflow: WorkflowPolicyGateRequest;
}
export interface CredentialExecutionIntent { id: string; operation: string; minimumRevision?: number; submittedEnvelope?: unknown; evidenceRefs?: string[] }
export interface MediatedExecutionResult {
  code: string; effect: WriteAdmissionResult['effect']; revision: number; frontierRef: string; admission?: WriteAdmissionResult;
}
const ref = { type: 'string', minLength: 1, maxLength: 2048, pattern: '\\S' };
const refs = { type: 'array', maxItems: 32, items: ref, uniqueItems: true };
const ajv = new Ajv({ ownProperties: true }); ajv.addFormat('date-time', isProfileTimestamp); ajv.addSchema(AUTHORITY_ENVELOPE_SCHEMA);
const validIntent = ajv.compile<CredentialExecutionIntent>({ type: 'object', additionalProperties: false, required: ['id', 'operation'], properties: {
  id: ref, operation: ref, minimumRevision: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER }, submittedEnvelope: {}, evidenceRefs: refs } });
const metadataProperties = { providerRef: ref, accountRef: ref, credentialHandle: ref,
  target: { $ref: `${AUTHORITY_ENVELOPE_SCHEMA.$id}#/properties/scope/properties/target` }, capabilities: { type: 'array', minItems: 1, maxItems: 32, items: { $ref: `${AUTHORITY_ENVELOPE_SCHEMA.$id}#/properties/scope` } },
  expiresAt: { type: 'string', format: 'date-time' }, revoked: { type: 'boolean' } };
const validMetadata = ajv.compile<ProviderCredentialMetadata>({ type: 'object', additionalProperties: false, properties: metadataProperties, required: Object.keys(metadataProperties) });
export class ProviderExecutionError extends Error {
  constructor(readonly code: 'PROVIDER_AUTH_FAILURE' | 'PROVIDER_INSUFFICIENT_SCOPE') { super(code); }
}
function refusal(auth: WriteAuthorization, code: string): WriteAuthorization {
  return { ...auth, iamDecision: undefined, evaluation: buildTile('rosetta.evaluation', { ...auth.evaluation.payload, verdict: 'deny', effect: 'deny', reasonCodes: [code] }, { parents: [auth.evaluation.cid] }) };
}

/** WRAP_EXISTING_INTERFACE: bounded provider operations consume current authority plus #994.
 * Lifecycle metadata/secret resolution belong to the provider owner (#776 where applicable).
 * No transport accepts bindings, credentials, gates, startup policy or source snapshots from agents.
 */
export class LocalCredentialMediator {
  constructor(private readonly state: LocalAuthorityState, private readonly admission: LocalWriteAdmission,
    private readonly binding: CredentialProviderBinding, private readonly options: CredentialMediatorOptions) {
    if (!options.operations.length || options.operations.length > 16 || new Set(options.operations).size !== options.operations.length) throw new Error('UNBOUNDED_PROVIDER_INTERFACE');
  }
  private metadata() {
    const value = this.binding.metadata(); if (!validMetadata(value)) throw new Error('PROVIDER_BINDING_MISMATCH'); return structuredClone(value);
  }
  private credentialStatus(meta: ProviderCredentialMetadata) {
    if (meta.providerRef !== this.options.providerRef || meta.accountRef !== this.options.accountRef || !isDeepStrictEqual(meta.target, this.options.target)) return 'PROVIDER_BINDING_MISMATCH';
    if (meta.revoked) return 'PROVIDER_CREDENTIAL_REVOKED';
    if (Date.parse(this.options.now()) >= Date.parse(meta.expiresAt)) return 'PROVIDER_CREDENTIAL_EXPIRED';
    return null;
  }
  private operation(intent: CredentialExecutionIntent, meta: ProviderCredentialMetadata, intentRefs: string[]): CurrentAuthorityOperation {
    return { query: { authorityRefs: this.options.authorityRefs, subjectRef: this.options.subjectRef, now: this.options.now(), minimumRevision: intent.minimumRevision },
      operation: intent.operation, effect: 'external-write', target: this.options.target, context: this.options.context, providerCapabilities: meta.capabilities,
      ceilings: this.options.ceilings, gates: this.options.gates, intentRefs, ...(intent.submittedEnvelope !== undefined ? { submittedEnvelope: intent.submittedEnvelope } : {}) };
  }
  discover(): { operations: string[]; revision: number; frontierRef: string; discovery: TileEnvelope<ObservationPayload> } {
    const meta = this.metadata(); const current = this.state.inspect();
    const operations = this.credentialStatus(meta) ? [] : this.options.operations.filter(operation => authorizeCurrentOperation(this.state, this.operation({ id: 'discovery', operation }, meta, [])).evaluation.payload.effect === 'allow');
    const discovery = buildTile('rosetta.observation', { observationId: `discovery:${current.frontierRef}`, source: 'urn:rosetta:credential-mediator', signal: 'Current bounded operation discovery',
      toolDiscovery: { revision: current.revision, frontierRef: current.frontierRef, operations, authorityRole: 'discovery-evidence' } });
    this.admission.journal.persist(discovery); return { operations, revision: current.revision, frontierRef: current.frontierRef, discovery };
  }
  async execute(input: unknown): Promise<MediatedExecutionResult> {
    if (!validIntent(input) || Buffer.byteLength(JSON.stringify(input)) > 131_072 || !this.options.operations.includes(input.operation)) throw new Error('UNINTERPRETABLE_EXECUTION_INTENT');
    const intent = structuredClone(input); let badSubmission = false;
    if (Object.hasOwn(intent, 'submittedEnvelope')) { try { parseAuthorityEnvelope(intent.submittedEnvelope); } catch { badSubmission = true; } }
    let failureCode: string | undefined; let before: ProviderSnapshot | undefined;
    const authorize = (p: AdmissionProposal) => {
      const meta = this.metadata(); const op = this.operation(intent, meta, [p.action.cid, ...(intent.evidenceRefs ?? [])]);
      // Unsupported submissions are evidence of refusal, never copied into public artifacts.
      if (badSubmission) delete op.submittedEnvelope;
      const auth = resolveWriteAuthorization(this.state, op, p, this.options.workflow);
      if (auth.evaluation.payload.effect !== 'allow') return auth;
      if (badSubmission) return refusal(auth, 'UNINTERPRETABLE_SUBMITTED_AUTHORITY');
      const code = this.credentialStatus(meta); return code ? refusal(auth, code) : auth;
    };
    let result: WriteAdmissionResult;
    try {
      result = await this.admission.execute({ id: intent.id, operation: intent.operation, effect: 'external-write', target: this.options.target, subjectRef: this.options.subjectRef, value: { executionId: intent.id } }, {
        normalize: createAdmissionProposal, authorize,
        ground: (p, a) => {
          const sources = this.state.observations(); if (!sources.some(tile => tile.cid === a.frontierRef)) throw new Error('CURRENT_SOURCE_UNRESOLVED');
          for (const source of sources) this.admission.journal.persist(source);
          const meta = this.metadata();
          return buildTile('rosetta.observation', { observationId: `provider-ground:${intent.id}`, source: 'urn:rosetta:credential-mediator', signal: 'Current authority and provider binding grounded',
            admissionGrounding: { proposalRef: p.action.cid, frontierRef: a.frontierRef, sourceRefs: sources.map(tile => tile.cid) },
            credentialBinding: { providerRef: meta.providerRef, accountRef: meta.accountRef, credentialHandle: meta.credentialHandle, target: meta.target, capabilities: meta.capabilities } }, { parents: [p.action.cid, a.frontierRef] });
        },
        apply: (p, a) => {
          const meta = this.metadata(); const fresh = authorize(p);
          this.admission.journal.persist(fresh.evaluation);
          if (fresh.evaluation.payload.effect !== 'allow' || fresh.revision !== a.revision || fresh.frontierRef !== a.frontierRef) { failureCode = 'ENTIF_AUTHORITY_DENIED'; throw new Error('CURRENT_AUTHORITY_REFUSED'); }
          const code = this.credentialStatus(meta); if (code) { failureCode = code; throw new Error(code); }
          before = this.binding.adapter.inspect(); let credential: string;
          try { credential = this.binding.resolveSecret(); } catch { failureCode = 'PROVIDER_AUTH_FAILURE'; throw new Error('PROVIDER_AUTH_FAILURE'); }
          if (typeof credential !== 'string' || !credential) { failureCode = 'PROVIDER_AUTH_FAILURE'; throw new Error('PROVIDER_AUTH_FAILURE'); }
          const latestMeta = this.metadata(); const final = authorizeCurrentOperation(this.state, this.operation(intent, latestMeta, [p.action.cid]));
          this.admission.journal.persist(final.evaluation);
          if (final.evaluation.payload.effect !== 'allow' || final.revision !== a.revision || final.frontierRef !== a.frontierRef) { failureCode = 'ENTIF_AUTHORITY_DENIED'; throw new Error('CURRENT_AUTHORITY_REFUSED'); }
          const finalCredentialStatus = this.credentialStatus(latestMeta); if (finalCredentialStatus) { failureCode = finalCredentialStatus; throw new Error(finalCredentialStatus); }
          try {
            const effect = this.binding.adapter.execute({ id: intent.id, operation: intent.operation, target: this.options.target, credential });
            if (effect instanceof Promise) return effect.catch(error => { failureCode = error instanceof ProviderExecutionError ? error.code : 'PROVIDER_AUTH_FAILURE'; throw new Error(failureCode); });
            return effect;
          } catch (error) { failureCode = error instanceof ProviderExecutionError ? error.code : 'PROVIDER_AUTH_FAILURE'; throw new Error(failureCode); }
        },
        observe: p => {
          const after = this.binding.adapter.inspect();
          return buildTile('rosetta.observation', { observationId: `provider-readback:${intent.id}`, source: 'urn:rosetta:credential-mediator', signal: 'Provider target read back',
            writeObservation: { proposalRef: p.action.cid, matched: !!before && after.effectCount === before.effectCount + 1 && after.stateDigest !== before.stateDigest }, providerEffect: { before, after } }, { parents: [p.action.cid] });
        },
        project: receipt => this.admission.journal.persist(buildTile('rosetta.observation', { observationId: `provider-queue:${receipt.cid}`, source: 'urn:rosetta:credential-mediator', signal: 'Provider projection queued', projectionJob: { receiptRef: receipt.cid, adapterRef: 'urn:projection:provider-reference' } }, { parents: [receipt.cid] })).cid
      });
    } catch (error) {
      if (!(error instanceof AdmissionClosureError)) throw new Error('CREDENTIAL_MEDIATION_UNRESOLVED');
      const view = this.state.inspect(); return { code: 'ACKNOWLEDGEMENT_UNKNOWN', effect: error.effect, revision: view.revision, frontierRef: view.frontierRef };
    }
    const codes = result.reasonCodes;
    const code = failureCode ?? (result.status === 'pass' ? 'EXECUTED' : codes.includes('PROVIDER_CAPABILITY_MISMATCH') ? 'PROVIDER_INSUFFICIENT_SCOPE' : codes.find(c => c.startsWith('PROVIDER_')) ?? (result.status === 'deny' ? 'ENTIF_AUTHORITY_DENIED' : 'ADMISSION_BLOCKED'));
    const current = this.state.inspect();
    return { code, effect: result.effect, revision: current.revision, frontierRef: current.frontierRef, admission: result };
  }
}

/** Actual durable local reference provider with deliberately independent mechanical capabilities.
 * Credentials are private fields; no token, request secret or provider error text is written to disk.
 */
export class LocalReferenceProvider implements CredentialProviderAdapter {
  #credential: string;
  constructor(private readonly directory: string, credential: string, private readonly target: AuthorityScope['target'], private readonly operations: string[]) {
    this.#credential = credential; mkdirSync(directory, { recursive: true });
  }
  private files() { const files = readdirSync(this.directory).filter(file => /^\d{10}\.json$/.test(file)).sort(); if (files.length > 10_000) throw new Error('PROVIDER_TARGET_BOUND_EXCEEDED'); return files; }
  inspect(): ProviderSnapshot {
    const files = this.files(); const hash = createHash('sha256'); for (const file of files) hash.update(readFileSync(join(this.directory, file)));
    return { effectCount: files.length, stateDigest: hash.digest('hex') };
  }
  execute(input: { id: string; operation: string; target: AuthorityScope['target']; credential: string }): void {
    if (input.credential !== this.#credential) throw new ProviderExecutionError('PROVIDER_AUTH_FAILURE');
    if (!this.operations.includes(input.operation) || !isDeepStrictEqual(input.target, this.target)) throw new ProviderExecutionError('PROVIDER_INSUFFICIENT_SCOPE');
    const revision = this.files().length + 1; const file = join(this.directory, `${String(revision).padStart(10, '0')}.json`);
    const bytes = JSON.stringify({ revision, id: input.id, operation: input.operation, targetRef: this.target.resourceRef }) + '\n'; const fd = openSync(file, 'wx', 0o600);
    try { writeFileSync(fd, bytes); fsyncSync(fd); } finally { closeSync(fd); }
    const directory = openSync(this.directory, 'r'); try { fsyncSync(directory); } finally { closeSync(directory); }
    if (readFileSync(file, 'utf8') !== bytes) throw new Error('PROVIDER_ACKNOWLEDGEMENT_UNKNOWN');
  }
}
