import { Ajv } from 'ajv';
import { canonicalTraceJson } from './trace-normalization.js';
import { isProfileTimestamp } from './evaluation-profile-validation.js';
import { materializeWorkLifecycle, parseWorkLifecycleRecord, WORK_LIFECYCLE_SCHEMA, type WorkLifecycleRecord } from './work-lifecycle.js';

export const ENGINEERING_LIFECYCLE_PROFILE = 'engineering.lifecycle-source.v1';
export const ENGINEERING_SOURCE_ROLES = ['issue', 'authority', 'spec', 'plan', 'checkpoint', 'red', 'green', 'hosted-verification', 'pull-request', 'integration', 'executor', 'receipt', 'other'] as const;
export interface EngineeringSourceReference {
  ref: string;
  locator: string | null;
  sha256: string | null;
  role: typeof ENGINEERING_SOURCE_ROLES[number];
  authorityClass: 'governing-contract' | 'desired-state' | 'source-evidence' | 'implementation-evidence' | 'verification-evidence' | 'integration-evidence' | 'unknown';
  sourceTime: string | null;
}
export interface EngineeringValidationRelation { redRef: string; greenRef: string; implementationRef: string }
export interface EngineeringLifecycleSource {
  profile: { id: typeof ENGINEERING_LIFECYCLE_PROFILE; version: '1.0.0' };
  bundleRef: string;
  capturedAt: string;
  workRef: string;
  sources: EngineeringSourceReference[];
  records: WorkLifecycleRecord[];
  validationRelations: EngineeringValidationRelation[];
  limitations: string[];
}
const ref = { type: 'string', minLength: 1, pattern: '\\S' };
const timestamp = { type: 'string', format: 'date-time' };
export const ENGINEERING_LIFECYCLE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:engineering.lifecycle-source.v1',
  title: 'Bounded engineering lifecycle source adapter v1', type: 'object', additionalProperties: false,
  required: ['profile', 'bundleRef', 'capturedAt', 'workRef', 'sources', 'records', 'validationRelations', 'limitations'],
  properties: {
    profile: { type: 'object', additionalProperties: false, required: ['id', 'version'], properties: { id: { const: ENGINEERING_LIFECYCLE_PROFILE }, version: { const: '1.0.0' } } },
    bundleRef: ref, capturedAt: timestamp, workRef: ref,
    sources: { type: 'array', minItems: 1, maxItems: 256, items: { type: 'object', additionalProperties: false, required: ['ref', 'locator', 'sha256', 'role', 'authorityClass', 'sourceTime'], properties: {
      ref, locator: { anyOf: [ref, { type: 'null' }] }, sha256: { type: ['string', 'null'], pattern: '^[a-f0-9]{64}$' }, role: { enum: ENGINEERING_SOURCE_ROLES },
      authorityClass: { enum: ['governing-contract', 'desired-state', 'source-evidence', 'implementation-evidence', 'verification-evidence', 'integration-evidence', 'unknown'] },
      sourceTime: { anyOf: [timestamp, { type: 'null' }] }
    } } },
    records: { type: 'array', minItems: 1, maxItems: 64, uniqueItems: true, items: { $ref: WORK_LIFECYCLE_SCHEMA.$id } },
    validationRelations: { type: 'array', maxItems: 64, items: { type: 'object', additionalProperties: false, required: ['redRef', 'greenRef', 'implementationRef'], properties: { redRef: ref, greenRef: ref, implementationRef: ref } } },
    limitations: { type: 'array', items: ref, uniqueItems: true }
  }
};
const ajv = new Ajv({ allErrors: true });
ajv.addFormat('date-time', isProfileTimestamp);
ajv.addSchema(WORK_LIFECYCLE_SCHEMA);
const validate = ajv.compile<EngineeringLifecycleSource>(ENGINEERING_LIFECYCLE_SCHEMA);

export function parseEngineeringLifecycleSource(value: unknown): EngineeringLifecycleSource {
  if (!validate(value)) throw new Error(`Invalid engineering lifecycle source: ${ajv.errorsText(validate.errors)}`);
  if (Buffer.byteLength(canonicalTraceJson(value)) > 131_072) throw new Error('Engineering source exceeds bounded metadata size; externalize payloads.');
  const sources = new Map(value.sources.map(s => [s.ref, s]));
  if (sources.size !== value.sources.length) throw new Error('Duplicate engineering source reference.');
  const resolve = (ref: string) => {
    const source = sources.get(ref);
    if (!source) throw new Error(`Unresolved engineering source reference: ${ref}`);
    if (source.locator === null && (source.authorityClass !== 'unknown' || source.sha256 !== null)) throw new Error('Unresolved sources must preserve explicit unknown posture.');
    return source;
  };
  resolve(value.workRef);
  for (const source of value.sources) resolve(source.ref);
  for (const record of value.records) {
    parseWorkLifecycleRecord(record);
    if (record.workRef !== value.workRef) throw new Error('Mixed engineering work identity.');
    for (const field of ['objectiveRefs', 'commitmentRefs', 'dependencyRefs', 'capabilityRefs', 'acceptanceRefs', 'evidenceRefs', 'verifierRefs', 'integrationRefs', 'telemetryRefs', 'receiptRefs', 'provenanceRefs'] as const) for (const ref of record[field] ?? []) resolve(ref);
    for (const field of ['procedureRef', 'executorRef', 'contextRef', 'dispatchRef', 'attemptRef', 'resultRef', 'adapterProfileRef', 'continuationRef'] as const) if (record[field] !== undefined) resolve(record[field] as string);
  }
  materializeWorkLifecycle(value.records);
  for (const relation of value.validationRelations) {
    if (resolve(relation.redRef).role !== 'red' || resolve(relation.greenRef).role !== 'green' || resolve(relation.implementationRef).role !== 'checkpoint') throw new Error('Validation relation must preserve red, green and implementation source roles.');
  }
  return value;
}
