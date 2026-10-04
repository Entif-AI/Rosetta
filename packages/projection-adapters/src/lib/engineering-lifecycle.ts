import { normalizeTrace } from '@entif-ai/ingress-refinery';
import { canonicalTraceJson, parseEngineeringLifecycleSource, parseTraceProjection, materializeWorkLifecycle, traceHash, type EngineeringLifecycleSource, type TraceObjectState } from '@entif-ai/rosetta-schemas';
import { createSourceRecordTile, createSourceManifestationTile } from '@entif-ai/source-substrate';
import { buildTraceProjection } from './trace-projection.js';

export function buildEngineeringLifecycleProjection(input: unknown) {
  const source = parseEngineeringLifecycleSource(input);
  const inputDigest = traceHash(canonicalTraceJson(source));
  const frames = source.records.map((record, index) => {
    const objects = [
      { id: source.bundleRef, kind: 'engineering.lifecycle-source.v1', content: { ...source, records: source.records.slice(0, index + 1) } },
      ...source.records.slice(0, index + 1).map(r => ({ id: r.recordId, kind: 'work.lifecycle.v1', content: r }))
    ];
    return `data: ${canonicalTraceJson({ type: 'trace_snapshot', run_id: source.workRef, window_id: source.bundleRef, objects, emitted_ids: [source.bundleRef, record.recordId] })}\n\n`;
  });
  const raw = frames.join('');
  const record = createSourceRecordTile({
    sourceSystemId: 'engineering.lifecycle-source.v1', recordLocalId: source.bundleRef,
    stableLocators: [source.bundleRef], recordType: 'engineering-lifecycle-evidence',
    publicationStatus: 'public-repository-evidence-adapter',
    metadataBlob: { profile: source.profile.id, inputDigest, sourceRefs: source.sources.map(s => s.ref), limitations: source.limitations }
  });
  const manifestation = createSourceManifestationTile({
    sourceRecordCid: record.cid, manifestationId: `${source.bundleRef}:${traceHash(raw)}`,
    manifestationKind: 'deterministically-adapted-evidence', mediaType: 'text/event-stream',
    byteHashes: { sha256: traceHash(raw) }, accessRequirements: ['public-repository-evidence'], structureProfile: source.profile.id
  }, [record.cid]);
  const normalized = normalizeTrace(raw, { sourceFixtureRef: source.bundleRef, recordedAt: source.capturedAt });
  const projection = buildTraceProjection(normalized, { projectionId: `engineering:${inputDigest}`, sourceArtifactCid: manifestation.cid });
  return { source: { record, manifestation, raw, inputDigest }, normalized, projection };
}

/** Reconstructs from the graph export, resolving exact content-addressed payloads. */
export function inspectEngineeringLifecycle(input: unknown) {
  const projection = parseTraceProjection(input);
  const payloads = new Map<string, unknown>();
  for (const node of projection.nodes.filter(n => n.label === 'TracePayload')) {
    if (typeof node.properties.valueJson !== 'string' || typeof node.properties.sha256 !== 'string') throw new Error('Invalid engineering payload binding.');
    const value: unknown = JSON.parse(node.properties.valueJson);
    if (canonicalTraceJson(value) !== node.properties.valueJson || traceHash(node.properties.valueJson) !== node.properties.sha256) throw new Error('Engineering payload digest mismatch.');
    payloads.set(`sha256:${node.properties.sha256}`, value);
  }
  const snapshots = projection.nodes.filter(n => n.label === 'TraceSnapshot').sort((a, b) => Number(b.properties.index) - Number(a.properties.index));
  const latest = snapshots[0];
  if (!latest) throw new Error('Missing engineering snapshot.');
  const sources: EngineeringLifecycleSource[] = [];
  for (const edge of projection.edges.filter(e => e.type === 'CONTAINS' && e.from === latest.id)) {
    if (typeof edge.properties.stateJson !== 'string') throw new Error('Missing engineering state.');
    const state = JSON.parse(edge.properties.stateJson) as TraceObjectState;
    if (state.objectKind !== 'engineering.lifecycle-source.v1') continue;
    const value = state.content.kind === 'inline' ? state.content.value : payloads.get(state.content.payloadRef);
    sources.push(parseEngineeringLifecycleSource(value));
  }
  if (sources.length !== 1) throw new Error('Engineering inspection requires exactly one bounded source bundle.');
  const source = sources[0];
  if (projection.projectionId !== `engineering:${traceHash(canonicalTraceJson(source))}`) throw new Error('Engineering source/projection identity mismatch.');
  if (canonicalTraceJson(buildEngineeringLifecycleProjection(source).projection) !== canonicalTraceJson(projection)) throw new Error('Engineering projection does not rebuild exactly from its preserved source bundle.');
  return { ...source, interpretation: 'deterministic-lifecycle-structure' as const, normalizedDigest: projection.normalizedDigest, sourceDigest: projection.sourceDigest, closureDigest: projection.closureDigest, currentState: materializeWorkLifecycle(source.records) };
}
