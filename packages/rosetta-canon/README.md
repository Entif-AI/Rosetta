# rosetta-canon

## Purpose

Provides deterministic normalization helpers for Rosetta artifacts.

## Working Today

- canonicalizes I-JSON values as RFC 8785 JCS: UTF-16 property sorting, ECMAScript primitive serialization, and no insignificant whitespace
- normalizes plain text by collapsing line endings and whitespace

Canonical JSON inputs must be `JsonValue` data: null, booleans, finite IEEE 754 numbers, well-formed Unicode strings, arrays, and objects. Lone surrogate strings or property names and non-finite numbers are rejected before hashing. Legacy runtime `undefined` object members are omitted, while `undefined` and holes in arrays serialize as `null`, matching `JSON.stringify` for existing tile payload casts; other values outside `JsonValue` are unsupported.

Canonicalization follows [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785.html). The corrected serializer changes historical digest output for objects with integer-like property names; recompute affected digests because canonical JSON does not preserve legacy hash equivalence.

## Fixture Status

- fully executable
- not fixture-backed

## Not Yet

- media-aware normalization beyond plain text
- streaming normalization for large payloads

## Roadmap

- add normalization profiles for HTML, Markdown, and PDF-extracted text
