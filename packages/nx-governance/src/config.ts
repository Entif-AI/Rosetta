import Ajv from 'ajv';
import { readJsonFile } from '@nx/devkit';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Nx 22's SWC CommonJS loader requires a direct JSON import.
import schema = require('./config.schema.json');

export interface GovernanceCheck {
  command: string;
  owner: string;
  inputs: string[];
  coordinator?: boolean;
}
export interface GovernanceConfig {
  schemaVersion: 1;
  projectName: string;
  branchPolicy: 'existing-authorized';
  authoritySources: string[];
  checks: Record<string, GovernanceCheck>;
  projectionPath: string;
  catalog?: { generator: string; outputs: string[] };
}
const validate = new Ajv({ allErrors: true }).compile<GovernanceConfig>(schema);
export function parseConfig(value: unknown): GovernanceConfig {
  if (!validate(value)) throw new Error(`Governance configuration conflict: ${JSON.stringify(validate.errors)}`);
  return value;
}
export const readConfig = (file: string) => parseConfig(readJsonFile<object>(file));
