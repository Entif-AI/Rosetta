import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { IMPACT_REVALIDATION_SCHEMA, parseImpactRevalidation, type ImpactRevalidation } from './impact-revalidation.js';
import { compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceObjectSchema as object, evidenceProfileSchema as profile, evidenceIdentitySchema as identity, evidenceTimestampSchema as timestamp, nullableEvidenceSchema as nullable, type EvidenceIdentity } from './evidence-contract-validation.js';

export const MATERIALIZED_VIEW_STATES = ['CURRENT_FOR_DECLARED_FRONTIER', 'STALE_SOURCE_ADVANCED', 'STALE_DEPENDENCY_CHANGED', 'STALE_POLICY_CHANGED', 'INVALIDATED', 'PARTIALLY_STALE', 'REVALIDATION_REQUIRED', 'SUPERSEDED', 'UNKNOWN'] as const;
export interface MaterializedView {
  recordId: string; profile: { id: 'materialized.view.v1'; version: '1.0.0' }; familyRef: string;
  source: { identity: EvidenceIdentity; frontier: { status: 'known' | 'unknown'; frontierRef: string | null; cursorRef: string | null; snapshotRef: string | null } };
  environment: { coreVersion: string; dependencyLockRefs: string[]; translatorRevisionRefs: string[]; migrationRevisionRefs: string[]; policyRef: string; rightsRef: string; tenantRef: string | null; workspaceRef: string | null;
    transformation: { kind: 'compiler' | 'model' | 'translator' | 'index' | 'other'; identity: EvidenceIdentity; configurationRef: string | null }; datasetRevisionRefs: string[]; canonicalizationRef: string; conformanceProfileRefs: string[] };
  temporal: { eventWindowRef: string; observationWindowRef: string; knowledgeFrontierRef: string };
  artifact: { ref: string; cid: string | null; sha256: string };
  materializedAt: string; state: typeof MATERIALIZED_VIEW_STATES[number]; driftEvidenceRefs: string[]; affectedScopeRefs: string[]; impact: ImpactRevalidation | null;
  replacementRefs: string[]; supersedesRefs: string[]; evidenceRefs: string[]; receiptRefs: string[]; provenanceRefs: string[];
}
export const MATERIALIZED_VIEW_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:materialized.view.v1', title: 'Materialized view identity, frontier and currency v1',
  ...object({ recordId: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' }, profile: profile('materialized.view.v1'), familyRef: ref,
    source: object({ identity, frontier: object({ status: { enum: ['known', 'unknown'] }, frontierRef: nullable(ref), cursorRef: nullable(ref), snapshotRef: nullable(ref) }) }),
    environment: object({ coreVersion: ref, dependencyLockRefs: refs, translatorRevisionRefs: refs, migrationRevisionRefs: refs, policyRef: ref, rightsRef: ref, tenantRef: nullable(ref), workspaceRef: nullable(ref),
      transformation: object({ kind: { enum: ['compiler', 'model', 'translator', 'index', 'other'] }, identity, configurationRef: nullable(ref) }), datasetRevisionRefs: refs, canonicalizationRef: ref, conformanceProfileRefs: support }),
    temporal: object({ eventWindowRef: ref, observationWindowRef: ref, knowledgeFrontierRef: ref }),
    artifact: object({ ref, cid: nullable(ref), sha256: { type: 'string', pattern: '^[a-f0-9]{64}$' } }),
    materializedAt: timestamp, state: { enum: MATERIALIZED_VIEW_STATES }, driftEvidenceRefs: refs, affectedScopeRefs: refs, impact: nullable({ $ref: IMPACT_REVALIDATION_SCHEMA.$id }),
    replacementRefs: refs, supersedesRefs: refs, evidenceRefs: support, receiptRefs: refs, provenanceRefs: support
  })
};
const admit = compileEvidenceContract<MaterializedView>(MATERIALIZED_VIEW_SCHEMA, [IMPACT_REVALIDATION_SCHEMA]);
const knownFrontier = (value: MaterializedView) => value.source.frontier.status === 'known' && Boolean(value.source.frontier.frontierRef || value.source.frontier.cursorRef || value.source.frontier.snapshotRef);
export function parseMaterializedView(input: unknown): MaterializedView {
  const value = admit(input);
  const { recordId, ...body } = value;
  if (recordId !== 'sha256:' + traceHash(canonicalTraceJson(body))) throw new Error('Materialized view metadata digest mismatch.');
  if (value.state === 'CURRENT_FOR_DECLARED_FRONTIER' && !knownFrontier(value)) throw new Error('Current view requires a known declared frontier.');
  if (value.source.frontier.status === 'unknown' && (value.source.frontier.frontierRef || value.source.frontier.cursorRef || value.source.frontier.snapshotRef)) throw new Error('Unknown frontier cannot contain a claimed known cursor.');
  if (value.state.startsWith('STALE_') && !value.driftEvidenceRefs.length) throw new Error('Staleness requires attributable drift evidence.');
  if (value.impact) parseImpactRevalidation(value.impact);
  if (['INVALIDATED', 'PARTIALLY_STALE', 'REVALIDATION_REQUIRED'].includes(value.state) && !value.impact) throw new Error('Invalidation/revalidation requires the impact Profile.');
  if (value.state === 'PARTIALLY_STALE' && (!value.affectedScopeRefs.length || value.affectedScopeRefs.some(ref =>
    !value.impact?.subjects.some(subject => subject.subject.ref === ref) && !value.impact?.candidateScope.queryRefs.includes(ref)))) throw new Error('Partial staleness requires bounded impact scope.');
  if (value.state === 'SUPERSEDED' && !value.replacementRefs.length) throw new Error('Superseded view requires replacement references.');
  if (value.supersedesRefs.includes(value.recordId)) throw new Error('View cannot supersede itself.');
  if (value.state === 'CURRENT_FOR_DECLARED_FRONTIER' && value.impact && !value.impact.subjects.some(subject => subject.subject.ref === value.artifact.ref &&
    ['PROVEN_UNAFFECTED', 'REVALIDATED_VALID'].includes(subject.disposition))) throw new Error('Current impacted view requires attributable revalidation of its subject.');
  return value;
}
export function createMaterializedView(input: unknown): MaterializedView {
  if (!input || typeof input !== 'object' || Array.isArray(input) || 'recordId' in input) throw new Error('Provide materialized view metadata without recordId.');
  return parseMaterializedView({ ...input, recordId: 'sha256:' + traceHash(canonicalTraceJson(input)) });
}

/** Consumer requirements and a current rights decision are supplied by their owning authorities. */
export function admitMaterializedViewReuse(input: unknown, context: { rightsAllowed: boolean; rightsDecisionRef: string; requireCurrent: boolean; frontierRef: string; environment: MaterializedView['environment'] }): MaterializedView {
  const value = parseMaterializedView(input);
  if (context.rightsAllowed !== true || typeof context.rightsDecisionRef !== 'string' || !context.rightsDecisionRef.trim()) throw new Error('Current rights decision does not permit view reuse.');
  if (typeof context.requireCurrent !== 'boolean') throw new Error('Explicit current evidence requirement is required.');
  if (context.requireCurrent) {
    if (value.state !== 'CURRENT_FOR_DECLARED_FRONTIER') throw new Error('Consumer requires a current view.');
    const frontier = value.source.frontier;
    if (![frontier.frontierRef, frontier.cursorRef, frontier.snapshotRef].includes(context.frontierRef)) throw new Error('Consumer source frontier differs from materialized frontier.');
    const sameRefs = (a: string[], b: string[]) => canonicalTraceJson([...a].sort()) === canonicalTraceJson([...b].sort());
    if (!sameRefs(value.environment.dependencyLockRefs, context.environment.dependencyLockRefs)) throw new Error('Consumer dependency lock differs.');
    if (value.environment.policyRef !== context.environment.policyRef || value.environment.rightsRef !== context.environment.rightsRef) throw new Error('Consumer policy/rights revision differs.');
    if (!sameRefs(value.environment.datasetRevisionRefs, context.environment.datasetRevisionRefs)) throw new Error('Consumer evaluation dataset revision differs.');
    const refFields = ['dependencyLockRefs', 'translatorRevisionRefs', 'migrationRevisionRefs', 'datasetRevisionRefs', 'conformanceProfileRefs'] as const;
    const normalizedEnvironment = (environment: MaterializedView['environment']) => ({ ...environment, ...Object.fromEntries(refFields.map(key => [key, [...environment[key]].sort()])) });
    if (canonicalTraceJson(normalizedEnvironment(value.environment)) !== canonicalTraceJson(normalizedEnvironment(context.environment))) throw new Error('Consumer transformation/environment revision differs.');
  }
  return value;
}
export function appendMaterializedView(history: readonly MaterializedView[], next: MaterializedView): MaterializedView[] {
  const records: MaterializedView[] = [];
  for (const input of [...history, next]) {
    const value = parseMaterializedView(input);
    if (records.some(r => r.recordId === value.recordId)) continue;
    if (value.supersedesRefs.some(ref => !records.some(r => r.recordId === ref))) throw new Error('Unresolved view supersession.');
    const previous = records.at(-1);
    if (previous && (previous.familyRef !== value.familyRef || !value.supersedesRefs.includes(previous.recordId))) throw new Error('View revision requires family identity and explicit supersession.');
    if (previous && ['INVALIDATED', 'PARTIALLY_STALE', 'REVALIDATION_REQUIRED'].includes(previous.state) && value.state === 'CURRENT_FOR_DECLARED_FRONTIER' &&
      !value.impact?.subjects.some(s => [previous.recordId, previous.artifact.ref].includes(s.subject.ref) && ['PROVEN_UNAFFECTED', 'REVALIDATED_VALID'].includes(s.disposition))) throw new Error('Rematerialization is not semantic revalidation.');
    records.push(value);
  }
  return structuredClone(records);
}
