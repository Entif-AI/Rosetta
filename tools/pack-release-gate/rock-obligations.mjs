import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { auditExecutablePackEvidence } from './vector-evidence.mjs';
import { auditPackTraceability } from './traceability-evidence.mjs';

const ROOT_FILES = ['README.md', 'acceptance.md', 'metadata.json'];
const require = createRequire(import.meta.url);
const semver = require('semver');

async function regularFile(filePath) {
  try {
    const info = await lstat(filePath);
    return info.isFile() && (await readFile(filePath)).byteLength > 0;
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return false;
    throw error;
  }
}

async function nonemptyDirectory(directory) {
  try {
    const info = await lstat(directory);
    return info.isDirectory() && (await readdir(directory)).length > 0;
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return false;
    throw error;
  }
}

function item(root, id, status, detail, receipts) {
  return { root, id, status, detail, ...(receipts ? { receipts } : {}) };
}

function requiresChangelog(version) {
  return !/^0\.0\.\d+(?:[-+].*)?$/.test(version);
}

export function evaluateVersionEvidence({ current, previous, changedPaths, changelogText }) {
  if (!previous) {
    return { status: 'not-evaluated', detail: 'Pack has no baseline manifest; initial release history needs review' };
  }
  if (current.version === previous.version) {
    return { status: 'not-applicable', detail: 'Pack version unchanged against the selected base' };
  }
  if (!semver.valid(current.version) || !semver.valid(previous.version) || !semver.gt(current.version, previous.version)) {
    return { status: 'fail', detail: `Pack version must advance: ${previous.version} -> ${current.version}` };
  }
  if (!changedPaths.includes('CHANGELOG.md')) {
    return { status: 'fail', detail: `Pack version ${previous.version} -> ${current.version} without a changelog change` };
  }
  if (!changelogText?.includes(current.version)) {
    return { status: 'fail', detail: `Changelog does not identify new version ${current.version}` };
  }
  return { status: 'pass', detail: `Changelog updated for version ${previous.version} -> ${current.version}` };
}

function sortedJson(value) {
  if (Array.isArray(value)) return value.map(sortedJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, sortedJson(v)]));
  }
  return value;
}

function withoutContentId(manifest) {
  const cleaned = { ...manifest };
  delete cleaned.pack_id;
  return sortedJson(cleaned);
}

export function normativeDelta({ current, previous, changedPaths }) {
  const changed = changedPaths.filter((file) =>
    /^(schema|shacl|vocab|policy|profiles|translators|migrations)\//.test(file));
  if (changedPaths.includes('pack.json') &&
    JSON.stringify(withoutContentId(current)) !== JSON.stringify(withoutContentId(previous))) {
    changed.push('pack.json');
  }
  return changed.sort();
}

function gitRead(workspaceRoot, args) {
  try {
    return execFileSync('git', ['-C', workspaceRoot, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

async function historyForPack(workspaceRoot, root, baseRef) {
  if (!baseRef || !/^[A-Za-z0-9_./-]+$/.test(baseRef) || baseRef.startsWith('-') || baseRef.includes('..')) return null;
  const relativeRoot = path.relative(workspaceRoot, root).split(path.sep).join('/');
  if (relativeRoot.startsWith('../') || relativeRoot.startsWith('/') || relativeRoot === '..') return null;
  const previousText = gitRead(workspaceRoot, ['show', `${baseRef}:${relativeRoot}/pack.json`]);
  const diff = gitRead(workspaceRoot, ['diff', '--name-only', baseRef, '--', relativeRoot]);
  if (diff === null) return null;
  let previous = null;
  if (previousText !== null) {
    try { previous = JSON.parse(previousText); } catch { return null; }
  }
  const changedPaths = diff.trim().split('\n').filter(Boolean).map((file) => path.posix.relative(relativeRoot, file));
  return { previous, changedPaths };
}

export async function auditPackReleaseObligations({ packResults, workspaceRoot, baseRef = 'origin/main' }) {
  const findings = [];
  for (const { root, manifest } of packResults) {
    const relativeRoot = path.relative(workspaceRoot, root).split(path.sep).join('/');
    if (!manifest || !manifest.entrypoints || typeof manifest.version !== 'string') {
      findings.push(item(relativeRoot, 'generic-required-root-file-presence', 'not-evaluated', 'Manifest validation must pass first'));
      continue;
    }

    const required = [...ROOT_FILES, ...(requiresChangelog(manifest.version) ? ['CHANGELOG.md'] : [])];
    const absent = [];
    for (const file of required) {
      if (!await regularFile(path.join(root, file))) absent.push(file);
    }
    for (const dir of ['examples', 'tests']) {
      if (!await nonemptyDirectory(path.join(root, dir))) absent.push(`${dir}/`);
    }
    if (await regularFile(path.join(root, 'metadata.json'))) {
      try {
        const metadata = JSON.parse(await readFile(path.join(root, 'metadata.json'), 'utf8'));
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) absent.push('metadata.json (not an object)');
      } catch { absent.push('metadata.json (invalid JSON)'); }
    }
    findings.push(item(relativeRoot, 'generic-required-root-file-presence', absent.length ? 'fail' : 'pass', absent.length ? `Missing or invalid: ${absent.join(', ')}` : 'Required root files and nonempty directories present'));

    const examples = manifest.entrypoints.examples ?? [];
    const proof = await auditExecutablePackEvidence({ root, manifest });
    const exampleProof = proof?.examples;
    findings.push(item(relativeRoot, 'example-validation',
      examples.length === 0 ? 'fail' : exampleProof?.status ?? 'not-evaluated',
      examples.length === 0 ? 'No example declared in manifest' : exampleProof?.detail ?? 'No executable example binding for this Pack',
      exampleProof?.receipts));

    const vectors = await nonemptyDirectory(path.join(root, 'test-vectors'));
    const vectorProof = proof?.vectors;
    findings.push(item(relativeRoot, 'test-vector-execution-where-applicable',
      vectors ? vectorProof?.status ?? 'not-evaluated' : 'not-applicable',
      vectors ? vectorProof?.detail ?? 'Vectors present without a generic executable binding' : 'No test-vectors/ subtree',
      vectorProof?.receipts));
    const traceability = await auditPackTraceability({ root, manifest });
    findings.push(item(relativeRoot, 'traceability-header-checks-where-required', traceability.status,
      traceability.detail, traceability.receipts));

    const history = await historyForPack(workspaceRoot, root, baseRef);
    if (!history) {
      findings.push(item(relativeRoot, 'release-version-to-changelog-consistency', 'not-evaluated', `No readable Git baseline ${baseRef}`));
      findings.push(item(relativeRoot, 'changelog-update-for-normative-changes', 'not-evaluated', 'Change classification requires reviewed baseline evidence'));
      findings.push(item(relativeRoot, 'breaking-change-migration-or-translator-strategy', 'not-evaluated', 'Breaking-change classification requires reviewed baseline evidence'));
      continue;
    }
    const changelogText = await regularFile(path.join(root, 'CHANGELOG.md')) ? await readFile(path.join(root, 'CHANGELOG.md'), 'utf8') : null;
    const version = evaluateVersionEvidence({ current: manifest, previous: history.previous, changedPaths: history.changedPaths, changelogText });
    findings.push(item(relativeRoot, 'release-version-to-changelog-consistency', version.status, version.detail));

    const normativeChanges = history.previous
      ? normativeDelta({ current: manifest, previous: history.previous, changedPaths: history.changedPaths })
      : ['new-pack'];
    const changedLog = history.changedPaths.includes('CHANGELOG.md');
    const changelogStatus = normativeChanges.length
      ? changedLog ? 'not-evaluated' : 'fail'
      : 'not-applicable';
    const changelogDetail = normativeChanges.length
      ? changedLog
        ? `Changelog changed; review normative significance: ${normativeChanges.join(', ')}`
        : `Normative candidate changed without changelog update: ${normativeChanges.join(', ')}`
      : 'No candidate normative paths changed';
    findings.push(item(relativeRoot, 'changelog-update-for-normative-changes', changelogStatus, changelogDetail));
    findings.push(item(relativeRoot, 'breaking-change-migration-or-translator-strategy', normativeChanges.length ? 'not-evaluated' : 'not-applicable',
      normativeChanges.length ? 'Breaking-change determination requires semantic diff and human review' : 'No candidate normative paths changed'));
  }
  return findings;
}
