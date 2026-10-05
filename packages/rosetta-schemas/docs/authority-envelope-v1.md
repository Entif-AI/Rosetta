# Authority Envelope Profile v1

`authz.authority_envelope.v1` implements the public extension contract in #630 and #1746. It is a governed extension/Profile carried in the existing Core `TileEnvelope`, not a new Core kind, a canonical authority store, or a self-authorizing token. ROCK-3005 remains the Core conformance-profile document identity.

The public exports are `AuthorityEnvelope`, `AUTHORITY_ENVELOPE_SCHEMA`, `parseAuthorityEnvelope`, `validateAuthorityEnvelope`, and `validateAuthorityDelegation`. The JSON Schema is a deterministic projection of the exported schema; after building `rosetta-schemas`, run `node tools/authz/export-schema.mjs` or its `--check` mode.

An envelope binds externally established authority-root/delegation references to one exact resource and a #711 `domain_ref`, operation names, the existing #1037 capability effect vocabulary, a policy/version/frontier, context constraints, a validity interval, delegation lineage/ceiling/depth, and a compilation source frontier. Context attributes use finite allowed string values; constraints compose conjunctively. Version 1 supports exact resource references; patterns and implicit resource hierarchies are unsupported. It never infers a union of independent grants.

Actor evidence is optional in the representation and becomes required only when the current owning policy/gate requires it. Identity, role, context, capability, discovery, decisions, integrity, and Receipts cannot substitute for an authority-source role. A correctly tagged reference still requires resolution against its authoritative owner; structural validation does not establish that the referenced grant exists.

Expiry, revocation, broader invalidity and supersession remain distinguishable. The extension uses `Expiry ⊂ Revocability ⊂ Invalidity`; mappings to OAuth/JWT/VC must declare their own terminology rather than assume synonyms. Invalid state remains representable even inside an integrity-valid Core wrapper. Integrity and Receipt references attest their bounded claims, without reviving authority.

`validateAuthorityDelegation` checks represented non-amplification: exact parent/lineage/root closure, target/domain, operations/effects, context predicates, interval, policy/source frontier, remaining depth and further-delegation posture. It does not resolve current authority state. Structural validation returns `ok/errors`, never an executable allow result. Guard (#1747) must revalidate current authority, source/frontier and independent gates at the boundary where the action acquires power.

The deterministic fixtures in `fixtures/authz-v1.json` and `authority-envelope.spec.ts` cover bounded standing delegation, malformed/unknown inputs, source-role confusion, represented expiry/revocation/invalidity/supersession, signed but invalid state, drift, and attenuation failures. They are fixture-backed contract proof, with no production provider or identity integration claim.
