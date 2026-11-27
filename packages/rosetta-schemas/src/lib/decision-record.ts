import { compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceIdentitySchema as identity, evidenceObjectSchema as object, evidenceProfileSchema as profile, evidenceTimestampSchema as timestamp, nullableEvidenceSchema as nullable, collectEvidenceSourceLineages, type EvidenceIdentity } from "./evidence-contract-validation.js";
import { createGovernedRecord, verifyGovernedRecord, governedArray as array, governedEnum as enumeration, governedRecordIdSchema as recordId } from "./governed-evidence-identity.js";

export const DECISION_RECORD_STATES = ["PROPOSED", "DRAFT", "ACCEPTED", "EFFECTIVE", "HISTORICAL", "REJECTED", "WITHDRAWN", "UNKNOWN"] as const;
export const DECISION_RELATIONS = ["ADDS", "SUPERSEDES", "AMENDS", "NARROWS", "EXCEPTS", "TEMPORARILY_OVERRIDES", "CORRECTS", "RETRACTS", "PEER_CONFLICT"] as const;
type State = (typeof DECISION_RECORD_STATES)[number];
type Relation = (typeof DECISION_RELATIONS)[number];
export interface DecisionRecord {
  recordId: string;
  profile: { id: "decision.record.v1"; version: "1.0.0" };
  decisionRef: string;
  versionRef: string;
  locusRef: string;
  controllerRef: string;
  authorRef: string;
  ratification: {
    ratifierRef: string;
    authorityRef: string;
    evidenceRefs: string[];
  } | null;
  scopeRefs: string[];
  state: State;
  clauses: { clauseRef: string; propositionRef: string }[];
  source: {
    identity: EvidenceIdentity;
    lineageRef: string;
    locatorRef: string;
  }[];
  time: {
    effectiveFrom: string | null;
    effectiveUntil: string | null;
    observedAt: string;
    recordedAt: string;
  };
  relations: {
    kind: Relation;
    targetRecordRef: string;
    clauseRefs: string[];
    evidenceRefs: string[];
  }[];
  provenanceRefs: string[];
  receiptRefs: string[];
}
export const DECISION_RECORD_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "urn:rosetta:decision.record.v1",
  title: "Candidate decision record and effective-state evidence v1",
  ...object({
    recordId,
    profile: profile("decision.record.v1"),
    decisionRef: ref,
    versionRef: ref,
    locusRef: ref,
    controllerRef: ref,
    authorRef: ref,
    ratification: nullable(object({ ratifierRef: ref, authorityRef: ref, evidenceRefs: support })),
    scopeRefs: support,
    state: enumeration(DECISION_RECORD_STATES),
    clauses: array(object({ clauseRef: ref, propositionRef: ref })),
    source: array(object({ identity, lineageRef: ref, locatorRef: ref }), 1),
    time: object({
      effectiveFrom: nullable(timestamp),
      effectiveUntil: nullable(timestamp),
      observedAt: timestamp,
      recordedAt: timestamp,
    }),
    relations: array(
      object({
        kind: enumeration(DECISION_RELATIONS),
        targetRecordRef: recordId,
        clauseRefs: support,
        evidenceRefs: support,
      })
    ),
    provenanceRefs: support,
    receiptRefs: refs,
  }),
};
const admit = compileEvidenceContract<DecisionRecord>(DECISION_RECORD_SCHEMA);
export function parseDecisionRecord(input: unknown): DecisionRecord {
  const value = verifyGovernedRecord(admit(input));
  const { effectiveFrom, effectiveUntil, observedAt, recordedAt } = value.time;
  if (Date.parse(observedAt) > Date.parse(recordedAt) || (effectiveUntil !== null && (effectiveFrom === null || Date.parse(effectiveUntil) <= Date.parse(effectiveFrom)))) throw new Error("Invalid decision temporal evidence.");
  if (["ACCEPTED", "EFFECTIVE", "HISTORICAL"].includes(value.state) && (!value.ratification || effectiveFrom === null)) throw new Error("Ratified state requires attributable ratification and effective time.");
  if (value.source.some((s) => s.identity.cid === null && s.identity.version === null)) throw new Error("Decision source needs exact revision evidence.");
  if (new Set(value.clauses.map((c) => c.clauseRef)).size !== value.clauses.length) throw new Error("Duplicate decision clause.");
  if (value.relations.some((r) => r.targetRecordRef === value.recordId || (r.kind === "TEMPORARILY_OVERRIDES" && effectiveUntil === null))) throw new Error("Invalid decision relation.");
  if (!value.clauses.length && !value.relations.some((r) => r.kind === "RETRACTS" || r.kind === "CORRECTS")) throw new Error("Decision has no proposition or correction.");
  collectEvidenceSourceLineages(value.source.map((s) => ({ source: s.identity, lineageRef: s.lineageRef })));
  return value;
}
export const createDecisionRecord = (body: unknown): DecisionRecord => createGovernedRecord(body, parseDecisionRecord);

export interface DecisionResolutionContext {
  locusRef: string;
  /** Scope applicability is supplied by its owner; no scope inheritance is inferred here. */
  applicableScopeRefs: readonly string[];
  effectiveAt: string;
  knownAt: string;
  /** An observation from the ratification owner, not a claim by the candidate itself. */
  ratifications: readonly {
    recordRef: string;
    controllerRef: string;
    authorityRef: string;
    evidenceRef: string;
  }[];
  /** Owner-observed normalized Decision source-set closure. Completeness is bounded to this declared set/frontier. */
  sourceSet: {
    sourceSetRef: string;
    versionRef: string;
    normalizationFrontierRef: string | null;
    coverage: "COMPLETE" | "PARTIAL" | "UNKNOWN";
    expectedPartitionRefs: readonly string[];
    observedPartitionRefs: readonly string[];
    observedRecordRefs: readonly string[];
  };
  /** Supported causal order between normalized records. Wall-clock/effective chronology is not causal evidence. */
  causalOrder: readonly {
    beforeRecordRef: string;
    afterRecordRef: string;
    evidenceRef: string;
  }[];
}
export interface DecisionResolution {
  state: "RESOLVED" | "CONFLICT" | "UNRESOLVED";
  clauses: {
    clauseRef: string;
    alternatives: {
      propositionRef: string;
      controllerRef: string;
      recordRefs: string[];
    }[];
  }[];
  unresolvedRecordRefs: string[];
  invalidatedRecordRefs: string[];
  historyRefs: string[];
  sourceLineageRefs: string[];
}
const sortedUnique = (values: string[]) => [...new Set(values)].sort();
const sameScope = (a: DecisionRecord, b: DecisionRecord) => JSON.stringify([...a.scopeRefs].sort()) === JSON.stringify([...b.scopeRefs].sort());

/** Finite reference projection over owner-observed evidence. Does not verify signatures, authorize an effect, or resolve authority hierarchies. */
export function resolveDecisionState(history: readonly unknown[], context: DecisionResolutionContext): DecisionResolution {
  const effectiveAt = Date.parse(context.effectiveAt),
    knownAt = Date.parse(context.knownAt);
  if (!Number.isFinite(effectiveAt) || !Number.isFinite(knownAt) || !context.locusRef || !context.applicableScopeRefs.length) throw new Error("Decision resolution requires explicit time, locus and applicable scope.");
  const records = [
    ...new Map(
      history.map((input) => {
        const r = parseDecisionRecord(input);
        return [r.recordId, r] as const;
      })
    ).values(),
  ];
  const sourceSet = context.sourceSet;
  if (!sourceSet.sourceSetRef || !sourceSet.versionRef) throw new Error("Decision resolution requires an explicit source-set identity and version.");
  const expectedPartitions = sortedUnique([...sourceSet.expectedPartitionRefs]);
  const observedPartitions = sortedUnique([...sourceSet.observedPartitionRefs]);
  if (sourceSet.coverage === "COMPLETE" && JSON.stringify(expectedPartitions) !== JSON.stringify(observedPartitions)) throw new Error("Complete Decision source-set coverage requires exact partition closure.");
  const recordIds = new Set(records.map((r) => r.recordId));
  const observedRecordIds = new Set(sourceSet.observedRecordRefs);
  const recordClosure = sourceSet.observedRecordRefs.every((recordRef) => recordIds.has(recordRef)) && records.every((r) => observedRecordIds.has(r.recordId));
  const closureEstablished = sourceSet.coverage === "COMPLETE" && sourceSet.normalizationFrontierRef !== null && recordClosure;
  const causalNext = new Map<string, Set<string>>();
  for (const edge of context.causalOrder) {
    if (!edge.beforeRecordRef || !edge.afterRecordRef || !edge.evidenceRef || edge.beforeRecordRef === edge.afterRecordRef) throw new Error("Invalid Decision causal-order evidence.");
    if (!observedRecordIds.has(edge.beforeRecordRef) || !observedRecordIds.has(edge.afterRecordRef)) throw new Error("Decision causal-order evidence must reference the declared observed source set.");
    const next = causalNext.get(edge.beforeRecordRef) ?? new Set<string>();
    next.add(edge.afterRecordRef);
    causalNext.set(edge.beforeRecordRef, next);
  }
  const reaches = (from: string, target: string, seen = new Set<string>()): boolean => {
    if (seen.has(from)) return false;
    seen.add(from);
    for (const next of causalNext.get(from) ?? []) {
      if (next === target || reaches(next, target, seen)) return true;
    }
    return false;
  };
  for (const recordRef of observedRecordIds) if (reaches(recordRef, recordRef)) throw new Error("Decision causal-order evidence must be acyclic.");
  const isBefore = (beforeRecordRef: string, afterRecordRef: string) => reaches(beforeRecordRef, afterRecordRef) && !reaches(afterRecordRef, beforeRecordRef);
  const known = records.filter((r) => Date.parse(r.time.recordedAt) <= knownAt);
  const byId = new Map(known.map((r) => [r.recordId, r]));
  const relevant = known.filter((r) => r.locusRef === context.locusRef && r.scopeRefs.some((s) => context.applicableScopeRefs.includes(s)));
  const unresolved = new Set<string>(),
    invalidated = new Set<string>();
  const versions = new Map<string, string>();
  for (const r of relevant) {
    const key = JSON.stringify([r.decisionRef, r.versionRef]);
    const prior = versions.get(key);
    if (prior && prior !== r.recordId) {
      unresolved.add(prior);
      unresolved.add(r.recordId);
    }
    versions.set(key, r.recordId);
  }
  const active = relevant.filter((r) => {
    if (r.state === "UNKNOWN") {
      unresolved.add(r.recordId);
      return false;
    }
    if (!["ACCEPTED", "EFFECTIVE", "HISTORICAL"].includes(r.state)) return false;
    const from = Date.parse(r.time.effectiveFrom!);
    if (from > effectiveAt || (r.time.effectiveUntil !== null && Date.parse(r.time.effectiveUntil) <= effectiveAt)) return false;
    const p = r.ratification!;
    if (!context.ratifications.some((a) => a.recordRef === r.recordId && a.controllerRef === r.controllerRef && a.authorityRef === p.authorityRef && p.evidenceRefs.includes(a.evidenceRef))) {
      unresolved.add(r.recordId);
      return false;
    }
    return !unresolved.has(r.recordId);
  });
  const suppressed = new Set<string>();
  const key = (r: DecisionRecord, clause: string) => JSON.stringify([r.recordId, clause]);
  const validActive = new Set(active.map((r) => r.recordId));
  // Validate every relation before any of this record's effects are projected.
  // A bad second relation cannot leave behind the first relation's suppression.
  for (const r of active)
    for (const relation of r.relations) {
      const target = byId.get(relation.targetRecordRef);
      const scoped = ["EXCEPTS", "TEMPORARILY_OVERRIDES", "NARROWS"].includes(relation.kind);
      const replacement = ["SUPERSEDES", "AMENDS", "EXCEPTS", "TEMPORARILY_OVERRIDES"].includes(relation.kind);
      if (!target || !validActive.has(target.recordId) || target.locusRef !== r.locusRef || relation.clauseRefs.some((c) => !target.clauses.some((t) => t.clauseRef === c)) || (replacement && relation.clauseRefs.some((c) => !r.clauses.some((n) => n.clauseRef === c))) || (!["PEER_CONFLICT", "ADDS"].includes(relation.kind) && (target.controllerRef !== r.controllerRef || (!scoped && !sameScope(r, target)) || Date.parse(target.time.effectiveFrom!) >= Date.parse(r.time.effectiveFrom!)))) unresolved.add(r.recordId);
    }
  // A relation cannot use an unresolved target as a valid witness.
  for (let i = 0; i < active.length; i++) {
    const before = unresolved.size;
    for (const r of active) if (r.relations.some((rel) => unresolved.has(rel.targetRecordRef))) unresolved.add(r.recordId);
    if (unresolved.size === before) break;
  }
  for (const r of active) {
    if (unresolved.has(r.recordId)) continue;
    for (const relation of r.relations) {
      if (relation.kind === "PEER_CONFLICT" || relation.kind === "ADDS") continue;
      const target = byId.get(relation.targetRecordRef)!;
      if (["CORRECTS", "RETRACTS"].includes(relation.kind)) invalidated.add(target.recordId);
      for (const c of relation.clauseRefs) suppressed.add(key(target, c));
    }
  }
  // An unqualified causally later incompatible proposition at the same exact
  // controller/locus/scope/slot supersedes by default only when the supplied
  // owner evidence establishes order and the effective interval is compatible.
  // Effective-time chronology alone is not causal evidence.
  for (const r of active)
    for (const c of r.clauses) {
      if (unresolved.has(r.recordId)) continue;
      if (active.some((next) => !unresolved.has(next.recordId) && next.relations.length === 0 && next.controllerRef === r.controllerRef && sameScope(next, r) && isBefore(r.recordId, next.recordId) && Date.parse(next.time.effectiveFrom!) > Date.parse(r.time.effectiveFrom!) && next.clauses.some((n) => n.clauseRef === c.clauseRef && n.propositionRef !== c.propositionRef))) suppressed.add(key(r, c.clauseRef));
    }
  const slots = new Map<string, Map<string, { propositionRef: string; controllerRef: string; recordRefs: string[] }>>();
  for (const r of active)
    for (const c of r.clauses) {
      if (unresolved.has(r.recordId) || suppressed.has(key(r, c.clauseRef))) continue;
      const alternatives = slots.get(c.clauseRef) ?? new Map();
      const k = JSON.stringify([r.controllerRef, c.propositionRef]);
      const a = alternatives.get(k) ?? {
        propositionRef: c.propositionRef,
        controllerRef: r.controllerRef,
        recordRefs: [],
      };
      a.recordRefs.push(r.recordId);
      alternatives.set(k, a);
      slots.set(c.clauseRef, alternatives);
    }
  const clauses = [...slots.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([clauseRef, values]) => ({
      clauseRef,
      alternatives: [...values.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([, v]) => ({ ...v, recordRefs: sortedUnique(v.recordRefs) })),
    }));
  const peerConflict = active.some((r) => !unresolved.has(r.recordId) && r.relations.some((rel) => rel.kind === "PEER_CONFLICT" && active.some((t) => t.recordId === rel.targetRecordRef)));
  const conflict = peerConflict || clauses.some((c) => new Set(c.alternatives.map((a) => a.propositionRef)).size > 1);
  return {
    state: conflict ? "CONFLICT" : unresolved.size || !closureEstablished ? "UNRESOLVED" : "RESOLVED",
    clauses,
    unresolvedRecordRefs: [...unresolved].sort(),
    invalidatedRecordRefs: [...invalidated].sort(),
    historyRefs: sortedUnique(relevant.map((r) => r.recordId)),
    sourceLineageRefs: collectEvidenceSourceLineages(relevant.flatMap((r) => r.source.map((s) => ({ source: s.identity, lineageRef: s.lineageRef })))),
  };
}
