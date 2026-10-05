# rosetta-guard

## Purpose

Provides the first minimal policy engine for parse-only safety decisions.

## Working Today

- matches simple action and resource prefixes against rules
- denies side effects by default in `parse-only` mode
- allows explicitly permitted read-like actions when a matching rule exists
- emits guard decisions as tiles

## Fixture Status

- executable
- intentionally minimal

## Not Yet

- policy composition
- temporal or actor-aware authorization
- real capability tokens with revocation or audience binding

## Roadmap

- evolve from a small rule evaluator into a richer policy system once live adapters exist
# Agent-native authority

Use the [current effective-authority evaluator](docs/effective-authority-v1.md) at execution boundaries. It consumes the shared Authority Envelope and current owner-supplied evidence, emits Core evaluation evidence, and preserves existing decision APIs as compatibility surfaces.
