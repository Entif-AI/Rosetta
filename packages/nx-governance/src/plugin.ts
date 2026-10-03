import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import type { CreateNodesV2, TargetConfiguration } from '@nx/devkit';
import { parseConfig } from './config';

/** Only execution requirements enter dependsOn. Pack semantics stay in the catalog. */
export const createNodesV2: CreateNodesV2 = ['**/governance.config.json', async (files, _options, context) => files.map((file) => {
  const config = parseConfig(JSON.parse(readFileSync(path.join(context.workspaceRoot, file), 'utf8')));
  const root = path.posix.dirname(file);
  const targets: Record<string, TargetConfiguration> = {};
  for (const [id, check] of Object.entries(config.checks)) {
    targets[`evidence-${id}`] = {
      executor: '@entif-ai/nx-governance:check', options: { configPath: file, checkId: id },
      cache: !check.coordinator, parallelism: !check.coordinator,
      inputs: [fileInput(file), ...config.authoritySources.map(fileInput), ...check.inputs],
      outputs: [`{workspaceRoot}/dist/governance/${config.projectName}/${id}.json`, `{workspaceRoot}/dist/governance/${config.projectName}/${id}.log`]
    };
  }
  const prerequisites = Object.keys(config.checks).map((id) => `evidence-${id}`);
  targets['merge-admission'] = {
    executor: '@entif-ai/nx-governance:admission', options: { configPath: file },
    dependsOn: prerequisites, cache: !Object.values(config.checks).some((check) => check.coordinator),
    inputs: [fileInput(file), ...config.authoritySources.map(fileInput), ...Object.values(config.checks).flatMap((check) => check.inputs)],
    outputs: [`{workspaceRoot}/dist/governance/${config.projectName}/merge-admission.json`, `{workspaceRoot}/dist/governance/${config.projectName}/merge-admission.md`]
  };
  const specChecks = Object.keys(config.checks).filter((id) => config.checks[id].stage !== 'merge');
  targets['spec-admission'] = {
    ...targets['merge-admission'], cache: !specChecks.some((id) => config.checks[id].coordinator),
    options: { configPath: file, checkIds: specChecks, reportName: 'spec-admission' },
    dependsOn: specChecks.map((id) => `evidence-${id}`),
    outputs: [`{workspaceRoot}/dist/governance/${config.projectName}/spec-admission.json`, `{workspaceRoot}/dist/governance/${config.projectName}/spec-admission.md`]
  };
  return [file, { projects: { [root]: { name: config.projectName, root, targets, tags: ['governance', 'projection-consumer'] } } }];
})];
const fileInput = (file: string) => `{workspaceRoot}/${file}`;
