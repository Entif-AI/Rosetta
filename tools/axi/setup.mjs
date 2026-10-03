import process from 'node:process';
import console from 'node:console';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

export { installSource } from '../../packages/nx-governance/specops/source.mjs';
import { installSource } from '../../packages/nx-governance/specops/source.mjs';
const main =
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '');
if (main) {
  try {
    const pins = JSON.parse(
      readFileSync(
        new URL(
          '../../packages/nx-governance/specops/upstreams.json',
          import.meta.url
        )
      )
    );
    const name = process.argv[2] ?? 'axi';
    if (process.argv.length > 3 || !pins[name])
      throw new Error(
        'usage: node tools/axi/setup.mjs axi|quota-axi|gh-axi|npm-axi|specops'
      );
    const installed = installSource(
      pins[name],
      path.resolve('.axi/upstreams', name)
    );
    console.log(
      `source: ${name}\ncommit: ${installed.commit}\npath: ${installed.path}\nrole: pinned on-demand reference`
    );
  } catch (error) {
    console.log(
      `error: ${JSON.stringify(
        error.message
      )}\nhelp: preserve local state and inspect packages/nx-governance/specops/upstreams.json`
    );
    process.exitCode = 1;
  }
}
