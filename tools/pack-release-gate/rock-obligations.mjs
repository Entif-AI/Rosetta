import { execFileSync } from 'node:child_process';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT_FILES = ['README.md', 'acceptance.md', 'metadata.json'];

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

function item(root, id, status, detail) {
  return { root, id, status, detail };
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
  if (!changedPaths.includes('CHANGELOG.md')) {
    return { status: 'fail', detail: `Pack version ${previous.version} -> ${current.version} without a changelog change` };
  }
  if (!changelogText?.includes(current.version)) {
    return { status: 'fail', detail: `Changelog does not identify new version ${current.version}` };
  }
  return { status: 'pass', detail: `Changelog updated for version ${previous.version} -> ${current.version}` };
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
    findings.push(item(relativeRoot, 'example-validation', examples.length === 0 ? 'fail' : 'not-evaluated',
      examples.length === 0 ? 'No example declared in manifest' : 'Example assets exist in the manifest, but no generic example-to-schema validation contract is declared'));

    const vectors = await nonemptyDirectory(path.join(root, 'test-vectors'));
    findings.push(item(relativeRoot, 'test-vector-execution-where-applicable', vectors ? 'not-evaluated' : 'not-applicable',
      vectors ? 'Vectors present; generic gate has no cross-Pack execution receipt contract' : 'No test-vectors/ subtree'));
    findings.push(item(relativeRoot, 'traceability-header-checks-where-required', 'not-evaluated',
      'ROCK requires headers for normative JSON/SHACL/other artifacts, but live JSON schemas cannot use textual preambles; mapping or sidecar convention not accepted'));

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

    const normativeChanges = history.changedPaths.filter((file) => /^(schema|shacl|vocab|policy|profiles|translators|migrations)\//.test(file) || file === 'pack.json');
    findings.push(item(relativeRoot, 'changelog-update-for-normative-changes', normativeChanges.length ? 'not-evaluated' : 'not-applicable',
      normativeChanges.length ? `Review normative significance: ${normativeChanges.join(', ')}` : 'No candidate normative paths changed'));
    findings.push(item(relativeRoot, 'breaking-change-migration-or-translator-strategy', normativeChanges.length ? 'not-evaluated' : 'not-applicable',
      normativeChanges.length ? 'Breaking-change determination requires semantic diff and human review' : 'No candidate normative paths changed'));
  }
  return findings;
}
