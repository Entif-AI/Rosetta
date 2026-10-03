import process from 'node:process';
import console from 'node:console';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkDesiredState, verifyPlanHistory } from './drift.mjs';
export function check(root, config, base) {
  return {
    ...checkDesiredState(root, config),
    history: base ? verifyPlanHistory(root, base) : null,
  };
}
if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '')) {
  try {
    const args = process.argv.slice(2);
    let base;
    if (args.length) {
      if (args[0] !== '--base' || args.length !== 2)
        throw new Error('usage: check.mjs [--base <git-ref>]');
      base = args[1];
    }
    const root = process.cwd();
    const config = JSON.parse(
      readFileSync('tools/semantic-governance/governance.config.json')
    );
    console.log(JSON.stringify(check(root, config, base)));
  } catch (error) {
    console.log(`error: ${JSON.stringify(error.message)}`);
    process.exitCode = 1;
  }
}
