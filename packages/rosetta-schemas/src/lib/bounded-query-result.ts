import { compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceIdentitySchema as identity, evidenceObjectSchema as object, evidenceProfileSchema as profile, nullableEvidenceSchema as nullable, type EvidenceIdentity } from "./evidence-contract-validation.js";
import { canonicalTraceJson } from "./trace-normalization.js";
import { createGovernedRecord, verifyGovernedRecord, governedArray as array, governedEnum as enumeration, governedRecordIdSchema as recordId } from "./governed-evidence-identity.js";
export const QUERY_COVERAGE_STATES = ["COMPLETE", "PARTIAL", "UNKNOWN", "UNAVAILABLE"] as const;
export const QUERY_TERMINATIONS = ["EXHAUSTED", "RESULT_LIMIT", "BYTE_LIMIT", "TOKEN_LIMIT", "TRAVERSAL_LIMIT", "INTERRUPTED", "UNKNOWN", "UNAVAILABLE"] as const;
export const QUERY_ORDER_DIRECTIONS = ["ASC", "DESC"] as const;
const count = { type: "integer", minimum: 0, maximum: Number.MAX_SAFE_INTEGER };
const quantity = nullable(count);
type Bounds = {
  results: number | null;
  bytes: number | null;
  tokens: number | null;
  traversals: number | null;
};
export type QueryCandidate = {
  candidateRef: string;
  sourceRef: string;
  locatorRefs: string[];
  matchBasisRef: string;
  evaluationRefs: string[];
  orderKeyRef: string;
};
export type QueryOrdering = {
  basisRef: string;
  direction: (typeof QUERY_ORDER_DIRECTIONS)[number];
  tieBreak: "CANDIDATE_REF_LEXICAL_ASC";
};
export type QueryContinuation = {
  cursorRef: string;
  queryRef: string;
  frontierRef: string;
  policyRef: string;
  scopeRef: string;
  callerRef: string;
  purposeRef: string;
  domainProfileRef: string;
  admissionRef: string;
  admittedUniverseRef: string;
  sourceIdentity: EvidenceIdentity;
  materializationRef: string | null;
  bounds: Bounds;
  ordering: QueryOrdering;
  exclusiveAfter: { orderKeyRef: string; candidateRef: string };
};
export interface QueryContinuationBinding {
  queryRef: string;
  domainProfileRef: string;
  admittedUniverseRef: string;
  authority: {
    callerRef: string;
    purposeRef: string;
    scopeRef: string;
    policyRef: string;
    admissionRef: string;
  };
  source: {
    identity: EvidenceIdentity;
    materializationRef: string | null;
    frontierRef: string | null;
  };
  bounds: Bounds;
  ordering: QueryOrdering;
}
export interface BoundedQueryResult {
  recordId: string;
  profile: { id: "query.result.v1"; version: "1.0.0" };
  queryRef: string;
  domainProfileRef: string;
  admittedUniverseRef: string;
  authority: {
    callerRef: string;
    purposeRef: string;
    scopeRef: string;
    policyRef: string;
    admissionRef: string;
  };
  source: {
    identity: EvidenceIdentity;
    materializationRef: string | null;
    frontierRef: string | null;
  };
  bounds: Bounds;
  observed: Bounds;
  ordering: QueryOrdering;
  coverage: (typeof QUERY_COVERAGE_STATES)[number];
  termination: (typeof QUERY_TERMINATIONS)[number];
  candidates: QueryCandidate[];
  continuation: QueryContinuation | null;
  currentness: "CURRENT_FOR_DECLARED_FRONTIER" | "STALE" | "UNKNOWN";
  replayRef: string | null;
  supersedesRefs: string[];
  invalidationRefs: string[];
  provenanceRefs: string[];
  receiptRefs: string[];
}
const bounds = object({
  results: quantity,
  bytes: quantity,
  tokens: quantity,
  traversals: quantity,
});
const ordering = object({
  basisRef: ref,
  direction: enumeration(QUERY_ORDER_DIRECTIONS),
  tieBreak: enumeration(["CANDIDATE_REF_LEXICAL_ASC"]),
});
export const BOUNDED_QUERY_RESULT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "urn:rosetta:query.result.v1",
  title: "Candidate bounded query result evidence v1",
  ...object({
    recordId,
    profile: profile("query.result.v1"),
    queryRef: ref,
    domainProfileRef: ref,
    admittedUniverseRef: ref,
    authority: object({
      callerRef: ref,
      purposeRef: ref,
      scopeRef: ref,
      policyRef: ref,
      admissionRef: ref,
    }),
    source: object({
      identity,
      materializationRef: nullable(ref),
      frontierRef: nullable(ref),
    }),
    bounds,
    observed: bounds,
    ordering,
    coverage: enumeration(QUERY_COVERAGE_STATES),
    termination: enumeration(QUERY_TERMINATIONS),
    candidates: array(
      object({
        candidateRef: ref,
        sourceRef: ref,
        locatorRefs: refs,
        matchBasisRef: ref,
        evaluationRefs: refs,
        orderKeyRef: ref,
      })
    ),
    continuation: nullable(
      object({
        cursorRef: ref,
        queryRef: ref,
        frontierRef: ref,
        policyRef: ref,
        scopeRef: ref,
        callerRef: ref,
        purposeRef: ref,
        domainProfileRef: ref,
        admissionRef: ref,
        admittedUniverseRef: ref,
        sourceIdentity: identity,
        materializationRef: nullable(ref),
        bounds,
        ordering,
        exclusiveAfter: object({ orderKeyRef: ref, candidateRef: ref }),
      })
    ),
    currentness: enumeration(["CURRENT_FOR_DECLARED_FRONTIER", "STALE", "UNKNOWN"]),
    replayRef: nullable(ref),
    supersedesRefs: refs,
    invalidationRefs: refs,
    provenanceRefs: support,
    receiptRefs: refs,
  }),
};
const admit = compileEvidenceContract<BoundedQueryResult>(BOUNDED_QUERY_RESULT_SCHEMA);
const lexicalCompare = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0);
const compareCandidates = (orderingContract: QueryOrdering) => (left: QueryCandidate, right: QueryCandidate) => {
  const primary = lexicalCompare(left.orderKeyRef, right.orderKeyRef);
  if (primary !== 0) return orderingContract.direction === "ASC" ? primary : -primary;
  return lexicalCompare(left.candidateRef, right.candidateRef);
};
export function queryContinuationMatches(continuation: QueryContinuation, binding: QueryContinuationBinding): boolean {
  const a = binding.authority;
  return continuation.queryRef === binding.queryRef && continuation.frontierRef === binding.source.frontierRef && continuation.policyRef === a.policyRef && continuation.scopeRef === a.scopeRef && continuation.callerRef === a.callerRef && continuation.purposeRef === a.purposeRef && continuation.domainProfileRef === binding.domainProfileRef && continuation.admissionRef === a.admissionRef && continuation.admittedUniverseRef === binding.admittedUniverseRef && canonicalTraceJson(continuation.sourceIdentity) === canonicalTraceJson(binding.source.identity) && continuation.materializationRef === binding.source.materializationRef && canonicalTraceJson(continuation.bounds) === canonicalTraceJson(binding.bounds) && canonicalTraceJson(continuation.ordering) === canonicalTraceJson(binding.ordering);
}
/** Reference pagination over an already admitted match universe. It does not rank, authorize, or discover candidates. */
export function paginateAdmittedQueryCandidates(universe: readonly QueryCandidate[], orderingContract: QueryOrdering, pageSize: number, exclusiveAfter: QueryContinuation["exclusiveAfter"] | null = null): QueryCandidate[] {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error("Query page size must be a positive integer.");
  const ordered = [...universe].sort(compareCandidates(orderingContract));
  const start = exclusiveAfter === null ? 0 : ordered.findIndex((candidate) => candidate.orderKeyRef === exclusiveAfter.orderKeyRef && candidate.candidateRef === exclusiveAfter.candidateRef) + 1;
  if (exclusiveAfter !== null && start === 0) throw new Error("Continuation cursor is not present in the admitted match universe.");
  return ordered.slice(start, start + pageSize);
}
export function parseBoundedQueryResult(input: unknown): BoundedQueryResult {
  const value = verifyGovernedRecord(admit(input));
  if (Object.values(value.bounds).every((v) => v === null)) throw new Error("Query requires an applied bound.");
  if (value.coverage === "COMPLETE" && (value.termination !== "EXHAUSTED" || value.continuation !== null || value.source.frontierRef === null)) throw new Error("Complete coverage requires exhausted known frontier.");
  if (value.termination === "EXHAUSTED" && value.coverage !== "COMPLETE") throw new Error("Exhaustion requires complete coverage.");
  if (value.currentness === "CURRENT_FOR_DECLARED_FRONTIER" && (!value.source.frontierRef || value.invalidationRefs.length)) throw new Error("Current result requires an uninvalidated declared frontier.");
  if (value.currentness === "STALE" && !value.invalidationRefs.length) throw new Error("Staleness requires evidence.");
  if (value.coverage === "UNAVAILABLE" || value.termination === "UNAVAILABLE") {
    if (value.coverage !== "UNAVAILABLE" || value.termination !== "UNAVAILABLE" || value.candidates.length || value.continuation || Object.values(value.observed).some((v) => v !== null)) throw new Error("Unavailable result must not disclose candidates or counts.");
  } else if (value.observed.results !== value.candidates.length) throw new Error("Observed result count differs from candidates.");
  if (new Set(value.candidates.map((c) => c.candidateRef)).size !== value.candidates.length) throw new Error("Duplicate query candidate.");
  const stableOrder = [...value.candidates].sort(compareCandidates(value.ordering));
  if (canonicalTraceJson(stableOrder.map((c) => [c.orderKeyRef, c.candidateRef])) !== canonicalTraceJson(value.candidates.map((c) => [c.orderKeyRef, c.candidateRef]))) throw new Error("Query candidates violate the declared stable order.");
  for (const key of ["results", "bytes", "tokens", "traversals"] as const) {
    const limit = value.bounds[key],
      actual = value.observed[key];
    if (limit !== null && actual !== null && actual > limit) throw new Error("Observed query exceeds declared bound.");
  }
  const limitKind = {
    RESULT_LIMIT: "results",
    BYTE_LIMIT: "bytes",
    TOKEN_LIMIT: "tokens",
    TRAVERSAL_LIMIT: "traversals",
  } as const;
  if (value.termination in limitKind) {
    const key = limitKind[value.termination as keyof typeof limitKind];
    if (value.coverage !== "PARTIAL" || value.bounds[key] === null || value.observed[key] === null) throw new Error("Bounded termination needs partial coverage and measured applied bound.");
  }
  if (value.continuation) {
    const c = value.continuation;
    const last = value.candidates.at(-1);
    if (value.coverage !== "PARTIAL" || !queryContinuationMatches(c, value) || !last || c.exclusiveAfter.orderKeyRef !== last.orderKeyRef || c.exclusiveAfter.candidateRef !== last.candidateRef) throw new Error("Continuation differs from the bound query, order, authority frontier or exclusive page cursor.");
  }
  if (value.supersedesRefs.includes(value.recordId)) throw new Error("Result cannot supersede itself.");
  return value;
}
export const createBoundedQueryResult = (body: unknown): BoundedQueryResult => createGovernedRecord(body, parseBoundedQueryResult);

/** Semantic observation only. Caller must independently verify authority and currency before relying on it. */
export function queryAbsenceEvidence(input: unknown): "OBSERVED_EMPTY_COMPLETE" | "NOT_ESTABLISHED" {
  const r = parseBoundedQueryResult(input);
  return r.coverage === "COMPLETE" && r.currentness === "CURRENT_FOR_DECLARED_FRONTIER" && r.candidates.length === 0 ? "OBSERVED_EMPTY_COMPLETE" : "NOT_ESTABLISHED";
}
/** The owner must use this same outward disposition for denied, hidden and absent-without-disclosure-authority. No input or metadata is carried. */
export function unavailableQueryResponse(): { readonly status: "unavailable" } {
  return Object.freeze({ status: "unavailable" });
}
