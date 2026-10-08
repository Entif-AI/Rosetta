import { readFileSync, statSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { normalizeBoundaryTrace } from '../../packages/ingress-refinery/dist/index.js';
import { writeBoundaryAdmission } from './spool.mjs';

try {
  const { values } = parseArgs({ options: { input: { type: 'string' }, 'output-dir': { type: 'string' },
    'recorded-at': { type: 'string' }, maturity: { type: 'string' } } });
  if (!values.input || !values['output-dir'] || !values['recorded-at'] || !values.maturity) throw new Error('Input, fresh ignored output, recorded time and source maturity are required.');
  const input = statSync(values.input);
  if (!input.isFile() || input.size > 4 * 1024 * 1024) throw new Error('Select a bounded regular source file.');
  const admission = normalizeBoundaryTrace(readFileSync(values.input, 'utf8'), {
    recordedAt: values['recorded-at'], maturity: values.maturity,
  });
  const evidenceDirectory = writeBoundaryAdmission(admission, values['output-dir']);
  process.stdout.write(JSON.stringify({ status: 'ok', maturity: admission.report.maturity, evidenceDirectory,
    sourceDigest: admission.localEvidence.source.sha256, normalizedDigest: admission.normalization.normalizedDigest,
    retainedEvents: admission.report.retainedEvents, unresolvedEvents: admission.report.unresolvedEvents,
    integrationAccepted: false }) + '\n');
} catch {
  // Producer parsing errors cannot echo raw bytes or private input locations.
  process.stdout.write(JSON.stringify({ status: 'blocked', code: 'SOURCE_ADMISSION', message: 'Boundary evidence was not admitted; check declared shape, bounds, identity conflicts and fresh output.' }) + '\n');
  process.exitCode = 1;
}
