#!/usr/bin/env node
/* global console, process */
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateWorkspacePacks } from '../pack-conformance/validate-packs.mjs';

const BOOTSTRAP_SOURCE = 'packages/rosetta-schemas/src/lib/workspace-contract.spec.ts';
const PACK_SOURCE = 'tools/pack-conformance/validate-packs.mjs';
const ROCK_PACK_SOURCE = 'docs/RFCs/ROCK-3111-C-RRP-Pack-Filesystem-Contract-v0.2.0.md';
const DEFAULT_REPORT = 'dist/pack-release-gate/report.json';
const GRAPH_ERROR_CODES = new Set([
  'depends-on-cycle',
  'depends-on-self-reference',
  'doc-id-duplicate',
  'doc-id-missing'
]);

function bootstrapFailure() {
  return {
    code: 'bootstrap-contract-failed',
    root: '.',
    detail: `${BOOTSTRAP_SOURCE} failed`
  };
}

const RELEASE_COVERAGE = {
  status: 'partial',
  authority: ROCK_PACK_SOURCE,
  evaluated: [
    'manifest-validation',
    'content-addressed-pack-id',
    'depends-on-self-reference-and-cycle',
    'declared-path-and-export-existence',
    'declared-json-schema-parse-and-meta-schema-validation',
    'repo-local-doc-id-integrity',
    'bootstrap-workspace-presence'
  ],
  notEvaluated: [
    'generic-required-root-file-presence',
    'example-validation',
    'test-vector-execution-where-applicable',
    'traceability-header-checks-where-required',
    'changelog-update-for-normative-changes',
    'release-version-to-changelog-consistency',
    'breaking-change-migration-or-translator-strategy'
  ]
};

function normalizeRoot(root, workspaceRoot) {
  const absoluteRoot = path.resolve(root);
  const relativeRoot = path.relative(workspaceRoot, absoluteRoot);
  if (relativeRoot === '' || relativeRoot === '..' || relativeRoot.startsWith(`..${path.sep}`)) {
    return root.split(path.sep).join('/');
  }
  return relativeRoot.split(path.sep).join('/');
}

function normalizePackErrors(errors, workspaceRoot) {
  return errors.map((error) => ({
    code: error.code,
    root: normalizeRoot(error.root, workspaceRoot),
    detail: error.detail
  }));
}

function isManifestStageError(error) {
  return error.code === 'packs-root-unsafe' || error.code === 'pack-root-unsafe' || error.code.startsWith('manifest-');
}

function classifyPackErrors(packErrors) {
  const manifest = [];
  const integrity = [];
  const graph = [];

  for (const error of packErrors) {
    if (isManifestStageError(error)) {
      manifest.push(error);
    } else if (GRAPH_ERROR_CODES.has(error.code)) {
      graph.push(error);
    } else {
      integrity.push(error);
    }
  }

  return { manifest, integrity, graph };
}

function appendStage(stages, id, errors, blocker) {
  if (blocker) {
    stages.push({ id, status: 'blocked', blockedBy: blocker });
    return blocker;
  }

  if (errors.length > 0) {
    stages.push({ id, status: 'fail', errors });
    return id;
  }

  stages.push({ id, status: 'pass' });
  return null;
}

export function composePackReleaseGateReport({ packErrors, bootstrap }) {
  const classified = classifyPackErrors(packErrors);
  const stages = [];
  let blocker = appendStage(stages, 'pack-root-manifest', classified.manifest, null);
  blocker = appendStage(stages, 'pack-integrity', classified.integrity, blocker);
  blocker = appendStage(stages, 'docid-dependencies', classified.graph, blocker);

  const observedErrors = [...packErrors];
  if (blocker) {
    stages.push({ id: 'bootstrap-workspace', status: 'blocked', blockedBy: blocker });
  } else if (bootstrap.status === 'pass') {
    stages.push({ id: 'bootstrap-workspace', status: 'pass' });
  } else {
    const error = bootstrapFailure();
    stages.push({ id: 'bootstrap-workspace', status: 'fail', errors: [error] });
    observedErrors.push(error);
    blocker = 'bootstrap-workspace';
  }

  return {
    formatVersion: 1,
    role: 'pack-release-gate-evidence',
    effect: 'conformance-evidence-only',
    disposition: blocker ? 'blocked' : RELEASE_COVERAGE.status,
    sources: {
      bootstrapWorkspace: BOOTSTRAP_SOURCE,
      packConformance: PACK_SOURCE,
      packContract: ROCK_PACK_SOURCE
    },
    coverage: RELEASE_COVERAGE,
    stages,
    observedErrors
  };
}

function runBootstrapProof(workspaceRoot) {
  const result = spawnSync('pnpm', ['exec', 'vitest', 'run', BOOTSTRAP_SOURCE], {
    cwd: workspaceRoot,
    env: { ...process.env, NX_DAEMON: 'false' },
    stdio: 'inherit'
  });
  return result.status === 0 && !result.error ? { status: 'pass' } : { status: 'fail' };
}

export async function evaluatePackReleaseGate({
  workspaceRoot = process.cwd(),
  runBootstrap = runBootstrapProof
} = {}) {
  let packErrors;
  try {
    const result = await validateWorkspacePacks(path.join(workspaceRoot, 'packs'));
    packErrors = normalizePackErrors(result.errors, workspaceRoot);
  } catch (error) {
    packErrors = [{
      code: 'pack-validation-exec-failed',
      root: 'packs',
      detail: typeof error?.code === 'string' ? error.code : 'unknown-error'
    }];
  }

  const bootstrap = packErrors.length === 0 ? runBootstrap(workspaceRoot) : { status: 'not-run' };
  return composePackReleaseGateReport({ packErrors, bootstrap });
}

export function releaseGateExitCode(report) {
  return report.disposition === 'pass' ? 0 : 1;
}

function reportPathFromArgs(argv) {
  const reportIndex = argv.indexOf('--report');
  if (reportIndex < 0) return DEFAULT_REPORT;
  const reportPath = argv[reportIndex + 1];
  if (!reportPath || reportPath.startsWith('--')) {
    throw new Error('--report requires a path');
  }
  return reportPath;
}

export async function cli(argv = process.argv.slice(2)) {
  const reportPath = reportPathFromArgs(argv);
  const report = await evaluatePackReleaseGate();
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Pack release gate ${report.disposition}; report: ${reportPath}`);
  return releaseGateExitCode(report);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  try {
    process.exitCode = await cli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
