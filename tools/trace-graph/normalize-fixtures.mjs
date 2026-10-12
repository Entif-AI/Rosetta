import process from 'node:process';
import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeTrace } from '../../packages/ingress-refinery/dist/index.js';
import { canonicalTraceJson, TRACE_NORMALIZATION_SCHEMA } from '../../packages/rosetta-schemas/dist/index.js';
for (const name of ['captured-derived', 'generated-edges']) {
  const raw = readFileSync(`packages/source-substrate/test-vectors/trace/${name}.sse`, 'utf8');
  const options = { sourceFixtureRef: name, recordedAt: '2000-01-01T00:01:00.000Z', observedAt: '2000-01-01T00:00:30.000Z' };
  const report = normalizeTrace(raw, options), bytes = canonicalTraceJson(report);
  if (bytes !== canonicalTraceJson(normalizeTrace(raw, options))) throw new Error('Nondeterministic normalization.');
  writeFileSync(`packages/ingress-refinery/test-vectors/trace/${name}.json`, bytes + '\n');
  process.stdout.write(`${name}: ${report.records.length} records, ${report.snapshots.length} snapshots; ${report.normalizedDigest}\n`);
}

writeFileSync('packages/rosetta-schemas/docs/trace-normalization-v1.schema.json', canonicalTraceJson(TRACE_NORMALIZATION_SCHEMA) + '\n');
