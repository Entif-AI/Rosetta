import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import type { ExecutorContext } from '@nx/devkit';
import { synchronizeTasks, type IssueSnapshot } from '../issue-sync';
import { withIssueLedger } from '../issue-ledger';
import { localPath } from '../source-evidence';

/** Coordinator only: durable local write-ahead ledger + exact GitHub marker reconciliation. */
export default async function issueSync(options: { request: string; apply?: boolean }, context: ExecutorContext) {
  localPath(options.request);
  const request: unknown = JSON.parse(readFileSync(path.join(context.root, options.request), 'utf8'));
  if (!request || typeof request !== 'object' || !('repository' in request) || typeof request.repository !== 'string') throw new Error('A repository identity is required.');
  if (!('featureId' in request) || typeof request.featureId !== 'string' || !/^[a-z][a-z0-9-]*$/.test(request.featureId)) throw new Error('A stable feature identity is required.');
  const origin = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: context.root, encoding: 'utf8' }).trim();
  const match = /^(?:https:\/\/github\.com\/|git@github\.com:)([^/]+\/[^/]+?)(?:\.git)?\/?$/.exec(origin);
  if (!match || match[1].toLowerCase() !== request.repository.toLowerCase()) throw new Error('Requested issue repository must exactly match the GitHub origin.');
  const repository = request.repository;
  const gh = (args: string[], input?: object): unknown => JSON.parse(execFileSync('gh', ['api', ...args], {
    cwd: context.root, encoding: 'utf8', ...(input ? { input: JSON.stringify(input) } : {}), maxBuffer: 16 * 1024 * 1024,
  }));
  const snapshot = (value: unknown): IssueSnapshot => {
    if (!value || typeof value !== 'object' || !('number' in value) || typeof value.number !== 'number' || !('title' in value) || typeof value.title !== 'string' ||
        !('body' in value) || value.body !== null && typeof value.body !== 'string' || !('state' in value) || !['open', 'closed'].includes(String(value.state)) ||
        !('repository_url' in value) || String(value.repository_url).toLowerCase() !== `https://api.github.com/repos/${repository}`.toLowerCase()) throw new Error('Malformed or cross-repository GitHub issue receipt.');
    return { number: value.number, title: value.title, body: value.body ?? '', state: value.state as 'open' | 'closed' };
  };
  const client = {
    get: async (number: number) => snapshot(gh([`repos/${repository}/issues/${number}`])),
    find: async (marker: string) => {
      const token = marker.slice('<!-- '.length, -' -->'.length);
      const result = gh(['search/issues', '--method', 'GET', '-f', `q=repo:${repository} "${token}" in:body`, '-f', 'per_page=100']);
      if (!result || typeof result !== 'object' || !('items' in result) || !Array.isArray(result.items) || !('total_count' in result) || typeof result.total_count !== 'number' ||
          result.total_count > result.items.length || 'incomplete_results' in result && result.incomplete_results) throw new Error('Incomplete exact-binding search; reconcile before mutation.');
      return result.items.map(snapshot).filter((issue) => issue.body.includes(marker));
    },
    create: async (title: string, body: string) => snapshot(gh([`repos/${repository}/issues`, '--method', 'POST', '--input', '-'], { title, body })),
  };
  return withIssueLedger(context.root, repository, request.featureId, options.apply ?? false, async (store) => {
    const result = await synchronizeTasks(request, client, store, options.apply ?? false);
    process.stdout.write(`${JSON.stringify({ role: result.role, actions: result.actions, apply: options.apply ?? false }, null, 2)}\n`);
    return { success: result.success };
  });
}
