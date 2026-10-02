export const SALIENCE_EVALUATION_PROFILE_ID = 'salience.evaluation.v1';
export const SALIENCE_EVALUATION_PROFILE_VERSION = '1.0.0';

export interface SalienceProfileValidationResult {
  errors: string[];
  ok: boolean;
  schemaId: typeof SALIENCE_EVALUATION_PROFILE_ID;
}

const EVALUATION_FIELDS = new Set(['assessment', 'assessedAt', 'evaluationId', 'profile', 'provenanceRefs', 'receiptRefs', 'scope', 'summary', 'supersedesRefs', 'validTime', 'verdict']);
const ASSESSMENT_FIELDS = new Set(['baselineRefs', 'evidenceRefs', 'phenomenonRefs', 'provenanceRefs', 'status', 'uncertainty', 'value']);
const VALUE_FIELDS = new Set(['allowedLevels', 'level', 'representation', 'schemaRef', 'value']);
const SCALES = new Set(['event', 'cluster', 'pattern', 'trend', 'system']);
const STATUSES = new Set(['observed', 'estimated', 'unknown', 'unavailable']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function requireString(record: Record<string, unknown>, field: string, errors: string[], prefix: string): void {
  if (typeof record[field] !== 'string' || record[field].length === 0) errors.push(`${prefix} ${field} must be a non-empty string.`);
}

function rejectUnknownFields(record: Record<string, unknown>, allowed: Set<string>, errors: string[], prefix: string): void {
  for (const field of Object.keys(record)) if (!allowed.has(field)) errors.push(`${prefix} does not allow field: ${field}`);
}

function validateValue(value: unknown, errors: string[], prefix: string): void {
  if (!isRecord(value)) {
    errors.push(`${prefix} value must be an object.`);
    return;
  }
  rejectUnknownFields(value, VALUE_FIELDS, errors, `${prefix} value`);
  requireString(value, 'schemaRef', errors, `${prefix} value`);
  requireString(value, 'representation', errors, `${prefix} value`);
  if (value.representation === 'ordinal') {
    if (!isStringArray(value.allowedLevels) || value.allowedLevels.length === 0) errors.push(`${prefix} ordinal value allowedLevels must be a non-empty string array.`);
    if (typeof value.level !== 'string' || !isStringArray(value.allowedLevels) || !value.allowedLevels.includes(value.level)) errors.push(`${prefix} ordinal value level must be one of allowedLevels.`);
  }
  if (value.representation === 'scalar' && typeof value.value !== 'number') errors.push(`${prefix} scalar value must contain a number.`);
}

function validateAssessment(name: 'impact' | 'exigency' | 'novelty', value: unknown, errors: string[]): void {
  const prefix = `salience.evaluation ${name}`;
  if (!isRecord(value)) {
    errors.push(`${prefix} assessment must be an object.`);
    return;
  }
  rejectUnknownFields(value, ASSESSMENT_FIELDS, errors, prefix);
  if (!STATUSES.has(value.status as string)) errors.push(`${prefix} status must be observed, estimated, unknown, or unavailable.`);
  if (!isRecord(value.uncertainty) || typeof value.uncertainty.status !== 'string') errors.push(`${prefix} uncertainty must declare a status.`);
  for (const field of ['evidenceRefs', 'provenanceRefs']) if (!isStringArray(value[field])) errors.push(`${prefix} ${field} must be a string array.`);
  if (name === 'novelty') for (const field of ['baselineRefs', 'phenomenonRefs']) if (!isStringArray(value[field])) errors.push(`${prefix} ${field} must be a string array.`);
  if (value.status === 'unknown' || value.status === 'unavailable') {
    if ('value' in value) errors.push(`${prefix} ${value.status} assessment must not fabricate a value.`);
  } else {
    validateValue(value.value, errors, prefix);
  }
}

export function isSalienceEvaluationProfile(payload: object): boolean {
  const profile = isRecord(payload) ? payload.profile : undefined;
  return isRecord(profile) && typeof profile.id === 'string' && profile.id.startsWith('salience.evaluation.');
}

/** Structural conformance only; this Profile establishes neither truth nor operational authority. */
export function validateSalienceEvaluation(payload: object): SalienceProfileValidationResult {
  const errors: string[] = [];
  const evaluation = payload as Record<string, unknown>;
  rejectUnknownFields(evaluation, EVALUATION_FIELDS, errors, 'salience.evaluation');
  for (const field of ['evaluationId', 'summary', 'verdict', 'assessedAt']) requireString(evaluation, field, errors, 'salience.evaluation');
  if (!isRecord(evaluation.profile)) {
    errors.push('salience.evaluation profile must be an object.');
  } else {
    if (evaluation.profile.id !== SALIENCE_EVALUATION_PROFILE_ID) errors.push(`salience.evaluation profile id must be ${SALIENCE_EVALUATION_PROFILE_ID}.`);
    if (evaluation.profile.version !== SALIENCE_EVALUATION_PROFILE_VERSION) errors.push(`salience.evaluation profile version must be ${SALIENCE_EVALUATION_PROFILE_VERSION}.`);
  }
  if (!isRecord(evaluation.scope) || !SCALES.has(evaluation.scope.scale as string) || !isStringArray(evaluation.scope.subjectRefs) || evaluation.scope.subjectRefs.length === 0) errors.push('salience.evaluation scope must declare a scale and at least one subjectRef.');
  const validTime = evaluation.validTime;
  if (!isRecord(validTime) || !['validAt', 'validFrom', 'validTo'].some((field) => typeof validTime[field] === 'string')) errors.push('salience.evaluation validTime must declare validAt, validFrom, or validTo.');
  for (const field of ['receiptRefs', 'provenanceRefs']) if (!isStringArray(evaluation[field])) errors.push(`salience.evaluation ${field} must be a string array.`);
  if ('supersedesRefs' in evaluation && !isStringArray(evaluation.supersedesRefs)) errors.push('salience.evaluation supersedesRefs must be a string array.');
  if (!isRecord(evaluation.assessment)) {
    errors.push('salience.evaluation assessment must be an object.');
  } else {
    rejectUnknownFields(evaluation.assessment, new Set(['impact', 'exigency', 'novelty']), errors, 'salience.evaluation assessment');
    validateAssessment('impact', evaluation.assessment.impact, errors);
    validateAssessment('exigency', evaluation.assessment.exigency, errors);
    validateAssessment('novelty', evaluation.assessment.novelty, errors);
  }
  return { errors, ok: errors.length === 0, schemaId: SALIENCE_EVALUATION_PROFILE_ID };
}
