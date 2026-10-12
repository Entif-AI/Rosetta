import { existsSync } from 'node:fs';
import process from 'node:process';
import { parseArgs } from 'node:util';

export function proofOutputPath(defaultPath, args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: { output: { type: 'string', default: defaultPath } } });
  if (!values.output.trim()) throw new Error('Proof output must be nonempty.');
  if (existsSync(values.output)) throw new Error(`Proof output already exists: ${values.output}; select a fresh --output path.`);
  return values.output;
}
