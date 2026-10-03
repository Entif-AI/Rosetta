import process from 'node:process';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export const isMain = (meta) =>
  Boolean(
    process.argv[1] &&
      existsSync(process.argv[1]) &&
      fileURLToPath(meta) === realpathSync(process.argv[1])
  );
