import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { traceHash } from './trace-normalization.js';
import { createMaterializedView, parseMaterializedView, appendMaterializedView, admitMaterializedViewReuse } from './materialized-view.js';

const body = () => ({
  profile: { id: 'materialized.view.v1' as const, version: '1.0.0' as const }, familyRef: 'urn:synthetic:compiled-evaluation',
  source: { identity: { ref: 'urn:synthetic:source', version: '1', cid: null }, frontier: { status: 'known' as 'known' | 'unknown', frontierRef: 'urn:synthetic:frontier:1' as string | null, cursorRef: null, snapshotRef: null } },
  environment: { coreVersion: '3.0.0', dependencyLockRefs: ['urn:synthetic:lock:1'], translatorRevisionRefs: ['urn:synthetic:translator:1'], migrationRevisionRefs: [], policyRef: 'urn:synthetic:policy:1', rightsRef: 'urn:synthetic:rights:1', tenantRef: null, workspaceRef: null,
    transformation: { kind: 'compiler' as const, identity: { ref: 'urn:synthetic:compiler', version: '1', cid: null }, configurationRef: null }, datasetRevisionRefs: ['urn:synthetic:dataset:1'], canonicalizationRef: 'urn:synthetic:jcs', conformanceProfileRefs: ['urn:synthetic:conformance:1'] },
  temporal: { eventWindowRef: 'urn:synthetic:event-window', observationWindowRef: 'urn:synthetic:observed-window', knowledgeFrontierRef: 'urn:synthetic:knowledge-frontier' },
  artifact: { ref: 'urn:synthetic:view-content', cid: null, sha256: traceHash('synthetic view') },
  materializedAt: '2026-10-04T08:00:00Z', state: 'CURRENT_FOR_DECLARED_FRONTIER' as 'CURRENT_FOR_DECLARED_FRONTIER' | 'STALE_SOURCE_ADVANCED' | 'STALE_DEPENDENCY_CHANGED' | 'STALE_POLICY_CHANGED' | 'INVALIDATED' | 'PARTIALLY_STALE' | 'REVALIDATION_REQUIRED' | 'SUPERSEDED' | 'UNKNOWN',
  driftEvidenceRefs: [] as string[], affectedScopeRefs: [] as string[], impact: null as unknown,
  replacementRefs: [] as string[], supersedesRefs: [] as string[], evidenceRefs: ['urn:synthetic:evidence'], receiptRefs: [], provenanceRefs: ['urn:synthetic:source']
});
const currentContext = () => ({ rightsAllowed: true, rightsDecisionRef: 'urn:synthetic:current-rights-decision', requireCurrent: true, frontierRef: 'urn:synthetic:frontier:1', environment: body().environment });
const stale = (state: ReturnType<typeof body>['state']) => createMaterializedView({ ...body(), state, driftEvidenceRefs: ['urn:synthetic:drift'] });
describe('materialized-view identity and staleness #1731', () => {
  it('admits unchanged source/dependencies only for the declared frontier', () => {
    const view = createMaterializedView(body());
    expect(parseMaterializedView(view)).toEqual(view);
    expect(admitMaterializedViewReuse(view, currentContext())).toEqual(view);
  });
  it('rejects byte-valid old source after the consumer frontier advances', () => {
    const view = createMaterializedView(body());
    expect(() => admitMaterializedViewReuse(view, { ...currentContext(), frontierRef: 'urn:synthetic:frontier:2' })).toThrow(/frontier/i);
    expect(() => admitMaterializedViewReuse(stale('STALE_SOURCE_ADVANCED'), currentContext())).toThrow(/current/i);
  });
  it('represents schema/Profile revision drift with unchanged source bytes', () => {
    const view = stale('STALE_DEPENDENCY_CHANGED');
    expect(view.source).toEqual(createMaterializedView(body()).source);
    expect(() => admitMaterializedViewReuse(view, currentContext())).toThrow(/current/i);
    expect(() => admitMaterializedViewReuse(createMaterializedView(body()), { ...currentContext(), environment: { ...body().environment, dependencyLockRefs: ['urn:synthetic:lock:2'] } })).toThrow(/dependency/i);
  });
  it('fences policy and rights revision without changing source bytes', () => {
    expect(stale('STALE_POLICY_CHANGED').source.identity).toEqual(body().source.identity);
    expect(() => admitMaterializedViewReuse(createMaterializedView(body()), { ...currentContext(), environment: { ...body().environment, policyRef: 'urn:synthetic:policy:2' } })).toThrow(/policy|rights/i);
  });
  it('reuses impact evidence for bounded partial invalidation', () => {
    const impact = JSON.parse(readFileSync('tools/view-integrity/fixtures/impact-cases.json', 'utf8')).valid[0].value;
    const value = { ...body(), state: 'PARTIALLY_STALE' as const, driftEvidenceRefs: ['urn:synthetic:invalidation'], affectedScopeRefs: [impact.subjects[0].subject.ref], impact };
    expect(parseMaterializedView(createMaterializedView(value)).state).toBe('PARTIALLY_STALE');
    expect(() => createMaterializedView({ ...value, affectedScopeRefs: [] })).toThrow(/scope/i);
  });
  it('rematerializes additively and preserves reconstructable old identity', () => {
    const previous = createMaterializedView(body());
    const next = createMaterializedView({ ...body(), materializedAt: '2026-10-04T08:01:00Z', supersedesRefs: [previous.recordId] });
    expect(next.recordId).not.toBe(previous.recordId);
    expect(appendMaterializedView([previous], next)).toEqual([previous, next]);
    expect(appendMaterializedView([previous, next], next)).toEqual([previous, next]);
  });
  it('missing frontier remains UNKNOWN and cannot pass current admission', () => {
    const unknown = { ...body(), source: { ...body().source, frontier: { status: 'unknown' as const, frontierRef: null, cursorRef: null, snapshotRef: null } }, state: 'UNKNOWN' as const };
    expect(createMaterializedView(unknown).state).toBe('UNKNOWN');
    expect(() => createMaterializedView({ ...unknown, state: 'CURRENT_FOR_DECLARED_FRONTIER' })).toThrow(/frontier/i);
  });
  it('cannot infer current status from incomplete impact scope', () => {
    const impact = JSON.parse(readFileSync('tools/view-integrity/fixtures/impact-cases.json', 'utf8')).valid[5].value;
    expect(() => createMaterializedView({ ...body(), impact })).toThrow(/revalidation|impact/i);
  });
  it('distinguishes compiler/model revision identities over the same source', () => {
    const first = createMaterializedView(body());
    const second = createMaterializedView({ ...body(), environment: { ...body().environment, transformation: { ...body().environment.transformation, identity: { ...body().environment.transformation.identity, version: '2' } } } });
    expect(first.source).toEqual(second.source); expect(first.recordId).not.toBe(second.recordId);
  });
  it('rejects a prior transformation when the required environment advances', () => {
    const environment = { ...body().environment, transformation: { ...body().environment.transformation, identity: { ...body().environment.transformation.identity, version: '2' } } };
    const context = { ...currentContext(), environment };
    expect(() => admitMaterializedViewReuse(createMaterializedView(body()), context)).toThrow(/transformation|environment/i);
  });
  it('distinguishes stale compatibility/evaluation corpus from current', () => {
    expect(() => admitMaterializedViewReuse(createMaterializedView(body()), { ...currentContext(), environment: { ...body().environment, datasetRevisionRefs: ['urn:synthetic:dataset:2'] } })).toThrow(/dataset/i);
  });
  it('rejects stale reuse when the consumer explicitly requires current evidence', () => {
    expect(() => admitMaterializedViewReuse(stale('STALE_SOURCE_ADVANCED'), currentContext())).toThrow(/current/i);
    expect(admitMaterializedViewReuse(stale('STALE_SOURCE_ADVANCED'), { ...currentContext(), requireCurrent: false }).state).toBe('STALE_SOURCE_ADVANCED');
  });
  it('revoked current rights fence byte-valid retained historical material', () => {
    expect(() => admitMaterializedViewReuse(stale('STALE_POLICY_CHANGED'), { ...currentContext(), requireCurrent: false, rightsAllowed: false })).toThrow(/rights/i);
  });
  it('does not treat a truthy malformed rights decision as permission', () => {
    const context = { ...currentContext(), rightsAllowed: 'false' as unknown as boolean };
    expect(() => admitMaterializedViewReuse(createMaterializedView(body()), context)).toThrow(/rights/i);
  });
  it('rejects rematerialization masquerading as semantic revalidation', () => {
    const impact = JSON.parse(readFileSync('tools/view-integrity/fixtures/impact-cases.json', 'utf8')).invalid[0].value;
    expect(() => createMaterializedView({ ...body(), impact })).toThrow(/revalidation/i);
  });
  it('requires explicit history lineage and rejects changed metadata under an old identity', () => {
    const previous = createMaterializedView(body());
    const changed = { ...previous, materializedAt: '2026-10-04T08:01:00Z' };
    expect(() => parseMaterializedView(changed)).toThrow(/digest/i);
    expect(() => appendMaterializedView([previous], createMaterializedView({ ...body(), materializedAt: changed.materializedAt }))).toThrow(/supersession/i);
  });
});
