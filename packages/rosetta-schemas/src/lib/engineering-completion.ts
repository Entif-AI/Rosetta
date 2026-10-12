import { Ajv } from 'ajv';
import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { isProfileTimestamp } from './evaluation-profile-validation.js';
import { ENGINEERING_LIFECYCLE_SCHEMA, type EngineeringSourceReference } from './engineering-lifecycle.js';
import { materializeWorkLifecycle, parseWorkLifecycleRecord, WORK_LIFECYCLE_SCHEMA, type WorkLifecycleRecord } from './work-lifecycle.js';

export type CompletionObservation<T> = { status: 'observed'; value: T; evidenceRefs: string[] } | { status: 'unknown' | 'unavailable'; reason: string; evidenceRefs: string[] };
export interface CompletionQuotaWindow {
  meterRef: string; windowRef: string | null; windowKind: 'five_hour' | 'weekly' | 'other';
  observedAt: string; phase: 'before' | 'checkpoint' | 'after' | 'installed-mid-run';
  usedPercent: number | null; remainingPercent: number | null; resetAt: string | null;
  attribution: 'shared-seat-unattributed' | 'unknown'; sourceStatus: 'fresh' | 'stale' | 'unavailable' | 'unknown';
}
export interface CompletionDelegation { role: string; model: string | null; reasoning: string | null; scope: string; mutableWriterCount: number }
export interface CompletionCache { kind: 'nx-task' | 'provider-prefix' | 'other'; subjectRef: string; cachedCount: number | null; totalCount: number | null; unit: 'tasks' | 'tokens' | 'bytes' | 'requests' }
const STRING_FIELDS = ['executorSurface', 'provider', 'model', 'modelVersion', 'reasoning', 'compiledContext'] as const;
const LIST_FIELDS = ['tools', 'runtime', 'repairs', 'rework', 'discardedWork'] as const;
export type CompletionObservations = { [K in typeof STRING_FIELDS[number]]: CompletionObservation<string> } & { [K in typeof LIST_FIELDS[number]]: CompletionObservation<string[]> } & {
  startedAt: CompletionObservation<string>; endedAt: CompletionObservation<string>;
  delegation: CompletionObservation<CompletionDelegation[]>;
  quota: CompletionObservation<CompletionQuotaWindow[]>;
  duration: CompletionObservation<{ seconds: number; basis: 'full-run' | 'checkpoint-interval' }>;
  contextSize: CompletionObservation<{ count: number; unit: 'tokens' | 'bytes' }>;
  cache: CompletionObservation<CompletionCache[]>;
  tokens: CompletionObservation<number>; cost: CompletionObservation<{ amount: number; currency: string }>;
  retries: CompletionObservation<number>;
};
export interface CompletionValidation { subjectRef: string; disposition: 'passed' | 'failed' | 'skipped' | 'unknown'; independence: 'executor-attested' | 'independent' | 'unknown'; evidenceRefs: string[] }
export interface EngineeringCompletionEnvelope {
  profile: { id: 'engineering.run-completion.v1'; version: '1.0.0' };
  envelopeId: string; runRef: string; workRefs: string[];
  identityRefs: { issues: string[]; specs: string[]; plans: string[]; prs: string[] };
  createdAt: string; terminalState: 'completed' | 'failed' | 'blocked' | 'cancelled';
  lifecycleRecords: WorkLifecycleRecord[]; observations: CompletionObservations;
  validation: CompletionValidation[]; independentVerification: CompletionValidation[];
  externalEffects: { effectRef: string; kind: 'git-checkpoint' | 'push' | 'pull-request' | 'merge' | 'runtime-mutation' | 'other'; reconciliation: 'verified' | 'pending' | 'unknown'; evidenceRefs: string[] }[];
  result: { disposition: 'code-complete' | 'verified' | 'integrated' | 'failed' | 'partial' | 'blocked' | 'cancelled'; evidenceRefs: string[] };
  limitations: string[];
  continuation: { refs: string[]; nextSafeStep: string; evidenceRefs: string[] };
  sources: EngineeringSourceReference[]; supersedesRefs: string[];
}

const ref = { type: 'string', minLength: 1, maxLength: 2048, pattern: '\\S' };
const refs = { type: 'array', items: ref, maxItems: 256, uniqueItems: true };
const nonemptyRefs = { ...refs, minItems: 1 };
const timestamp = { type: 'string', format: 'date-time' };
const count = { type: 'integer', minimum: 0 };
const nullable = (schema: object) => ({ anyOf: [schema, { type: 'null' }] });
const object = (properties: Record<string, object>) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const observation = (value: object) => ({ oneOf: [
  object({ status: { const: 'observed' }, value, evidenceRefs: nonemptyRefs }),
  object({ status: { enum: ['unknown', 'unavailable'] }, reason: { ...ref, maxLength: 512 }, evidenceRefs: refs })
] });
const observationSchemas = {
  ...Object.fromEntries(STRING_FIELDS.map(field => [field, observation(ref)])),
  ...Object.fromEntries(LIST_FIELDS.map(field => [field, observation(refs)])),
  startedAt: observation(timestamp), endedAt: observation(timestamp),
  delegation: observation({ type: 'array', maxItems: 64, items: object({ role: ref, model: nullable(ref), reasoning: nullable(ref), scope: ref, mutableWriterCount: count }) }),
  quota: observation({ type: 'array', maxItems: 64, items: object({
    meterRef: ref, windowRef: nullable(ref), windowKind: { enum: ['five_hour', 'weekly', 'other'] }, observedAt: timestamp,
    phase: { enum: ['before', 'checkpoint', 'after', 'installed-mid-run'] }, usedPercent: nullable({ type: 'number', minimum: 0, maximum: 100 }), remainingPercent: nullable({ type: 'number', minimum: 0, maximum: 100 }), resetAt: nullable(timestamp),
    attribution: { enum: ['shared-seat-unattributed', 'unknown'] }, sourceStatus: { enum: ['fresh', 'stale', 'unavailable', 'unknown'] }
  }) }),
  duration: observation(object({ seconds: { type: 'number', minimum: 0 }, basis: { enum: ['full-run', 'checkpoint-interval'] } })),
  contextSize: observation(object({ count, unit: { enum: ['tokens', 'bytes'] } })),
  cache: observation({ type: 'array', maxItems: 64, items: object({ kind: { enum: ['nx-task', 'provider-prefix', 'other'] }, subjectRef: ref, cachedCount: nullable(count), totalCount: nullable(count), unit: { enum: ['tasks', 'tokens', 'bytes', 'requests'] } }) }),
  tokens: observation(count), retries: observation(count), cost: observation(object({ amount: { type: 'number', minimum: 0 }, currency: ref }))
};
const validationSchema = object({ subjectRef: ref, disposition: { enum: ['passed', 'failed', 'skipped', 'unknown'] }, independence: { enum: ['executor-attested', 'independent', 'unknown'] }, evidenceRefs: nonemptyRefs });
export const ENGINEERING_COMPLETION_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:engineering.run-completion.v1', title: 'Source-linked terminal engineering completion envelope v1',
  ...object({
    profile: object({ id: { const: 'engineering.run-completion.v1' }, version: { const: '1.0.0' } }),
    envelopeId: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' }, runRef: ref, workRefs: nonemptyRefs,
    identityRefs: object({ issues: refs, specs: refs, plans: refs, prs: refs }), createdAt: timestamp, terminalState: { enum: ['completed', 'failed', 'blocked', 'cancelled'] },
    lifecycleRecords: { type: 'array', maxItems: 256, items: { $ref: WORK_LIFECYCLE_SCHEMA.$id } },
    observations: object(observationSchemas),
    validation: { type: 'array', maxItems: 256, items: validationSchema }, independentVerification: { type: 'array', maxItems: 128, items: validationSchema },
    externalEffects: { type: 'array', maxItems: 128, items: object({ effectRef: ref, kind: { enum: ['git-checkpoint', 'push', 'pull-request', 'merge', 'runtime-mutation', 'other'] }, reconciliation: { enum: ['verified', 'pending', 'unknown'] }, evidenceRefs: nonemptyRefs }) },
    result: object({ disposition: { enum: ['code-complete', 'verified', 'integrated', 'failed', 'partial', 'blocked', 'cancelled'] }, evidenceRefs: nonemptyRefs }),
    limitations: refs, continuation: object({ refs, nextSafeStep: ref, evidenceRefs: nonemptyRefs }),
    sources: ENGINEERING_LIFECYCLE_SCHEMA.properties.sources, supersedesRefs: refs
  })
};
const ajv = new Ajv({ allErrors: true });
ajv.addFormat('date-time', isProfileTimestamp);
ajv.addSchema(WORK_LIFECYCLE_SCHEMA);
const validate = ajv.compile<EngineeringCompletionEnvelope>(ENGINEERING_COMPLETION_SCHEMA);

export function parseEngineeringCompletion(value: unknown): EngineeringCompletionEnvelope {
  if (!validate(value)) throw new Error(`Invalid engineering completion: ${ajv.errorsText(validate.errors)}`);
  if (Buffer.byteLength(canonicalTraceJson(value)) > 262_144) throw new Error('Completion metadata exceeds 256 KiB; use external references.');
  const { envelopeId, ...body } = value;
  if (envelopeId !== `sha256:${traceHash(canonicalTraceJson(body))}`) throw new Error('Completion digest/identity mismatch.');
  const sources = new Map(value.sources.map(s => [s.ref, s]));
  if (sources.size !== value.sources.length) throw new Error('Duplicate completion source reference.');
  const resolve = (ref: string) => { if (!sources.has(ref)) throw new Error(`Unresolved completion source reference: ${ref}`); };
  const resolveRefs = (refs: string[]) => refs.forEach(resolve);
  for (const source of value.sources) if (source.locator === null && (source.authorityClass !== 'unknown' || source.sha256 !== null)) throw new Error('Unresolved source must preserve explicit unknown posture.');
  resolveRefs(value.workRefs);
  Object.values(value.identityRefs).forEach(resolveRefs);
  for (const observation of Object.values(value.observations)) resolveRefs(observation.evidenceRefs);
  if (value.observations.compiledContext.status === 'observed') resolve(value.observations.compiledContext.value);
  if (value.observations.quota.status === 'observed') for (const window of value.observations.quota.value) resolve(window.meterRef);
  if (value.observations.cache.status === 'observed') for (const cache of value.observations.cache.value) {
    resolve(cache.subjectRef);
    if (cache.cachedCount !== null && cache.totalCount !== null && cache.cachedCount > cache.totalCount) throw new Error('Observed cache count exceeds its total.');
  }
  for (const claim of [...value.validation, ...value.independentVerification]) { resolve(claim.subjectRef); resolveRefs(claim.evidenceRefs); }
  if (value.independentVerification.some(v => v.independence !== 'independent')) throw new Error('Independent verification cannot be executor self-attestation.');
  for (const effect of value.externalEffects) { resolve(effect.effectRef); resolveRefs(effect.evidenceRefs); }
  resolveRefs(value.result.evidenceRefs); resolveRefs(value.continuation.refs); resolveRefs(value.continuation.evidenceRefs);
  const histories = new Map<string, WorkLifecycleRecord[]>();
  const recordsById = new Map(value.lifecycleRecords.map(r => [r.recordId, r]));
  if (recordsById.size !== value.lifecycleRecords.length) throw new Error('Duplicate completion lifecycle record.');
  for (const record of value.lifecycleRecords) {
    parseWorkLifecycleRecord(record);
    if (!value.workRefs.includes(record.workRef)) throw new Error('Lifecycle work identity must belong to the run.');
    for (const [key, field] of Object.entries(record)) {
      if (key === 'priorRecordRef' || key === 'verificationRef') { if (!recordsById.has(field as string)) throw new Error('Unresolved lifecycle record reference.'); }
      else if (key.endsWith('Refs')) resolveRefs(field as string[]);
      else if (key.endsWith('Ref')) resolve(field as string);
    }
    histories.set(record.workRef, [...histories.get(record.workRef) ?? [], record]);
  }
  const states = [...histories.values()].map(materializeWorkLifecycle);
  if (value.terminalState === 'completed' && !states.some(s => s.execution.state === 'completed')) throw new Error('Terminal completion requires separately recorded execution completion.');
  if (value.result.disposition === 'integrated' && !states.some(s => s.integration.state === 'integrated')) throw new Error('Integrated result requires separately recorded integration.');
  if (['verified', 'integrated'].includes(value.result.disposition)) {
    const subjects = value.result.disposition === 'integrated'
      ? new Set(value.lifecycleRecords.filter(r => r.event === 'integrated').map(r => recordsById.get(r.verificationRef as string)?.resultRef))
      : new Set(states.filter(s => s.verification.state === 'accepted').map(s => s.verification.resultRef));
    if (!value.independentVerification.length || value.independentVerification.some(v => v.disposition !== 'passed' || !subjects.has(v.subjectRef))) throw new Error('Verified result requires passed independent verification of the accepted lifecycle subject.');
  }
  if (['failed', 'blocked', 'cancelled'].includes(value.terminalState) && ![value.terminalState, 'partial'].includes(value.result.disposition)) throw new Error('Terminal failure/block/cancellation cannot be promoted to successful completion.');
  if (value.supersedesRefs.includes(envelopeId)) throw new Error('An envelope cannot supersede itself.');
  return value;
}

export function createEngineeringCompletion(body: Omit<EngineeringCompletionEnvelope, 'envelopeId'>): EngineeringCompletionEnvelope {
  return parseEngineeringCompletion({ ...body, envelopeId: `sha256:${traceHash(canonicalTraceJson(body))}` });
}

export function appendEngineeringCompletion(history: readonly EngineeringCompletionEnvelope[], next: EngineeringCompletionEnvelope): EngineeringCompletionEnvelope[] {
  const result: EngineeringCompletionEnvelope[] = [];
  const known = new Set<string>();
  for (const input of [...history, next]) {
    const envelope = parseEngineeringCompletion(input);
    if (known.has(envelope.envelopeId)) continue;
    if (result[0] && envelope.runRef !== result[0].runRef) throw new Error('Completion history must describe one run.');
    if (envelope.supersedesRefs.some(ref => !known.has(ref))) throw new Error('Unresolved completion supersession.');
    known.add(envelope.envelopeId); result.push(envelope);
  }
  return structuredClone(result);
}

export function renderEngineeringCompletion(input: unknown): string {
  const envelope = parseEngineeringCompletion(input);
  const show = (observation: CompletionObservation<unknown>) => observation.status === 'observed' ? JSON.stringify(observation.value) : `${observation.status}: ${observation.reason}`;
  return [
    `# Engineering completion: ${envelope.runRef}`, '',
    `Envelope: ${envelope.envelopeId}`, `Terminal: ${envelope.terminalState}; result: ${envelope.result.disposition}`,
    `Work: ${envelope.workRefs.join(', ')}`, `PR: ${envelope.identityRefs.prs.join(', ') || 'unavailable'}`, '',
    `Executor: ${show(envelope.observations.executorSurface)}`, `Provider: ${show(envelope.observations.provider)}`,
    `Model: ${show(envelope.observations.model)}; version: ${show(envelope.observations.modelVersion)}`,
    `Reasoning: ${show(envelope.observations.reasoning)}`, `Delegation: ${show(envelope.observations.delegation)}`,
    `Quota: ${show(envelope.observations.quota)}`, `Duration: ${show(envelope.observations.duration)}`,
    `Tokens: ${show(envelope.observations.tokens)}; cost: ${show(envelope.observations.cost)}`,
    `Validation: ${envelope.validation.map(v => `${v.disposition}:${v.subjectRef}`).join(', ') || 'none recorded'}; independent verification: ${envelope.independentVerification.length}`,
    `Repairs: ${show(envelope.observations.repairs)}`, `External effects: ${envelope.externalEffects.map(e => `${e.kind}:${e.reconciliation}`).join(', ') || 'none recorded'}`, '',
    `Limitations: ${envelope.limitations.join('; ') || 'none declared'}`, `Next safe step: ${envelope.continuation.nextSafeStep}`,
    `Sources: ${envelope.sources.map(s => s.ref).join(', ')}`, ''
  ].join('\n');
}
