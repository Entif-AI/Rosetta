import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from 'node:fs';
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
const normalizedPath =
  'packages/ingress-refinery/test-vectors/trace/generated-edges.json';
const normalized = JSON.parse(readFileSync(normalizedPath, 'utf8'));
const selections = normalized.records
  .slice(0, 3)
  .map((r) => ({
    recordId: r.recordId,
    effectiveAt: r.time.sourceEvent ?? null,
    correctionAt: null,
    scopeRef: 'scope:public-generated-fixture',
    rightsRef: 'rights:public-generated-fixture',
    identity: 'unresolved',
  }));
const selected = selectTraceEpisodes(normalized, {
  sourceArtifactRef: normalized.sourceFixtureRef,
  selections,
  maxEpisodes: 3,
  maxBytes: 20000,
});
const temporary = mkdtempSync(path.join(tmpdir(), 'rosetta-trace-temp-'));
const outputDirectory = 'tools/trace-temporal/evidence';
mkdirSync(outputDirectory, { recursive: true });
try {
  const input = path.join(temporary, 'selected.json');
  const output = path.join(temporary, 'projection.json');
  writeFileSync(input, JSON.stringify(selected));
  execFileSync(
    process.env.TRACE_GRAPHITI_PYTHON ?? 'python3',
    [
      'tools/trace-temporal/graphiti_runner.py',
      input,
      output,
      ...(process.argv.includes('--live') ? ['--live'] : []),
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
    path.join(outputDirectory, 'projection.json'),
    JSON.stringify(projection, null, 2) + '\n'
  );
  writeFileSync(
    path.join(outputDirectory, 'inspection.json'),
    JSON.stringify(inspection, null, 2) + '\n'
  );
  writeFileSync(
    'tools/trace-temporal/selection.schema.json',
    JSON.stringify(GRAPHITI_SELECTION_SCHEMA, null, 2) + '\n'
  );
  writeFileSync(
    'tools/trace-temporal/projection.schema.json',
    JSON.stringify(GRAPHITI_PROJECTION_SCHEMA, null, 2) + '\n'
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
