# Trace source fixtures

`captured-derived.sse` contains the first 75 contiguous physical SSE frames of an authorized private stream. It is a structural derivative, not pristine capture evidence. Tokens, private text, URLs, hosts, names and unknown metadata are removed by an explicit allowlist. ID equality uses first-seen typed ordinals; text equality uses fixture-local placeholders without public secret hashes. Timestamps use a fixed-base relative clock. Heartbeat comments retain their source positions as transport markers with content omitted.

`redaction-manifest.json` records path classes/actions/counts. `source-bundle.json` uses existing source-substrate tiles and `chat-transcript`, with distinct private-original and public-derived manifestations. The original digest and acquisition locator are held only in the private derivation receipt. Public original metadata contains no pristine bytes or digest claim. The derived episode references only the public derivative.

Reproduction: build source-substrate, then run `node tools/trace-graph/derive-source.mjs PRIVATE_INPUT PRIVATE_RECEIPT`. Both private paths must be outside the checkout. The command independently re-derives and compares output, scans public secret patterns, and binds full original/derived digests in the private receipt. A private scalar intersection scan checked 638 captured values at initial derivation; no value outside the permitted structural enums survived.

`generated-edges.sse` is separately labeled generated test input with six declared client-visible snapshots, including removal, reappearance, duplicate payload and reset. It has no captured-evidence claim. Neither fixture describes provider internal memory.
