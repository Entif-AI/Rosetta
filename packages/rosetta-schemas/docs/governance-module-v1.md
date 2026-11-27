# Governance module v1

**Status: proposed, fixture-only.** Source issue #1876. Schema owner: rosetta-schemas. Human semantic acceptance is outstanding.

The registry is metadata, not a duplicate rule body. An immutable record binds a stable module identity, title, owner, category, exact version/revision, artifact digest, disclosure posture, provenance, receipt and conformance references. It can carry proposed/current/superseded/retired state, predecessor/replacement references and exact prerequisites. Replacement references may point to stable version identities so immutable records need not refer cyclically to each other's content hashes.

Topic, operation, event and applicability references are routing hints. They do not authorize execution or override the authority hierarchy. Protected artifacts use an opaque binding handle, never an internal path; producers must screen all other metadata for disclosure safety.

The resolver takes a current registry-owner observation that binds an explicit frontier, authorized scope and authority reference, coverage state, and exact module slots. COMPLETE coverage must enumerate the relevant slots; a missing slot is BLOCKED rather than evidence of absence. A slot with an explicit null record is the owner's bounded statement that no current record exists for that slot and resolves UNKNOWN. Duplicate slots are CONFLICT. A non-null slot must identify exactly one current record with the declared owner or resolution fails closed. The resolver does not select the highest version or treat a prior cache as current. It checks exact prerequisites against the same complete slot observation and refuses cycles. The loaded UTF-8 artifact is verified against a newly resolved registry observation, record identity, revision and actual bytes. The caller must obtain fresh authenticated observations before every governed reuse; neither a metadata record nor a hash authenticates the registry owner.

Earlier records remain inspectable. Multiple consumers can reference the same canonical body without duplicating it. Restart/compaction is handled by re-resolution from the registry, not restoring authority from cached text.

Executable conformance: governed-evidence-profiles.spec.ts tests unique current resolution, incomplete and conflicting registry observations, explicit no-current slots, stale cache, restart, exact artifact bytes, opaque binding, prerequisite closure and metadata-only records.
