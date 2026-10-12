import process from 'node:process';
import { readFileSync, writeFileSync } from 'node:fs';
import { measureTraceKinematics } from '../../packages/projection-adapters/dist/index.js';
import { canonicalTraceJson, TRACE_KINEMATICS_SCHEMA } from '../../packages/rosetta-schemas/dist/index.js';
for (const name of ['captured-derived', 'generated-edges']) {
  const trace = JSON.parse(readFileSync(`packages/ingress-refinery/test-vectors/trace/${name}.json`, 'utf8'));
  const report = measureTraceKinematics(trace);
  writeFileSync(`packages/projection-adapters/test-vectors/trace/${name}.kinematics.json`, canonicalTraceJson(report) + '\n');
  process.stdout.write(`${name}: ${report.metrics.length} measurements, ${report.resultDigest}\n`);
}
writeFileSync('packages/rosetta-schemas/docs/trace-kinematics-v1.schema.json', canonicalTraceJson(TRACE_KINEMATICS_SCHEMA) + '\n');
