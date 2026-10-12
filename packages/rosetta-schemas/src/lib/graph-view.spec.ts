import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { createMaterializedView, type MaterializedView } from './materialized-view.js';
import { parseGraphView, admitGraphViewReuse, appendGraphView, graphViewIndependentSourceLineages, verifyGraphViewRebuild, type GraphView } from './graph-view.js';

const source = { source: { ref: 'urn:synthetic:shared-source', version: '1', cid: 'cid:synthetic-source' }, lineageRef: 'urn:synthetic:one-witness', evidenceRefs: ['urn:synthetic:observation'], supportRefs: ['urn:synthetic:support'], provenanceRefs: ['urn:synthetic:shared-source'] };
const member = (ref: string) => ({ ref, familyRef: 'rosetta.observation', lineageRefs: [source.lineageRef], supportRefs: source.supportRefs, origin: 'source-supported' as const });
const metadata = () => ({
  profile: { id: 'materialized.view.v1' as const, version: '1.0.0' as const }, familyRef: 'urn:synthetic:execution-view',
  source: { identity: source.source, frontier: { status: 'known' as const, frontierRef: 'urn:synthetic:frontier:1', cursorRef: null, snapshotRef: null } },
  environment: { coreVersion: '3.0.0', dependencyLockRefs: ['urn:synthetic:profile-lock:1'], translatorRevisionRefs: [], migrationRevisionRefs: [], policyRef: 'urn:synthetic:policy:1', rightsRef: 'urn:synthetic:rights:1', tenantRef: 'urn:synthetic:tenant', workspaceRef: 'urn:synthetic:workspace', transformation: { kind: 'compiler' as const, identity: { ref: 'urn:synthetic:graph-construction', version: '1', cid: null }, configurationRef: null }, datasetRevisionRefs: [], canonicalizationRef: 'urn:synthetic:jcs', conformanceProfileRefs: ['urn:synthetic:conformance'] },
  temporal: { eventWindowRef: 'urn:synthetic:event-window', observationWindowRef: 'urn:synthetic:observed-window', knowledgeFrontierRef: 'urn:synthetic:knowledge-frontier' },
  artifact: { ref: 'urn:synthetic:graph-content', cid: null, sha256: '' }, materializedAt: '2026-10-04T10:00:00Z', state: 'CURRENT_FOR_DECLARED_FRONTIER' as MaterializedView['state'], driftEvidenceRefs: [] as string[], affectedScopeRefs: [] as string[], impact: null as MaterializedView['impact'], replacementRefs: [] as string[], supersedesRefs: [] as string[], evidenceRefs: ['urn:synthetic:observation'], receiptRefs: [], provenanceRefs: ['urn:synthetic:shared-source']
});
const content = () => ({ profile: { id: 'graph.view.v1' as const, version: '1.0.0' as const }, purpose: { questionFamilyRef: 'urn:synthetic:execution', questionRef: 'urn:synthetic:question' }, jurisdiction: { authority: 'projection' as const, plane: 'derived' as const, scopeRefs: ['urn:synthetic:workspace'], ownerRefs: ['urn:synthetic:source-authority'] }, construction: { profile: { id: 'urn:synthetic:graph-construction', version: '1' }, admissibleFamilyRefs: ['rosetta.observation'], replay: 'rebuildable' as 'rebuildable' | 'non-replayable', recipeRef: 'urn:synthetic:recipe:1', sourceClosureRefs: [source.source.ref], nonReplayReasonRefs: [] as string[] }, sources: [structuredClone(source)], nodes: [member('urn:synthetic:A'), member('urn:synthetic:B')], edges: [{ ref: 'urn:synthetic:edge', fromRef: 'urn:synthetic:A', toRef: 'urn:synthetic:B', relationRef: 'prov:wasDerivedFrom', lineageRefs: [source.lineageRef], supportRefs: source.supportRefs, origin: 'source-supported' as 'source-supported' | 'view-inferred', assertionScope: 'view-local' as const }], evictions: [] as GraphView['evictions'], interViewRelations: [] as GraphView['interViewRelations'] });
function view(data = content(), meta = metadata()): GraphView {
  return parseGraphView({ ...data, materialization: createMaterializedView({ ...meta, artifact: { ...meta.artifact, sha256: traceHash(canonicalTraceJson(data)) } }) });
}
const context = () => ({ rightsAllowed: true, rightsDecisionRef: 'urn:synthetic:current-rights', requireCurrent: true, frontierRef: 'urn:synthetic:frontier:1', environment: metadata().environment });
describe('bounded GraphView #1728', () => {
  it('shares source lineage across execution and research views with different edges', () => {
    const execution = view(); const data = content(); data.purpose.questionFamilyRef = 'urn:synthetic:research'; data.edges[0].relationRef = 'urn:synthetic:research-related';
    const research = view(data, { ...metadata(), familyRef: 'urn:synthetic:research-view' });
    expect(research.materialization.source).toEqual(execution.materialization.source);
    expect(research.edges).not.toEqual(execution.edges);
    expect(graphViewIndependentSourceLineages([{ view: execution, context: context() }, { view: research, context: context() }])).toEqual([source.lineageRef]);
  });
  it('stales only the view whose declared frontier has advanced', () => {
    const stale = view(content(), { ...metadata(), state: 'STALE_SOURCE_ADVANCED', driftEvidenceRefs: ['urn:synthetic:advanced'] });
    expect(() => admitGraphViewReuse(stale, context())).toThrow(/current/i);
    expect(admitGraphViewReuse(view(), context()).materialization.state).toBe('CURRENT_FOR_DECLARED_FRONTIER');
  });
  it('evicts active membership without deleting source or historical membership', () => {
    const original = view(); const data = content(); data.nodes.pop(); data.edges = [];
    data.evictions = [{ subjectRef: 'urn:synthetic:B', lineageRefs: [source.lineageRef], reasonRefs: ['urn:synthetic:eviction'], sourceDisposition: 'preserved' }];
    const next = view(data, { ...metadata(), materializedAt: '2026-10-04T10:01:00Z', supersedesRefs: [original.materialization.recordId] });
    expect(appendGraphView([original], next)).toEqual([original, next]);
    expect(next.sources).toEqual(original.sources); expect(original.nodes).toHaveLength(2); expect(next.nodes).toHaveLength(1);
  });
  it('composes bounded upstream partial invalidation through the materialized Profile', () => {
    const impact = JSON.parse(readFileSync('tools/view-integrity/fixtures/impact-cases.json', 'utf8')).valid[0].value;
    const graph = view(content(), { ...metadata(), state: 'PARTIALLY_STALE', impact, affectedScopeRefs: [impact.subjects[0].subject.ref] });
    expect(graph.materialization.state).toBe('PARTIALLY_STALE'); expect(() => admitGraphViewReuse(graph, context())).toThrow(/current/i);
  });
  it('represents overlaps and a meta-view without flattening authority', () => {
    const data = content(); data.interViewRelations = [{ viewRef: 'urn:synthetic:research-view', relationRef: 'urn:rosetta:graph-view:overlaps', authority: 'projection', supportRefs: source.supportRefs }, { viewRef: 'urn:synthetic:meta-view', relationRef: 'urn:rosetta:graph-view:meta-of', authority: 'projection', supportRefs: source.supportRefs }];
    expect(view(data).interViewRelations).toHaveLength(2);
  });
  it('rebuilds the literal source/profile closure without claiming semantic revalidation', () => {
    const original = view(); const rebuilt = view(content(), { ...metadata(), materializedAt: '2026-10-04T10:01:00Z' });
    expect(verifyGraphViewRebuild(original, rebuilt)).toBe(true);
    expect(original.materialization.recordId).not.toBe(rebuilt.materialization.recordId);
    const altered = content(); altered.edges = [];
    expect(() => verifyGraphViewRebuild(original, view(altered))).toThrow(/closure|rebuild/i);
  });
  it('declares non-replayability without pretending it can rebuild', () => {
    const data = content(); data.construction.replay = 'non-replayable'; data.construction.nonReplayReasonRefs = ['urn:synthetic:nondeterministic-extraction'];
    const graph = view(data); expect(() => verifyGraphViewRebuild(graph, graph)).toThrow(/replay/i);
  });
  it('fences stale bytes, membership and support counts through current rights', () => {
    const graph = view(content(), { ...metadata(), state: 'STALE_POLICY_CHANGED', driftEvidenceRefs: ['urn:synthetic:revocation'] });
    const revoked = { ...context(), requireCurrent: false, rightsAllowed: false };
    expect(() => admitGraphViewReuse(graph, revoked)).toThrow(/rights/i);
    expect(() => graphViewIndependentSourceLineages([{ view: graph, context: revoked }])).toThrow(/rights/i);
  });
  it('rejects pruning represented as canonical evidence deletion', () => {
    const data = content(); data.nodes.pop(); data.edges = [];
    const invalid = { ...data, evictions: [{ subjectRef: 'urn:synthetic:B', lineageRefs: [source.lineageRef], reasonRefs: ['urn:synthetic:prune'], sourceDisposition: 'deleted' }] };
    expect(() => view(invalid as unknown as ReturnType<typeof content>)).toThrow(/contract|preserved/i);
  });
  it('rejects view-local inference promoted into universal/Core truth', () => {
    const data = content(); data.edges[0].origin = 'view-inferred';
    expect(view(data).edges[0].assertionScope).toBe('view-local');
    expect(() => view({ ...data, edges: [{ ...data.edges[0], assertionScope: 'universal-truth' }] } as unknown as ReturnType<typeof content>)).toThrow(/contract|view-local/i);
  });
  it('rejects dangling node, lineage and source-closure references', () => {
    const data = content(); data.edges[0].toRef = 'urn:synthetic:missing'; expect(() => view(data)).toThrow(/node|endpoint/i);
    const lineage = content(); lineage.nodes[0].lineageRefs = ['urn:synthetic:unresolved']; expect(() => view(lineage)).toThrow(/lineage/i);
    const closure = content(); closure.construction.sourceClosureRefs = []; expect(() => view(closure)).toThrow(/closure/i);
  });
  it('does not count one canonical source twice under different projection lineage IDs', () => {
    const data = content(); data.sources[0].lineageRef = 'urn:synthetic:second-witness'; data.nodes.forEach(n => n.lineageRefs = [data.sources[0].lineageRef]); data.edges[0].lineageRefs = [data.sources[0].lineageRef];
    expect(() => graphViewIndependentSourceLineages([{ view: view(), context: context() }, { view: view(data), context: context() }])).toThrow(/lineage|witness/i);
  });
  it('binds graph bytes to the materialized digest and preserves explicit history', () => {
    const original = view(); expect(() => parseGraphView({ ...original, edges: [] })).toThrow(/digest/i);
    expect(() => appendGraphView([original], view(content(), { ...metadata(), materializedAt: '2026-10-04T10:01:00Z' }))).toThrow(/supersession/i);
  });
});
