import { parseArgs } from 'node:util';
import process from 'node:process';
import { invoke, loadConfig } from './broker.mjs';
import { VERSION, JOBS, outcomeError } from './contract.mjs';

try {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { target: { type: 'string', default: 'm3-ultra' }, job: { type: 'string' }, output: { type: 'string' }, config: { type: 'string' }, 'run-id': { type: 'string' } } });
  if (positionals.length !== 1) throw new Error('Select one operation.');
  if (positionals[0] === 'catalog') process.stdout.write(JSON.stringify({ version: VERSION, disposition: 'WRAP_EXISTING_INTERFACE', operations: ['doctor', 'run', 'collect'], jobs: JOBS }) + '\n');
  else {
    const result = await invoke({ operation: positionals[0], target: values.target, job: values.job, output: values.output, config: loadConfig(values.config), runId: values['run-id'] });
    process.stdout.write(JSON.stringify(result) + '\n');
    if (result.status !== 'ok') process.exitCode = 1;
  }
} catch (error) { process.stdout.write(JSON.stringify(outcomeError(error)) + '\n'); process.exitCode = 1; }
