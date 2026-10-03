import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import type { ExecutorContext } from '@nx/devkit';
import { readConfig, type GovernanceConfig } from '../config';

export const digest = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
export function authorityProjection(config: GovernanceConfig, read: (file: string) => string | Buffer) {
  return { formatVersion: 1, role: 'derived-working-authority-projection', branchPolicy: config.branchPolicy,
    sources: config.authoritySources.map((file) => ({ path: file, sha256: digest(read(file)) })) };
}
function state(options: { configPath: string }, context: ExecutorContext) {
  const configFile = path.join(context.root, options.configPath);
  const config = readConfig(configFile);
  const sources = authorityProjection(config, (file) => readFileSync(path.join(context.root, file)));
  const directory = path.join(context.root, 'dist/governance', config.projectName);
  mkdirSync(directory, { recursive: true });
  return { config, sources, directory, configDigest: digest(readFileSync(configFile)) };
}

/** A successful target records a check result, including failure. Admission is the gate. */
export async function checkExecutor(options: { configPath: string; checkId: string }, context: ExecutorContext) {
  const { config, sources, directory, configDigest } = state(options, context);
  const check = config.checks[options.checkId];
  if (!check) throw new Error(`Unknown check: ${options.checkId}`);
  const result = spawnSync(check.command, { cwd: context.root, shell: true, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: { ...process.env, NX_DAEMON: 'false' } });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const report = { id: options.checkId, owner: check.owner, sourceTarget: `${config.projectName}:evidence-${options.checkId}`, command: check.command,
    status: result.status === 0 && !result.error ? 'pass' : 'fail', reason: result.error?.message ?? (result.status === 0 ? null : `Exit ${result.status}`),
    configDigest, authority: sources, exitCode: result.status, evidenceRef: `dist/governance/${config.projectName}/${options.checkId}.log` };
  writeFileSync(path.join(directory, `${options.checkId}.json`), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(path.join(directory, `${options.checkId}.log`), output);
  process.stdout.write(`${options.checkId}: ${report.status}\n`);
  return { success: true };
}

export async function admissionExecutor(options: { configPath: string; checkIds?: string[]; reportName?: string }, context: ExecutorContext) {
  const { config, sources, directory, configDigest } = state(options, context);
  const checks = (options.checkIds ?? Object.keys(config.checks)).sort().map((id) => {
    const report: unknown = JSON.parse(readFileSync(path.join(directory, `${id}.json`), 'utf8'));
    if (!report || typeof report !== 'object' || !('status' in report) || !('configDigest' in report) || !('authority' in report) || report.configDigest !== configDigest || JSON.stringify(report.authority) !== JSON.stringify(sources)) throw new Error(`Stale or malformed check evidence: ${id}`);
    return report;
  });
  const pass = checks.every((check) => check.status === 'pass');
  const report = { formatVersion: 1, role: 'composition-of-upstream-checks', disposition: pass ? 'merge-admissible' : 'blocked', checks };
  writeFileSync(path.join(directory, `${options.reportName ?? 'merge-admission'}.json`), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(path.join(directory, `${options.reportName ?? 'merge-admission'}.md`), `# Merge admission\n\n${report.disposition}\n\n${Object.entries(config.checks).map(([id, check]) => `- ${id}: ${check.owner}, evidence at ${id}.json`).join('\n')}\n`);
  return { success: pass };
}
