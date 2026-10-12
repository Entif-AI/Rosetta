#!/usr/bin/env node
import { isMain } from './entrypoint.mjs';
import { hostname } from 'node:os';
import process from 'node:process';
import console from 'node:console';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
  openSync,
  closeSync,
  fsyncSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { digest, localFile } from './plans.mjs';
import { loadGovernance } from './configuration.mjs';
import { installSource } from './source.mjs';
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
export const pins = JSON.parse(
  readFileSync(new URL('./upstreams.json', import.meta.url))
);
const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const manifestPath = '.specops/managed-veneers.json';
const pendingPath = '.specops/pending-veneers.json';
function atomic(file, bytes) {
  const temporary = file + '.' + randomUUID() + '.tmp';
  const fd = openSync(temporary, 'wx', 0o600);
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    renameSync(temporary, file);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}
function validateManifest(record) {
  if (
    record.formatVersion !== 1 ||
    record.component !== '@entif-ai/nx-governance' ||
    !record.identity ||
    !record.files ||
    Array.isArray(record.files)
  )
    throw new Error('invalid managed provenance');
  for (const hash of Object.values(record.files))
    if (!/^[a-f0-9]{64}$/.test(hash))
      throw new Error('invalid managed content digest');
}
export function recoverVeneerLock(root) {
  const lock = localFile(root, '.specops/install.lock'),
    recovery = localFile(root, '.specops/recovery.lock');
  if (!existsSync(lock)) return { recovered: false };
  let fd;
  try {
    fd = openSync(recovery, 'wx', 0o600);
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error(
        'recovery already owned; inspect recovery lock before administrative repair'
      );
    throw error;
  }
  try {
    writeFileSync(fd, JSON.stringify({ pid: process.pid, host: hostname() }));
    fsyncSync(fd);
    const owner = read(lock);
    if (
      owner.host !== hostname() ||
      !Number.isSafeInteger(owner.pid) ||
      owner.pid < 1
    )
      throw new Error(
        'ambiguous lock owner; preserve for administrative review'
      );
    try {
      process.kill(owner.pid, 0);
      throw new Error('live lock owner; recovery denied');
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
    unlinkSync(lock);
    return { recovered: true, owner };
  } finally {
    closeSync(fd);
    unlinkSync(recovery);
  }
}
export function manageVeneers(root, payload, identity, refresh = false) {
  if (
    !['codex', 'claude', 'generic'].includes(identity.runtime) ||
    !/^\d+\.\d+\.\d+$/.test(identity.version) ||
    !/^[a-f0-9]{64}$/.test(identity.sourceDigest) ||
    !/^[a-f0-9]{40}$/.test(identity.specopsCommit)
  )
    throw new Error('invalid runtime identity');
  const names = Object.keys(payload).sort();
  if (!names.length) throw new Error('empty payload');
  const paths = [
    manifestPath,
    pendingPath,
    '.specops/install.lock',
    '.specops/recovery.lock',
    ...names,
  ];
  for (const file of paths) localFile(root, file);
  if (
    names.some(
      (file) =>
        [
          manifestPath,
          pendingPath,
          '.specops/install.lock',
          '.specops/recovery.lock',
        ].includes(file) || typeof payload[file] !== 'string'
    )
  )
    throw new Error('invalid managed destination');
  mkdirSync(localFile(root, '.specops'), { recursive: true });
  if (existsSync(localFile(root, '.specops/recovery.lock')))
    throw new Error('administrative recovery already owned');
  const lock = localFile(root, '.specops/install.lock');
  let fd;
  try {
    fd = openSync(lock, 'wx', 0o600);
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error(
        'installer already owned; inspect lock owner before recovery'
      );
    throw error;
  }
  writeFileSync(fd, JSON.stringify({ pid: process.pid, host: hostname() }));
  closeSync(fd);
  try {
    const manifest = localFile(root, manifestPath),
      pending = localFile(root, pendingPath);
    const prior = existsSync(manifest) ? read(manifest) : null;
    if (prior) {
      validateManifest(prior);
      if (prior.identity.runtime !== identity.runtime)
        throw new Error('runtime identity conflict');
    }
    const desired = {
      formatVersion: 1,
      component: '@entif-ai/nx-governance',
      identity,
      files: Object.fromEntries(
        names.map((file) => [file, digest(payload[file])])
      ),
    };
    if (prior && Object.keys(prior.files).some((file) => !names.includes(file)))
      throw new Error(
        'removed managed files require explicit migration; preserve rollback state'
      );
    if (
      prior &&
      JSON.stringify(prior.identity) !== JSON.stringify(identity) &&
      !refresh
    )
      throw new Error('changed source requires explicit --refresh');
    const transaction = existsSync(pending) ? read(pending) : null;
    if (
      transaction &&
      JSON.stringify(transaction.desired) !== JSON.stringify(desired)
    )
      throw new Error(
        'pending install differs; resume its exact payload first'
      );
    if (transaction) {
      validateManifest(transaction.desired);
      if (
        !transaction.before ||
        Object.keys(transaction.before).sort().join() !== names.join()
      )
        throw new Error('invalid pending provenance');
    }
    for (const file of names) {
      const target = localFile(root, file),
        actual = existsSync(target) ? digest(readFileSync(target)) : null;
      const original = prior?.files[file] ?? null;
      if (transaction) {
        if (
          actual !== transaction.before[file] &&
          actual !== desired.files[file]
        )
          throw new Error(
            `local edit/deletion during pending install: ${file}`
          );
      } else if (original !== null && actual !== original)
        throw new Error(`local edit/deletion: ${file}`);
      else if (original === null && actual !== null)
        throw new Error(`unmanaged collision: ${file}`);
    }
    if (
      prior &&
      JSON.stringify(prior) === JSON.stringify(desired) &&
      !transaction
    )
      return prior;
    if (!transaction)
      atomic(
        pending,
        JSON.stringify(
          {
            desired,
            before: Object.fromEntries(
              names.map((file) => [file, prior?.files[file] ?? null])
            ),
          },
          null,
          2
        ) + '\n'
      );
    for (const file of names) {
      const target = localFile(root, file);
      mkdirSync(path.dirname(target), { recursive: true });
      if (
        !existsSync(target) ||
        digest(readFileSync(target)) !== desired.files[file]
      )
        atomic(target, payload[file]);
    }
    atomic(manifest, JSON.stringify(desired, null, 2) + '\n');
    unlinkSync(pending);
    return desired;
  } finally {
    unlinkSync(lock);
  }
}
export function installRuntime(root, runtime, { refresh = false } = {}) {
  const installation = localFile(root, '.specops/entif-governance.json');
  if (!existsSync(installation))
    throw new Error(
      'run Nx init --substrate=specops with consumer-owned governance config first'
    );
  const local = read(installation);
  if (
    local.branchPolicy !== 'existing-authorized' ||
    local.writerCount !== 1 ||
    local.components?.substrate !== 'specops'
  )
    throw new Error('conflicting consumer installation identity');
  const config = loadGovernance(root);
  for (const source of config.authoritySources)
    if (!existsSync(localFile(root, source)))
      throw new Error(`missing consumer authority: ${source}`);
  const source = localFile(root, '.axi/upstreams/specops');
  if (!existsSync(source))
    throw new Error(
      'pinned SpecOps source unavailable; acquire explicitly with --acquire-source=specops'
    );
  installSource(pins.specops, source);
  const cli = path.join(source, 'skills/specops/scripts/specops.mjs');
  if (!existsSync(cli)) throw new Error('missing pinned donor CLI');
  const version = read(path.join(packageRoot, 'package.json')).version;
  const assets = [
    'install.mjs',
    'entrypoint.mjs',
    'source.mjs',
    'configuration.mjs',
    'cli.mjs',
    'plans.mjs',
    'context.mjs',
    'catalog.mjs',
    'drift.mjs',
    'check.mjs',
    'upstreams.json',
    'runtime-template.md',
  ];
  const sourceDigest = digest(
    assets
      .map(
        (file) =>
          `${file}\n${readFileSync(new URL(file, import.meta.url), 'utf8')}`
      )
      .join('\n')
  );
  const route = {
    codex: '.agents/skills/entif-substrate/SKILL.md',
    claude: '.claude/skills/entif-substrate/SKILL.md',
    generic: '.specops/runtime.md',
  }[runtime];
  if (config.authoritySources.includes(route))
    throw new Error('runtime projection cannot overwrite consumer authority');
  if (!route) throw new Error('runtime must be codex|claude|generic');
  const payload = readFileSync(
    new URL('./runtime-template.md', import.meta.url),
    'utf8'
  )
    .replaceAll('{{project}}', config.projectName)
    .replaceAll('{{config}}', local.configPath);
  return manageVeneers(
    root,
    { [route]: payload },
    { runtime, version, sourceDigest, specopsCommit: pins.specops.commit },
    refresh
  );
}
if (isMain(import.meta.url)) {
  try {
    const args = process.argv.slice(2),
      acquire = args.find((arg) => arg.startsWith('--acquire-source='));
    if (args.length === 1 && args[0] === '--recover-lock') {
      console.log(JSON.stringify(recoverVeneerLock(process.cwd())));
    } else if (acquire) {
      if (args.length !== 1)
        throw new Error('source acquisition is a separate explicit operation');
      const name = acquire.split('=')[1];
      if (!pins[name]) throw new Error('unknown source');
      const target = localFile(process.cwd(), `.axi/upstreams/${name}`);
      console.log(JSON.stringify(installSource(pins[name], target)));
    } else {
      if (
        args.some(
          (arg) => !['codex', 'claude', 'generic', '--refresh'].includes(arg)
        ) ||
        args.filter((arg) => arg !== '--refresh').length !== 1
      )
        throw new Error(
          'usage: entif-substrate codex|claude|generic [--refresh] or --acquire-source=<name> or --recover-lock'
        );
      console.log(
        JSON.stringify(
          installRuntime(
            process.cwd(),
            args.find((arg) => arg !== '--refresh'),
            { refresh: args.includes('--refresh') }
          )
        )
      );
    }
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
  }
}
