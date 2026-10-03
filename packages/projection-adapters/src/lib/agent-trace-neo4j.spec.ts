import { createHash } from 'node:crypto';
import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeAgentStreamSource } from '@entif-ai/ingress-refinery';
import { type AgentStreamFixtureManifest } from '@entif-ai/source-substrate';
import { agentTraceNeighborhoodQuery, executeFixtureCypher, importAgentTraceProjection, planAgentTraceProjection, resetAgentTraceProjection } from './agent-trace-neo4j.js';

async function fixture() {
  const base = new URL('../../../source-substrate/src/fixtures/', import.meta.url);
  const bytes = await readFile(new URL('agent-stream-synthetic.ndjson', base));
  const manifest = JSON.parse(await readFile(new URL('agent-stream-synthetic.manifest.json', base), 'utf8')) as AgentStreamFixtureManifest;
  return normalizeAgentStreamSource(manifest, bytes);
}
afterEach(() => vi.unstubAllGlobals());

describe('fixture Neo4j projection', () => {
  it('derives stable scoped identities and mechanical relations with source lineage', async () => {
    const normalized = await fixture();
    const plan = planAgentTraceProjection(normalized);
    expect(planAgentTraceProjection(normalized)).toEqual(plan);
    expect(plan.nodes).toHaveLength(37);
    expect(plan.sha256).toBe('4bf5195427005169a73ff713c17864deae542f83dc399d9785bd9b90fe2a35a1');
    expect(new Set(plan.nodes.map((node: { id: string }) => node.id)).size).toBe(plan.nodes.length);
    expect(new Set(plan.edges.map((edge: { id: string }) => edge.id)).size).toBe(plan.edges.length);
    for (const item of [...plan.nodes, ...plan.edges]) expect(item.properties).toMatchObject({ sourceSha256: normalized.source.sourceSha256, normalizedSha256: normalized.sha256, normalizationReceiptCid: normalized.normalizationReceipt.cid });
    expect(plan.edges.filter((edge: { kind: string }) => edge.kind === 'SOURCE_PARENT')).toHaveLength(8);
    expect(plan.edges.filter((edge: { kind: string }) => edge.kind === 'REQUEST_RESULT')).toHaveLength(1);
    expect(plan.edges.some((edge: { kind: string }) => edge.kind.includes('CAUS'))).toBe(false);
    expect(plan.nodes.filter((node: { kind: string }) => node.kind === 'snapshot').map((node: { properties: { occurrenceCount: number } }) => node.properties.occurrenceCount)).toEqual([2, 4, 1, 2]);
  });

  it('rejects mutated normalized content before planning database writes', async () => {
    const normalized = await fixture(); normalized.snapshots[0].objects[0].id = 'tampered';
    expect(() => planAgentTraceProjection(normalized)).toThrow('integrity');
  });

  it('rejects a self-consistent plan with missing endpoints or foreign ownership', async () => {
    const plan = planAgentTraceProjection(await fixture());
    plan.edges[0].from = 'missing-node';
    const { sha256: _prior, ...body } = plan;
    plan.sha256 = createHash('sha256').update(canonicalizeJson(body as unknown as JsonValue)).digest('hex');
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(importAgentTraceProjection('http://127.0.0.1:17474', plan)).rejects.toThrow('integrity');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects non-loopback endpoints, credentials and redirects before sending data', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    for (const endpoint of ['https://example.com', 'http://user:secret@127.0.0.1:17474', 'http://127.0.0.1:17474/private', 'http://127.0.0.1:17474?token=secret']) await expect(executeFixtureCypher(endpoint, [])).rejects.toThrow('loopback');
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockResolvedValue(new Response('', { status: 302, headers: { location: 'http://example.com' } }));
    await expect(executeFixtureCypher('http://127.0.0.1:17474', [{ statement: 'RETURN 1' }])).rejects.toThrow('HTTP');
    expect(fetch.mock.calls[0][1]).toMatchObject({ redirect: 'error' });
  });

  it('checks Neo4j transactional errors even on HTTP success and bounds responses', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ results: [], errors: [{ code: 'Neo.ClientError.Test' }] })));
    await expect(executeFixtureCypher('http://127.0.0.1:17474', [{ statement: 'RETURN 1' }])).rejects.toThrow('Neo.ClientError.Test');
    fetch.mockResolvedValueOnce(new Response('x'.repeat(2_000_001)));
    await expect(executeFixtureCypher('http://127.0.0.1:17474', [{ statement: 'RETURN 1' }])).rejects.toThrow('response limit');
    fetch.mockResolvedValueOnce(new Response('{}'));
    await expect(executeFixtureCypher('http://127.0.0.1:17474', [{ statement: 'RETURN 1' }])).rejects.toThrow('response shape');
  });

  it('bounds neighborhood inspection without expanding to the entire graph', () => {
    expect(agentTraceNeighborhoodQuery('p', 'e', 10).parameters).toMatchObject({ projectionId: 'p', eventId: 'e', limit: 10 });
    expect(() => agentTraceNeighborhoodQuery('p', 'e', 101)).toThrow('limit');
  });
});

const endpoint = process.env.AKASHA_NEO4J_ENDPOINT;
describe.runIf(endpoint)('real Neo4j fixture proof', () => {
  it('imports, reimports, traverses, atomically protects foreign edges and rebuilds closure', async () => {
    const normalized = await fixture(); const plan = planAgentTraceProjection(normalized);
    const pid = plan.projectionId;
    const query = (statement: string, parameters: Record<string, unknown> = {}) => executeFixtureCypher(endpoint!, [{ statement, parameters: { projectionId: pid, ...parameters } }]);
    const closure = async () => (await query('MATCH (n:AkashaTrace {projectionId:$projectionId}) OPTIONAL MATCH (n)-[r:TRACE_EDGE {projectionId:$projectionId}]->() RETURN count(DISTINCT n), count(r)')).results[0].data[0].row;
    const identities = async () => {
      const result = await executeFixtureCypher(endpoint!, [
        { statement: 'MATCH (n:AkashaTrace {projectionId:$projectionId}) RETURN n.id,properties(n) ORDER BY n.id', parameters: { projectionId: pid } },
        { statement: 'MATCH (a)-[r:TRACE_EDGE {projectionId:$projectionId}]->(b) RETURN r.id,a.id,b.id,properties(r) ORDER BY r.id', parameters: { projectionId: pid } }
      ]);
      return result.results.map((item) => item.data.map(({ row }) => row));
    };
    await importAgentTraceProjection(endpoint!, plan, true);
    const firstClosure = await identities();
    expect(await closure()).toEqual([plan.nodes.length, plan.edges.length]);
    await importAgentTraceProjection(endpoint!, plan);
    expect(await identities()).toEqual(firstClosure);
    expect(await closure()).toEqual([plan.nodes.length, plan.edges.length]);
    const relations = (await query('MATCH ()-[r:TRACE_EDGE {projectionId:$projectionId}]->() RETURN r.kind, count(r) ORDER BY r.kind')).results[0].data;
    expect(relations.map((item: { row: unknown[] }) => item.row)).toContainEqual(['SOURCE_PARENT', 8]);
    expect(relations.map((item: { row: unknown[] }) => item.row)).toContainEqual(['REQUEST_RESULT', 1]);
    const membership = await query('MATCH (e:AkashaTrace {projectionId:$projectionId,kind:"event"})-[r:TRACE_EDGE {kind:"MEMBER_WINDOW"}]->(w) RETURN count(e), count(DISTINCT w)');
    expect(membership.results[0].data[0].row).toEqual([9, 1]);
    const lifecycle = await query('MATCH (s:AkashaTrace {projectionId:$projectionId,kind:"snapshot"})-[r:TRACE_EDGE]->(o) WHERE r.kind IN ["ADDED","CHANGED","REMOVED","UNCHANGED"] RETURN s.sourceId, r.kind, collect(o.sourceId) ORDER BY s.sourceId,r.kind');
    expect(lifecycle.results[0].data.map((item: { row: unknown[] }) => item.row)).toContainEqual(['snapshot.synthetic.003', 'REMOVED', ['object.synthetic.tool.001', 'object.synthetic.result.001']]);
    const provenance = await query('MATCH (e:AkashaTrace {projectionId:$projectionId,kind:"event"})-[:TRACE_EDGE {kind:"DERIVED_FROM"}]->(v)-[:TRACE_EDGE {kind:"NORMALIZED_FROM"}]->(s) RETURN count(DISTINCT e), collect(DISTINCT s.sourceId)');
    expect(provenance.results[0].data[0].row[0]).toBe(9);
    expect(provenance.results[0].data[0].row[1]).toContain(normalized.source.manifestationCid);
    const bounded = await executeFixtureCypher(endpoint!, [agentTraceNeighborhoodQuery(pid, 'evt.synthetic.006', 5)]);
    expect(bounded.results[0].data.length).toBeGreaterThan(0); expect(bounded.results[0].data.length).toBeLessThanOrEqual(5);
    await query('MATCH (n:AkashaTrace {projectionId:$projectionId,id:$id}) CREATE (f:AkashaForeign {proof:$projectionId})-[:FOREIGN_PROOF]->(n)', { id: plan.nodes[0].id });
    try {
      await expect(resetAgentTraceProjection(endpoint!, pid)).rejects.toThrow('Neo.ClientError');
      expect(await closure()).toEqual([plan.nodes.length, plan.edges.length]);
    } finally {
      await query('MATCH (f:AkashaForeign {proof:$projectionId})-[r:FOREIGN_PROOF]->() DELETE r,f');
    }
    await importAgentTraceProjection(endpoint!, plan, true);
    expect(await identities()).toEqual(firstClosure);
    expect(await closure()).toEqual([plan.nodes.length, plan.edges.length]);
    await resetAgentTraceProjection(endpoint!, pid);
    expect(await closure()).toEqual([0,0]);
    expect(normalized.sourceArtifacts.record.cid).toBe(normalized.source.recordCid);
    expect(await fixture()).toEqual(normalized);
  }, 30_000);
});
