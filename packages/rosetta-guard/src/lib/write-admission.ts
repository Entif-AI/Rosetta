import { createHash } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ajv } from 'ajv';
import { buildTile, createAction, createEvaluation, createObservation, createRun, verifyTileIntegrity, type ActionPayload, type ObservationPayload, type RunPayload, type TileEnvelope } from '@entif-ai/rosetta-core';
import { AUTHORITY_ENVELOPE_SCHEMA, isProfileTimestamp, validatePayload, type AuthorityScope } from '@entif-ai/rosetta-schemas';
import { createLifecycleReceipt, type ReceiptPayload } from '@entif-ai/rosetta-receipts';
import { authorizeCurrentOperation, type LocalAuthorityState, type CurrentAuthorityOperation } from './authority-state.js';
import { projectAuthorityDecisionForIam, type CompatibleIamDecisionPayload } from './authority-compatibility.js';
import type { EffectiveAuthorityDecision } from './effective-authority.js';
import { evaluateWorkflowPolicyGate, type WorkflowPolicyDecisionPayload, type WorkflowPolicyGateRequest } from './rosetta-guard.js';

export interface WriteIntent { id: string; subjectRef: string; operation: string; effect: AuthorityScope['effects'][number]; target: AuthorityScope['target']; value: unknown }
export interface AdmissionActionPayload extends ActionPayload { writeIntent: WriteIntent }
export interface AdmissionProposal { intent: WriteIntent; run: TileEnvelope<RunPayload>; action: TileEnvelope<AdmissionActionPayload> }
export interface WriteAuthorization {
  revision: number; frontierRef: string; evaluation: TileEnvelope<EffectiveAuthorityDecision>;
  workflowDecision: TileEnvelope<WorkflowPolicyDecisionPayload>; iamDecision?: TileEnvelope<CompatibleIamDecisionPayload>;
}
export interface AdmissionCheckpointPayload extends ObservationPayload {
  admissionCheckpoint: { proposalRef: string; revision: number; frontierRef: string; evaluationRef: string; groundingRef: string };
}
export interface WriteAdmissionAdapter {
  normalize(input: unknown): AdmissionProposal;
  authorize(proposal: AdmissionProposal): WriteAuthorization | Promise<WriteAuthorization>;
  ground(proposal: AdmissionProposal, authorization: WriteAuthorization): TileEnvelope<ObservationPayload> | Promise<TileEnvelope<ObservationPayload>>;
  apply(proposal: AdmissionProposal, authorization: WriteAuthorization, checkpoint: TileEnvelope<AdmissionCheckpointPayload>): unknown | Promise<unknown>;
  observe(proposal: AdmissionProposal, result: unknown): TileEnvelope<ObservationPayload> | Promise<TileEnvelope<ObservationPayload>>;
  project?(receipt: TileEnvelope<ReceiptPayload>): string | Promise<string>;
}
export type AdmissionStep = 'propose' | 'normalize' | 'authorize' | 'ground' | 'checkpoint' | 'apply' | 'observe' | 'receipt' | 'project';
export interface WriteAdmissionResult {
  status: 'pass' | 'deny' | 'block' | 'fail' | 'partial'; effect: 'none' | 'committed' | 'unknown'; steps: AdmissionStep[];
  reasonCodes: string[]; receipt: TileEnvelope<ReceiptPayload>; artifacts: TileEnvelope[];
  authorization?: WriteAuthorization; checkpoint?: TileEnvelope<AdmissionCheckpointPayload>; observation?: TileEnvelope<ObservationPayload>;
  projection: { status: 'not-queued' | 'queued' | 'failed'; ref?: string };
}
const ref = { type: 'string', minLength: 1, maxLength: 2048, pattern: '\\S' };
const ajv = new Ajv({ ownProperties: true }); ajv.addFormat('date-time', isProfileTimestamp); ajv.addSchema(AUTHORITY_ENVELOPE_SCHEMA);
const properties = { id: ref, subjectRef: ref, operation: ref, value: {},
  effect: { $ref: `${AUTHORITY_ENVELOPE_SCHEMA.$id}#/properties/scope/properties/effects/items` },
  target: { $ref: `${AUTHORITY_ENVELOPE_SCHEMA.$id}#/properties/scope/properties/target` } };
const validIntent = ajv.compile<WriteIntent>({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });
function validTile(tile: TileEnvelope, kind?: string) {
  return (!kind || tile.kind === kind) && typeof tile.payload === 'object' && tile.payload !== null && !Array.isArray(tile.payload) &&
    verifyTileIntegrity(tile).ok && validatePayload(tile.kind, tile.payload).ok;
}
export class AdmissionClosureError extends Error {
  readonly code = 'ADMISSION_CLOSURE_UNCONFIRMED';
  constructor(readonly effect: WriteAdmissionResult['effect'], readonly receiptRef: string) { super('ADMISSION_CLOSURE_UNCONFIRMED'); }
}
export function createAdmissionProposal(input: unknown): AdmissionProposal {
  if (!validIntent(input) || Buffer.byteLength(JSON.stringify(input)) > 131_072) throw new Error('UNINTERPRETABLE_WRITE_INTENT');
  const intent = structuredClone(input); const run = createRun(`Governed write ${intent.id}`, ['authz', 'admission']);
  const core = createAction(run.cid, intent.operation);
  const action = buildTile<AdmissionActionPayload>('rosetta.action', { ...core.payload, actionId: intent.id, writeIntent: intent }, { parents: [run.cid] });
  return { intent, run, action };
}

/** Current #1758 resolution plus #1748's additive IAM evidence projection; workflow narrows independently. */
export function resolveWriteAuthorization(state: LocalAuthorityState, operation: CurrentAuthorityOperation, proposal: AdmissionProposal, workflow: WorkflowPolicyGateRequest): WriteAuthorization {
  const workflowDecision = evaluateWorkflowPolicyGate({ ...workflow, evaluatedAt: operation.query.now, workflow: { ...workflow.workflow, artifactId: proposal.action.cid } });
  const current = state.resolve(operation.query);
  if (!current.ok) return { ...authorizeCurrentOperation(state, operation), workflowDecision };
  if (operation.operation !== proposal.intent.operation || operation.effect !== proposal.intent.effect || operation.query.subjectRef !== proposal.intent.subjectRef ||
    JSON.stringify(operation.target) !== JSON.stringify(proposal.intent.target)) throw new Error('REQUEST_BINDING_MISMATCH');
  const request = { action: operation.operation, actionId: proposal.action.payload.actionId, principalId: proposal.intent.subjectRef,
    resource: operation.target.resourceRef, mode: 'live' as const, sideEffect: true, requestedAt: operation.query.now };
  const { query, submittedEnvelope, ...execution } = operation;
  const result = projectAuthorityDecisionForIam({ currentAuthority: { ...current.evaluatorState, ...execution, now: query.now,
    envelope: submittedEnvelope ?? current.envelope }, request,
    validation: { ...request, now: operation.query.now, policyVersionSet: current.envelope.policy.version }, workflowDecision });
  if (!result.evaluation) throw new Error('CURRENT_AUTHORITY_EVALUATION_UNRESOLVED');
  return { revision: current.revision, frontierRef: current.frontierRef, evaluation: result.evaluation, workflowDecision, iamDecision: result.decision };
}

/** Bounded local durable evidence store. Evidence persistence never grants authority. */
export class LocalAdmissionJournal {
  constructor(private readonly directory: string) { mkdirSync(directory, { recursive: true }); }
  private file(cid: string) { return join(this.directory, `${createHash('sha256').update(cid).digest('hex')}.json`); }
  read(cid: string): TileEnvelope {
    const bytes = readFileSync(this.file(cid)); if (bytes.length > 524_288) throw new Error('ADMISSION_ARTIFACT_BOUND_EXCEEDED');
    const tile = JSON.parse(bytes.toString()) as TileEnvelope;
    if (tile.cid !== cid || !validTile(tile)) throw new Error('ADMISSION_ARTIFACT_INVALID'); return tile;
  }
  all(): TileEnvelope[] {
    const files = readdirSync(this.directory).filter(file => /^[a-f0-9]{64}\.json$/.test(file));
    if (files.length > 10_000) throw new Error('ADMISSION_HISTORY_BOUND_EXCEEDED');
    return files.map(file => { const bytes = readFileSync(join(this.directory, file)); if (bytes.length > 524_288) throw new Error('ADMISSION_ARTIFACT_BOUND_EXCEEDED');
      const tile = JSON.parse(bytes.toString()) as TileEnvelope; return this.read(tile.cid); });
  }
  persist<T>(tile: TileEnvelope<T>): TileEnvelope<T> {
    if (!validTile(tile)) throw new Error('ADMISSION_ARTIFACT_INVALID');
    const bytes = JSON.stringify(tile) + '\n'; if (Buffer.byteLength(bytes) > 524_288) throw new Error('ADMISSION_ARTIFACT_BOUND_EXCEEDED');
    let fd: number;
    try { fd = openSync(this.file(tile.cid), 'wx', 0o600); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; if (readFileSync(this.file(tile.cid), 'utf8') !== bytes) throw new Error('ADMISSION_ARTIFACT_CONFLICT'); return this.read(tile.cid) as TileEnvelope<T>; }
    try { writeFileSync(fd, bytes); fsyncSync(fd); } finally { closeSync(fd); }
    const directory = openSync(this.directory, 'r'); try { fsyncSync(directory); } finally { closeSync(directory); }
    if (readFileSync(this.file(tile.cid), 'utf8') !== bytes) throw new Error('ADMISSION_ACKNOWLEDGEMENT_UNKNOWN');
    return this.read(tile.cid) as TileEnvelope<T>;
  }
}
function authorizationReasons(p: AdmissionProposal, a: WriteAuthorization): string[] {
  if (!validTile(a.evaluation, 'rosetta.evaluation') || !validTile(a.workflowDecision, 'workflow.policy_decision')) return ['UNINTERPRETABLE_ADMISSION_AUTHORIZATION'];
  if (a.evaluation.payload.effect !== 'allow') return a.evaluation.payload.reasonCodes;
  if (a.workflowDecision.payload.status !== 'allowed') return ['WORKFLOW_POLICY_DENIED'];
  if (!a.workflowDecision.payload.provenance.startupGrantSnapshotId || a.workflowDecision.payload.provenance.evaluatedWorkflowArtifactId !== p.action.cid ||
    a.workflowDecision.payload.boundaries.requestPolicyAuthority !== 'narrows_startup_authority_only') return ['STARTUP_WORKFLOW_EVIDENCE_UNRESOLVED'];
  const decision = a.iamDecision;
  if (!decision || !validTile(decision, 'iam.decision') || decision.payload.effect !== 'allow' || decision.payload.compatibility.authzMapping.evaluationRef !== a.evaluation.cid ||
    decision.payload.binding.actionId !== p.action.payload.actionId || decision.payload.binding.action !== p.intent.operation || decision.payload.binding.principalId !== p.intent.subjectRef || decision.payload.binding.resource !== p.intent.target.resourceRef) return ['CURRENT_IAM_EVIDENCE_UNRESOLVED'];
  return [];
}

/** NOT_AGENT_FACING: owners inject current resolvers and actual effect/readback adapters.
 * A decision alone cannot apply. Every effect requires grounded sources, durable checkpoint,
 * a second current check, readback and canonical Receipt closure. No automatic effect retry.
 */
export class LocalWriteAdmission {
  constructor(readonly journal: LocalAdmissionJournal) {}
  async execute(input: unknown, adapter: WriteAdmissionAdapter): Promise<WriteAdmissionResult> {
    let p: AdmissionProposal | undefined; let auth: WriteAuthorization | undefined; let checkpoint: TileEnvelope<AdmissionCheckpointPayload> | undefined;
    let observation: TileEnvelope<ObservationPayload> | undefined; let stage: AdmissionStep = 'normalize';
    let attempted = false; let effect: WriteAdmissionResult['effect'] = 'none'; let status: WriteAdmissionResult['status'] = 'pass'; let reasons: string[] = [];
    const steps: AdmissionStep[] = ['propose']; const artifacts: TileEnvelope[] = [];
    const keep = <T>(tile: TileEnvelope<T>) => { this.journal.persist(tile); if (!artifacts.some(t => t.cid === tile.cid)) artifacts.push(tile); return tile; };
    try {
      steps.push('normalize'); p = adapter.normalize(input);
      if (!validIntent(p.intent) || !validTile(p.run, 'rosetta.run') || !validTile(p.action, 'rosetta.action') || p.action.payload.runCid !== p.run.cid ||
        JSON.stringify(p.action.payload.writeIntent) !== JSON.stringify(p.intent)) throw new Error();
      keep(p.run); keep(p.action); stage = 'authorize'; steps.push(stage); auth = await adapter.authorize(p);
      keep(auth.evaluation); keep(auth.workflowDecision); if (auth.iamDecision) keep(auth.iamDecision);
      reasons = authorizationReasons(p, auth); if (reasons.length) { status = 'deny'; throw new Error(); }
      stage = 'ground'; steps.push(stage); const ground = await adapter.ground(p, auth);
      const grounding = (ground.payload as ObservationPayload & { admissionGrounding?: { proposalRef: string; frontierRef: string; sourceRefs: string[] } }).admissionGrounding;
      if (!validTile(ground, 'rosetta.observation') || grounding?.proposalRef !== p.action.cid || grounding.frontierRef !== auth.frontierRef || !grounding.sourceRefs.includes(auth.frontierRef)) throw new Error();
      keep(ground); stage = 'checkpoint'; steps.push(stage);
      checkpoint = keep(buildTile<AdmissionCheckpointPayload>('rosetta.observation', { observationId: `checkpoint:${p.intent.id}`, source: 'urn:rosetta:write-admission', signal: 'Checkpoint before durable apply',
        admissionCheckpoint: { proposalRef: p.action.cid, revision: auth.revision, frontierRef: auth.frontierRef, evaluationRef: auth.evaluation.cid, groundingRef: ground.cid } }, { parents: [p.action.cid, auth.evaluation.cid, ground.cid] }));
      if (JSON.stringify(this.journal.read(checkpoint.cid)) !== JSON.stringify(checkpoint)) throw new Error();
      stage = 'authorize'; const fresh = await adapter.authorize(p); keep(fresh.evaluation); keep(fresh.workflowDecision); if (fresh.iamDecision) keep(fresh.iamDecision);
      reasons = authorizationReasons(p, fresh); if (reasons.length) { auth = fresh; status = 'deny'; throw new Error(); }
      if (fresh.revision !== auth.revision || fresh.frontierRef !== auth.frontierRef) { reasons = ['AUTHORITY_CHANGED_AFTER_CHECKPOINT']; status = 'block'; throw new Error(); }
      auth = fresh; stage = 'apply'; steps.push(stage); attempted = true; effect = 'unknown'; const result = await adapter.apply(p, auth, checkpoint);
      stage = 'observe'; steps.push(stage); observation = await adapter.observe(p, result);
      const readback = (observation.payload as ObservationPayload & { writeObservation?: { proposalRef: string; matched: boolean } }).writeObservation;
      if (!validTile(observation, 'rosetta.observation') || readback?.proposalRef !== p.action.cid) throw new Error();
      keep(observation); if (readback.matched !== true) throw new Error(); effect = 'committed';
    } catch {
      if (stage === 'normalize') p = undefined;
      if (status === 'pass') status = attempted ? 'partial' : stage === 'ground' || stage === 'checkpoint' ? 'block' : 'fail';
      if (!reasons.length) reasons = [`${stage.toUpperCase()}_FAILED`];
    }
    // Even refusal has a bounded run/action/check/Receipt. Never copy raw exception or malformed input.
    if (!p) { const run = createRun('Write admission normalization refused', ['admission']); const action = createAction(run.cid, 'Refused malformed proposal'); p = { run, action: action as TileEnvelope<AdmissionActionPayload>, intent: {} as WriteIntent }; }
    const verdict = status === 'pass' ? 'pass' : status === 'deny' ? 'deny' : status === 'block' ? 'unknown' : status;
    const subjects = artifacts.filter(t => t.cid !== p?.run.cid && t.cid !== p?.action.cid);
    if (!subjects.length) subjects.push(createObservation('urn:rosetta:write-admission', reasons.join(',')));
    const core = createEvaluation(`Write admission ${status}`, verdict);
    const check = buildTile('rosetta.evaluation', { ...core.payload, admission: { status, effect, steps: [...steps], reasonCodes: reasons } }, { parents: [p.action.cid, ...subjects.map(t => t.cid)] });
    const receipt = createLifecycleReceipt({ run: p.run, step: p.action, artifacts: subjects, check, policies: [], outcome: verdict, statement: `Write admission ${status}; target effect ${effect}.` });
    stage = 'receipt'; steps.push(stage);
    // A failed receipt persistence throws to the owner: no success acknowledgement and no effect retry.
    try { for (const tile of [p.run, p.action, ...subjects, check, receipt]) keep(tile); }
    catch { throw new AdmissionClosureError(effect, receipt.cid); }
    const projection: WriteAdmissionResult['projection'] = { status: 'not-queued' };
    if (status === 'pass' && adapter.project) {
      steps.push('project');
      try { projection.ref = await adapter.project(receipt); projection.status = 'queued'; }
      catch { projection.status = 'failed'; }
      keep(buildTile('rosetta.observation', { observationId: `projection:${receipt.cid}`, source: 'urn:rosetta:write-admission', signal: 'Projection queue outcome', projection: { receiptRef: receipt.cid, ...projection } }, { parents: [receipt.cid] }));
    }
    return { status, effect, steps, reasonCodes: reasons, receipt, artifacts, authorization: auth, checkpoint, observation, projection };
  }
}
