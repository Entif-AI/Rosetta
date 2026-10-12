import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  selectTraceEpisodes,
  parseTemporalProjection,
  inspectTemporalProjection,
  GRAPHITI_SELECTION_SCHEMA,
  GRAPHITI_PROJECTION_SCHEMA,
} from '../../packages/projection-adapters/dist/index.js';
import process from 'node:process';
import console from 'node:console';
import { admitTemporalFixture } from './fixture-input.mjs';
const { values } = parseArgs({ options: {
  'neo4j-reference': { type: 'boolean' }, live: { type: 'boolean' }, 'output-dir': { type: 'string' },
} });
const historicalReference = values['neo4j-reference'];
const live = values.live;
const outputDirectory = values['output-dir'] ?? (historicalReference ? '.axi/trace-temporal-neo4j-reference' : '.axi/trace-temporal-falkor');
if (!outputDirectory.trim()) throw new Error('Output directory must be nonempty.');
const outputPrefix = historicalReference ? '' : `falkordb-${live ? 'live' : 'model-off'}-`;
for (const name of [outputPrefix + 'projection.json', outputPrefix + 'inspection.json', 'selection.schema.json', 'projection.schema.json']) {
  const target = path.join(outputDirectory, name);
  if (existsSync(target)) throw new Error(`Evidence output already exists: ${target}; select a fresh --output-dir.`);
}
let normalized, selected;
if (historicalReference) {
  normalized = JSON.parse(readFileSync('packages/ingress-refinery/test-vectors/trace/generated-edges.json', 'utf8'));
  selected = selectTraceEpisodes(normalized, {
    sourceArtifactRef: normalized.sourceFixtureRef, maxEpisodes: 3, maxBytes: 20000,
    selections: normalized.records.slice(0, 3).map(r => ({
      recordId: r.recordId, effectiveAt: r.time.sourceEvent ?? null, correctionAt: null,
      scopeRef: 'scope:public-generated-fixture', rightsRef: 'rights:public-generated-fixture', identity: 'unresolved',
    })),
  });
} else {
  ({ normalized, selected } = admitTemporalFixture());
}
const temporary = mkdtempSync(path.join(tmpdir(), 'rosetta-trace-temp-'));
mkdirSync(outputDirectory, { recursive: true });
try {
  const input = path.join(temporary, 'selected.json');
  const output = path.join(temporary, 'projection.json');
  writeFileSync(input, JSON.stringify(selected));
  execFileSync(
    process.env.TRACE_GRAPHITI_PYTHON ?? 'python3',
    [
      historicalReference ? 'tools/trace-temporal/graphiti_runner.py' : 'tools/trace-temporal/graphiti_falkor_runner.py',
      input,
      output,
      ...(live ? ['--live'] : []),
    ],
    { stdio: 'inherit', timeout: 180000 }
  );
  const projection = parseTemporalProjection(
    JSON.parse(readFileSync(output, 'utf8')),
    normalized,
    selected
  );
  const now = new Date().toISOString();
  const inspection = inspectTemporalProjection(projection, normalized, {
    admittedSelection: selected,
    effectiveAt: now,
    knownAt: now,
    allowedScopeRefs: ['scope:public-generated-fixture'],
    allowedRightsRefs: ['rights:public-generated-fixture'],
    revokedEpisodeIds: [],
  });
  writeFileSync(
    path.join(outputDirectory, outputPrefix + 'projection.json'),
    JSON.stringify(projection, null, 2) + '\n', { flag: 'wx' }
  );
  writeFileSync(
    path.join(outputDirectory, outputPrefix + 'inspection.json'),
    JSON.stringify(inspection, null, 2) + '\n', { flag: 'wx' }
  );
  writeFileSync(
    path.join(outputDirectory, 'selection.schema.json'),
    JSON.stringify(GRAPHITI_SELECTION_SCHEMA, null, 2) + '\n', { flag: 'wx' }
  );
  writeFileSync(
    path.join(outputDirectory, 'projection.schema.json'),
    JSON.stringify(GRAPHITI_PROJECTION_SCHEMA, null, 2) + '\n', { flag: 'wx' }
  );
  console.log(
    JSON.stringify({
      status: inspection.status,
      artifacts: projection.artifacts.length,
      normalizedDigest: normalized.normalizedDigest,
      loss: projection.loss,
    })
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
