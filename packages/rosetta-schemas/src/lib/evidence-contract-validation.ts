import { Ajv } from 'ajv';
import { isProfileTimestamp } from './evaluation-profile-validation.js';
import { canonicalTraceJson } from './trace-normalization.js';

export const evidenceRefSchema = { type: 'string', minLength: 1, maxLength: 2048, pattern: '\\S' };
export const evidenceRefsSchema = { type: 'array', maxItems: 256, uniqueItems: true, items: evidenceRefSchema };
export const supportedEvidenceSchema = { ...evidenceRefsSchema, minItems: 1 };
export const evidenceTimestampSchema = { type: 'string', format: 'date-time' };
export const nullableEvidenceSchema = (schema: object) => ({ anyOf: [schema, { type: 'null' }] });
export const evidenceObjectSchema = (properties: Record<string, object>) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
export const evidenceProfileSchema = (id: string) => evidenceObjectSchema({ id: { const: id }, version: { const: '1.0.0' } });
export const evidenceIdentitySchema = evidenceObjectSchema({ ref: evidenceRefSchema, version: nullableEvidenceSchema(evidenceRefSchema), cid: nullableEvidenceSchema(evidenceRefSchema) });
export interface EvidenceIdentity { ref: string; version: string | null; cid: string | null }

/** Bounded structural admission; referenced evidence and rights still need their owning authorities. */
export function compileEvidenceContract<T>(schema: object, dependencies: object[] = []): (input: unknown) => T {
  const ajv = new Ajv({ allErrors: true });
  ajv.addFormat('date-time', isProfileTimestamp);
  dependencies.forEach(dependency => ajv.addSchema(dependency));
  const validate = ajv.compile<T>(schema);
  return input => {
    if (!validate(input)) throw new Error(`Invalid evidence contract: ${ajv.errorsText(validate.errors)}`);
    if (Buffer.byteLength(canonicalTraceJson(input)) > 262_144) throw new Error('Evidence metadata exceeds 256 KiB; use external references.');
    return input;
  };
}
