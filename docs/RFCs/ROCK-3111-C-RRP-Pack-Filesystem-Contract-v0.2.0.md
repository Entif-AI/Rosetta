
# ROCK-3111-C
**Title:** RRP Pack Filesystem Contract v0.2.0  
**Status:** Draft  
**Series:** ROCK 3100+ Extension Pack Range  
**Depends on:** Rosetta v3.0.0 Core Spine; ROCK-3111; ROCK-3111-A; ROCK-3111-B; Doctrine v0.2  
**Scope:** Define the normative filesystem, manifest, validation, conformance, and release contract for Rosetta packs, with an RRP-specific concrete instantiation.

---

## 0. Intent

This contract is the missing bridge between “we have pack ideas” and “the repository knows exactly how a pack must exist on disk, how it must be validated, how it evolves, and what must be green before it can claim conformance.”

It serves two simultaneous goals:

1. make packs predictable and machine-checkable for humans, CI, and coding agents
2. keep Rosetta’s constitutional center stable by forcing new semantics into packs instead of casual core mutation

This contract defines a **generic pack root contract** and an **RRP-specific specialization**.

---

## 1. Normative pack model

### 1.1 Pack categories
A pack MUST declare exactly one primary category:

- `StdPack` — standard/protocol alignment pack
- `VocabPack` — taxonomy / SKOS / vocabulary pack
- `SchemaPack` — JSON Schema / SHACL / examples pack
- `GovernancePack` — policy / rules / guard-adjacent pack
- `RecipePack` — reusable workflow or compositional recipe pack
- `SkillPack` — reusable agent/operator behavior pack
- `PersonaPack` — identity/persona/council pack (non-core; elevated governance applies)

A pack MAY expose cross-category exports, but MUST name one primary category.

### 1.2 Pack identity
Each pack MUST expose:
- stable `pack_id`
- human-readable `name`
- `namespace`
- semver `version`
- `doc_id` where applicable
- compatibility range for Rosetta core
- content-addressed export metadata or file hashes

### 1.3 Refinement-first rule
Packs MUST extend core semantics without redefining or silently mutating Rosetta core meanings.  
If a change requires core semantic mutation, it is not a pack change and must be escalated out of band.

---

## 2. Required generic pack root

Every pack root MUST exist under:

```txt
packs/<pack-name>/
```

Minimum required files:

```txt
packs/<pack-name>/
  pack.json
  README.md
  CHANGELOG.md
  acceptance.md
  metadata.json
  examples/
  tests/
```

Additional required subtrees depend on pack category.

### 2.1 Required root files

#### `pack.json`
Normative machine manifest. REQUIRED.

#### `README.md`
Human-first overview including:
- purpose
- scope
- included exports
- prerequisites
- quickstart
- conformance claims
- known limitations
- version notes

#### `CHANGELOG.md`
Semver-aligned change history. REQUIRED once the pack is past `0.0.x`.

#### `acceptance.md`
Explicit acceptance gates for this pack:
- what must pass
- what must fail
- merge blockers
- release blockers
- profile-specific behavior if any

#### `metadata.json`
Contribution metadata for humans and agents. SHOULD include:
- owner/maintainer
- source doctrine
- intended lifecycle stage
- automation hints
- agent-readable tags
- security classification

#### `examples/`
Minimal and representative examples. At least one valid example is REQUIRED.

#### `tests/`
Pack-specific tests and/or pointers to fixtures. A pack without tests cannot claim conformance.

---

## 3. Generic optional-but-standard subtrees

These are optional generically, but standard if applicable:

```txt
schema/
shacl/
vocab/
profiles/
test-vectors/
receipts-fixtures/
policy/
migrations/
translators/
docs/
```

### 3.1 `schema/`
Use when JSON Schemas or related machine contracts exist.

### 3.2 `shacl/`
Use when RDF/graph constraints are part of the pack.  
For schema-heavy or provenance-heavy packs, SHACL is strongly recommended.

### 3.3 `vocab/`
Use for controlled vocabularies, SKOS concept schemes, enums, registries.

### 3.4 `profiles/`
Use for light/full/auditor/forge or other named conformance profiles.

### 3.5 `test-vectors/`
Use for deterministic canonical vectors, expected outputs, tamper negatives, translator vectors.

### 3.6 `receipts-fixtures/`
Use when the pack emits or verifies important receipts.

### 3.7 `policy/`
Use when the pack includes policy bundles, default rules, or policy fragments.

### 3.8 `migrations/`
Use when version-to-version migration scripts or plans exist.

### 3.9 `translators/`
Use when schema evolution or semantic mapping is handled via translators.

---

## 4. `pack.json` contract

### 4.1 Required fields

```json
{
  "pack_id": "cid:...",
  "name": "RRP",
  "doc_id": "ROCK-3111-C",
  "category": "SchemaPack",
  "namespace": "rrp",
  "version": "0.2.0",
  "status": "draft",
  "compatible_core": {
    "min": "3.0.0",
    "max_exclusive": "4.0.0"
  },
  "depends_on": [
    {"doc_id": "ROCK-3111", "version_range": "^0.1.0"}
  ],
  "owners": [
    {"name": "Entif/Rosetta maintainers", "role": "editor"}
  ],
  "exports": [],
  "entrypoints": {},
  "profiles": [],
  "source_of_truth": {
    "doctrine": "Doctrine v0.2",
    "traceability_required": true
  }
}
```

### 4.2 Field semantics
- `pack_id`: MUST be content-addressed for any pack checked by `packs-rrp:conformance`
  - Algorithm: `rosetta-pack-id-v1`
  - Hash input:
    - canonical JSON object with keys sorted recursively
    - `algorithm: "rosetta-pack-id-v1"`
    - `manifest`: `pack.json` parsed as JSON with only `pack_id` omitted
    - `files`: sorted list of every regular file under the pack root except `pack.json`; each entry includes repository-relative path within the pack, byte length, and SHA-256 digest
  - Output format in this repo: `cidv1-sha256-<64 lowercase hex chars>`, matching the current `rosetta-cid` content-id helper
  - Verification: recompute the ID from current pack contents and compare to declared `pack_id`; mismatch is non-conformant and MUST fail the conformance gate
  - Edge cases:
    - empty packs are not conformant because required pack root files and entrypoints are absent
    - single-file packs hash as a one-entry sorted file manifest
    - directory structure is material because each file path participates in the hash input
    - `pack.json` metadata is material except for `pack_id`, which is omitted to avoid self-reference
- `category`: MUST match one of the supported primary categories
- `namespace`: MUST be unique within the repo
- `compatible_core`: MUST define the Rosetta core compatibility window
- `depends_on`: MUST include required pack/doc dependencies; dependencies MUST NOT self-reference and MUST be acyclic across repo-local pack manifests
- `exports`: MUST enumerate machine-consumable assets if present
- `profiles`: MUST enumerate declared conformance profiles if present
- `entrypoints`: SHOULD identify canonical file entrypoints for automation

### 4.3 Export entry format
Example:

```json
{
  "kind": "json-schema",
  "id": "rrp.receipt-content",
  "path": "schema/receipt-content.schema.json",
  "version": "0.2.0",
  "hash": "sha256-...",
  "profile": "light"
}
```

---

## 5. File-level traceability headers

Protocol-sensitive files SHOULD begin with a terse machine-checkable header block.

Recommended minimum:

```txt
DocID: ROCK-3111-C
Artifact: rrp.receipt-content
Version: 0.2.0
Status: Draft
Depends-On: Rosetta-v3.0.0, ROCK-3111, ROCK-3111-A, ROCK-3111-B
Source-Of-Truth: packs/rrp/pack.json
```

Headers are REQUIRED for:
- normative schemas
- SHACL files
- policy bundles
- translator specs
- generated conformance fixtures if intended as canonical vectors

---

## 6. Conformance profiles

A pack MAY declare named conformance profiles.  
If no profiles are declared, the pack is assumed single-profile.

Recommended standard profile names:
- `light`
- `full`
- `auditor`
- `forge`

Each declared profile MUST specify:
- included exports
- excluded exports
- mandatory tests
- optional tests
- known non-goals
- compatibility guarantees

Profiles SHOULD live under:

```txt
profiles/<profile-name>.json
```

Example:

```json
{
  "name": "light",
  "required_exports": [
    "rrp.receipt-content",
    "rrp.receipt-bundle-tapestry"
  ],
  "required_tests": [
    "tv1",
    "tamper-negative"
  ],
  "forbidden_claims": [
    "auditor-level-full-closure"
  ]
}
```

---

## 7. Release and migration rules

### 7.1 Semver
- breaking schema or meaning changes require a major bump
- additive fields, vocab items, or examples may be minor bumps
- typo/docs/example-only changes may be patch bumps if no normative surface changed

### 7.2 Migration artifacts
Any breaking or translator-relevant pack update MUST include at least one of:
- translator spec in `translators/`
- migration notes in `migrations/`
- example before/after fixtures
- updated test vectors
- migration receipts if the repo runtime emits them

### 7.3 Backwards compatibility
Packs SHOULD prefer additive evolution and translator-based compatibility rather than deletion or redefinition.

---

## 8. CI and acceptance gates for all packs

A pack may claim “conformant” only if all relevant gates are green.

Minimum generic gates:
- manifest validation
- content-addressed `pack_id` verification
- `depends_on` self-reference and cycle detection
- required file presence
- schema parse/validation where applicable
- example validation
- test-vector execution where applicable
- traceability header checks where required
- no broken export paths
- changelog updated for normative changes

A pack MUST refuse merge if:
- `pack.json` is missing required fields
- declared `pack_id` does not match current pack contents
- declared `depends_on` creates a self-reference or cycle
- required files are absent
- declared exports do not exist
- examples fail validation
- required vectors fail
- release version changed without changelog
- major change has no migration note or translator strategy

---

## 9. RRP-specific specialization

Pack root:

```txt
packs/rrp/
```

Required tree:

```txt
packs/rrp/
  pack.json
  README.md
  CHANGELOG.md
  acceptance.md
  metadata.json

  schema/
    receipt-content.schema.json
    receipt-bundle-tapestry.schema.json

  shacl/
    receipt.shapes.ttl
    tapestry-bundle.shapes.ttl
    profile-light.shapes.ttl
    profile-auditor.shapes.ttl

  vocab/
    receipt-types.json
    claim-types.json
    verdicts.json
    subject-roles.json
    digest-algorithms.json

  profiles/
    light.json
    full.json
    auditor.json

  test-vectors/
    tv1.hash-input.json
    tv1.expected.json
    tv1.tampered.json
    tv2.signature.expected.json
    tv2.signature.invalid.json

  examples/
    receipt.min.json
    receipt.full.json
    receipt-bundle.min.json
    receipt-bundle.auditor.json

  receipts-fixtures/
    guard-allow.receipt.json
    guard-deny.receipt.json
    verify-pass.receipt.json
    verify-fail.receipt.json

  migrations/
    0.1.x-to-0.2.0.md

  translators/
    receipt-content.v0_1_to_v0_2.json
```

### 9.1 RRP-specific `pack.json` example

For repository conformance, the machine-recognized `pack.json` shape is defined by
`packs/_schemas/pack-manifest.schema.json`, which the Pack validator consumes before
integrity or declared-path checks. This RFC defines the Pack filesystem and semantic
obligations around that manifest; its examples do not create additional manifest
keys. If an example and the executable manifest schema diverge, the example must be
corrected or the schema must be amended explicitly through its own authority path.

```json
{
  "$schema": "../_schemas/pack-manifest.schema.json",
  "id": "rrp",
  "pack_id": "cidv1-sha256-cada32cfe484e30fa81767221c6ffbb7782e0e51151dfe60a273e347e607cb80",
  "kind": "pack",
  "title": "Receipt Refinement Pack",
  "name": "Receipt Refinement Pack",
  "doc_id": "ROCK-3111-C",
  "category": "SchemaPack",
  "namespace": "rrp",
  "version": "0.2.0",
  "status": "draft",
  "compatible_core": {
    "min": "3.0.0",
    "max_exclusive": "4.0.0"
  },
  "depends_on": [
    {"doc_id": "ROCK-3111", "version_range": "^0.1.0"},
    {"doc_id": "ROCK-3111-A", "version_range": "^0.1.0"},
    {"doc_id": "ROCK-3111-B", "version_range": "^0.1.0"}
  ],
  "owners": [
    {"name": "Entif/Rosetta maintainers", "role": "editor"}
  ],
  "exports": [
    {"kind": "json-schema", "id": "rrp.receipt-content", "path": "schema/receipt-content.schema.json", "version": "0.2.0"},
    {"kind": "json-schema", "id": "rrp.receipt-bundle-tapestry", "path": "schema/receipt-bundle-tapestry.schema.json", "version": "0.2.0"},
    {"kind": "shacl", "id": "rrp.receipt.shapes", "path": "shacl/receipt.shapes.ttl", "version": "0.2.0"},
    {"kind": "vocab", "id": "rrp.receipt-types", "path": "vocab/receipt-types.json", "version": "0.2.0"}
  ],
  "profiles": [
    {"name": "light", "path": "profiles/light.json"},
    {"name": "full", "path": "profiles/full.json"},
    {"name": "auditor", "path": "profiles/auditor.json"}
  ],
  "entrypoints": {
    "schema": [
      "schema/receipt-content.schema.json",
      "schema/receipt-bundle-tapestry.schema.json"
    ]
  },
  "source_of_truth": {
    "doctrine": "Doctrine v0.2",
    "traceability_required": true
  }
}
```

---

## 10. Example generic contribution subtree rules

Because the doctrine imports OB1-inspired contribution ergonomics, the following subtrees are recommended for future non-core pack-like contributions:

```txt
recipes/<name>/
  README.md
  metadata.json
  acceptance.md
  examples/
  tests/

skills/<name>/
  README.md
  metadata.json
  acceptance.md
  examples/
  tests/
```

These are not RRP pack roots, but they should follow the same manifest discipline.

---

## 11. Test vector naming rules

Normative vector files SHOULD follow:

- `<vector-id>.hash-input.json`
- `<vector-id>.expected.json`
- `<vector-id>.tampered.json`
- `<vector-id>.invalid.json`
- `<vector-id>.notes.md` (optional)

Vector IDs SHOULD be stable and human-legible:
- `tv1`
- `tv2`
- `bundle-guard-allow`
- `bundle-guard-expired`

---

## 12. Acceptance checklist for RRP

RRP pack is acceptable only if all are true:

1. required tree exists
2. schemas validate
3. SHACL files parse
4. vocab files parse and match referenced enums
5. examples validate against schemas
6. `tv1` deterministic output passes
7. tamper-negative vectors fail verification
8. profile declarations resolve to real files
9. traceability headers pass
10. changelog updated for normative changes

### Must fail if
- receipt example omits required `subjects`
- bundle example references missing subjects/evidence tiles
- signature/digest mismatch passes accidentally
- undeclared vocab items appear in examples
- release claims conformance without vectors

---

## 13. Release policy

A pack may be tagged for release only if:
- pack validation green
- relevant vectors green
- acceptance gates green
- migration notes included when needed
- docs updated
- no unresolved known-red-tests within the pack’s own merge-critical surface

---

## 14. Immediate next implementation actions

1. scaffold `packs/rrp/` exactly to this contract
2. validate `pack.json` with a repo-level manifest validator
3. move current RRP schema/spec assets into this tree
4. write CI target `nx run packs-rrp:conformance`
5. generate initial vector set (`tv1`, tamper-negative, signature-negative)
6. add pack contract checker to pre-commit / CI

This contract is now the filesystem law for RRP and the template for later pack families.
