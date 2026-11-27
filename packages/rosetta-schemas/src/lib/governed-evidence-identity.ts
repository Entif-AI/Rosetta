import { canonicalTraceJson, traceHash } from './trace-normalization.js';

export const governedRecordIdSchema = { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' };
export const governedDigestSchema = { type: 'string', pattern: '^[a-f0-9]{64}$' };
export const governedArray = (items: object, minItems = 0) => ({ type: 'array', items, minItems, maxItems: 256 });
export const governedEnum = (values: readonly string[]) => ({ enum: values });

export function governedRecordId(body: unknown): string {
  return 'sha256:' + traceHash(canonicalTraceJson(body));
}

export function verifyGovernedRecord<T extends { recordId: string }>(value: T): T {
  const { recordId, ...body } = value;
  if (recordId !== governedRecordId(body)) throw new Error('Governed evidence metadata digest mismatch.');
  return structuredClone(value);
}

export function createGovernedRecord<T>(body: unknown, parse: (value: unknown) => T): T {
  if (!body || typeof body !== 'object' || Array.isArray(body) || 'recordId' in body) throw new Error('Provide evidence metadata without recordId.');
  return parse({ ...body, recordId: governedRecordId(body) });
}
