import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { IMPACT_REVALIDATION_SCHEMA } from './impact-revalidation.js';
import { MATERIALIZED_VIEW_SCHEMA, parseMaterializedView, admitMaterializedViewReuse, appendMaterializedView, type MaterializedView } from './materialized-view.js';
import { compileEvidenceContract, collectEvidenceSourceLineages, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceObjectSchema as object, evidenceProfileSchema as profile, evidenceIdentitySchema as identity, type EvidenceIdentity } from './evidence-contract-validation.js';

export interface GraphViewSource {
  source: EvidenceIdentity;
  lineageRef: string;
  evidenceRefs: string[];
  supportRefs: string[];
  provenanceRefs: string[];
}
export interface GraphView {
  profile: { id: 'graph.view.v1'; version: '1.0.0' };
  materialization: MaterializedView;
  purpose: { questionFamilyRef: string; questionRef: string };
  jurisdiction: { authority: 'projection'; plane: 'derived'; scopeRefs: string[]; ownerRefs: string[] };
  construction: { profile: { id: string; version: string }; admissibleFamilyRefs: string[]; replay: 'rebuildable' | 'non-replayable'; recipeRef: string; sourceClosureRefs: string[]; nonReplayReasonRefs: string[] };
  sources: GraphViewSource[];
  nodes: { ref: string; familyRef: string; lineageRefs: string[]; supportRefs: string[]; origin: 'source-supported' | 'view-inferred' }[];
  edges: { ref: string; fromRef: string; toRef: string; relationRef: string; lineageRefs: string[]; supportRefs: string[]; origin: 'source-supported' | 'view-inferred'; assertionScope: 'view-local' }[];
  evictions: { subjectRef: string; lineageRefs: string[]; reasonRefs: string[]; sourceDisposition: 'preserved' }[];
  interViewRelations: { viewRef: string; relationRef: 'prov:wasDerivedFrom' | 'urn:rosetta:graph-view:overlaps' | 'urn:rosetta:graph-view:meta-of'; authority: 'projection'; supportRefs: string[] }[];
}
export type GraphViewReuseContext = Parameters<typeof admitMaterializedViewReuse>[1];
const array = (items: object, minItems = 0) => ({ type: 'array', minItems, maxItems: 256, items });
const origin = { enum: ['source-supported', 'view-inferred'] };
export const GRAPH_VIEW_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:graph.view.v1', title: 'Bounded derived GraphView v1',
  ...object({
    profile: profile('graph.view.v1'), materialization: { $ref: MATERIALIZED_VIEW_SCHEMA.$id },
    purpose: object({ questionFamilyRef: ref, questionRef: ref }),
    jurisdiction: object({ authority: { const: 'projection' }, plane: { const: 'derived' }, scopeRefs: support, ownerRefs: support }),
    construction: object({ profile: object({ id: ref, version: ref }), admissibleFamilyRefs: support, replay: { enum: ['rebuildable', 'non-replayable'] }, recipeRef: ref, sourceClosureRefs: refs, nonReplayReasonRefs: refs }),
    sources: array(object({ source: identity, lineageRef: ref, evidenceRefs: support, supportRefs: support, provenanceRefs: support }), 1),
    nodes: array(object({ ref, familyRef: ref, lineageRefs: support, supportRefs: support, origin })),
    edges: array(object({ ref, fromRef: ref, toRef: ref, relationRef: ref, lineageRefs: support, supportRefs: support, origin, assertionScope: { const: 'view-local' } })),
    evictions: array(object({ subjectRef: ref, lineageRefs: support, reasonRefs: support, sourceDisposition: { const: 'preserved' } })),
    interViewRelations: array(object({ viewRef: ref, relationRef: { enum: ['prov:wasDerivedFrom', 'urn:rosetta:graph-view:overlaps', 'urn:rosetta:graph-view:meta-of'] }, authority: { const: 'projection' }, supportRefs: support }))
  })
};
const admit = compileEvidenceContract<GraphView>(GRAPH_VIEW_SCHEMA, [IMPACT_REVALIDATION_SCHEMA, MATERIALIZED_VIEW_SCHEMA]);

export function parseGraphView(input: unknown): GraphView {
  const value = admit(input);
  parseMaterializedView(value.materialization);
  const { materialization, ...content } = value;
  if (materialization.artifact.sha256 !== traceHash(canonicalTraceJson(content))) throw new Error('GraphView content digest differs from its materialized artifact.');
  const unique = (values: string[], subject: string) => {
    if (new Set(values).size !== values.length) throw new Error(`Duplicate GraphView ${subject} identity.`);
  };
  unique(value.sources.map(source => source.source.ref), 'source');
  unique([...value.nodes, ...value.edges].map(member => member.ref), 'member');
  unique(value.evictions.map(eviction => eviction.subjectRef), 'eviction');
  const lineages = new Set(value.sources.map(source => source.lineageRef));
  const nodes = new Set(value.nodes.map(node => node.ref));
  const members = new Set([...value.nodes, ...value.edges].map(member => member.ref));
  for (const member of [...value.nodes, ...value.edges, ...value.evictions]) {
    if (member.lineageRefs.some(lineage => !lineages.has(lineage))) throw new Error('GraphView member has an unresolved source lineage.');
  }
  if (value.nodes.some(node => !value.construction.admissibleFamilyRefs.includes(node.familyRef))) throw new Error('GraphView node family is outside the declared construction Profile.');
  if (value.edges.some(edge => !nodes.has(edge.fromRef) || !nodes.has(edge.toRef))) throw new Error('GraphView edge endpoint is not an active node.');
  if (value.evictions.some(eviction => members.has(eviction.subjectRef))) throw new Error('Evicted member cannot remain active.');
  if (value.interViewRelations.some(relation => relation.viewRef === materialization.familyRef)) throw new Error('GraphView inter-view relation cannot refer to itself.');
  if (value.construction.replay === 'rebuildable' && value.sources.some(source => !value.construction.sourceClosureRefs.includes(source.source.ref))) throw new Error('Rebuildable GraphView must declare the source closure.');
  if (value.construction.replay === 'non-replayable' && !value.construction.nonReplayReasonRefs.length) throw new Error('Non-replayability requires an attributable reason.');
  return value;
}

/** Current rights and currency are resolved through the generic materialized-view owner. */
export function admitGraphViewReuse(input: unknown, context: GraphViewReuseContext): GraphView {
  const view = parseGraphView(input);
  admitMaterializedViewReuse(view.materialization, context);
  return view;
}

/** Count declared canonical lineages only after every view passes current-rights admission. */
export function graphViewIndependentSourceLineages(inputs: { view: unknown; context: GraphViewReuseContext }[]): string[] {
  return collectEvidenceSourceLineages(inputs.flatMap(input => admitGraphViewReuse(input.view, input.context).sources));
}

export function appendGraphView(history: readonly GraphView[], next: GraphView): GraphView[] {
  const views: GraphView[] = [];
  for (const input of [...history, next]) {
    const view = parseGraphView(input);
    if (views.some(previous => previous.materialization.recordId === view.materialization.recordId)) continue;
    appendMaterializedView(views.map(previous => previous.materialization), view.materialization);
    views.push(view);
  }
  return structuredClone(views);
}

/** Exact declared recipe/source/content replay is evidence of rebuild, never semantic revalidation. */
export function verifyGraphViewRebuild(originalInput: unknown, rebuiltInput: unknown): true {
  const original = parseGraphView(originalInput);
  const rebuilt = parseGraphView(rebuiltInput);
  if (original.construction.replay !== 'rebuildable' || rebuilt.construction.replay !== 'rebuildable') throw new Error('Non-replayable GraphView cannot claim an exact rebuild.');
  const closure = (view: GraphView) => {
    const { materialization, ...content } = view;
    return { content, source: materialization.source, environment: materialization.environment, temporal: materialization.temporal };
  };
  if (canonicalTraceJson(closure(original)) !== canonicalTraceJson(closure(rebuilt))) throw new Error('GraphView rebuild differs from the declared canonical closure.');
  return true;
}
