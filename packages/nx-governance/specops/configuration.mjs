import { createRequire } from 'node:module';
import { URL } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { localFile } from './plans.mjs';
const require = createRequire(new URL('../package.json', import.meta.url));
export function loadGovernance(root) {
  const {
    installationPaths,
    resolveInstallation,
  } = require('./dist/installation.js');
  const { parseConfig } = require('./dist/config.js');
  const metadata = resolveInstallation(
    installationPaths
      .map((file) => localFile(root, file))
      .filter((file) => existsSync(file))
      .map((file) => JSON.parse(readFileSync(file)))
  );
  return parseConfig(
    JSON.parse(readFileSync(localFile(root, metadata.configPath)))
  );
}
