import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canonicalTraceJson, parseTraceProjection, traceHash } from '@entif-ai/rosetta-schemas';
import { buildTraceProjection } from './neo4j-trace-projection.js';
const fixture = () => JSON.parse(readFileSync('packages/ingress-refinery/test-vectors/trace/generated-edges.json', 'utf8'));
describe('trace.projection.v1', () => {
  it('produces stable source-mechanical graph identities with all five lifecycle dispositions', () => {
    const p = buildTraceProjection(fixture(), { projectionId: 'test', sourceArtifactCid: 'fixture-source-cid' });
    expect(p).toEqual(buildTraceProjection(fixture(), { projectionId: 'test', sourceArtifactCid: 'fixture-source-cid' }));
    expect(new Set(p.nodes.map(n => n.id)).size).toBe(p.nodes.length);
    for (const type of ['ADDED', 'CHANGED', 'REMOVED', 'REPEATED', 'UNCHANGED']) expect(p.edges.some(e => e.type === type)).toBe(true);
    expect(p.edges.map(e => e.type)).not.toContain('CAUSES');
    expect(p.nodes.every(n => n.properties.normalizedDigest === p.normalizedDigest)).toBe(true);
    const ids = new Set(p.nodes.map(n => n.id));
    expect(p.edges.every(e => ids.has(e.from) && ids.has(e.to))).toBe(true);
  });
  it('rejects cross-namespace identities even with recomputed closure digest', () => {
    const p = buildTraceProjection(fixture(), { projectionId: 'test', sourceArtifactCid: 'fixture-source-cid' });
    const old = p.nodes[0].id;
    p.edges = p.edges.map(e => ({ ...e, from: e.from === old ? 'other:SourceArtifact:collision' : e.from, to: e.to === old ? 'other:SourceArtifact:collision' : e.to }));
    p.nodes[0].id = 'other:SourceArtifact:collision'; p.nodes[0].properties.id = p.nodes[0].id;
    const body = Object.fromEntries(Object.entries(p).filter(([key]) => key !== 'closureDigest'));
    expect(() => parseTraceProjection({ ...body, closureDigest: traceHash(canonicalTraceJson(body)) })).toThrow('namespace');
  });
  it('isolates identities for two projections of the same canonical evidence', () => {
    const a = buildTraceProjection(fixture(), { projectionId: 'a', sourceArtifactCid: 'same-cid' });
    const b = buildTraceProjection(fixture(), { projectionId: 'b', sourceArtifactCid: 'same-cid' });
    expect(a.nodes.some(n => b.nodes.some(m => m.id === n.id))).toBe(false);
    expect(() => buildTraceProjection(fixture(), { projectionId: '', sourceArtifactCid: 'cid' })).toThrow();
  });
});
