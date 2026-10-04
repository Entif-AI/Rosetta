import { createHash } from 'node:crypto';
import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
import { verifyAgentStreamNormalizationContent, type AgentStreamNormalizationResult } from '@entif-ai/ingress-refinery';

export const AGENT_TRACE_PROJECTION_PROFILE = 'agent-trace-neo4j@1.0.0';
type Properties = Record<string, string | number | boolean | null>;
export interface AgentTraceNode { id: string; kind: string; properties: Properties }
export interface AgentTraceEdge extends AgentTraceNode { from: string; to: string }
export interface AgentTraceProjection {
  edges: AgentTraceEdge[];
  nodes: AgentTraceNode[];
  profile: string;
  projectionId: string;
  sha256: string;
  unresolvedRefs: string[];
}
export interface FixtureCypherStatement { statement: string; parameters?: Record<string, unknown> }
export interface FixtureCypherResponse { results: Array<{ columns: string[]; data: Array<{ row: unknown[] }> }>; errors: Array<{ code: string }> }
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const canonical = (value: unknown) => canonicalizeJson(value as JsonValue);

export function agentTraceProjectionIdentity(normalizedSha256: string): string {
  if (!/^[a-f0-9]{64}$/u.test(normalizedSha256)) throw new Error('Normalized digest must be SHA-256.');
  return `${AGENT_TRACE_PROJECTION_PROFILE}:${normalizedSha256}`;
}

/** Derived development projection. Source artifacts and rosetta-store retain canonical authority. */
export function planAgentTraceProjection(normalized: AgentStreamNormalizationResult): AgentTraceProjection {
  const { blobs, profile, records, snapshots, source } = normalized;
  const parsed = verifyAgentStreamNormalizationContent(normalized);
  const projectionId = agentTraceProjectionIdentity(normalized.sha256);
  const common: Properties = { projectionId, projectionProfile: AGENT_TRACE_PROJECTION_PROFILE, sourceSha256: source.sourceSha256, normalizedSha256: normalized.sha256, sourceManifestationCid: source.manifestationCid, normalizationReceiptCid: normalized.normalizationReceipt.cid };
  const nodes = new Map<string, AgentTraceNode>();
  const edges = new Map<string, AgentTraceEdge>();
  const unresolvedRefs: string[] = [];
  const node = (kind: string, key: unknown[], properties: Properties = {}) => {
    const id = hash(canonical([projectionId, kind, ...key]));
    nodes.set(id, { id, kind, properties: { ...common, ...properties, kind } });
    return id;
  };
  const edge = (kind: string, from: string, to: string, basis: 'source-field' | 'derived-structure', key: unknown[] = [], properties: Properties = {}) => {
    const id = hash(canonical([projectionId, kind, from, to, ...key]));
    edges.set(id, { id, kind, from, to, properties: { ...common, ...properties, kind, basis } });
  };
  const view = node('normalized_view', [normalized.sha256], { sourceId: normalized.sha256, normalizerProfile: profile, frontierStatus: 'CURRENT_FOR_DECLARED_FRONTIER', materializedAt: normalized.normalizationReceipt.createdAt, canonicalJson: normalized.canonicalJson });
  const artifactNodes = new Map<string, string>();
  for (const artifact of [...Object.values(normalized.sourceArtifacts), normalized.normalizationReceipt]) {
    const id = node('source_artifact', [artifact.cid], { sourceId: artifact.cid, artifactKind: artifact.kind, canonicalJson: canonical(artifact) });
    artifactNodes.set(artifact.cid, id);
  }
  for (const artifact of [...Object.values(normalized.sourceArtifacts), normalized.normalizationReceipt]) {
    for (const parent of artifact.parents ?? []) if (artifactNodes.has(parent)) edge('ARTIFACT_PARENT', artifactNodes.get(artifact.cid)!, artifactNodes.get(parent)!, 'source-field');
  }
  edge('NORMALIZED_FROM', view, artifactNodes.get(source.manifestationCid)!, 'derived-structure');
  edge('HAS_RECEIPT', view, artifactNodes.get(normalized.normalizationReceipt.cid)!, 'derived-structure');
  const eventIds = new Map<string, string[]>();
  const recordEvents = new Map<number, string>();
  for (const [index, record] of records.entries()) {
    const data = parsed[index];
    if (typeof data.run_id !== 'string' || typeof data.window_id !== 'string') throw new Error('Fixture graph requires explicit run/window identity.');
    const scope = [data.run_id, data.window_id];
    const run = node('run', [data.run_id], { sourceId: data.run_id });
    const window = node('window', scope, { sourceId: data.window_id });
    edge('HAS_RUN', view, run, 'derived-structure'); edge('HAS_WINDOW', run, window, 'source-field');
    const event = node('event', [record.line], { sourceId: record.eventId, eventType: typeof data.type === 'string' ? data.type : null, recordLine: record.line, startByte: record.startByte, endByte: record.endByte, lineSha256: record.lineSha256, dataJson: canonical(data), sourceTimestamp: typeof data.source_timestamp === 'string' ? data.source_timestamp : null, observedAt: typeof data.observed_at === 'string' ? data.observed_at : null, recordedAt: typeof data.recorded_at === 'string' ? data.recorded_at : null });
    recordEvents.set(record.line, event);
    const key = canonical([...scope, record.eventId]);
    eventIds.set(key, [...(eventIds.get(key) ?? []), event]);
    edge('DERIVED_FROM', event, view, 'derived-structure'); edge('MEMBER_RUN', event, run, 'source-field'); edge('MEMBER_WINDOW', event, window, 'source-field');
    if (typeof data.turn_id === 'string') edge('MEMBER_TURN', event, node('turn', [...scope, data.turn_id], { sourceId: data.turn_id }), 'source-field');
    let request: string | undefined;
    if (typeof data.request_ref === 'string') { request = node('request', [...scope, data.request_ref], { sourceId: data.request_ref }); edge('REFERENCES_REQUEST', event, request, 'source-field'); }
    if (typeof data.result_ref === 'string') {
      const result = node('result', [...scope, data.result_ref], { sourceId: data.result_ref }); edge('REFERENCES_RESULT', event, result, 'source-field');
      if (request) edge('REQUEST_RESULT', request, result, 'source-field');
    }
    for (const [field, digest] of Object.entries(record.externalizedFields)) edge('EXTERNALIZED_VALUE', event, node('blob', [digest], { sourceId: digest, canonicalJson: blobs[digest].canonicalJson }), 'derived-structure', [field], { field });
  }
  for (const [index, record] of records.entries()) {
    const data = parsed[index];
    if (typeof data.parent_event_id !== 'string') continue;
    const parents = eventIds.get(canonical([data.run_id, data.window_id, data.parent_event_id]));
    if (parents?.length === 1) edge('SOURCE_PARENT', recordEvents.get(record.line)!, parents[0], 'source-field', [], { childRecordLine: record.line });
    else unresolvedRefs.push(`line:${record.line}:parent_event_id:${data.parent_event_id}`);
  }
  const previousByScope = new Map<string, { id: string; sourceId: string }>();
  for (const snapshot of snapshots) {
    const scope = [snapshot.runId, snapshot.windowId];
    const current = node('snapshot', [snapshot.recordLine], { sourceId: snapshot.snapshotId, recordLine: snapshot.recordLine, occurrenceCount: snapshot.occurrences.length, uniqueObjectCount: snapshot.objects.length });
    edge('HAS_SNAPSHOT', recordEvents.get(snapshot.recordLine)!, current, 'source-field');
    const previous = previousByScope.get(canonical(scope));
    if (snapshot.previousSnapshotId !== null && previous?.sourceId === snapshot.previousSnapshotId) edge('PREVIOUS_SNAPSHOT', current, previous.id, 'derived-structure');
    previousByScope.set(canonical(scope), { id: current, sourceId: snapshot.snapshotId });
    for (const [index, occurrence] of snapshot.occurrences.entries()) {
      const value = snapshot.objects[occurrence.objectIndex];
      const object = node('object', [...scope, value.id], { sourceId: value.id });
      const version = node('object_version', [...scope, value.id, value.valueSha256], { sourceId: value.id, valueSha256: value.valueSha256 });
      const blob = node('blob', [value.valueSha256], { sourceId: value.valueSha256, canonicalJson: blobs[value.valueSha256].canonicalJson });
      edge('HAS_VERSION', object, version, 'derived-structure'); edge('HAS_VALUE', version, blob, 'derived-structure');
      edge('CONTAINS_VERSION', current, version, 'source-field', [index], { occurrenceIndex: index, extraJson: canonical(occurrence.extra) });
    }
    for (const field of ['added', 'changed', 'removed', 'unchanged'] as const) for (const sourceId of snapshot[field]) edge(field.toUpperCase(), current, node('object', [...scope, sourceId], { sourceId }), 'derived-structure');
  }
  const body = { edges: [...edges.values()], nodes: [...nodes.values()], profile: AGENT_TRACE_PROJECTION_PROFILE, projectionId, unresolvedRefs };
  return { ...body, sha256: hash(canonical(body)) };
}

/** Native transactional HTTP client restricted to a credential-free loopback development database. */
export async function executeFixtureCypher(endpoint: string, statements: FixtureCypherStatement[]): Promise<FixtureCypherResponse> {
  const url = new URL(endpoint);
  if (url.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Fixture database endpoint must be a credential-free loopback HTTP origin.');
  const body = JSON.stringify({ statements });
  if (statements.length > 64 || Buffer.byteLength(body) > 2_000_000) throw new Error('Fixture transaction request limit exceeded.');
  const response = await fetch(`${url.origin}/db/neo4j/tx/commit`, { method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json' }, body, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) { await response.body?.cancel(); throw new Error(`Neo4j HTTP failure (${response.status}).`); }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Neo4j response shape is invalid.');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) { await reader.cancel(); throw new Error('Neo4j response limit exceeded.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as FixtureCypherResponse;
  if (!parsed || !Array.isArray(parsed.results) || !Array.isArray(parsed.errors)) throw new Error('Neo4j response shape is invalid.');
  if (parsed.errors.length) throw new Error(`Neo4j transaction failed: ${parsed.errors.map((error) => typeof error.code === 'string' && /^[\w.]{1,120}$/u.test(error.code) ? error.code : 'UNKNOWN_ERROR').join(', ')}`);
  if (parsed.results.length !== statements.length || parsed.results.some((result) => !result || !Array.isArray(result.columns) || !Array.isArray(result.data) || result.data.some((item) => !item || !Array.isArray(item.row)))) throw new Error('Neo4j response shape is invalid.');
  return parsed;
}

const resetStatements = (projectionId: string): FixtureCypherStatement[] => [
  { statement: 'MATCH (a:AkashaTrace {projectionId:$projectionId})-[r:TRACE_EDGE {projectionId:$projectionId}]->(b:AkashaTrace {projectionId:$projectionId}) DELETE r', parameters: { projectionId } },
  { statement: 'MATCH (n:AkashaTrace {projectionId:$projectionId}) DELETE n', parameters: { projectionId } }
];
export async function resetAgentTraceProjection(endpoint: string, projectionId: string): Promise<void> {
  await executeFixtureCypher(endpoint, resetStatements(projectionId));
}
export async function importAgentTraceProjection(endpoint: string, plan: AgentTraceProjection, rebuild = false): Promise<void> {
  const { sha256, ...body } = plan;
  const nodeIds = new Set(plan.nodes.map((node) => node.id));
  const owned = (item: AgentTraceNode) => /^[a-f0-9]{64}$/u.test(item.id) && item.properties.projectionId === plan.projectionId && item.properties.kind === item.kind;
  if (hash(canonical(body)) !== sha256 || plan.profile !== AGENT_TRACE_PROJECTION_PROFILE ||
      !plan.projectionId.startsWith(`${AGENT_TRACE_PROJECTION_PROFILE}:`) || !/^[a-f0-9]{64}$/u.test(plan.projectionId.slice(AGENT_TRACE_PROJECTION_PROFILE.length + 1)) ||
      nodeIds.size !== plan.nodes.length || new Set(plan.edges.map((edge) => edge.id)).size !== plan.edges.length ||
      !plan.nodes.every(owned) || !plan.edges.every((edge) => owned(edge) && nodeIds.has(edge.from) && nodeIds.has(edge.to))) throw new Error('Graph plan integrity check failed.');
  await executeFixtureCypher(endpoint, [
    { statement: 'CREATE CONSTRAINT akasha_trace_node IF NOT EXISTS FOR (n:AkashaTrace) REQUIRE (n.projectionId,n.id) IS UNIQUE' },
    { statement: 'CREATE CONSTRAINT akasha_trace_edge IF NOT EXISTS FOR ()-[r:TRACE_EDGE]-() REQUIRE (r.projectionId,r.id) IS UNIQUE' }
  ]);
  await executeFixtureCypher(endpoint, [
    ...(rebuild ? resetStatements(plan.projectionId) : []),
    { statement: 'UNWIND $nodes AS node MERGE (n:AkashaTrace {projectionId:$projectionId,id:node.id}) SET n += node.properties', parameters: { projectionId: plan.projectionId, nodes: plan.nodes } },
    { statement: 'UNWIND $edges AS edge MATCH (a:AkashaTrace {projectionId:$projectionId,id:edge.from}),(b:AkashaTrace {projectionId:$projectionId,id:edge.to}) MERGE (a)-[r:TRACE_EDGE {projectionId:$projectionId,id:edge.id}]->(b) SET r += edge.properties', parameters: { projectionId: plan.projectionId, edges: plan.edges } }
  ]);
}
export function agentTraceNeighborhoodQuery(projectionId: string, eventId: string, limit = 50): FixtureCypherStatement {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Neighborhood limit must be between 1 and 100.');
  return { statement: 'MATCH (e:AkashaTrace {projectionId:$projectionId,kind:"event",sourceId:$eventId})-[r:TRACE_EDGE {projectionId:$projectionId}]-(n:AkashaTrace {projectionId:$projectionId}) RETURN e.id,r.id,r.kind,n.id,n.kind,n.sourceId ORDER BY r.id LIMIT $limit', parameters: { projectionId, eventId, limit } };
}
