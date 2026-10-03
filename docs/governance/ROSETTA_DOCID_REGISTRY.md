# Rosetta core-suite DocID registry

Draft contract for #676. The generated `ROSETTA_DOCID_REGISTRY.json` is the
machine-readable projection of the nine suite identities already declared by
Core Spine. It is not a document publication, release, or completeness claim.

## Ownership and authority

The flow is one-way:

1. Core Spine's normative suite table owns titles, document types and identities.
   Its authoritative adjacency list owns direct suite prerequisite edges.
2. The checked-in Core Spine source path supplies source identity. The former intake
   ledger was removed in #1572; it is neither needed nor reconstructed by public checks.
   The generator still accepts an explicit legacy ledger for bounded fixtures and checks
   its join if supplied. Public generation records `ledgerPath: null`.
3. `tools/docid-registry/registry.mjs` generates the projection, refuses table/adjacency
   disagreement, and hashes source bytes. Do not hand-edit it.

Companion availability remains declared-only unless separately verified by authority.

## Fields and validation

Every entry includes `docId`, exact declared `title` and `type`, `authority`,
`versionPosture`, `dependsOn`, `availability`, `canonicalPath`, `canonicalUri`,
and `declaredIn`. The envelope has `formatVersion`, `scope` and source path,
SHA-256 and ledger-path provenance.

`dependsOn` contains direct DocIDs: A listing B means A depends on B. External
standards and contextual references are not graph prerequisites. The graph must
have unique identities, existing targets and no cycles or self-dependencies.
Duplicate dependency entries, malformed metadata and authority/type mismatch fail.

`checked-in` identifies the verified Core Spine path. `declared-only` preserves
the other suite declarations without claiming their standalone artifacts exist.
Their paths are null. All canonical URIs are null: illustrative URIs in prose
are not verified publication locations. A legacy filename may differ from the
normative title; use the explicit verified path rather than renaming source
history or synthesizing a filename. Registering a new verified companion path or
URI requires a reviewed generator/source change and fixtures.

Core Spine's old diagram reversed most dependency arrows and added guide edges
absent from its authoritative adjacency list. The editorial correction uses
dependent-to-prerequisite arrows and exactly the existing list. No new normative
dependency or DocID is inferred from the old diagram.

## Commands and consumers

- `pnpm run docs:registry:generate`: regenerate after reviewing source changes.
- `pnpm run docs:registry:check`: reject stale output or source/graph conflicts.
- `pnpm run docs:registry:test`: positive and negative structural fixtures.

Both `verify` and `verify:full` run the checks. The Nx test target fingerprints
the source, generator and output so a source change cannot reuse a stale
cached registry result. Generation is deterministic and uses no timestamps,
network calls or models.

#680, #685 and #240 may resolve declared core-suite identities from this file;
they must separately check artifact availability before claiming schema exports,
implemented vocabularies or conformance coverage. Neither a registered identity
nor a normative document type certifies implementation support.

The `scope` is deliberately `core-suite`. Current pack manifests name
`ROCK-3111-C`, whose separate filesystem contract remains their authority.
Absence from this scoped projection must not reject that valid pack declaration.
An extension-range registry needs source-grounded closure of its own declared
dependencies (including ROCK-3111/A/B); this leaf does not fabricate those
missing authorities or replace existing pack validation. #790 remains the pack
integrity owner.

Preflight reviewed Core Spine, intake ownership, the pack filesystem contract,
public governance and the public/protected maps. No protected operational edge
controls this public document projection; no authority-map change is introduced.
