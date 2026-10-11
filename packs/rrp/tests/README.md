# RRP Tests

The Pack test target executes the declared RRP receipt vectors through the existing Rosetta runtime primitives rather than treating fixture paths as conformance evidence by themselves.

- `receipt-pass.json` contains a serialized Core subject Tile plus a signed `rosetta.receipt`. The test verifies Tile integrity, Ed25519 receipt signature validity, and complete receipt-bundle closure.
- `receipt-tampered.json` preserves the original signed CID/signature while changing the receipt payload and omitting its subject closure Tile. The existing integrity/signature verifier rejects the payload drift and the existing bundle verifier reports the missing closure member.

These vectors prove only the bounded receipt evidence path owned by #1118/#158. They do not claim generic Pack root-file, changelog/migration, SHACL-processor, release, promotion, or auditor conformance.
