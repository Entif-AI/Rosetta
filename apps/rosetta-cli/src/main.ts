import { runRosettaCli } from './lib/rosetta-cli.js';

const execution = runRosettaCli(process.argv.slice(2));

if (execution.stdout.length > 0) {
  process.stdout.write(`${execution.stdout}\n`);
}
if (execution.stderr.length > 0) {
  process.stderr.write(`${execution.stderr}\n`);
}

process.exitCode = execution.exitCode;
