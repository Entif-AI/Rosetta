import { checkProfileFields, checkProfileRefs, checkProfileStrings, CORE_EVALUATION_VERDICTS, isProfileRecord, isProfileRefs, isProfileTimestamp } from './evaluation-profile-validation.js';

export const COUNTERFACTUAL_PROFILE = Object.freeze({ id: 'counterfactual.evaluation.v1', version: '1.0.0' } as const);
const CONTEXT_REFS = ['authorityRefs', 'policyRefs', 'modelRefs', 'runtimeRefs', 'profileRefs', 'budgetRefs'];
const COMPARISON_REFS = ['comparatorRefs', 'verifierRefs', 'qualityObservationRefs', 'exceptionObservationRefs', 'latencyObservationRefs', 'computeObservationRefs', 'tokenObservationRefs', 'costObservationRefs', 'maintenanceObservationRefs', 'revalidationObservationRefs'];
const DISPOSITIONS = ['better', 'equivalent-within-declared-criteria', 'worse', 'inconclusive', 'invalid', 'non-replayable', 'unknown'];
const COMPARABLE = ['better', 'equivalent-within-declared-criteria', 'worse'];

export function isCounterfactualEvaluationProfile(payload: unknown): boolean {
  return isProfileRecord(payload) && isProfileRecord(payload.profile) && typeof payload.profile.id === 'string' && payload.profile.id.startsWith('counterfactual.evaluation.');
}

/** Public record conformance. Does not execute replay, enforce a sandbox, or authorize production changes. */
export function validateCounterfactualEvaluation(payload: unknown): { errors: string[]; ok: boolean } {
  const errors: string[] = [];
  const result = () => ({ errors, ok: errors.length === 0 });
  if (!isProfileRecord(payload)) { errors.push('counterfactual.evaluation must be an object.'); return result(); }
  checkProfileFields(payload, ['evaluationId', 'summary', 'verdict', 'profile', 'historical', 'candidate', 'replay', 'comparison', 'disposition', 'validityScope', 'evidenceRefs', 'counterEvidenceRefs', 'provenanceRefs', 'receiptRefs', 'supersedesRefs', 'laterEvaluationRefs'], errors, 'counterfactual.evaluation');
  checkProfileStrings(payload, ['evaluationId', 'summary'], errors, 'counterfactual.evaluation');
  if (!CORE_EVALUATION_VERDICTS.includes(payload.verdict as typeof CORE_EVALUATION_VERDICTS[number])) errors.push('counterfactual.evaluation verdict must use the Core Evaluation vocabulary.');
  if (!DISPOSITIONS.includes(payload.disposition as string)) errors.push('counterfactual.evaluation disposition is unsupported.');
  const object = (value: unknown, fields: string[], path: string): Record<string, unknown> => {
    if (!isProfileRecord(value)) { errors.push(`${path} must be an object.`); return {}; }
    checkProfileFields(value, fields, errors, path);
    return value;
  };
  const profile = object(payload.profile, ['id', 'version'], 'profile');
  if (profile.id !== COUNTERFACTUAL_PROFILE.id || profile.version !== COUNTERFACTUAL_PROFILE.version) errors.push('counterfactual.evaluation Profile id/version is unsupported.');
  const historical = object(payload.historical, ['subjectRefs', 'decisionRef', 'evidenceCutoff', 'context'], 'historical');
  checkProfileRefs(historical, ['subjectRefs'], errors, 'historical');
  checkProfileStrings(historical, ['decisionRef'], errors, 'historical');
  if (!isProfileRefs(historical.subjectRefs) || historical.subjectRefs.length === 0) errors.push('historical requires a subject reference.');
  const cutoff = object(historical.evidenceCutoff, ['frontierRef', 'availableAt', 'inputRefs', 'excludedLaterEvidenceRefs'], 'historical.evidenceCutoff');
  checkProfileStrings(cutoff, ['frontierRef'], errors, 'historical.evidenceCutoff');
  if (!isProfileTimestamp(cutoff.availableAt)) errors.push('historical.evidenceCutoff availableAt must be an RFC 3339 timestamp.');
  checkProfileRefs(cutoff, ['inputRefs', 'excludedLaterEvidenceRefs'], errors, 'historical.evidenceCutoff');
  if (isProfileRefs(cutoff.inputRefs) && isProfileRefs(cutoff.excludedLaterEvidenceRefs) && cutoff.inputRefs.some((ref) => (cutoff.excludedLaterEvidenceRefs as string[]).includes(ref))) errors.push('Historical inputs must not include declared later evidence.');
  const context = object(historical.context, CONTEXT_REFS, 'historical.context');
  checkProfileRefs(context, CONTEXT_REFS, errors, 'historical.context');
  if (!isProfileRefs(context.authorityRefs) || context.authorityRefs.length === 0) errors.push('historical.context requires authority references.');
  const candidate = object(payload.candidate, ['mechanismRef', 'version', 'class'], 'candidate');
  checkProfileStrings(candidate, ['mechanismRef', 'version', 'class'], errors, 'candidate');
  const replay = object(payload.replay, ['state', 'runRefs', 'mode', 'liveEffects', 'sandboxRef', 'effectAttempt'], 'replay');
  checkProfileRefs(replay, ['runRefs'], errors, 'replay');
  if (!['replayable', 'partially-replayable', 'non-replayable', 'unknown'].includes(replay.state as string)) errors.push('replay state is unsupported.');
  if (!['no-live-effect', 'sandbox'].includes(replay.mode as string) || replay.liveEffects !== 'none') errors.push('Replay must declare no live effects.');
  if (replay.mode === 'sandbox' || 'sandboxRef' in replay) checkProfileStrings(replay, ['sandboxRef'], errors, 'replay');
  if ('effectAttempt' in replay) {
    const attempt = object(replay.effectAttempt, ['requestRef', 'disposition', 'receiptRef'], 'replay.effectAttempt');
    checkProfileStrings(attempt, ['requestRef', 'receiptRef'], errors, 'replay.effectAttempt');
    if (attempt.disposition !== 'rejected') errors.push('Live effect attempts must be rejected.');
    if (payload.disposition !== 'invalid') errors.push('An attempted live effect must retain an invalid evaluation disposition.');
  }
  const comparison = object(payload.comparison, ['criteriaRef', ...COMPARISON_REFS], 'comparison');
  checkProfileStrings(comparison, ['criteriaRef'], errors, 'comparison');
  checkProfileRefs(comparison, COMPARISON_REFS, errors, 'comparison');
  if (COMPARABLE.includes(payload.disposition as string)) {
    for (const field of ['comparatorRefs', 'verifierRefs', 'qualityObservationRefs']) if (!isProfileRefs(comparison[field]) || comparison[field].length === 0) errors.push(`A comparable result requires ${field}.`);
    if (!['replayable', 'partially-replayable'].includes(replay.state as string) || !isProfileRefs(replay.runRefs) || replay.runRefs.length === 0) errors.push('A comparable result requires replay evidence.');
  }
  if (payload.disposition === 'non-replayable' && replay.state !== 'non-replayable') errors.push('A non-replayable disposition requires explicit non-replayability.');
  const scope = object(payload.validityScope, ['scopeRef', 'description'], 'validityScope');
  checkProfileStrings(scope, ['scopeRef', 'description'], errors, 'validityScope');
  checkProfileRefs(payload, ['evidenceRefs', 'counterEvidenceRefs', 'provenanceRefs', 'receiptRefs', 'supersedesRefs', 'laterEvaluationRefs'], errors, 'counterfactual.evaluation');
  for (const field of ['provenanceRefs', 'receiptRefs']) if (!isProfileRefs(payload[field]) || payload[field].length === 0) errors.push(`counterfactual.evaluation requires ${field}.`);
  for (const field of ['supersedesRefs', 'laterEvaluationRefs']) if (isProfileRefs(payload[field]) && payload[field].includes(payload.evaluationId as string)) errors.push(`counterfactual.evaluation ${field} must not reference itself.`);
  return result();
}
