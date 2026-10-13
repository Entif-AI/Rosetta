# Source Taxonomy Pack acceptance

## Required positive cases

- Pack manifest, content ID, exported Turtle file path, and dependency on `PACK-SOURCE-SUBSTRATE` validate.
- The vocabulary's tier and trust concepts remain distinct, as shown in [examples/tiering-and-trust.md](examples/tiering-and-trust.md).
- An eventual release must execute applicable RDF parsing/vocabulary tests and verify required traceability and change history.

## Must fail

- A broken vocabulary export, unresolved DocID dependency, or stale Pack content ID.
- Representing a source tier as a direct truth or integrity verdict without separate evidence.
- Claiming release with no executable RDF/vocabulary acceptance coverage.

## Blockers

Manifest, identity, and path failures block merge. Vocabulary-semantic and general ROCK release obligations remain separate release blockers until executed. No broader truth assessment authority is conferred.
