# Bounded query result v1

**Status: proposed, fixture-only.** Source issue #1877. Schema owner: rosetta-schemas. Human semantic acceptance is outstanding.

This generic result projection composes Core observation/evaluation/receipt references, source identity, authority references and materialized-view frontier identity. It does not redefine graph.view.v1, materialized.view.v1 or compiled.context.v1, and specifies neither ranking nor retrieval policy.

A record commits its metadata body to a content digest. The query and domain Profile references identify the request and its domain semantics. Caller, purpose, scope, policy and admission references bind the result to its governing owner. None are authentication or disclosure grants. Source revision, materialization and frontier references identify the evidence observed.

Bounds and observed counts distinguish an unapplied or unmeasured quantity (null) from zero. COMPLETE requires known exhausted frontier; PARTIAL denotes bounded or interrupted coverage; UNKNOWN cannot prove absence; UNAVAILABLE carries no candidate or measured count. Even a complete empty result is only evidence at its declared frontier and must be authenticated and revalidated independently. Termination describes why work ended, not an action or ranking decision.

Continuation binds exact query, source identity, materialization, frontier, caller, purpose, scope, policy, admission, domain and bounds. A changed binding cannot silently continue. Candidate references can carry source locators, match-basis and evaluation evidence without exposing ranking internals. Replay, supersession and invalidation references preserve history rather than rewriting it.

An internal unavailable envelope is not a disclosure-safe public error: it still contains protected query context. The owner must use the fixed outward unavailable disposition for hidden, denied and absent-without-disclosure-authority cases. Admission, settlement, side-channel control and allowed disclosure are external owner obligations. The schema and reference observations never grant rights.

Executable conformance: governed-evidence-profiles.spec.ts covers complete/partial/unknown, bounded exhaustion, exact continuation, domain catalog and decision evidence, and uniform unavailable outward behavior.
