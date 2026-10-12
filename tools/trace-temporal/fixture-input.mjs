import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { normalizeTrace } from '../../packages/ingress-refinery/dist/index.js';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
import { selectTraceEpisodes } from '../../packages/projection-adapters/dist/index.js';
import { createSourceRecordTile, createSourceManifestationTile } from '../../packages/source-substrate/dist/index.js';

export function admitTemporalFixture() {
  const sourcePath = 'tools/trace-temporal/fixtures/temporal-evolution.sse';
  const normalized = JSON.parse(readFileSync('tools/trace-temporal/fixtures/temporal-evolution.normalized.json', 'utf8'));
  assert.deepEqual(normalized, normalizeTrace(readFileSync(sourcePath, 'utf8'), {
    sourceFixtureRef: 'temporal-evolution', recordedAt: '2000-01-06T00:01:00.000Z',
    observedAt: '2000-01-06T00:00:30.000Z',
  }));
  const record = createSourceRecordTile({
    sourceSystemId: 'trace-temporal-fixture-generator', recordLocalId: 'temporal-evolution',
    stableLocators: [sourcePath], recordType: 'generated-fixture', publicationStatus: 'public', metadataBlob: {},
  });
  const source = createSourceManifestationTile({
    sourceRecordCid: record.cid, manifestationId: 'temporal-evolution-v1',
    manifestationKind: 'generated-fixture', mediaType: 'text/event-stream',
    byteHashes: { sha256: normalized.sourceDigest }, accessRequirements: ['public-structural-fixture'],
    structureProfile: 'trace-temporal-fixture-v1',
  }, [record.cid]);
  const selected = selectTraceEpisodes(normalized, {
    sourceArtifactRef: source.cid, maxEpisodes: 5, maxBytes: 20000,
    selections: normalized.records.map(r => ({
      recordId: r.recordId, effectiveAt: r.time.sourceEvent, correctionAt: null,
      scopeRef: 'scope:public-generated-fixture', rightsRef: 'rights:public-generated-fixture', identity: 'unresolved',
    })),
  });
  assert.ok(Buffer.byteLength(canonicalTraceJson(selected)) <= 20000);
  return { normalized, selected, sourceTiles: [record, source] };
}
