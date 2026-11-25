import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { compareProfileTimestamps } from './evaluation-profile-validation.js';
import {
  compileEvidenceContract, evidenceRefSchema as ref,
  evidenceRefsSchema as refs, supportedEvidenceSchema as support,
  evidenceObjectSchema as object, evidenceProfileSchema as profile,
  evidenceIdentitySchema, evidenceTimestampSchema, nullableEvidenceSchema as nullable,
  type EvidenceIdentity
} from './evidence-contract-validation.js';

export const EVIDENCE_INDEPENDENCE_PROFILE = 'evidence.independence.v1';
export const INDEPENDENCE_OUTCOMES = [
  'INDEPENDENT', 'PARTIALLY_INDEPENDENT', 'COMMON_SOURCE', 'DERIVED_COPY',
  'SYNDICATED', 'SELF_REFERENTIAL_LINEAGE', 'INDEPENDENCE_UNKNOWN'
] as const;
export const INDEPENDENCE_LINEAGE_KINDS = [
  'derivation', 'quotation', 'translation', 'summary', 'syndication',
  'mirror', 'dataset-use', 'export', 're-ingest'
] as const;
export type IndependenceOutcome = typeof INDEPENDENCE_OUTCOMES[number];
export interface IndependenceSubject {
  id: string;
  record: EvidenceIdentity | null;
  manifestation: EvidenceIdentity | null;
  ancestry: 'complete' | 'unknown';
  origin: 'original' | 'rosetta' | 'derived' | 'unknown';
  evidenceRefs: string[];
}
export interface IndependenceLineage {
  descendant: string;
  ancestor: string;
  kind: typeof INDEPENDENCE_LINEAGE_KINDS[number];
  evidenceRefs: string[];
}
export interface IndependenceDeclaration {
  members: [string, string];
  kind: 'independent-origins' | 'independent-analyses';
  evidenceRefs: string[];
}
export type IndependenceScope =
  | { kind: 'pair'; members: [string, string] }
  | { kind: 'set'; members: string[] }
  | { kind: 'cluster'; clusterRef: string; members: string[] };
export interface EvidenceIndependenceAssessment {
  profile: { id: typeof EVIDENCE_INDEPENDENCE_PROFILE; version: '1.0.0' };
  assessmentRef: string;
  recordId: string;
  supersedesRef: string | null;
  observedAt: string;
  methodRef: string;
  scope: IndependenceScope;
  subjects: IndependenceSubject[];
  edges: IndependenceLineage[];
  declarations: IndependenceDeclaration[];
  frontier: { ref: string; coverage: 'complete' | 'partial' | 'unknown'; unresolvedRefs: string[]; evidenceRefs: string[] };
  outcome: IndependenceOutcome;
  explanationRefs: string[];
  correctionRefs: string[];
  revalidationRefs: string[];
  receiptRefs: string[];
}

const pair = { ...refs, minItems: 2, maxItems: 2 };
const members = { ...refs, minItems: 2, maxItems: 64 };
const bounded = (items: object, maxItems: number, minItems = 0) => ({ type: 'array', items, maxItems, minItems });
export const EVIDENCE_INDEPENDENCE_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'urn:rosetta:evidence.independence.v1',
  title: 'Bounded evidence independence assessment v1',
  ...object({
    profile: profile(EVIDENCE_INDEPENDENCE_PROFILE), assessmentRef: ref,
    recordId: { type: 'string', pattern: '^[a-f0-9]{64}$' },
    supersedesRef: nullable(ref), observedAt: evidenceTimestampSchema, methodRef: ref,
    scope: { oneOf: [
      object({ kind: { const: 'pair' }, members: pair }),
      object({ kind: { const: 'set' }, members }),
      object({ kind: { const: 'cluster' }, clusterRef: ref, members })
    ] },
    subjects: bounded(object({ id: ref, record: nullable(evidenceIdentitySchema), manifestation: nullable(evidenceIdentitySchema),
      ancestry: { enum: ['complete', 'unknown'] }, origin: { enum: ['original', 'rosetta', 'derived', 'unknown'] },
      evidenceRefs: refs }), 256, 2),
    edges: bounded(object({ descendant: ref, ancestor: ref, kind: { enum: INDEPENDENCE_LINEAGE_KINDS }, evidenceRefs: support }), 1024),
    declarations: bounded(object({ members: pair, kind: { enum: ['independent-origins', 'independent-analyses'] }, evidenceRefs: support }), 2048),
    frontier: object({ ref, coverage: { enum: ['complete', 'partial', 'unknown'] }, unresolvedRefs: refs, evidenceRefs: refs }),
    outcome: { enum: INDEPENDENCE_OUTCOMES }, explanationRefs: support,
    correctionRefs: refs, revalidationRefs: refs, receiptRefs: support
  })
};
// This profile uses only keywords with identical draft-07 and 2020-12
// semantics. The shared evidence compiler implements draft-07.
const admit = compileEvidenceContract<EvidenceIndependenceAssessment>({
  ...EVIDENCE_INDEPENDENCE_SCHEMA, $schema: 'http://json-schema.org/draft-07/schema#'
});
const key = (a: string, b: string) => JSON.stringify([a, b].sort());
const exactIdentity = (identity: EvidenceIdentity | null) =>
  identity !== null && (identity.version !== null || identity.cid !== null);
const sameRecord = (a: IndependenceSubject, b: IndependenceSubject) =>
  a.record !== null && b.record !== null && a.record.ref === b.record.ref;

/** Classify only declared, bounded lineage. This does not authenticate source,
 * rights, completeness, independence evidence or receipt issuers. */
function inspect(value: EvidenceIndependenceAssessment): IndependenceOutcome {
  const nodes = new Map(value.subjects.map(s => [s.id, s]));
  if (nodes.size !== value.subjects.length) throw new Error('Duplicate evidence subject.');
  if (value.scope.members.some(id => !nodes.has(id))) throw new Error('Unknown comparison subject.');
  function subject(id: string): IndependenceSubject {
    const node = nodes.get(id);
    if (!node) throw new Error('Unknown evidence subject.');
    return node;
  }
  const manifestationOwners = new Map<string, string>();
  for (const node of value.subjects) {
    if (!node.record || !node.manifestation) continue;
    // One exact manifestation must not acquire incompatible record identities.
    // The content digest alone is deliberately not a manifestation identity.
    const id = canonicalTraceJson(node.manifestation);
    const previous = manifestationOwners.get(id);
    if (previous !== undefined && previous !== node.record.ref) throw new Error('Conflicting manifestation record identity.');
    manifestationOwners.set(id, node.record.ref);
  }
  const parents = new Map<string, IndependenceLineage[]>();
  const edgeKeys = new Set<string>();
  for (const edge of value.edges) {
    const id = JSON.stringify([edge.descendant, edge.ancestor, edge.kind]);
    if (edgeKeys.has(id) || !nodes.has(edge.descendant) || !nodes.has(edge.ancestor) || edge.descendant === edge.ancestor) throw new Error('Invalid lineage edge.');
    edgeKeys.add(id);
    const list = parents.get(edge.descendant) ?? [];
    list.push(edge);
    parents.set(edge.descendant, list);
  }
  const ancestors = new Map<string, Set<string>>();
  function closure(id: string, active = new Set<string>()): Set<string> {
    if (active.has(id)) throw new Error('Cyclic evidence lineage.');
    const cached = ancestors.get(id);
    if (cached) return cached;
    const result = new Set([id]);
    active.add(id);
    for (const edge of parents.get(id) ?? []) {
      for (const ancestor of closure(edge.ancestor, active)) result.add(ancestor);
    }
    active.delete(id);
    ancestors.set(id, result);
    return result;
  }
  for (const node of value.subjects) {
    closure(node.id);
    if (node.ancestry === 'complete' &&
        (!exactIdentity(node.record) || !exactIdentity(node.manifestation) ||
         !node.evidenceRefs.length || node.origin === 'unknown' ||
         (node.origin === 'derived' && !parents.has(node.id)))) throw new Error('Unsupported complete ancestry.');
    // Rosetta-origin identifies the producer of this artifact, not a claim
    // that its source ancestry is empty.
    if (node.origin === 'original' && parents.has(node.id)) throw new Error('An original origin cannot also be a lineage descendant.');
  }
  // Assessment-local IDs are not source identities. Walk stable-record
  // aliases as well as explicit lineage so a known ancestor of another
  // manifestation of the same record cannot disappear from a comparison.
  // This is conservative for independence: a shared record never proves
  // independent origin merely because its manifestations have separate IDs.
  const byRecord = new Map<string, string[]>();
  const byExactArtifact = new Map<string, string[]>();
  const exactArtifactKey = (node: IndependenceSubject): string | null =>
    exactIdentity(node.record) && exactIdentity(node.manifestation)
      ? canonicalTraceJson([node.record, node.manifestation]) : null;
  for (const node of value.subjects) {
    if (!node.record) continue;
    const aliases = byRecord.get(node.record.ref) ?? [];
    aliases.push(node.id);
    byRecord.set(node.record.ref, aliases);
    const exact = exactArtifactKey(node);
    if (exact !== null) {
      const occurrences = byExactArtifact.get(exact) ?? [];
      occurrences.push(node.id);
      byExactArtifact.set(exact, occurrences);
    }
  }
  const aliasesOf = (id: string): readonly string[] => {
    const record = subject(id).record;
    return record ? byRecord.get(record.ref) ?? [] : [];
  };
  const exactAliasesOf = (id: string): readonly string[] => {
    const exact = exactArtifactKey(subject(id));
    return exact === null ? [] : byExactArtifact.get(exact) ?? [];
  };
  const walkLineage = (id: string, includeDataset: boolean, aliases: (id: string) => readonly string[]): Set<string> => {
    const visited = new Set<string>(), pending = [id];
    while (pending.length) {
      const current = pending.pop();
      if (current === undefined || visited.has(current)) continue;
      visited.add(current);
      pending.push(...aliases(current));
      for (const edge of parents.get(current) ?? [])
        if (includeDataset || edge.kind !== 'dataset-use') pending.push(edge.ancestor);
    }
    return visited;
  };
  const recordClosure = new Map<string, Set<string>>();
  for (const node of value.subjects) recordClosure.set(node.id, walkLineage(node.id, true, aliasesOf));
  if (value.frontier.coverage === 'complete' &&
      (!value.frontier.evidenceRefs.length || value.frontier.unresolvedRefs.length ||
       value.subjects.some(n => n.ancestry !== 'complete'))) throw new Error('Incomplete evidence frontier.');
  if (value.frontier.coverage !== 'complete' && !value.frontier.unresolvedRefs.length) throw new Error('Unresolved ancestry must be explicit.');
  const declarations = new Map<string, IndependenceDeclaration>();
  for (const declaration of value.declarations) {
    const [a, b] = declaration.members;
    const id = key(a, b);
    if (!nodes.has(a) || !nodes.has(b) || declarations.has(id)) throw new Error('Invalid or conflicting independence declaration.');
    declarations.set(id, declaration);
  }
  const echoMemo = new Map<string, Set<string>>();
  function echoOrigins(id: string): Set<string> {
    // Require a directed re-ingest -> export -> Rosetta-origin path.
    const cached = echoMemo.get(id);
    if (cached) return cached;
    const found = new Set<string>(), visited = new Set<string>();
    const pending: { current: string; state: 0 | 1 | 2 }[] = [{ current: id, state: 0 }];
    while (pending.length) {
      const item = pending.pop();
      if (!item) continue;
      const { current, state } = item;
      const coordinate = JSON.stringify([current, state]);
      if (visited.has(coordinate)) continue;
      visited.add(coordinate);
      if (state === 2 && subject(current).origin === 'rosetta') found.add(current);
      // Only exact artifact aliases can bridge the directed event path.
      // Stable record identity alone cannot prove an export/re-ingest event.
      for (const alias of exactAliasesOf(current)) pending.push({ current: alias, state });
      for (const edge of parents.get(current) ?? []) pending.push({
        current: edge.ancestor,
        state: state === 0 && edge.kind === 're-ingest' ? 1 : state === 1 && edge.kind === 'export' ? 2 : state
      });
    }
    echoMemo.set(id, found);
    return found;
  }
  const copyAncestors = new Map<string, Set<string>>();
  function copies(id: string): Set<string> {
    const cached = copyAncestors.get(id);
    if (cached) return cached;
    const result = walkLineage(id, false, exactAliasesOf);
    copyAncestors.set(id, result);
    return result;
  }
  const shares = (A: Set<string>, B: Set<string>) =>
    [...A].some(x => B.has(x) || [...B].some(y => sameRecord(subject(x), subject(y))));
  function compare(a: string, b: string): IndependenceOutcome {
    const left = subject(a), right = subject(b);
    const A = recordClosure.get(a) ?? walkLineage(a, true, aliasesOf);
    const B = recordClosure.get(b) ?? walkLineage(b, true, aliasesOf);
    // Stable record identity, not byte or publisher equality, is the source anchor.
    const shared = shares(A, B);
    const declaration = declarations.get(key(a, b));
    const exactA = new Set([a, ...exactAliasesOf(a)]), exactB = new Set([b, ...exactAliasesOf(b)]);
    const direct = value.edges.filter(e =>
      (exactA.has(e.descendant) && exactB.has(e.ancestor)) ||
      (exactB.has(e.descendant) && exactA.has(e.ancestor)));
    const dependent = shares(copies(a), new Set([b])) || shares(copies(b), new Set([a])) || sameRecord(left, right);
    const echo = shares(echoOrigins(a), B) || shares(echoOrigins(b), A);
    if (declaration?.kind === 'independent-origins' && shared) throw new Error('Independence contradicts shared lineage.');
    if (declaration?.kind === 'independent-analyses' && (!shared || dependent || echo)) throw new Error('Independent analysis declaration contradicts lineage.');
    if (echo) return 'SELF_REFERENTIAL_LINEAGE';
    if (direct.some(e => e.kind === 'syndication')) return 'SYNDICATED';
    if (dependent) return 'DERIVED_COPY';
    if (value.frontier.coverage !== 'complete') return 'INDEPENDENCE_UNKNOWN';
    if (shared) {
      // Independent analysis requires explicit shared dataset-use paths, not
      // a bare claim attached to two copies of the same source.
      const datasets = (id: string) => new Set(value.edges.filter(e => copies(id).has(e.descendant) && e.kind === 'dataset-use').map(e => e.ancestor));
      const leftData = datasets(a), rightData = datasets(b);
      if (declaration?.kind === 'independent-analyses') {
        if (!shares(leftData, rightData) || shares(copies(a), copies(b))) throw new Error('Independent analyses require shared dataset, not shared analysis lineage.');
        return 'PARTIALLY_INDEPENDENT';
      }
      return 'COMMON_SOURCE';
    }
    return declaration?.kind === 'independent-origins' ? 'INDEPENDENT' : 'INDEPENDENCE_UNKNOWN';
  }
  // Contradictory declarations outside the selected comparison are not inert
  // metadata that can later be reused by a different scope.
  for (const { members: [a, b] } of value.declarations) compare(a, b);
  const results: IndependenceOutcome[] = [];
  for (const [i, a] of value.scope.members.entries())
    for (const b of value.scope.members.slice(i + 1)) results.push(compare(a, b));
  if (results.includes('INDEPENDENCE_UNKNOWN')) return 'INDEPENDENCE_UNKNOWN';
  if (results.every(r => r === results[0])) return results[0];
  if (results.some(r => r === 'INDEPENDENT' || r === 'PARTIALLY_INDEPENDENT')) return 'PARTIALLY_INDEPENDENT';
  return 'INDEPENDENCE_UNKNOWN';
}

export function parseEvidenceIndependence(input: unknown): EvidenceIndependenceAssessment {
  const value = admit(input);
  const { recordId, ...body } = value;
  if (recordId !== traceHash(canonicalTraceJson(body))) throw new Error('Evidence assessment digest mismatch.');
  if (recordId === value.assessmentRef || recordId === value.supersedesRef) throw new Error('Assessment identity collision.');
  if (value.supersedesRef !== null && (!value.correctionRefs.length || !value.revalidationRefs.length)) throw new Error('Correction requires revalidation evidence.');
  if (inspect(value) !== value.outcome) throw new Error('Assessment outcome contradicts bounded lineage.');
  return structuredClone(value);
}

export function createEvidenceIndependence(body: Omit<EvidenceIndependenceAssessment, 'recordId' | 'outcome'>): EvidenceIndependenceAssessment {
  const draft: EvidenceIndependenceAssessment = { ...body, recordId: '0'.repeat(64), outcome: 'INDEPENDENCE_UNKNOWN' };
  const checked = admit(draft);
  const result = { ...body, outcome: inspect(checked) };
  return parseEvidenceIndependence({ ...result, recordId: traceHash(canonicalTraceJson(result)) });
}

/** Preserve exact prior assessments; no authority to overwrite or publish. */
export function appendEvidenceIndependence(history: readonly EvidenceIndependenceAssessment[], next: EvidenceIndependenceAssessment): EvidenceIndependenceAssessment[] {
  const result: EvidenceIndependenceAssessment[] = [];
  for (const input of [...history, next]) {
    const value = parseEvidenceIndependence(input);
    if (result.some(r => r.recordId === value.recordId)) continue;
    const prior = result.at(-1);
    if (!prior ? value.supersedesRef !== null :
        value.supersedesRef !== prior.recordId || value.assessmentRef !== prior.assessmentRef ||
        canonicalTraceJson(value.scope) !== canonicalTraceJson(prior.scope) ||
        compareProfileTimestamps(value.observedAt, prior.observedAt) <= 0) throw new Error('Invalid assessment succession.');
    result.push(value);
  }
  return result;
}
