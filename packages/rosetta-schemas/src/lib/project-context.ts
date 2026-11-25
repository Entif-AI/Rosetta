import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { compareProfileTimestamps, isProfileTimestamp } from './evaluation-profile-validation.js';
import { compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceObjectSchema as object, evidenceProfileSchema as profile, evidenceIdentitySchema as identity, evidenceTimestampSchema as timestamp, nullableEvidenceSchema as nullable, type EvidenceIdentity } from './evidence-contract-validation.js';
import { authorityScopeContains, parseAuthorityEnvelope, type AuthorityScope, type AuthorityPolicyBinding } from './authority-envelope.js';

/** Proposed public project-context Profile; never a grant of authority. */
export const PROJECT_CONTEXT_PROFILE = 'project.context.v1';
export type ValidTime = { kind: 'known'; from: string; until: string | null } | { kind: 'unknown'; from: null; until: null };
export const PROJECT_CLASSES = ['research-project', 'software-project', 'publication', 'campaign', 'collaboration', 'operational-program', 'experiment-series'] as const;
export const PRODUCT_KINDS = ['document', 'dataset', 'software', 'specification', 'experiment', 'model', 'design', 'media', 'analysis', 'research-note', 'communication-package', 'decision-record', 'prototype', 'artifact', 'idea', 'capability', 'issue', 'contact'] as const;
export const PRODUCT_ROLES = ['deliverable', 'intermediate', 'evidence', 'input', 'output', 'reference', 'derivative'] as const;
export const RELATIONS = ['membership', 'related_to', 'depends_on', 'contains_work', 'has_phase', 'produces', 'derived_from', 'supports', 'used_by', 'by_product', 'spawned', 'seeded', 'participates_in', 'applies_within', 'supersedes'] as const;

interface Base {
  recordId: string;
  profile: { id: typeof PROJECT_CONTEXT_PROFILE; version: '1.0.0' };
  subjectRef: string;
  supersedesRef: string | null;
  revisionKind: 'initial' | 'effective-change' | 'correction';
  correctsRef: string | null;
  observedAt: string;
  validTime: ValidTime;
  provenanceRefs: string[];
  receiptRefs: string[];
  correctionRefs: string[];
}
export interface ProjectContextProject extends Base {
  kind: 'project';
  projectClass: string;
  title: string;
  description: string;
  status: 'planned' | 'active' | 'paused' | 'ended' | 'cancelled' | 'unknown';
  startAt: string | null;
  endAt: string | null;
  objectiveRefs: string[];
  partyRefs: string[];
  roleAssignmentRefs: string[];
  phaseRefs: string[];
  milestoneRefs: string[];
  policyRefs: string[];
  workRefs: string[];
  interactionRefs: string[];
  feedbackRefs: string[];
}
export interface ProjectContextProduct extends Base {
  kind: 'product';
  productKind: string;
  artifact: EvidenceIdentity;
  status: 'draft' | 'available' | 'withdrawn' | 'unknown';
  createdAt: string;
  publishedAt: string | null;
  producerRefs: string[];
  workRefs: string[];
  sourceRefs: string[];
  dependencyRefs: string[];
  rightsRefs: string[];
  licensingRefs: string[];
  disclosureRefs: string[];
}
export interface ProjectContextRelation extends Base {
  kind: 'relation';
  relation: typeof RELATIONS[number];
  sourceRef: string;
  targetRef: string;
  role: typeof PRODUCT_ROLES[number] | null;
  originWorkRef: string | null;
  rationaleRefs: string[];
  disposition: 'asserted' | 'withdrawn';
}
export type ProjectContextRecord = ProjectContextProject | ProjectContextProduct | ProjectContextRelation;

const knownTime = object({ kind: { const: 'known' }, from: timestamp, until: nullable(timestamp) });
const unknownTime = object({ kind: { const: 'unknown' }, from: { const: null }, until: { const: null } });
const base = {
  recordId: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' },
  profile: profile(PROJECT_CONTEXT_PROFILE),
  subjectRef: ref, supersedesRef: nullable(ref), observedAt: timestamp,
  revisionKind: { enum: ['initial', 'effective-change', 'correction'] }, correctsRef: nullable(ref),
  validTime: { oneOf: [knownTime, unknownTime] },
  provenanceRefs: support, receiptRefs: refs, correctionRefs: refs
};
const extensionKind = (values: readonly string[]) => ({ anyOf: [{ enum: values }, { type: 'string', maxLength: 2048, pattern: '^urn:[a-z][a-z0-9-]*:.+$' }] });
export const PROJECT_CONTEXT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:project.context.v1', title: 'Proposed durable project-context records v1',
  oneOf: [
    object({ ...base, kind: { const: 'project' }, projectClass: extensionKind(PROJECT_CLASSES),
      title: { type: 'string', minLength: 1, maxLength: 2048, pattern: '\\S' }, description: { type: 'string', maxLength: 8192 },
      status: { enum: ['planned', 'active', 'paused', 'ended', 'cancelled', 'unknown'] },
      startAt: nullable(timestamp), endAt: nullable(timestamp), objectiveRefs: refs, partyRefs: refs, roleAssignmentRefs: refs,
      phaseRefs: refs, milestoneRefs: refs, policyRefs: refs, workRefs: refs, interactionRefs: refs, feedbackRefs: refs }),
    object({ ...base, kind: { const: 'product' }, productKind: extensionKind(PRODUCT_KINDS), artifact: identity,
      status: { enum: ['draft', 'available', 'withdrawn', 'unknown'] }, createdAt: timestamp, publishedAt: nullable(timestamp),
      producerRefs: support, workRefs: refs, sourceRefs: support, dependencyRefs: refs, rightsRefs: refs, licensingRefs: refs, disclosureRefs: refs }),
    object({ ...base, kind: { const: 'relation' }, relation: { enum: RELATIONS },
      sourceRef: ref, targetRef: ref, role: nullable({ enum: PRODUCT_ROLES }), originWorkRef: nullable(ref), rationaleRefs: support,
      disposition: { enum: ['asserted', 'withdrawn'] } })
  ]
};
const admit = compileEvidenceContract<ProjectContextRecord>(PROJECT_CONTEXT_SCHEMA);
function before(a: string, b: string) { return compareProfileTimestamps(a, b) < 0; }
export function parseProjectContextRecord(input: unknown): ProjectContextRecord {
  const record = admit(input);
  const { recordId, ...body } = record;
  if (recordId !== 'sha256:' + traceHash(canonicalTraceJson(body))) throw new Error('Project-context record digest mismatch.');
  if (record.subjectRef === recordId || record.supersedesRef === recordId) throw new Error('Stable subject and immutable revision must be distinct.');
  if (record.revisionKind === 'initial' ? record.supersedesRef !== null || record.correctsRef !== null :
      record.supersedesRef === null || (record.revisionKind === 'correction' ?
        record.correctsRef === null || record.correctsRef === recordId || !record.correctionRefs.length :
        record.correctsRef !== null || record.validTime.kind !== 'known')) throw new Error('Invalid project-context revision disposition.');
  const interval = record.validTime;
  if (interval.kind === 'known' && interval.until !== null && !before(interval.from, interval.until)) throw new Error('Invalid half-open validity interval.');
  if (record.kind === 'project') {
    if (record.startAt !== null && record.endAt !== null && before(record.endAt, record.startAt)) throw new Error('Invalid project lifetime.');
    if (record.workRefs.includes(record.subjectRef)) throw new Error('A project is not its own bounded work.');
  }
  if (record.kind === 'product') {
    if (record.artifact.ref === recordId || record.artifact.ref === record.subjectRef) throw new Error('Product and artifact identity must be distinct.');
    if (record.artifact.version === null && record.artifact.cid === null) throw new Error('Product requires an attributable artifact version or content address.');
    if (record.publishedAt !== null && before(record.publishedAt, record.createdAt)) throw new Error('Publication precedes product creation.');
  }
  if (record.kind === 'relation') {
    if (record.sourceRef === record.targetRef || [record.sourceRef, record.targetRef].includes(record.subjectRef)) throw new Error('Reflexive or self-identifying project relation.');
    if (record.relation === 'used_by' ? record.role === null : record.role !== null) throw new Error('Only product-use relations carry an explicit product role.');
    if (record.relation === 'by_product' ? record.originWorkRef === null : record.originWorkRef !== null) throw new Error('By-product relations require originating bounded work.');
  }
  return structuredClone(record);
}
export function createProjectContextRecord(input: unknown): ProjectContextRecord {
  if (!input || typeof input !== 'object' || Array.isArray(input) || 'recordId' in input) throw new Error('Provide metadata without recordId.');
  return parseProjectContextRecord({ ...input, recordId: 'sha256:' + traceHash(canonicalTraceJson(input)) });
}

export interface ProjectContextCut { validAt: string; observedThrough: string; coverage: 'complete' | 'partial' | 'unknown' }
interface SubjectHistory { head: ProjectContextRecord; segments: ProjectContextRecord[] }
/** An effective transition adds a segment. A correction replaces exactly one
 * visible segment in the new observation cut, never an unrelated later state.
 * The entire supplied immutable record remains available at earlier cuts. */
function historyAt(input: readonly unknown[], cut: ProjectContextCut): { records: Map<string, ProjectContextRecord>; unresolved: Set<string> } {
  if (!isProfileTimestamp(cut.observedThrough) || !isProfileTimestamp(cut.validAt) ||
      !['complete', 'partial', 'unknown'].includes(cut.coverage)) throw new Error('Invalid project-context cut.');
  const subjects = new Map<string, SubjectHistory>(), ids = new Set<string>();
  const parsed = input.map(parseProjectContextRecord).filter(r => !before(cut.observedThrough, r.observedAt))
    .sort((a,b) => compareProfileTimestamps(a.observedAt,b.observedAt));
  for (const record of parsed) {
    if (ids.has(record.recordId)) continue;
    const history = subjects.get(record.subjectRef), previous = history?.head;
    if ((previous?.recordId ?? null) !== record.supersedesRef) throw new Error('Missing or competing project-context predecessor.');
    if (previous) {
      if (record.kind !== previous.kind || !before(previous.observedAt, record.observedAt)) throw new Error('Invalid project-context revision.');
      if (previous.kind === 'relation' && record.kind === 'relation' &&
        (previous.relation !== record.relation || previous.sourceRef !== record.sourceRef || previous.targetRef !== record.targetRef ||
         previous.role !== record.role || previous.originWorkRef !== record.originWorkRef))
        throw new Error('Relation identity cannot change endpoints, kind, role or origin.');
    }
    if (!history) {
      if (record.revisionKind !== 'initial') throw new Error('Missing initial project-context record.');
      subjects.set(record.subjectRef, { head: record, segments: [record] });
    } else {
      if (record.revisionKind === 'effective-change') {
        const last = history.segments.at(-1);
        if (!last || last.validTime.kind !== 'known' || record.validTime.kind !== 'known' ||
            !before(last.validTime.from, record.validTime.from)) throw new Error('Effective transition must advance a known segment boundary.');
        history.segments.push(record);
      } else if (record.revisionKind === 'correction') {
        const index = history.segments.findIndex(r => r.recordId === record.correctsRef);
        if (index < 0) throw new Error('Correction must target an exact visible segment.');
        history.segments[index] = record;
      } else throw new Error('Repeated initial project-context record.');
      history.head = record;
    }
    ids.add(record.recordId);
  }
  const records = new Map<string, ProjectContextRecord>(), unresolved = new Set<string>();
  for (const [subject, history] of subjects) {
    if (history.segments.some(r => r.validTime.kind === 'unknown')) {
      unresolved.add(subject);
      continue;
    }
    let selected: ProjectContextRecord | undefined;
    let previousStart: string | undefined;
    for (const segment of history.segments) {
      if (segment.validTime.kind !== 'known') throw new Error('Unknown segment must remain unresolved.');
      const start = segment.validTime.from;
      if (previousStart !== undefined && !before(previousStart, start)) throw new Error('Corrected effective segments conflict.');
      previousStart = start;
      if (!before(cut.validAt, start)) selected = segment;
    }
    // An expired newer segment does not silently revive the prior state.
    if (selected && active(selected.validTime, cut.validAt)) records.set(subject, selected);
  }
  return { records, unresolved };
}
function active(interval: ValidTime, at: string) {
  return interval.kind === 'known' && !before(at, interval.from) && (interval.until === null || before(at, interval.until));
}
export interface ProjectMembershipView {
  coverage: 'declared-complete' | 'unknown';
  parents: { childRef: string; parentRef: string; relationRecordRef: string }[];
}
/** Candidate forest membership, distinct from dependency/related/use relations.
 * A historical cut must name both effective time and observation time. A
 * declaration of completeness is not independent authentication. */
export function materializeProjectMembership(
  history: readonly unknown[], cut: ProjectContextCut
): ProjectMembershipView {
  const { records: heads, unresolved } = historyAt(history, cut);
  const projects = new Set([...heads.values()].filter(r => r.kind === 'project').map(r => r.subjectRef));
  const parents = new Map<string, { childRef: string; parentRef: string; relationRecordRef: string }>();
  let unknown = cut.coverage !== 'complete' || unresolved.size > 0;
  for (const r of heads.values()) {
    if (r.kind !== 'relation' || r.relation !== 'membership' || r.disposition !== 'asserted') continue;
    if (!projects.has(r.sourceRef) || !projects.has(r.targetRef)) { unknown = true; continue; }
    const child = heads.get(r.sourceRef), parent = heads.get(r.targetRef);
    if (!child || !parent || !active(child.validTime, cut.validAt) || !active(parent.validTime, cut.validAt)) { unknown = true; continue; }
    if (parents.has(r.sourceRef)) throw new Error('Competing current membership parents.');
    parents.set(r.sourceRef, { childRef: r.sourceRef, parentRef: r.targetRef, relationRecordRef: r.recordId });
  }
  for (const child of parents.keys()) {
    const visited = new Set<string>();
    let cursor: string | undefined = child;
    while (cursor !== undefined) {
      if (visited.has(cursor)) throw new Error('Cyclic project membership.');
      visited.add(cursor);
      cursor = parents.get(cursor)?.parentRef;
    }
  }
  return { coverage: unknown ? 'unknown' : 'declared-complete', parents: [...parents.values()].sort((a,b) => a.childRef === b.childRef ? 0 : a.childRef < b.childRef ? -1 : 1) };
}
/** Inspect exact effective state at an observation cut, not current authority. */
export function inspectProjectContext(history: readonly unknown[], cut: ProjectContextCut): { coverage: 'declared-complete' | 'unknown'; records: ProjectContextRecord[]; unresolvedSubjectRefs: string[] } {
  const { records, unresolved } = historyAt(history, cut);
  return { coverage: cut.coverage === 'complete' && unresolved.size === 0 ? 'declared-complete' : 'unknown',
    records: structuredClone([...records.values()]), unresolvedSubjectRefs: [...unresolved].sort() };
}

/** Structural composition with the existing exact-resource authority envelope.
 * Project membership and assigned roles never create authority. This comparison
 * does not authenticate the envelope, the role owner, or current policy. */
export function inspectProjectAuthorityBinding(history: readonly unknown[], cut: ProjectContextCut, input: {
  projectRef: string; projectRecordRef: string; roleAssignmentRef: string;
  scope: AuthorityScope; policy: AuthorityPolicyBinding; sourceFrontierRef: string; envelope: unknown;
}): 'STRUCTURALLY_MATCHED' | 'UNRESOLVED' {
  const view = inspectProjectContext(history, cut);
  if (view.coverage !== 'declared-complete') return 'UNRESOLVED';
  const project = view.records.find(r => r.kind === 'project' && r.subjectRef === input.projectRef);
  if (project?.kind !== 'project' || project.recordId !== input.projectRecordRef ||
      !project.roleAssignmentRefs.includes(input.roleAssignmentRef) ||
      !project.policyRefs.includes(input.policy.ref) ||
      input.scope.target.resourceRef !== project.subjectRef) return 'UNRESOLVED';
  try {
    const envelope = parseAuthorityEnvelope(input.envelope);
    if (!authorityScopeContains(envelope.scope, input.scope) ||
        envelope.policy.ref !== input.policy.ref || envelope.policy.version !== input.policy.version ||
        envelope.policy.frontierRef !== input.policy.frontierRef ||
        envelope.provenance.sourceFrontierRef !== input.sourceFrontierRef ||
        before(cut.observedThrough, envelope.provenance.compiledAt) ||
        !envelope.provenance.sourceRefs.includes(input.roleAssignmentRef) ||
        envelope.validity.state !== 'valid' || before(cut.validAt, envelope.validity.notBefore) ||
        !before(cut.validAt, envelope.validity.expiresAt)) return 'UNRESOLVED';
    return 'STRUCTURALLY_MATCHED';
  } catch {
    return 'UNRESOLVED';
  }
}
