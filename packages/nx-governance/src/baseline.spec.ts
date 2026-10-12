import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createBaseline, type BaselineRequest } from './baseline';

const evidence = 'packs/rrp/test-vectors/promotion-pre-fix.json';
const authority = 'docs/spec/PROMOTION_TRANSITION_CONTRACT.md';
const revision = '16e0274f3d32e4543f864992d6cf06dd7fcd8837';
const ref = (path: string) => ({ path, start: 1, end: 1 });
const request = (): BaselineRequest => ({ formatVersion: 1, baselineId: 'promotion-profile', scope: [evidence],
  observations: [{ key: 'prose-only-state', kind: 'direct', claim: 'The frozen pre-fix artifact has no structured promotion Profile.',
    confidence: 1, evidenceRefs: [ref(evidence)], authorityRefs: [ref(authority)], conflictRefs: [],
    disposition: 'drift', rationale: 'The governing promotion contract requires machine-readable state.' }] });
const read = (file: string) => readFileSync(file);
describe('bounded observed behavior #1706', () => {
  it('preserves Rosetta implementation/spec disagreement as evidence, never new intent', () => {
    const output = createBaseline(request(), read, revision, [authority]);
    expect(output.role).toBe('observed-behavior-not-authority');
    expect(output.observations[0].disposition).toBe('drift');
    expect(output.observations[0].authorityRefs).not.toEqual(output.observations[0].evidenceRefs);
    expect(output.sources.every((source) => source.sha256.length === 64)).toBe(true);
    expect(output.revision).toBe(revision);
    expect(output.candidates[0].observationId).toBe(output.observations[0].id);
  });
  it('keeps undocumented behavior authority-missing and inference distinct', () => {
    const input = request(); input.observations[0].authorityRefs = []; input.observations[0].kind = 'inference';
    input.observations[0].disposition = 'aligned';
    const output = createBaseline(input, read, revision, []);
    expect(output.observations[0]).toMatchObject({ kind: 'inference', disposition: 'authority-missing' });
    expect(output.candidates[0].action).toBe('resolve-authority');
  });
  it('preserves conflicting tests instead of silently declaring alignment', () => {
    const input = request(); input.scope.push('test.ts'); input.observations[0].conflictRefs = [ref('test.ts')];
    input.observations[0].disposition = 'aligned';
    const output = createBaseline(input, (file) => file === 'test.ts' ? Buffer.from('expect(profile).toBeUndefined();') : read(file), revision, [authority]);
    expect(output.observations[0].disposition).toBe('ambiguous');
    expect(output.observations[0].conflictRefs).toEqual([ref('test.ts')]);
  });
  it('rejects self-authorizing implementation, scope escapes and unresolvable evidence', () => {
    const input = request(); input.observations[0].authorityRefs = [ref(evidence)];
    expect(() => createBaseline(input, read, revision, [authority])).toThrow(/authority/i);
    const escaped = request(); escaped.scope = ['../outside'];
    expect(() => createBaseline(escaped, read, revision, [authority])).toThrow();
    const missing = request(); missing.observations[0].evidenceRefs = [ref('unselected.ts')];
    expect(() => createBaseline(missing, read, revision, [authority])).toThrow(/scope/i);
    const invalidLines = request(); invalidLines.observations[0].evidenceRefs[0].end = 100000;
    expect(() => createBaseline(invalidLines, read, revision, [authority])).toThrow(/line/i);
  });
  it('reproduces exact source provenance while retaining identity through prose changes', () => {
    const input = request(); const first = createBaseline(input, read, revision, [authority]);
    expect(createBaseline(input, read, revision, [authority])).toEqual(first);
    input.observations[0].claim = 'A revised description of the same observation.';
    expect(createBaseline(input, read, revision, [authority]).observations[0].id).toBe(first.observations[0].id);
    const changed = createBaseline(input, (file) => Buffer.concat([read(file), Buffer.from('\n')]), revision, [authority]);
    expect(changed.sources).not.toEqual(first.sources);
  });
});
