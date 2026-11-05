import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

import {
  buildTile,
  verifyTileIntegrity,
} from '../../packages/rosetta-core/dist/index.js';
import { validatePayload } from '../../packages/rosetta-schemas/dist/index.js';
import {
  buildReceiptBundle,
  digestTile,
  verifyReceiptBundle,
  verifySignedReceipt,
} from '../../packages/rosetta-receipts/dist/index.js';
import { InMemoryTileStore } from '../../packages/rosetta-store/dist/index.js';
import { compileReceiptBundleTapestry } from '../../packages/rosetta-tapestry/dist/index.js';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020.js');
const DEFAULT_TRACE = fileURLToPath(
  new URL('./interop-trace-0001.json', import.meta.url)
);
const DEFAULT_SCHEMA = fileURLToPath(
  new URL('./interop-trace-0001.schema.json', import.meta.url)
);

const PHASES = ['preCalibration', 'calibration', 'postCalibration'];
const EXPECTED_ROLES = [
  'run',
  ...PHASES.flatMap((phase) => [
    phase + 'Action',
    phase + 'ToolCall',
    phase + 'Observation',
    phase + 'Evaluation',
  ]),
  'receipt',
  'tapestry',
];
const BOUNDED_STATEMENT =
  'The fixture records a calibration action and a post-calibration observation matching the declared reference. This attestation does not establish a VER diagnosis or scientific correctness.';

function check(checks, id, action) {
  try {
    action();
    checks.push({ id, status: 'pass' });
  } catch (error) {
    checks.push({
      id,
      status: 'fail',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

function roleTile(document, tiles, role, expectedKind) {
  const cid = document.roleIndex[role];
  const tile = tiles.get(cid);
  assert.ok(tile, 'Missing role ' + role + ' reference: ' + cid);
  assert.equal(tile.kind, expectedKind, 'Role ' + role + ' has wrong kind');
  return tile;
}

function assertParents(tile, expected, role) {
  assert.deepEqual(
    [...tile.parents].sort(),
    [...expected].sort(),
    'Wrong parent edges for ' + role
  );
}

/**
 * A fixed-fixture interoperability witness, not a general VER diagnostic engine.
 * Each check is independent: a corrupt CID must not conceal an unrelated
 * missing-parent, unsigned-claim, or semantic overclaim finding.
 */
export function verifyInteropTrace(document, schema) {
  const checks = [];
  const tiles = new Map(
    (Array.isArray(document?.tiles) ? document.tiles : []).map((tile) => [
      tile.cid,
      tile,
    ])
  );
  const roles = document?.roleIndex ?? {};

  check(checks, 'transport-schema', () => {
    const validate = new Ajv2020({ strict: false, allErrors: true }).compile(
      schema
    );
    assert.equal(validate(document), true, JSON.stringify(validate.errors));
    assert.equal(document.fixtureId, 'VER-ROSETTA-INTEROP-TRACE-0001');
    assert.equal(
      document.sourceCommit,
      '555503eead2f532bb133e3eaffd8f4dbacdf2a7a'
    );
    assert.equal(
      document.maturity,
      'constructed-against-current-executable-contracts'
    );
    assert.deepEqual(document.integrity.hashedTileBodyFields, [
      'kind',
      'pack',
      'parents',
      'payload',
      'version',
    ]);
    assert.deepEqual(document.integrity.excludedFromCid, [
      'cid',
      'canonical',
      'createdAt',
    ]);
  });

  check(checks, 'native-tile-contracts', () => {
    assert.equal(
      document.tiles.length,
      15,
      'The published fixture contains 15 tiles'
    );
    assert.equal(tiles.size, document.tiles.length, 'Duplicate Tile CID');
    for (const tile of document.tiles) {
      const integrity = verifyTileIntegrity(tile);
      assert.equal(
        integrity.ok,
        true,
        tile.kind + ': ' + integrity.errors.join('; ')
      );
      const payloadValidation = validatePayload(tile.kind, tile.payload);
      assert.equal(
        payloadValidation.ok,
        true,
        tile.kind + ': ' + payloadValidation.errors.join('; ')
      );
      const reconstructed = buildTile(tile.kind, tile.payload, {
        createdAt: tile.createdAt,
        pack: tile.pack,
        parents: tile.parents,
        version: tile.version,
      });
      assert.deepEqual(
        reconstructed,
        tile,
        'Native constructor mismatch for ' + tile.cid
      );
    }
  });

  check(checks, 'observable-lineage', () => {
    assert.deepEqual(
      Object.keys(roles).sort(),
      [...EXPECTED_ROLES].sort(),
      'Unexpected role index'
    );
    assert.deepEqual(
      new Set(Object.values(roles)),
      new Set(tiles.keys()),
      'Unindexed or duplicate role Tile'
    );
    assert.deepEqual(
      document.expectedTraversal,
      document.tiles.map((tile) => tile.cid),
      'Fixture traversal was changed'
    );
    for (const tile of document.tiles) {
      assert.equal(
        tile.kind.startsWith('ver.'),
        false,
        'This handoff must not pre-encode VER conclusions'
      );
      for (const parent of tile.parents)
        assert.ok(tiles.has(parent), 'Missing parent ' + parent);
    }
    const run = roleTile(document, tiles, 'run', 'rosetta.run');
    assert.deepEqual(run.parents, []);
    for (const phase of PHASES) {
      const action = roleTile(
        document,
        tiles,
        phase + 'Action',
        'rosetta.action'
      );
      const tool = roleTile(
        document,
        tiles,
        phase + 'ToolCall',
        'rosetta.toolcall'
      );
      const observation = roleTile(
        document,
        tiles,
        phase + 'Observation',
        'rosetta.observation'
      );
      const evaluation = roleTile(
        document,
        tiles,
        phase + 'Evaluation',
        'rosetta.evaluation'
      );
      assert.equal(
        action.payload.runCid,
        run.cid,
        phase + ' points to another run'
      );
      assertParents(action, [run.cid], phase + 'Action');
      assertParents(tool, [action.cid], phase + 'ToolCall');
      assertParents(observation, [tool.cid], phase + 'Observation');
      const expectedEvaluationParents =
        phase === 'postCalibration'
          ? [
              action.cid,
              observation.cid,
              roles.preCalibrationObservation,
              roles.calibrationObservation,
            ]
          : [action.cid, observation.cid];
      assertParents(
        evaluation,
        expectedEvaluationParents,
        phase + 'Evaluation'
      );
      assert.equal(
        observation.payload.source,
        'fixture.sensor-A',
        'Unexpected measurement source'
      );
    }
    const pre = roleTile(
      document,
      tiles,
      'preCalibrationObservation',
      'rosetta.observation'
    );
    const post = roleTile(
      document,
      tiles,
      'postCalibrationObservation',
      'rosetta.observation'
    );
    const correction = roleTile(
      document,
      tiles,
      'calibrationToolCall',
      'rosetta.toolcall'
    );
    assert.equal(
      pre.payload.signal,
      'Observed value 112 against reference 100 before calibration.'
    );
    assert.equal(
      post.payload.signal,
      'Observed value 100 against reference 100 after calibration.'
    );
    assert.equal(correction.payload.tool, 'fixture.sensor.calibrate');
    assert.deepEqual(correction.payload.args, {
      offset: -12,
      sensor: 'sensor-A',
    });
    assert.equal(
      roleTile(
        document,
        tiles,
        'preCalibrationEvaluation',
        'rosetta.evaluation'
      ).payload.verdict,
      'fail'
    );
    assert.equal(
      roleTile(
        document,
        tiles,
        'postCalibrationEvaluation',
        'rosetta.evaluation'
      ).payload.verdict,
      'pass'
    );
  });

  check(checks, 'bounded-receipt-claims', () => {
    const receipt = roleTile(document, tiles, 'receipt', 'rosetta.receipt');
    assert.equal(receipt.payload.receiptType, 'rrp:interop.fixture-closure');
    assert.equal(receipt.payload.claims.length, 1);
    assert.equal(
      receipt.payload.claims[0].claimType,
      'rrp:claim.fixture-closure-recorded'
    );
    assert.equal(
      receipt.payload.claims[0].statement,
      BOUNDED_STATEMENT,
      'Receipt makes an unreviewed claim'
    );
    assert.deepEqual(receipt.payload.subjects, [
      { cid: roles.run, role: 'rrp:subject.run' },
    ]);
    const evidence = [
      'postCalibrationEvaluation',
      'calibrationObservation',
      'postCalibrationObservation',
    ].map((role) => roles[role]);
    assert.deepEqual(
      receipt.payload.claims[0].evidence.map((item) => item.cid),
      evidence
    );
  });

  check(checks, 'native-signature-and-digests', () => {
    const receipt = roleTile(document, tiles, 'receipt', 'rosetta.receipt');
    assert.deepEqual(
      document.signedReceipt.receipt,
      receipt,
      'Detached signature references a different receipt'
    );
    const signed = verifySignedReceipt(document.signedReceipt);
    assert.equal(signed.ok, true, signed.errors.join('; '));
    const expectedDigests = [
      ['preCalibrationObservation', 'interop.pre-calibration-observation'],
      ['postCalibrationObservation', 'interop.post-calibration-observation'],
      ['postCalibrationEvaluation', 'interop.post-calibration-evaluation'],
    ].map(([role, label]) => digestTile(tiles.get(roles[role]), label));
    assert.deepEqual(
      receipt.payload.digests,
      expectedDigests,
      'Receipt digest evidence changed'
    );
  });

  check(checks, 'native-receipt-closure', () => {
    const receipt = roleTile(document, tiles, 'receipt', 'rosetta.receipt');
    const expectedBundle = buildReceiptBundle(receipt);
    assert.deepEqual(
      document.receiptBundle,
      expectedBundle,
      'Receipt bundle is not the native closure'
    );
    const store = new InMemoryTileStore();
    document.tiles.forEach((tile) => store.put(tile));
    const closure = verifyReceiptBundle(document.receiptBundle, store);
    assert.equal(closure.ok, true, closure.errors.join('; '));
  });

  check(checks, 'native-tapestry', () => {
    const bundle = document.receiptBundle;
    const tapestry = compileReceiptBundleTapestry(
      bundle.receiptCid,
      bundle.subjectCids,
      bundle.evidenceCids,
      bundle.policyCids
    );
    assert.deepEqual(
      roleTile(document, tiles, 'tapestry', 'rosetta.tapestry'),
      tapestry
    );
  });

  return {
    formatVersion: '1',
    role: 'ver-rosetta-native-interop-evidence',
    effect: 'fixture-integrity-and-provenance-only',
    fixtureId: document?.fixtureId ?? null,
    sourceCommit: document?.sourceCommit ?? null,
    tileCount: document?.tiles?.length ?? 0,
    disposition: checks.every((item) => item.status === 'pass')
      ? 'pass'
      : 'fail',
    checks,
  };
}

export function verifyInteropFile(
  traceFile = DEFAULT_TRACE,
  schemaFile = DEFAULT_SCHEMA
) {
  const bytes = readFileSync(traceFile);
  const trace = JSON.parse(bytes.toString('utf8'));
  const schema = JSON.parse(readFileSync(schemaFile, 'utf8'));
  return {
    ...verifyInteropTrace(trace, schema),
    traceSha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const report = verifyInteropFile(
    process.argv[2] ?? DEFAULT_TRACE,
    process.argv[3] ?? DEFAULT_SCHEMA
  );
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  if (report.disposition !== 'pass') process.exitCode = 1;
}
