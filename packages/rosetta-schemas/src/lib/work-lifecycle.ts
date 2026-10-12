import { Ajv } from 'ajv';
import { canonicalTraceJson } from './trace-normalization.js';
import { isProfileTimestamp } from './evaluation-profile-validation.js';

export const WORK_LIFECYCLE_PROFILE = 'work.lifecycle.v1';
export const WORK_LIFECYCLE_EVENTS = ['declared', 'blocked', 'ready', 'dispatched', 'started', 'completed', 'failed', 'verification_requested', 'verification_accepted', 'verification_rejected', 'repair_required', 'human_requested', 'human_responded', 'integrated', 'deferred', 'cancelled'] as const;
export type WorkLifecycleEvent = typeof WORK_LIFECYCLE_EVENTS[number];
export interface WorkLifecycleRecord {
  recordId: string;
  profile: { id: typeof WORK_LIFECYCLE_PROFILE; version: '1.0.0' };
  workRef: string;
  event: WorkLifecycleEvent;
  createdAt: string;
  receiptRefs: string[];
  provenanceRefs: string[];
  objectiveRefs?: string[];
  commitmentRefs?: string[];
  dependencyRefs?: string[];
  procedureRef?: string;
  capabilityRefs?: string[];
  executorRef?: string;
  contextRef?: string;
  acceptanceRefs?: string[];
  evidenceRefs?: string[];
  dispatchRef?: string;
  attemptRef?: string;
  resultRef?: string;
  disposition?: 'accepted' | 'repair_required' | 'rejected' | 'blocked' | 'deferred' | 'completed';
  verifierRefs?: string[];
  verificationRef?: string;
  integrationRefs?: string[];
  telemetryRefs?: string[];
  adapterProfileRef?: string;
  priorRecordRef?: string;
  continuationRef?: string;
}

const ref = { type: 'string', minLength: 1, pattern: '\\S' };
const refs = { type: 'array', items: ref, uniqueItems: true };
const supportedRefs = ['objectiveRefs', 'commitmentRefs', 'dependencyRefs', 'capabilityRefs', 'acceptanceRefs', 'evidenceRefs', 'verifierRefs', 'integrationRefs', 'telemetryRefs'];
const supportedSingles = ['procedureRef', 'executorRef', 'contextRef', 'dispatchRef', 'attemptRef', 'resultRef', 'verificationRef', 'adapterProfileRef', 'priorRecordRef', 'continuationRef'];
const requires = (event: string | string[], fields: string[], disposition?: string) => ({
  if: { properties: { event: Array.isArray(event) ? { enum: event } : { const: event } }, required: ['event'] },
  then: { required: fields, properties: { ...Object.fromEntries(fields.filter(f => f.endsWith('Refs')).map(f => [f, { ...refs, minItems: 1 }])), ...(disposition ? { disposition: { const: disposition } } : {}) } }
});
export const WORK_LIFECYCLE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:work.lifecycle.v1',
  title: 'Public bounded-work lifecycle record v1',
  description: 'Application-level composition of work, execution, Evaluation and Receipt references. No dispatch, completion or telemetry record grants operational authority.',
  type: 'object', additionalProperties: false,
  required: ['recordId', 'profile', 'workRef', 'event', 'createdAt', 'receiptRefs', 'provenanceRefs'],
  properties: {
    recordId: ref, workRef: ref, event: { enum: WORK_LIFECYCLE_EVENTS },
    profile: { type: 'object', additionalProperties: false, required: ['id', 'version'], properties: { id: { const: WORK_LIFECYCLE_PROFILE }, version: { const: '1.0.0' } } },
    createdAt: { type: 'string', format: 'date-time', pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt][0-9]{2}:[0-9]{2}:[0-5][0-9](?:\\.[0-9]+)?(?:[Zz]|[+-][0-9]{2}:[0-9]{2})$' },
    receiptRefs: refs, provenanceRefs: { ...refs, minItems: 1 },
    disposition: { enum: ['accepted', 'repair_required', 'rejected', 'blocked', 'deferred', 'completed'] },
    ...Object.fromEntries(supportedRefs.map(f => [f, refs])),
    ...Object.fromEntries(supportedSingles.map(f => [f, ref]))
  },
  allOf: [
    requires(['dispatched', 'started'], ['procedureRef', 'executorRef']),
    requires('completed', ['executorRef', 'resultRef', 'evidenceRefs', 'disposition'], 'completed'),
    requires('verification_requested', ['executorRef', 'resultRef', 'evidenceRefs']),
    requires('verification_accepted', ['executorRef', 'resultRef', 'verifierRefs', 'evidenceRefs', 'disposition'], 'accepted'),
    requires('verification_rejected', ['executorRef', 'resultRef', 'verifierRefs', 'evidenceRefs', 'disposition'], 'rejected'),
    requires('integrated', ['verificationRef', 'integrationRefs', 'evidenceRefs', 'disposition'], 'accepted'),
    requires('repair_required', ['priorRecordRef', 'continuationRef', 'evidenceRefs', 'disposition'], 'repair_required')
  ]
};
const ajv = new Ajv({ allErrors: true });
ajv.addFormat('date-time', isProfileTimestamp);
const validateShape = ajv.compile<WorkLifecycleRecord>(WORK_LIFECYCLE_SCHEMA);

export function validateWorkLifecycle(value: unknown): { ok: boolean; errors: string[] } {
  if (!validateShape(value)) return { ok: false, errors: (validateShape.errors ?? []).map(e => `${e.instancePath || '/'} ${e.message}`) };
  const errors: string[] = [];
  if (value.procedureRef !== undefined && value.procedureRef === value.executorRef) errors.push('Procedure and executor must have distinct identities.');
  if (value.verifierRefs?.includes(value.executorRef ?? '')) errors.push('Executor completion cannot be its own independent verification.');
  if (value.priorRecordRef === value.recordId) errors.push('A record cannot precede itself.');
  if (value.continuationRef === value.workRef) errors.push('A continuation must identify separate bounded work.');
  return { ok: errors.length === 0, errors };
}

export function parseWorkLifecycleRecord(value: unknown): WorkLifecycleRecord {
  const result = validateWorkLifecycle(value);
  if (!result.ok) throw new Error(`Invalid work lifecycle record: ${result.errors.join('; ')}`);
  return value as WorkLifecycleRecord;
}

function admittedHistory(input: readonly WorkLifecycleRecord[]): WorkLifecycleRecord[] {
  const history: WorkLifecycleRecord[] = [];
  const byId = new Map<string, WorkLifecycleRecord>();
  const results = new Map<string, WorkLifecycleRecord>();
  const latestVerification = new Map<string, string>();
  for (const value of input) {
    const record = parseWorkLifecycleRecord(value);
    const existing = byId.get(record.recordId);
    if (existing) {
      if (canonicalTraceJson(existing) !== canonicalTraceJson(record)) throw new Error('Lifecycle record identity conflict; history cannot be overwritten.');
      continue;
    }
    const previous = history.at(-1);
    if (previous ? record.workRef !== previous.workRef || record.priorRecordRef !== previous.recordId : record.priorRecordRef !== undefined) throw new Error('Lifecycle history must be one bounded work with a resolvable append-only prior chain.');
    if (record.event.startsWith('verification_')) {
      const result = results.get(record.resultRef ?? '');
      if (!result || result.executorRef !== record.executorRef) throw new Error('Verification must resolve to an earlier attributed execution result.');
      latestVerification.set(record.resultRef as string, record.recordId);
    }
    if (record.event === 'integrated') {
      const verification = byId.get(record.verificationRef ?? '');
      if (verification?.event !== 'verification_accepted' || latestVerification.get(verification.resultRef ?? '') !== verification.recordId) throw new Error('Integration must resolve to earlier independent accepted verification that has not been superseded.');
    }
    if (record.event === 'completed') {
      if (results.has(record.resultRef ?? '')) throw new Error('Each completed attempt must have a distinct result identity.');
      results.set(record.resultRef as string, record);
    }
    history.push(record);
    byId.set(record.recordId, record);
  }
  return history;
}

/** Adds evidence without rewriting history; identical delivery is idempotent. */
export function appendWorkLifecycleRecord(history: readonly WorkLifecycleRecord[], record: WorkLifecycleRecord): WorkLifecycleRecord[] {
  return structuredClone(admittedHistory([...history, record]));
}

export interface WorkLifecycleState {
  profile: 'work.lifecycle-state.v1';
  workRef: string;
  headRecordRef: string;
  historyRefs: string[];
  lastEvent: WorkLifecycleEvent;
  execution: { state: 'not_started' | 'running' | 'completed' | 'failed'; recordRef: string | null; resultRef: string | null };
  verification: { state: 'unverified' | 'requested' | 'accepted' | 'rejected'; recordRef: string | null; resultRef: string | null };
  integration: { state: 'not_recorded' | 'integrated'; recordRef: string | null; verificationRef: string | null };
}

/** A separately materialized inspection view; it grants no execution/write authority. */
export function materializeWorkLifecycle(input: readonly WorkLifecycleRecord[]): WorkLifecycleState {
  const history = admittedHistory(input);
  const head = history.at(-1);
  if (!head) throw new Error('Lifecycle history must not be empty.');
  const newestFirst = [...history].reverse();
  const execution = newestFirst.find(r => ['started', 'completed', 'failed'].includes(r.event));
  const verification = execution?.event === 'completed' ? newestFirst.find(r => r.event.startsWith('verification_') && r.resultRef === execution.resultRef) : undefined;
  const integration = newestFirst.find(r => r.event === 'integrated');
  return {
    profile: 'work.lifecycle-state.v1', workRef: head.workRef, headRecordRef: head.recordId,
    historyRefs: history.map(r => r.recordId), lastEvent: head.event,
    execution: { state: execution?.event === 'started' ? 'running' : execution?.event === 'completed' ? 'completed' : execution?.event === 'failed' ? 'failed' : 'not_started', recordRef: execution?.recordId ?? null, resultRef: execution?.resultRef ?? null },
    verification: { state: verification?.event === 'verification_accepted' ? 'accepted' : verification?.event === 'verification_rejected' ? 'rejected' : verification ? 'requested' : 'unverified', recordRef: verification?.recordId ?? null, resultRef: verification?.resultRef ?? null },
    integration: { state: integration ? 'integrated' : 'not_recorded', recordRef: integration?.recordId ?? null, verificationRef: integration?.verificationRef ?? null }
  };
}
