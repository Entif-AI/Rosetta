import { checkProfileFields, checkProfileRefs, checkProfileStrings, CORE_EVALUATION_VERDICTS, isProfileRecord, isProfileRefs, isProfileTimestamp } from './evaluation-profile-validation.js';

export const SALIENCE_EVALUATION_PROFILE_ID = 'salience.evaluation.v1';
export const SALIENCE_EVALUATION_PROFILE_VERSION = '1.0.0';
export interface SalienceProfileValidationResult {
  errors: string[];
  ok: boolean;
  schemaId: typeof SALIENCE_EVALUATION_PROFILE_ID;
}

const EVALUATION_FIELDS = ['assessment', 'assessedAt', 'evaluationId', 'profile', 'provenanceRefs', 'receiptRefs', 'scope', 'summary', 'supersedesRefs', 'validTime', 'verdict'];
const ASSESSMENT_FIELDS = ['baselineRefs', 'evidenceRefs', 'phenomenonRefs', 'provenanceRefs', 'status', 'uncertainty', 'value'];
const SCALES = ['event', 'cluster', 'pattern', 'trend', 'system'];
const STATUSES = ['observed', 'estimated', 'unknown', 'unavailable'];

function validateValue(value: unknown, errors: string[], path: string): void {
  if (!isProfileRecord(value)) { errors.push(`${path} must be an object.`); return; }
  checkProfileStrings(value, ['schemaRef'], errors, path);
  if (value.representation === 'ordinal') {
    checkProfileFields(value, ['allowedLevels', 'level', 'representation', 'schemaRef'], errors, path);
    if (!isProfileRefs(value.allowedLevels) || value.allowedLevels.length === 0 || new Set(value.allowedLevels).size !== value.allowedLevels.length) errors.push(`${path} allowedLevels must be a non-empty unique string array.`);
    if (typeof value.level !== 'string' || !isProfileRefs(value.allowedLevels) || !value.allowedLevels.includes(value.level)) errors.push(`${path} level must belong to allowedLevels.`);
  } else if (value.representation === 'scalar') {
    checkProfileFields(value, ['representation', 'schemaRef', 'value'], errors, path);
    if (typeof value.value !== 'number' || !Number.isFinite(value.value)) errors.push(`${path} scalar must be a finite number.`);
  } else if (value.representation === 'reference') {
    checkProfileFields(value, ['representation', 'schemaRef', 'valueRef'], errors, path);
    checkProfileStrings(value, ['valueRef'], errors, path);
  } else errors.push(`${path} representation must be scalar, ordinal, or reference.`);
}

function validateAssessment(name: 'impact' | 'exigency' | 'novelty', value: unknown, errors: string[]): void {
  const path = `salience.evaluation.assessment.${name}`;
  if (!isProfileRecord(value)) { errors.push(`${path} must be an object.`); return; }
  checkProfileFields(value, ASSESSMENT_FIELDS, errors, path);
  if (!STATUSES.includes(value.status as string)) errors.push(`${path} status is unsupported.`);
  if (!isProfileRecord(value.uncertainty)) errors.push(`${path} uncertainty must declare a status.`);
  else {
    checkProfileFields(value.uncertainty, ['status', 'assessmentRef'], errors, `${path}.uncertainty`);
    if (!['known', 'bounded', 'unknown', 'unavailable'].includes(value.uncertainty.status as string)) errors.push(`${path} uncertainty status is unsupported.`);
    if ('assessmentRef' in value.uncertainty) checkProfileStrings(value.uncertainty, ['assessmentRef'], errors, `${path}.uncertainty`);
  }
  checkProfileRefs(value, ['evidenceRefs', 'provenanceRefs'], errors, path);
  for (const field of ['baselineRefs', 'phenomenonRefs']) if (name === 'novelty' || field in value) checkProfileRefs(value, [field], errors, path);
  if (value.status === 'unknown' || value.status === 'unavailable') {
    if ('value' in value) errors.push(`${path} must not fabricate a value for ${value.status}.`);
  } else {
    validateValue(value.value, errors, `${path}.value`);
    if (name === 'novelty' && (!isProfileRefs(value.baselineRefs) || value.baselineRefs.length === 0)) errors.push(`${path} requires an explicit baseline for an assessed value.`);
  }
}

export function isSalienceEvaluationProfile(payload: unknown): boolean {
  return isProfileRecord(payload) && isProfileRecord(payload.profile) && typeof payload.profile.id === 'string' && payload.profile.id.startsWith('salience.evaluation.');
}

/** Structural conformance only; this Profile establishes neither truth nor operational authority. */
export function validateSalienceEvaluation(payload: unknown): SalienceProfileValidationResult {
  const errors: string[] = [];
  const result = (): SalienceProfileValidationResult => ({ errors, ok: errors.length === 0, schemaId: SALIENCE_EVALUATION_PROFILE_ID });
  if (!isProfileRecord(payload)) { errors.push('salience.evaluation must be an object.'); return result(); }
  checkProfileFields(payload, EVALUATION_FIELDS, errors, 'salience.evaluation');
  checkProfileStrings(payload, ['evaluationId', 'summary'], errors, 'salience.evaluation');
  if (!CORE_EVALUATION_VERDICTS.includes(payload.verdict as typeof CORE_EVALUATION_VERDICTS[number])) errors.push('salience.evaluation verdict must use the Core Evaluation vocabulary.');
  if (!isProfileTimestamp(payload.assessedAt)) errors.push('salience.evaluation assessedAt must be an RFC 3339 timestamp.');
  if (!isProfileRecord(payload.profile)) errors.push('salience.evaluation profile must be an object.');
  else {
    checkProfileFields(payload.profile, ['id', 'version'], errors, 'salience.evaluation.profile');
    if (payload.profile.id !== SALIENCE_EVALUATION_PROFILE_ID || payload.profile.version !== SALIENCE_EVALUATION_PROFILE_VERSION) errors.push('salience.evaluation Profile id/version is unsupported.');
  }
  if (!isProfileRecord(payload.scope)) errors.push('salience.evaluation scope must be an object.');
  else {
    checkProfileFields(payload.scope, ['scale', 'subjectRefs'], errors, 'salience.evaluation.scope');
    if (!SCALES.includes(payload.scope.scale as string) || !isProfileRefs(payload.scope.subjectRefs) || payload.scope.subjectRefs.length === 0) errors.push('salience.evaluation scope must declare a scale and at least one subjectRef.');
  }
  if (!isProfileRecord(payload.validTime) || Object.keys(payload.validTime).length === 0) errors.push('salience.evaluation validTime must declare validAt, validFrom, or validTo.');
  else {
    checkProfileFields(payload.validTime, ['validAt', 'validFrom', 'validTo'], errors, 'salience.evaluation.validTime');
    for (const value of Object.values(payload.validTime)) if (!isProfileTimestamp(value)) errors.push('salience.evaluation validTime values must be RFC 3339 timestamps.');
    if (isProfileTimestamp(payload.validTime.validFrom) && isProfileTimestamp(payload.validTime.validTo) && Date.parse(payload.validTime.validFrom) > Date.parse(payload.validTime.validTo)) errors.push('salience.evaluation validFrom must not follow validTo.');
  }
  checkProfileRefs(payload, ['receiptRefs', 'provenanceRefs'], errors, 'salience.evaluation');
  if ('supersedesRefs' in payload) checkProfileRefs(payload, ['supersedesRefs'], errors, 'salience.evaluation');
  if (isProfileRefs(payload.supersedesRefs) && payload.supersedesRefs.includes(payload.evaluationId as string)) errors.push('salience.evaluation cannot supersede itself.');
  if (!isProfileRecord(payload.assessment)) errors.push('salience.evaluation assessment must be an object.');
  else {
    checkProfileFields(payload.assessment, ['impact', 'exigency', 'novelty'], errors, 'salience.evaluation.assessment');
    for (const name of ['impact', 'exigency', 'novelty'] as const) validateAssessment(name, payload.assessment[name], errors);
  }
  return result();
}
