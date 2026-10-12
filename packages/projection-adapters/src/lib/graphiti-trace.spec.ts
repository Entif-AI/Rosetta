import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  selectTraceEpisodes,
  parseTemporalProjection,
  inspectTemporalProjection,
  type TemporalArtifact,
  type TemporalProjection,
} from './graphiti-trace.js';
const normalized = () =>
  JSON.parse(
    readFileSync(
      'packages/ingress-refinery/test-vectors/trace/generated-edges.json',
      'utf8'
    )
  );
const time = (day: number) =>
  `2026-01-${String(day).padStart(2, '0')}T00:00:00.000Z`;
const selected = () => {
  const n = normalized();
  return selectTraceEpisodes(n, {
    sourceArtifactRef: 'fixture:source',
    selections: n.records
      .slice(0, 3)
      .map((r: { recordId: string }, i: number) => ({
        recordId: r.recordId,
        effectiveAt: time(i + 1),
        correctionAt: null,
        scopeRef: 'scope:fixture',
        rightsRef: 'rights:fixture',
        identity: 'unresolved',
      })),
    maxEpisodes: 3,
    maxBytes: 20000,
  });
};
const artifact = (
  id: string,
  support: string[],
  from: number,
  until: number | null = null
): TemporalArtifact => ({
  id,
  kind: 'fact',
  interpretation: id,
  supportEpisodeIds: support,
  validFrom: time(from),
  validUntil: until === null ? null : time(until),
  validUntilKnownAt: until === null ? null : time(10),
  validUntilSupportEpisodeIds: until === null ? [] : support,
  materializedAt: time(10),
  supersedes: [],
  identity: 'unresolved',
});
const projection = (): TemporalProjection => {
  const input = selected();
  return {
    profile: 'trace.graphiti-projection.v1',
    profileVersion: '1.0.0',
    selected: input,
    derivation: {
      mode: 'fixture-replay',
      graphitiVersion: '0.30.2',
      graphitiCommit: 'eaa4128681bc53487138a4bbc22d58336ebe70d2',
      databaseVersion: null,
      provider: null,
      model: null,
      modelVersion: null,
      extractionConfig: {},
      embedder: null,
      reranker: null,
      adapterVersion: '1.0.0',
    },
    artifacts: [
      artifact('old', [input.episodes[0].id], 1, 2),
      artifact('new', [input.episodes[1].id], 2),
    ],
    loss: ['Authored wrapper fixture; no Graphiti inference executed.'],
  };
};
const inspect = (p: unknown, at = time(3), revokedEpisodeIds: string[] = []) =>
  inspectTemporalProjection(p, normalized(), {
    admittedSelection: selected(),
    effectiveAt: at,
    knownAt: time(11),
    allowedScopeRefs: ['scope:fixture'],
    allowedRightsRefs: ['rights:fixture'],
    revokedEpisodeIds,
  });
describe('selected TRACE-NORM Graphiti boundary', () => {
  it('retains selected source support and exact bounded content, without the raw firehose', () => {
    const n = normalized();
    const s = selected();
    expect(s.episodes).toHaveLength(3);
    expect(s.sourceDigest).toBe(n.sourceDigest);
    expect(s.normalizedDigest).toBe(n.normalizedDigest);
    expect(s.normalizedProfile).toBe(n.profile);
    expect(s.episodes[0].content).toEqual(n.records[0].preserved);
    expect(s.episodes[0].recordedAt).toBe(n.records[0].time.recorded);
    expect(s).toEqual(selected());
  });
  it('rejects unknown records, oversized selection and duplicates before sending to a donor', () => {
    const n = normalized();
    const base = {
      sourceArtifactRef: 'fixture:source',
      maxEpisodes: 1,
      maxBytes: 20000,
      selections: [
        {
          recordId: 'missing',
          effectiveAt: time(1),
          correctionAt: null,
          scopeRef: 's',
          rightsRef: 'r',
          identity: 'unresolved' as const,
        },
      ],
    };
    expect(() => selectTraceEpisodes(n, base)).toThrow();
    base.selections[0].recordId = n.records[0].recordId;
    expect(() => selectTraceEpisodes(n, { ...base, maxBytes: 1 })).toThrow();
    expect(() =>
      selectTraceEpisodes(n, {
        ...base,
        selections: [...base.selections, ...base.selections],
      })
    ).toThrow();
    expect(() => selectTraceEpisodes('data: raw firehose', base)).toThrow();
  });
  it.each(['sourceDigest', 'normalizedDigest', 'sourceArtifactRef'])(
    'rejects tampered selected provenance %s',
    (field) => {
      const p = projection();
      Reflect.set(p.selected, field, 'tampered');
      expect(() =>
        parseTemporalProjection(p, normalized(), selected())
      ).toThrow();
    }
  );
  it('rejects source text changes attached to the old normalized digest', () => {
    const p = projection();
    p.selected.episodes[0].content = 'changed text';
    expect(() =>
      parseTemporalProjection(p, normalized(), selected())
    ).toThrow();
  });
  it('queries event validity separately from materialization and preserves historical state', () => {
    const p = projection();
    p.artifacts[0].materializedAt = time(11);
    expect(inspect(p).artifacts.map((a) => a.id)).toEqual(['new']);
    expect(inspect(p, time(1)).artifacts.map((a) => a.id)).toEqual(['old']);
    expect(
      inspectTemporalProjection(p, normalized(), {
        admittedSelection: selected(),
        effectiveAt: time(1),
        knownAt: time(9),
        allowedScopeRefs: ['scope:fixture'],
        allowedRightsRefs: ['rights:fixture'],
        revokedEpisodeIds: [],
      }).artifacts
    ).toEqual([]);
  });
  it('preserves contradictory interpretations and reversible ambiguous identities without merging', () => {
    const p = projection();
    p.artifacts.push(artifact('contradiction', [p.selected.episodes[2].id], 2));
    expect(inspect(p).artifacts.map((a) => a.id)).toEqual([
      'new',
      'contradiction',
    ]);
    expect(inspect(p).artifacts.every((a) => a.identity === 'unresolved')).toBe(
      true
    );
    p.artifacts[1].validUntil = time(1);
    expect(() => inspect(p)).toThrow();
  });
  it('deduplicates delivery and counts one source lineage across projections', () => {
    const p = projection();
    p.artifacts.push(structuredClone(p.artifacts[1]));
    const result = inspect(p);
    expect(result.artifacts).toHaveLength(1);
    expect(result.sourceLineages).toEqual([p.selected.sourceDigest]);
    p.artifacts[2].interpretation = 'conflicting duplicate';
    expect(() => inspect(p)).toThrow();
  });
  it('fences all rights-tainted output even when stale physical state remains', () => {
    const p = projection();
    const before = structuredClone(p);
    expect(inspect(p, time(3), [p.selected.episodes[1].id]).artifacts).toEqual(
      []
    );
    expect(
      inspectTemporalProjection(p, normalized(), {
        admittedSelection: selected(),
        effectiveAt: time(3),
        knownAt: time(11),
        allowedScopeRefs: [],
        allowedRightsRefs: ['rights:fixture'],
        revokedEpisodeIds: [],
      }).artifacts
    ).toEqual([]);
    expect(p).toEqual(before);
  });
  it('applies explicit supersession only with visible supporting evidence and known frontier', () => {
    const p = projection();
    p.artifacts[0].validUntil = null;
    p.artifacts[0].validUntilKnownAt = null;
    p.artifacts[0].validUntilSupportEpisodeIds = [];
    p.artifacts[1].supersedes = ['old'];
    expect(inspect(p).artifacts.map((a) => a.id)).toEqual(['new']);
    expect(
      inspect(p, time(3), [p.selected.episodes[1].id]).artifacts.map(
        (a) => a.id
      )
    ).toEqual(['old']);
    expect(inspect(p, time(1)).artifacts.map((a) => a.id)).toEqual(['old']);
  });
  it('rejects artifacts with missing support or source-authority claims', () => {
    const p = projection();
    p.artifacts[0].supportEpisodeIds = ['absent'];
    expect(() => inspect(p)).toThrow();
    const q = projection();
    Reflect.set(q.artifacts[0], 'kind', 'rosetta.observation');
    expect(() => inspect(q)).toThrow();
  });
  it('rejects rehashed rights and provenance relabeling against independently admitted selection', () => {
    const p = projection();
    const n = normalized();
    const forged = selectTraceEpisodes(n, {
      sourceArtifactRef: 'forged:source',
      selections: p.selected.episodes.map((e) => ({
        recordId: e.recordId,
        effectiveAt: e.effectiveAt,
        correctionAt: e.correctionAt,
        scopeRef: e.scopeRef,
        rightsRef: e.rightsRef,
        identity: e.identity,
      })),
      maxEpisodes: 3,
      maxBytes: 20000,
    });
    p.artifacts = [artifact('forged', [forged.episodes[0].id], 1)];
    p.selected = forged;
    expect(() => inspect(p)).toThrow('admitted');
  });
  it('does not let future invalidation change an earlier knowledge frontier', () => {
    const p = projection();
    p.artifacts = [artifact('old', [p.selected.episodes[0].id], 1, 2)];
    p.artifacts[0].materializedAt = time(1);
    const q = {
      admittedSelection: selected(),
      effectiveAt: time(3),
      knownAt: time(5),
      allowedScopeRefs: ['scope:fixture'],
      allowedRightsRefs: ['rights:fixture'],
      revokedEpisodeIds: [],
    };
    expect(
      inspectTemporalProjection(p, normalized(), q).artifacts.map((a) => a.id)
    ).toEqual(['old']);
    expect(
      inspectTemporalProjection(p, normalized(), { ...q, knownAt: time(11) })
        .artifacts
    ).toEqual([]);
  });
  it('returns independently resolvable permitted support with every inspection', () => {
    const p = projection();
    const result = inspect(p);
    expect(result.support.normalizedDigest).toBe(p.selected.normalizedDigest);
    expect(result.support.episodes.map((e) => e.id)).toEqual(
      result.artifacts.flatMap((a) => a.supportEpisodeIds)
    );
    expect(
      inspect(p, time(3), [p.selected.episodes[1].id]).support.episodes
    ).toEqual([]);
  });
  it('omits future or revoked invalidation metadata from the visible artifact', () => {
    const p = projection();
    p.artifacts = [artifact('old', [p.selected.episodes[0].id], 1, 2)];
    p.artifacts[0].materializedAt = time(1);
    p.artifacts[0].validUntilSupportEpisodeIds = [p.selected.episodes[1].id];
    const q = {
      admittedSelection: selected(),
      effectiveAt: time(3),
      knownAt: time(5),
      allowedScopeRefs: ['scope:fixture'],
      allowedRightsRefs: ['rights:fixture'],
      revokedEpisodeIds: [],
    };
    const visible = inspectTemporalProjection(p, normalized(), q).artifacts[0];
    expect(visible.validUntil).toBeNull();
    expect(visible.validUntilSupportEpisodeIds).toEqual([]);
    const revoked = inspect(p, time(3), [p.selected.episodes[1].id]);
    expect(revoked.artifacts[0].validUntil).toBeNull();
    expect(revoked.support.episodes.map((e) => e.id)).toEqual([
      p.selected.episodes[0].id,
    ]);
  });
  it('validates branching supersession without exponential traversal', () => {
    const p = projection();
    p.artifacts = Array.from({ length: 40 }, (_, i) => ({
      ...artifact(`a${i}`, [p.selected.episodes[0].id], 1),
      supersedes: [i - 1, i - 2].filter((n) => n >= 0).map((n) => `a${n}`),
    }));
    expect(() =>
      parseTemporalProjection(p, normalized(), selected())
    ).not.toThrow();
    p.artifacts[0].supersedes = ['a39'];
    expect(() => parseTemporalProjection(p, normalized(), selected())).toThrow(
      'Cyclic'
    );
  });
  it('reports model-off degradation, preserves evidence and permits exact accepted-output replay', () => {
    const p = projection();
    const bytes = JSON.stringify(normalized());
    expect(inspect(JSON.parse(JSON.stringify(p)))).toEqual(inspect(p));
    p.derivation.mode = 'unavailable';
    p.artifacts = [];
    p.loss = ['Graphiti/model unavailable; deterministic evidence retained.'];
    const result = inspect(p);
    expect(result.status).toBe('degraded');
    expect(result.artifacts).toEqual([]);
    expect(JSON.stringify(normalized())).toBe(bytes);
  });
});
