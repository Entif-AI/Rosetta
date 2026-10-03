import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { normalizeAgentStreamSource } from '@entif-ai/ingress-refinery';
import type { AgentStreamFixtureManifest } from '@entif-ai/source-substrate';
import { agentTraceTransitionQuery, analyzeAgentTraceKinematics } from './agent-trace-kinematics.js';

async function fixture() {
  const base = new URL('../../../source-substrate/src/fixtures/', import.meta.url);
  const bytes = await readFile(new URL('agent-stream-synthetic.ndjson', base));
  const manifest = JSON.parse(await readFile(new URL('agent-stream-synthetic.manifest.json', base), 'utf8')) as AgentStreamFixtureManifest;
  return { bytes, normalized: normalizeAgentStreamSource(manifest, bytes) };
}
describe('observable agent-trace kinematics', () => {
  it('reports reproducible sizes, state counts and conservative shrink evidence', async () => {
    const { bytes, normalized } = await fixture();
    const report = analyzeAgentTraceKinematics(normalized, bytes);
    expect(analyzeAgentTraceKinematics(normalized, bytes)).toEqual(report);
    expect(report.sha256).toBe('183d1baee405156dd28683475d3cc41e7f16321c05e02932d405a95db5843331');
    expect(report.snapshots.map((item: { occurrenceCount: number }) => item.occurrenceCount)).toEqual([2,4,1,2]);
    expect(report.snapshots.map((item: { uniqueObjectCount: number }) => item.uniqueObjectCount)).toEqual([2,3,1,2]);
    expect(report.snapshots.map((item: { recordCount: number }) => item.recordCount)).toEqual([3,6,7,8]);
    expect(report.snapshots[1]).toMatchObject({ duplicateCount: 1, addedCount: 1, changedCount: 1, unchangedCount: 1 });
    expect(report.snapshots[2]).toMatchObject({ removedCount: 2, representationShrink: true, compactionCandidate: true });
    expect(report.snapshots.filter((item: { compactionCandidate: boolean }) => item.compactionCandidate)).toHaveLength(1);
    for (const metric of report.snapshots) {
      const record = normalized.records.find((item) => item.line === metric.recordLine)!;
      expect(metric.sourceRecordBytes).toBe(record.endByte - record.startByte);
      expect(metric.normalizedRecordAndSnapshotBytes).toBeGreaterThan(0);
    }
    expect(report.sourceSha256).toBe(normalized.source.sourceSha256);
    expect(report.normalizedSha256).toBe(normalized.sha256);
    expect(report.epistemicBoundary).toContain('client-visible');
    expect(report.epistemicBoundary).toContain('does not establish provider/model internal state');
  });

  it('tracks survival, disappearance, reappearance and exact repeated signatures', async () => {
    const { bytes, normalized } = await fixture();
    const report = analyzeAgentTraceKinematics(normalized, bytes);
    expect(report.objects.find((item: { objectId: string }) => item.objectId === 'object.synthetic.tool.001')).toMatchObject({ survivedTransitions: 1, disappearedAt: ['snapshot.synthetic.003'], reappearedAt: ['snapshot.synthetic.004'] });
    expect(report.objects.find((item: { objectId: string }) => item.objectId === 'object.synthetic.context.001')).toMatchObject({ survivedTransitions: 3, disappearedAt: [], reappearedAt: [] });
    expect(report.signatures.find((item: { kind: string }) => item.kind === 'payload')).toMatchObject({ occurrenceCount: 2 });
    expect(report.signatures.find((item: { sourceName: string }) => item.sourceName === 'synthetic-tool')).toMatchObject({ occurrenceCount: 3 });
    expect(report.signatures.find((item: { kind: string }) => item.kind === 'request')).toMatchObject({ occurrenceCount: 8 });
    expect(report.signatures.find((item: { kind: string }) => item.kind === 'result')).toMatchObject({ occurrenceCount: 5 });
  });

  it('fails before analysis on source drift and bounds transition inspection', async () => {
    const { bytes, normalized } = await fixture();
    const changed = Buffer.from(bytes); changed[0] ^= 1;
    expect(() => analyzeAgentTraceKinematics(normalized, changed)).toThrow('source integrity');
    expect(() => agentTraceTransitionQuery('p', 7, 101)).toThrow('limit');
    expect(() => agentTraceTransitionQuery('p', -1)).toThrow('record line');
    expect(agentTraceTransitionQuery('p', 7, 10).parameters).toMatchObject({ projectionId: 'p', recordLine: 7, limit: 10 });
  });
});
