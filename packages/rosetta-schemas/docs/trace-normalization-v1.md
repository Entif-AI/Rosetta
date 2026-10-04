# trace.normalization.v1

Public derived-trace Profile owned by #1666 and rosetta-schemas; implementation in ingress-refinery. It specializes existing source/derived-artifact contracts and does not add a Core kind. Source bytes remain independent evidence. JSON schema is exported as TRACE_NORMALIZATION_SCHEMA; parseTraceNormalization validates shape, digest, dictionary and reference invariants.

Caller-supplied recorded and optional observation times stay separate from source-event time. SourceSequence denotes physical order, never causality. The captured derivative uses complete source message emissions as client-visible materialization boundaries. Partial patches/transport events are retained in records and loss entries; no partial event is guessed into a full snapshot. Generated fixtures declare complete snapshots, emitted IDs, run/window identities and explicit reset.

Snapshots retain sorted object states, explicit identity, current membership, reconstructed canonical-state byte size, cumulative source bytes and record counts. Run-scoped predecessor snapshots support returning branches; an explicit new-run reset also reports replacement of the immediately preceding visible representation. Each transition partitions identities into added, changed, removed, repeated and unchanged. Equal re-emitted objects are repeated; equal un-emitted survivors are unchanged. Changed canonical state wins over repetition.

Exact object content of at least 256 canonical UTF-8 bytes is dictionary-externalized by SHA-256. The dictionary retains the actual JSON value, hash and byte length for reconstruction; this is structural equality, not semantic deduplication. The threshold is a declared representation choice, not a salience policy. Each externalization is reported. Every inheriting record names hoisted fields explicitly; a field is hoisted only after identical values are proven across its participating scope.

Physical SSE framing lines remain separate from parsed JSON semantics in each record. No framing omission or causal upgrade is performed.

Malformed JSON retains its escaped data in unknown/loss entries. Unsupported transport/partial events retain their entire JSON without inferred semantics. The report names canonicalization, externalization and uncertainty. The normalizedDigest hashes the whole canonical report excluding only normalizedDigest itself. Identity binds source bytes, fixture reference, parser profile/version and all supplied times. Changing these inputs changes identity. A digest is neither authorization nor a signed receipt.

Development scope: bounded fixture traces, no LLM, routing, salience, hidden-state claims or production retention policy. Schema/fixtures are public; private original source is excluded.
