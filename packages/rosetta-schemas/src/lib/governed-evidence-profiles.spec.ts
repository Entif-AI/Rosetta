import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DECISION_RECORD_SCHEMA, createDecisionRecord, parseDecisionRecord, resolveDecisionState, type DecisionRecord, type DecisionResolutionContext } from "./decision-record.js";
import { GOVERNANCE_MODULE_SCHEMA, createGovernanceModule, parseGovernanceModule, resolveGovernanceModule, verifyGovernanceModuleArtifact, type GovernanceModule, type GovernanceRegistryObservation } from "./governance-module.js";
import { BOUNDED_QUERY_RESULT_SCHEMA, createBoundedQueryResult, paginateAdmittedQueryCandidates, parseBoundedQueryResult, queryAbsenceEvidence, queryContinuationMatches, unavailableQueryResponse, type BoundedQueryResult, type QueryCandidate } from "./bounded-query-result.js";
import { traceHash } from "./trace-normalization.js";

const t1 = "2026-01-01T00:00:00.000Z",
  t2 = "2026-02-01T00:00:00.000Z",
  t3 = "2026-03-01T00:00:00.000Z";
function decision(n: string, overrides: Partial<Omit<DecisionRecord, "recordId">> = {}) {
  return createDecisionRecord({
    profile: { id: "decision.record.v1", version: "1.0.0" },
    decisionRef: "decision:" + n,
    versionRef: "1",
    locusRef: "locus",
    controllerRef: "owner",
    authorRef: "author",
    ratification: {
      ratifierRef: "ratifier",
      authorityRef: "authority",
      evidenceRefs: ["ratification:" + n],
    },
    scopeRefs: ["global"],
    state: "EFFECTIVE",
    clauses: [{ clauseRef: "slot", propositionRef: "value:" + n }],
    source: [
      {
        identity: { ref: "source:" + n, version: "revision:1", cid: null },
        lineageRef: "lineage:" + n,
        locatorRef: "span:1",
      },
    ],
    time: {
      effectiveFrom: t1,
      effectiveUntil: null,
      observedAt: t1,
      recordedAt: t1,
    },
    relations: [],
    provenanceRefs: ["source:" + n],
    receiptRefs: [],
    ...overrides,
  });
}
function context(records: DecisionRecord[], overrides: Partial<DecisionResolutionContext> = {}): DecisionResolutionContext {
  const ordered = [...records].sort((a, b) => Date.parse(a.time.recordedAt) - Date.parse(b.time.recordedAt));
  const causalOrder = ordered.flatMap((before, index) =>
    ordered
      .slice(index + 1)
      .filter((after) => Date.parse(after.time.recordedAt) > Date.parse(before.time.recordedAt))
      .map((after) => ({
        beforeRecordRef: before.recordId,
        afterRecordRef: after.recordId,
        evidenceRef: `order:${before.recordId}:${after.recordId}`,
      }))
  );
  return {
    locusRef: "locus",
    applicableScopeRefs: ["global"],
    effectiveAt: t3,
    knownAt: t3,
    ratifications: records.flatMap((r) =>
      r.ratification
        ? [
            {
              recordRef: r.recordId,
              controllerRef: r.controllerRef,
              authorityRef: r.ratification.authorityRef,
              evidenceRef: r.ratification.evidenceRefs[0]!,
            },
          ]
        : []
    ),
    sourceSet: {
      sourceSetRef: "decision-source-set",
      versionRef: "1",
      normalizationFrontierRef: "frontier:normalized:1",
      coverage: "COMPLETE",
      expectedPartitionRefs: ["partition:all"],
      observedPartitionRefs: ["partition:all"],
      observedRecordRefs: records.map((r) => r.recordId),
    },
    causalOrder,
    ...overrides,
  };
}
const later = {
  effectiveFrom: t2,
  effectiveUntil: null,
  observedAt: t2,
  recordedAt: t2,
};
const values = (history: DecisionRecord[], c = context(history)) =>
  resolveDecisionState(history, c)
    .clauses.flatMap((slot) => slot.alternatives.map((a) => a.propositionRef))
    .sort();
const relation = (kind: DecisionRecord["relations"][number]["kind"], target: DecisionRecord, clauseRefs = ["slot"]) => ({
  kind,
  targetRecordRef: target.recordId,
  clauseRefs,
  evidenceRefs: ["relation:evidence"],
});
describe("candidate decision effective-state projection #1875", () => {
  it("supersedes incompatible ratified history but preserves both revisions and order independence", () => {
    const a = decision("a"),
      b = decision("b", { time: later });
    const c = context([a, b]);
    expect(values([a, b], c)).toEqual(["value:b"]);
    expect(resolveDecisionState([b, a], c)).toEqual(resolveDecisionState([a, b], c));
    expect(resolveDecisionState([a, b], c).historyRefs).toEqual([a.recordId, b.recordId].sort());
  });
  it("does not promote later proposal or assistant wording", () => {
    const a = decision("a"),
      b = decision("b", {
        time: later,
        state: "PROPOSED",
        authorRef: "assistant",
        ratification: null,
      });
    expect(values([a, b])).toEqual(["value:a"]);
  });
  it("retains independent additive clauses", () => {
    const a = decision("a"),
      b = decision("b", {
        time: later,
        clauses: [{ clauseRef: "other", propositionRef: "value:b" }],
        relations: [relation("ADDS", a)],
      });
    expect(values([a, b])).toEqual(["value:a", "value:b"]);
  });
  it("amends only a bounded clause, leaving the others intact", () => {
    const a = decision("a", {
      clauses: [
        { clauseRef: "slot", propositionRef: "value:a" },
        { clauseRef: "other", propositionRef: "untouched" },
      ],
    });
    const b = decision("b", {
      time: later,
      relations: [relation("AMENDS", a)],
    });
    expect(values([a, b])).toEqual(["untouched", "value:b"]);
  });
  it("applies scoped exception only inside the owner-declared applicability", () => {
    const a = decision("a"),
      b = decision("b", {
        scopeRefs: ["local"],
        time: later,
        relations: [relation("EXCEPTS", a)],
      });
    expect(values([a, b])).toEqual(["value:a"]);
    expect(values([a, b], context([a, b], { applicableScopeRefs: ["global", "local"] }))).toEqual(["value:b"]);
  });
  it("expires a temporary override and restores the base without a history rewrite", () => {
    const a = decision("a"),
      b = decision("b", {
        time: { ...later, effectiveUntil: t3 },
        relations: [relation("TEMPORARILY_OVERRIDES", a)],
      });
    expect(values([a, b], context([a, b], { effectiveAt: t2 }))).toEqual(["value:b"]);
    expect(values([a, b])).toEqual(["value:a"]);
  });
  it("preserves peer-controller conflict and same-time alternatives", () => {
    const a = decision("a"),
      b = decision("b", { controllerRef: "peer", time: later });
    expect(resolveDecisionState([a, b], context([a, b])).state).toBe("CONFLICT");
    expect(resolveDecisionState([a, decision("c")], context([a, decision("c")])).state).toBe("CONFLICT");
  });
  it("same proposition across unrelated scope cannot supersede", () => {
    const a = decision("a"),
      b = decision("b", { time: later, scopeRefs: ["unrelated"] });
    expect(values([a, b])).toEqual(["value:a"]);
  });
  it("retains one witness lineage for repeated projections and rejects manufactured lineage", () => {
    const a = decision("a"),
      b = decision("b", { source: a.source, clauses: a.clauses });
    expect(resolveDecisionState([a, a, b], context([a, b])).sourceLineageRefs).toEqual(["lineage:a"]);
    const bad = decision("b", {
      source: a.source.map((s) => ({ ...s, lineageRef: "fabricated" })),
    });
    expect(() => resolveDecisionState([a, bad], context([a, bad]))).toThrow(/lineage/);
  });
  it("records source retraction as an explicit invalidation rather than erasing history", () => {
    const a = decision("a"),
      b = decision("b", {
        time: later,
        clauses: [],
        relations: [relation("RETRACTS", a)],
      });
    const r = resolveDecisionState([a, b], context([a, b]));
    expect(r.clauses).toEqual([]);
    expect(r.invalidatedRecordRefs).toEqual([a.recordId]);
    expect(r.historyRefs).toHaveLength(2);
  });
  it("rejects unobserved ratification despite a self-declared accepted state", () => {
    const a = decision("a"),
      b = decision("b", { time: later, authorRef: "assistant" });
    const r = resolveDecisionState([a, b], context([a]));
    expect(r.state).toBe("UNRESOLVED");
    expect(r.unresolvedRecordRefs).toEqual([b.recordId]);
    expect(values([a, b], context([a]))).toEqual(["value:a"]);
  });
  it("reconstructs historical knowledge and refuses substituted evidence or partial relation effects", () => {
    const a = decision("a"),
      b = decision("b", {
        time: later,
        relations: [relation("AMENDS", a), relation("AMENDS", a, ["missing"])],
      });
    expect(values([a, b])).toEqual(["value:a"]);
    expect(resolveDecisionState([a, b], context([a, b])).state).toBe("UNRESOLVED");
    expect(values([a, b], context([a, b], { knownAt: t1 }))).toEqual(["value:a"]);
    expect(() => parseDecisionRecord({ ...a, locusRef: "changed" })).toThrow(/digest/);
  });
  it("does not claim a unique current state when declared observed history is missing", () => {
    const a = decision("a"),
      b = decision("b", { time: later });
    expect(resolveDecisionState([a], context([a, b])).state).toBe("UNRESOLVED");
  });
  it("requires complete normalized source closure before resolving a unique state", () => {
    const a = decision("a");
    expect(
      resolveDecisionState(
        [a],
        context([a], {
          sourceSet: { ...context([a]).sourceSet, coverage: "PARTIAL" },
        })
      ).state
    ).toBe("UNRESOLVED");
    expect(
      resolveDecisionState(
        [a],
        context([a], {
          sourceSet: {
            ...context([a]).sourceSet,
            normalizationFrontierRef: null,
          },
        })
      ).state
    ).toBe("UNRESOLVED");
  });
  it("does not infer causal supersession from effective time alone or from retroactive effective time", () => {
    const a = decision("a"),
      b = decision("b", { time: later });
    expect(resolveDecisionState([a, b], context([a, b], { causalOrder: [] })).state).toBe("CONFLICT");
    expect(values([a, b], context([a, b], { causalOrder: [] }))).toEqual(["value:a", "value:b"]);
    const retroactive = decision("retro", {
      time: {
        effectiveFrom: "2025-12-01T00:00:00.000Z",
        effectiveUntil: null,
        observedAt: t2,
        recordedAt: t2,
      },
    });
    const retroContext = context([a, retroactive], {
      causalOrder: [
        {
          beforeRecordRef: a.recordId,
          afterRecordRef: retroactive.recordId,
          evidenceRef: "order:retroactive",
        },
      ],
    });
    expect(resolveDecisionState([a, retroactive], retroContext).state).toBe("CONFLICT");
    expect(values([a, retroactive], retroContext)).toEqual(["value:a", "value:retro"]);
  });
  it("uses transitive causal order and rejects out-of-set or cyclic order evidence", () => {
    const a = decision("a");
    const b = decision("b", {
      time: later,
      state: "PROPOSED",
      ratification: null,
    });
    const c = decision("c", {
      time: {
        effectiveFrom: "2026-01-03T00:00:00.000Z",
        effectiveUntil: null,
        observedAt: t3,
        recordedAt: t3,
      },
    });
    const transitive = context([a, b, c], {
      causalOrder: [
        {
          beforeRecordRef: a.recordId,
          afterRecordRef: b.recordId,
          evidenceRef: "order:a:b",
        },
        {
          beforeRecordRef: b.recordId,
          afterRecordRef: c.recordId,
          evidenceRef: "order:b:c",
        },
      ],
    });
    expect(values([a, b, c], transitive)).toEqual(["value:c"]);
    expect(() =>
      resolveDecisionState(
        [a, b],
        context([a, b], {
          causalOrder: [
            {
              beforeRecordRef: a.recordId,
              afterRecordRef: "missing-record",
              evidenceRef: "order:outside",
            },
          ],
        })
      )
    ).toThrow(/source set/);
    expect(() =>
      resolveDecisionState(
        [a, b],
        context([a, b], {
          causalOrder: [
            {
              beforeRecordRef: a.recordId,
              afterRecordRef: b.recordId,
              evidenceRef: "order:a:b",
            },
            {
              beforeRecordRef: b.recordId,
              afterRecordRef: a.recordId,
              evidenceRef: "order:b:a",
            },
          ],
        })
      )
    ).toThrow(/acyclic/);
  });
});
function moduleRecord(n: string, overrides: Partial<Omit<GovernanceModule, "recordId">> = {}) {
  return createGovernanceModule({
    profile: { id: "governance.module.v1", version: "1.0.0" },
    moduleRef: "rules",
    title: "Rules",
    ownerRef: "owner",
    categoryRef: "category",
    versionRef: n,
    revisionRef: "revision:" + n,
    artifact: { ref: "artifact:" + n, sha256: traceHash("body:" + n) },
    disclosure: "PUBLIC",
    opaqueBindingRef: null,
    state: "CURRENT",
    supersedesRefs: [],
    replacedByRefs: [],
    dependencies: [],
    triggers: {
      topicRefs: ["topic"],
      operationRefs: [],
      eventRefs: [],
      applicabilityRefs: [],
    },
    conformanceRefs: ["profile"],
    provenanceRefs: ["source"],
    receiptRefs: [],
    ...overrides,
  });
}
const registry = (m: GovernanceModule, frontierRef = "frontier:1"): GovernanceRegistryObservation => ({
  frontierRef,
  scopeRef: "scope:registry",
  authorityRef: "authority:registry-owner",
  coverage: "COMPLETE",
  slots: [{ moduleRef: m.moduleRef, recordRef: m.recordId, ownerRef: m.ownerRef }],
});
const emptyRegistry = (moduleRef = "rules", frontierRef = "frontier:1"): GovernanceRegistryObservation => ({
  frontierRef,
  scopeRef: "scope:registry",
  authorityRef: "authority:registry-owner",
  coverage: "COMPLETE",
  slots: [{ moduleRef, recordRef: null, ownerRef: "owner" }],
});
const loaded = (m: GovernanceModule, utf8: string) => ({
  recordRef: m.recordId,
  revisionRef: m.revisionRef,
  utf8,
});
describe("candidate governance registry #1876", () => {
  it("resolves one observed current version with immutable earlier records", () => {
    const a = moduleRecord("1"),
      b = moduleRecord("2", { supersedesRefs: [a.recordId] });
    expect(resolveGovernanceModule([a, b], registry(b), "rules")).toEqual({
      state: "RESOLVED",
      frontierRef: "frontier:1",
      module: b,
    });
    expect(parseGovernanceModule(a)).toEqual(a);
    expect(resolveGovernanceModule([a, b], emptyRegistry("rules", "f"), "rules").state).toBe("UNKNOWN");
  });
  it("rejects stale cache after the authoritative frontier changes and after restart", () => {
    const a = moduleRecord("1"),
      b = moduleRecord("2");
    expect(verifyGovernanceModuleArtifact([a, b], registry(a), "rules", loaded(a, "body:1"))).toBe(true);
    expect(verifyGovernanceModuleArtifact([a, b], registry(b, "frontier:2"), "rules", loaded(a, "body:1"))).toBe(false);
    expect(resolveGovernanceModule(JSON.parse(JSON.stringify([a, b])), registry(b), "rules")).toEqual(resolveGovernanceModule([a, b], registry(b), "rules"));
  });
  it("does not load a superseded or proposed record as current", () => {
    for (const state of ["SUPERSEDED", "PROPOSED"] as const) {
      const a = moduleRecord("1", { state, replacedByRefs: ["version:2"] });
      expect(resolveGovernanceModule([a], registry(a), "rules").state).toBe("MISMATCH");
    }
  });
  it("reports conflicting current observations rather than using version order", () => {
    const a = moduleRecord("1"),
      b = moduleRecord("2");
    const observed = {
      ...registry(a, "f"),
      slots: [...registry(a).slots, ...registry(b).slots],
    };
    expect(resolveGovernanceModule([a, b], observed, "rules").state).toBe("CONFLICT");
  });
  it("resolves protected artifact only through an opaque handle and refuses path substitution", () => {
    const a = moduleRecord("1", {
      disclosure: "OPAQUE",
      opaqueBindingRef: "urn:opaque:binding",
      artifact: { ref: "urn:opaque:binding", sha256: traceHash("body:1") },
    });
    expect(resolveGovernanceModule([a], registry(a), "rules")).toMatchObject({
      state: "RESOLVED",
      module: { artifact: { ref: "urn:opaque:binding" } },
    });
    expect(() =>
      moduleRecord("1", {
        disclosure: "OPAQUE",
        opaqueBindingRef: "urn:opaque:binding",
        artifact: { ref: "/local/rules", sha256: traceHash("body:1") },
      })
    ).toThrow(/opaque/);
  });
  it("checks exact revision, actual bytes and digest against the observed owner", () => {
    const a = moduleRecord("1");
    expect(verifyGovernanceModuleArtifact([a], registry(a), "rules", loaded(a, "wrong"))).toBe(false);
    expect(
      verifyGovernanceModuleArtifact([a], registry(a), "rules", {
        ...loaded(a, "body:1"),
        revisionRef: "wrong",
      })
    ).toBe(false);
    expect(
      resolveGovernanceModule(
        [a],
        {
          ...registry(a, "f"),
          slots: [{ ...registry(a).slots[0]!, ownerRef: "wrong" }],
        },
        "rules"
      ).state
    ).toBe("MISMATCH");
  });
  it("requires the exact current prerequisite, blocking stale or absent dependency", () => {
    const dep = moduleRecord("1", { moduleRef: "dependency" });
    const a = moduleRecord("1", {
      dependencies: [{ moduleRef: dep.moduleRef, recordRef: dep.recordId }],
    });
    expect(resolveGovernanceModule([a, dep], registry(a), "rules").state).toBe("BLOCKED");
    expect(
      resolveGovernanceModule(
        [a, dep],
        {
          ...registry(a, "f"),
          slots: [...registry(a).slots, ...registry(dep).slots],
        },
        "rules"
      ).state
    ).toBe("RESOLVED");
  });
  it("keeps metadata-only registry and one artifact shared by consumers", () => {
    const a = moduleRecord("1");
    expect(() =>
      createGovernanceModule({
        ...Object.fromEntries(Object.entries(a).filter(([k]) => k !== "recordId")),
        body: "duplicate rules",
      })
    ).toThrow();
    const consumers = [
      { consumerRef: "consumer-a", artifactRef: a.artifact.ref },
      { consumerRef: "consumer-b", artifactRef: a.artifact.ref },
    ];
    expect(new Set(consumers.map((c) => c.artifactRef)).size).toBe(1);
    expect(consumers.map((c) => c.artifactRef === a.artifact.ref && verifyGovernanceModuleArtifact([a], registry(a), "rules", loaded(a, "body:1")))).toEqual([true, true]);
  });
  it("does not treat an omitted slot as authoritative evidence that no current module exists", () => {
    const a = moduleRecord("1");
    expect(resolveGovernanceModule([a], { ...registry(a, "f"), slots: [] }, "rules").state).toBe("BLOCKED");
    expect(resolveGovernanceModule([a], { ...registry(a, "f"), coverage: "PARTIAL" }, "rules").state).toBe("BLOCKED");
    expect(resolveGovernanceModule([a], emptyRegistry("rules", "f"), "rules").state).toBe("UNKNOWN");
  });
});
function result(overrides: Partial<Omit<BoundedQueryResult, "recordId">> = {}) {
  return createBoundedQueryResult({
    profile: { id: "query.result.v1", version: "1.0.0" },
    queryRef: "query:1",
    domainProfileRef: "domain:catalog",
    admittedUniverseRef: "universe:admitted:1",
    authority: {
      callerRef: "caller",
      purposeRef: "lookup",
      scopeRef: "scope",
      policyRef: "policy:1",
      admissionRef: "admission:1",
    },
    source: {
      identity: { ref: "source", version: "revision:1", cid: null },
      materializationRef: "view:1",
      frontierRef: "frontier:1",
    },
    bounds: { results: 10, bytes: 1000, tokens: null, traversals: 100 },
    observed: { results: 0, bytes: 0, tokens: null, traversals: 1 },
    ordering: {
      basisRef: "order:domain",
      direction: "ASC",
      tieBreak: "CANDIDATE_REF_LEXICAL_ASC",
    },
    coverage: "COMPLETE",
    termination: "EXHAUSTED",
    candidates: [],
    continuation: null,
    currentness: "CURRENT_FOR_DECLARED_FRONTIER",
    replayRef: null,
    supersedesRefs: [],
    invalidationRefs: [],
    provenanceRefs: ["source"],
    receiptRefs: [],
    ...overrides,
  });
}
describe("candidate bounded query results #1877", () => {
  it("distinguishes complete empty from partial, unknown and stale evidence", () => {
    expect(queryAbsenceEvidence(result())).toBe("OBSERVED_EMPTY_COMPLETE");
    expect(queryAbsenceEvidence(result({ coverage: "PARTIAL", termination: "RESULT_LIMIT" }))).toBe("NOT_ESTABLISHED");
    expect(
      queryAbsenceEvidence(
        result({
          coverage: "UNKNOWN",
          termination: "UNKNOWN",
          currentness: "UNKNOWN",
        })
      )
    ).toBe("NOT_ESTABLISHED");
    expect(queryAbsenceEvidence(result({ currentness: "STALE", invalidationRefs: ["correction"] }))).toBe("NOT_ESTABLISHED");
  });
  it("binds pagination to exact query, source, bounds and policy frontier", () => {
    const a = result();
    const candidate: QueryCandidate = {
      candidateRef: "candidate:a",
      sourceRef: "source",
      locatorRefs: ["span:1"],
      matchBasisRef: "exact-id",
      evaluationRefs: [],
      orderKeyRef: "order-key:1",
    };
    const continuation = {
      cursorRef: "cursor",
      queryRef: a.queryRef,
      frontierRef: a.source.frontierRef!,
      ...a.authority,
      domainProfileRef: a.domainProfileRef,
      admittedUniverseRef: a.admittedUniverseRef,
      sourceIdentity: a.source.identity,
      materializationRef: a.source.materializationRef,
      bounds: a.bounds,
      ordering: a.ordering,
      exclusiveAfter: {
        orderKeyRef: candidate.orderKeyRef,
        candidateRef: candidate.candidateRef,
      },
    };
    expect(
      result({
        coverage: "PARTIAL",
        termination: "RESULT_LIMIT",
        candidates: [candidate],
        observed: { results: 1, bytes: 50, tokens: null, traversals: 1 },
        continuation,
      }).continuation
    ).toEqual(continuation);
    expect(() =>
      result({
        coverage: "PARTIAL",
        termination: "RESULT_LIMIT",
        continuation: { ...continuation, policyRef: "changed" },
      })
    ).toThrow(/Continuation/);
    expect(() =>
      result({
        coverage: "PARTIAL",
        termination: "RESULT_LIMIT",
        continuation: { ...continuation, bounds: { ...a.bounds, results: 11 } },
      })
    ).toThrow(/Continuation/);
  });
  it("validates bounds and candidate counts, and uses two distinct domain profiles", () => {
    const candidate: QueryCandidate = {
      candidateRef: "candidate:1",
      sourceRef: "source",
      locatorRefs: ["span:1"],
      matchBasisRef: "exact-id",
      evaluationRefs: [],
      orderKeyRef: "order-key:1",
    };
    for (const domainProfileRef of ["domain:catalog", "domain:decision"])
      expect(
        result({
          domainProfileRef,
          candidates: [candidate],
          observed: { results: 1, bytes: 50, tokens: null, traversals: 1 },
        }).candidates
      ).toEqual([candidate]);
    expect(() =>
      result({
        observed: { results: 0, bytes: 1001, tokens: null, traversals: 1 },
      })
    ).toThrow(/bound/);
    expect(() => result({ candidates: [candidate] })).toThrow(/count/);
  });
  it("does not disclose counts or candidate evidence in unavailable results; outward absence is uniform", () => {
    const a = result({
      coverage: "UNAVAILABLE",
      termination: "UNAVAILABLE",
      observed: { results: null, bytes: null, tokens: null, traversals: null },
      currentness: "UNKNOWN",
    });
    expect(queryAbsenceEvidence(a)).toBe("NOT_ESTABLISHED");
    expect(() => result({ coverage: "UNAVAILABLE", termination: "UNAVAILABLE" })).toThrow(/disclose/);
    const deniedExisting = unavailableQueryResponse(),
      absentWithoutAuthority = unavailableQueryResponse();
    expect(JSON.stringify(deniedExisting)).toBe(JSON.stringify(absentWithoutAuthority));
    expect(deniedExisting).toEqual({ status: "unavailable" });
  });
  it("refuses inconsistent exhaustion or tampered result identity", () => {
    expect(() => result({ coverage: "PARTIAL" })).toThrow(/Exhaustion/);
    expect(() =>
      result({
        source: {
          identity: { ref: "s", version: null, cid: null },
          materializationRef: null,
          frontierRef: null,
        },
      })
    ).toThrow(/frontier/);
    expect(() => parseBoundedQueryResult({ ...result(), queryRef: "other" })).toThrow(/digest/);
  });
  it("rejects a page whose candidate order is not stable", () => {
    const candidates = [
      {
        candidateRef: "candidate:z",
        sourceRef: "source",
        locatorRefs: ["span:2"],
        matchBasisRef: "exact-id",
        evaluationRefs: [],
        orderKeyRef: "order-key:1",
      },
      {
        candidateRef: "candidate:a",
        sourceRef: "source",
        locatorRefs: ["span:1"],
        matchBasisRef: "exact-id",
        evaluationRefs: [],
        orderKeyRef: "order-key:1",
      },
    ];
    expect(() =>
      result({
        candidates,
        observed: { results: 2, bytes: 100, tokens: null, traversals: 1 },
      })
    ).toThrow(/order/i);
  });
  it("replays a real two-page admitted universe with an exclusive cursor and rejects changed bindings", () => {
    const universe: QueryCandidate[] = [
      {
        candidateRef: "candidate:c",
        sourceRef: "source",
        locatorRefs: ["span:3"],
        matchBasisRef: "exact-id",
        evaluationRefs: [],
        orderKeyRef: "order-key:2",
      },
      {
        candidateRef: "candidate:b",
        sourceRef: "source",
        locatorRefs: ["span:2"],
        matchBasisRef: "exact-id",
        evaluationRefs: [],
        orderKeyRef: "order-key:1",
      },
      {
        candidateRef: "candidate:a",
        sourceRef: "source",
        locatorRefs: ["span:1"],
        matchBasisRef: "exact-id",
        evaluationRefs: [],
        orderKeyRef: "order-key:1",
      },
    ];
    const base = result();
    const first = paginateAdmittedQueryCandidates(universe, base.ordering, 2);
    expect(first.map((c) => c.candidateRef)).toEqual(["candidate:a", "candidate:b"]);
    const last = first.at(-1)!;
    const continuation = {
      cursorRef: "cursor:page-2",
      queryRef: base.queryRef,
      frontierRef: base.source.frontierRef!,
      ...base.authority,
      domainProfileRef: base.domainProfileRef,
      admittedUniverseRef: base.admittedUniverseRef,
      sourceIdentity: base.source.identity,
      materializationRef: base.source.materializationRef,
      bounds: base.bounds,
      ordering: base.ordering,
      exclusiveAfter: {
        orderKeyRef: last.orderKeyRef,
        candidateRef: last.candidateRef,
      },
    };
    const firstResult = result({
      coverage: "PARTIAL",
      termination: "RESULT_LIMIT",
      candidates: first,
      observed: { results: 2, bytes: 100, tokens: null, traversals: 1 },
      continuation,
    });
    expect(queryContinuationMatches(continuation, firstResult)).toBe(true);
    const second = paginateAdmittedQueryCandidates(universe, base.ordering, 2, continuation.exclusiveAfter);
    expect(second.map((c) => c.candidateRef)).toEqual(["candidate:c"]);
    expect(
      result({
        candidates: second,
        observed: { results: 1, bytes: 50, tokens: null, traversals: 1 },
      }).coverage
    ).toBe("COMPLETE");
    expect(
      queryContinuationMatches(continuation, {
        ...base,
        queryRef: "query:changed",
      })
    ).toBe(false);
    expect(
      queryContinuationMatches(continuation, {
        ...base,
        source: { ...base.source, frontierRef: "frontier:changed" },
      })
    ).toBe(false);
    expect(
      queryContinuationMatches(continuation, {
        ...base,
        authority: { ...base.authority, admissionRef: "admission:changed" },
      })
    ).toBe(false);
    expect(
      queryContinuationMatches(continuation, {
        ...base,
        bounds: { ...base.bounds, results: 2 },
      })
    ).toBe(false);
    expect(
      queryContinuationMatches(continuation, {
        ...base,
        ordering: { ...base.ordering, direction: "DESC" },
      })
    ).toBe(false);
  });
});

it("keeps published JSON schemas identical to the executable owner schemas", () => {
  for (const [name, schema] of [
    ["decision-record-v1", DECISION_RECORD_SCHEMA],
    ["governance-module-v1", GOVERNANCE_MODULE_SCHEMA],
    ["bounded-query-result-v1", BOUNDED_QUERY_RESULT_SCHEMA],
  ] as const) {
    const path = new URL("../../docs/" + name + ".schema.json", import.meta.url);
    expect(JSON.parse(readFileSync(path, "utf8"))).toEqual(schema);
  }
});
