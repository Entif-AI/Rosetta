import { Buffer } from 'node:buffer';
import process from 'node:process';
import console from 'node:console';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  existsSync,
  renameSync,
  rmSync,
  chmodSync,
  realpathSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { performance } from 'node:perf_hooks';
export const pin = JSON.parse(
  readFileSync(new URL('./pin.json', import.meta.url))
);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function verifyBytes(bytes, expected) {
  if (!/^[a-f0-9]{64}$/.test(expected) || sha(bytes) !== expected)
    throw new Error('integrity mismatch');
}
export const git = (root, ...args) =>
  execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
export function checkBinary(binary) {
  const result = spawnSync(binary, ['version'], {
    encoding: 'utf8',
    timeout: 10000,
  });
  if (result.error)
    throw new Error('Badger unavailable: ' + result.error.message);
  if (result.status !== 0 || result.stdout.trim() !== `badger ${pin.release}`)
    throw new Error('Badger version mismatch');
}
export async function setup(target = path.resolve('.axi/badger')) {
  const asset = pin.assets[`${process.platform}_${process.arch}`];
  if (!asset) throw new Error('unsupported platform');
  if (existsSync(target)) {
    verifiedBinary(target);
    return target;
  }
  mkdirSync(path.dirname(target), { recursive: true });
  const stage = mkdtempSync(path.join(path.dirname(target), '.badger-stage-'));
  try {
    const response = await globalThis.fetch(asset.url);
    if (!response.ok) throw new Error('download failed: ' + response.status);
    const bytes = Buffer.from(await response.arrayBuffer());
    verifyBytes(bytes, asset.sha256);
    const archive = path.join(stage, 'release.tar.gz');
    writeFileSync(archive, bytes);
    // Extract only the verified archive's single executable; never its Skills.
    const binary = execFileSync('tar', ['-xOzf', archive, 'badger'], {
      maxBuffer: 64 * 1024 * 1024,
    });
    writeFileSync(path.join(stage, 'badger'), binary, { mode: 0o755 });
    chmodSync(path.join(stage, 'badger'), 0o755);
    checkBinary(path.join(stage, 'badger'));
    writeFileSync(
      path.join(stage, 'receipt.json'),
      JSON.stringify({ pin, asset, binarySha256: sha(binary) }, null, 2) + '\n'
    );
    if (existsSync(target))
      throw new Error('install collision; preserve existing state');
    renameSync(stage, target);
    return target;
  } finally {
    if (existsSync(stage)) rmSync(stage, { recursive: true, force: true });
  }
}
export function verifiedBinary(target = path.resolve('.axi/badger')) {
  const asset = pin.assets[`${process.platform}_${process.arch}`];
  const receipt = JSON.parse(readFileSync(path.join(target, 'receipt.json')));
  if (
    JSON.stringify(receipt.pin) !== JSON.stringify(pin) ||
    JSON.stringify(receipt.asset) !== JSON.stringify(asset)
  )
    throw new Error('donor identity mismatch');
  verifyBytes(readFileSync(path.join(target, 'release.tar.gz')), asset.sha256);
  // Compare to the digest-verified archive, not merely a mutable local receipt.
  const expected = execFileSync(
    'tar',
    ['-xOzf', path.join(target, 'release.tar.gz'), 'badger'],
    { maxBuffer: 64 * 1024 * 1024 }
  );
  const binary = path.join(target, 'badger');
  verifyBytes(readFileSync(binary), sha(expected));
  checkBinary(binary);
  return binary;
}
export function capture({ root, output, base, binary = verifiedBinary() }) {
  if (!root || !output || !/^[a-f0-9]{40}$/.test(base ?? ''))
    throw new Error('explicit root/output/base required');
  root = realpathSync(root);
  const repo = git(root, 'rev-parse', '--show-toplevel');
  mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  output = path.join(
    realpathSync(path.dirname(path.resolve(output))),
    path.basename(output)
  );
  if (output === repo || output.startsWith(repo + path.sep))
    throw new Error('capture must be outside scanned repository');
  if (existsSync(output))
    throw new Error('capture already exists; no regeneration loop');
  checkBinary(binary);
  const head = git(root, 'rev-parse', 'HEAD');
  const tree = git(root, 'rev-parse', 'HEAD^{tree}');
  git(root, 'cat-file', '-e', base + '^{commit}');
  const before = git(root, 'status', '--porcelain=v1', '--untracked-files=all');
  mkdirSync(output, { mode: 0o700 });
  const home = mkdtempSync(path.join(tmpdir(), 'badger-home-'));
  const report = {
    formatVersion: 1,
    role: 'non-authoritative-orientation-projection',
    pin,
    root,
    repository: { head, tree, base, dirty: !!before },
    runs: [],
  };
  try {
    for (let i = 1; i <= 2; i++) {
      const start = performance.now();
      const result = spawnSync(binary, ['api', 'topology', '--root', root], {
        cwd: root,
        env: {
          PATH: process.env.PATH,
          HOME: home,
          XDG_CONFIG_HOME: home,
          TMPDIR: home,
          LANG: 'C',
        },
        timeout: 60000,
        maxBuffer: 16 * 1024 * 1024,
      });
      const stdout = result.stdout ?? Buffer.alloc(0),
        stderr = result.stderr ?? Buffer.alloc(0);
      writeFileSync(path.join(output, `${i}.stdout`), stdout, { mode: 0o600 });
      writeFileSync(path.join(output, `${i}.stderr`), stderr, { mode: 0o600 });
      report.runs.push({
        exitStatus: result.status,
        signal: result.signal,
        error: result.error?.message ?? null,
        stdoutBytes: stdout.length,
        stderrBytes: stderr.length,
        stdoutSha256: sha(stdout),
        stderrSha256: sha(stderr),
        wallSeconds: (performance.now() - start) / 1000,
      });
    }
    report.deterministic =
      report.runs[0].stdoutSha256 === report.runs[1].stdoutSha256 &&
      report.runs[0].stderrSha256 === report.runs[1].stderrSha256 &&
      report.runs[0].exitStatus === report.runs[1].exitStatus;
    report.repositoryUnchanged =
      before ===
        git(root, 'status', '--porcelain=v1', '--untracked-files=all') &&
      head === git(root, 'rev-parse', 'HEAD');
    writeFileSync(
      path.join(output, 'metadata.json'),
      JSON.stringify(report, null, 2) + '\n',
      { mode: 0o600 }
    );
    if (!report.repositoryUnchanged)
      throw new Error('repository changed during capture');
    return report;
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}
export function validateTrial(m) {
  if (m.projectionAuthority !== false)
    throw new Error('projection cannot become authority');
  if (
    m.formatVersion !== 1 ||
    m.issue !== 1711 ||
    m.mode !== 'orientation-only' ||
    !['A', 'B', 'C', 'D'].includes(m.variant)
  )
    throw new Error('invalid trial');
  if (
    !['startingCommit', 'startingTree'].every((k) =>
      /^[a-f0-9]{40}$/.test(m[k] ?? '')
    ) ||
    !['taskIssue', 'model', 'reasoning', 'root', 'qualityReviewMethod'].every(
      (k) => typeof m[k] === 'string' && m[k].trim()
    ) ||
    ![
      'skillRuntimeSurface',
      'acceptanceCriteria',
      'validationCommands',
      'quotaCapturePoints',
      'stopConditions',
    ].every(
      (k) =>
        Array.isArray(m[k]) &&
        m[k].length &&
        m[k].every((v) => typeof v === 'string' && v.trim())
    )
  )
    throw new Error('freeze every required trial field');
  if (
    !Number.isSafeInteger(m.contextByteLimit) ||
    m.contextByteLimit <= 0 ||
    m.contextByteLimit >= 512 * 1024
  )
    throw new Error('bounded context required');
  if (
    m.variant === 'D' &&
    !(typeof m.dGateEvidence === 'string' && m.dGateEvidence.trim())
  )
    throw new Error('D requires A/B/C gate evidence');
  if (!m.treatments?.[m.variant]) throw new Error('context treatment required');
  return true;
}
if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '')) {
  try {
    const [command, ...args] = process.argv.slice(2);
    if (command === 'setup' && !args.length) console.log(await setup());
    else if (command === 'smoke' && args.length === 3) {
      const report = capture({ root: args[0], output: args[1], base: args[2] });
      console.log(JSON.stringify(report));
      if (!report.deterministic || report.runs.some((r) => r.exitStatus !== 0))
        process.exitCode = 1;
    } else if (command === 'freeze' && args.length === 2) {
      const m = JSON.parse(readFileSync(args[0]));
      validateTrial(m);
      const root = realpathSync(m.root);
      if (
        git(root, 'rev-parse', 'HEAD') !== m.startingCommit ||
        git(root, 'rev-parse', 'HEAD^{tree}') !== m.startingTree ||
        git(root, 'status', '--porcelain=v1', '--untracked-files=all')
      )
        throw new Error('trial requires frozen clean Git state');
      writeFileSync(args[1], JSON.stringify(m, null, 2) + '\n', {
        flag: 'wx',
        mode: 0o600,
      });
      console.log('Frozen; no model invoked.');
    } else
      throw new Error(
        'usage: harness.mjs setup | smoke <root> <outside-output> <base-sha> | freeze <filled-template> <new-manifest>'
      );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
