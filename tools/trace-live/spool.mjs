import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
import { freshEvidenceDirectory } from '../compute/broker.mjs';

/** Preserve source bytes once; callers export only the separate derived files. */
export function writeBoundaryAdmission(admission, output) {
  const directory = freshEvidenceDirectory(output);
  const write = (ref, bytes) => {
    const file = path.join(directory, ref);
    mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    writeFileSync(file, bytes, { flag: 'wx', mode: 0o600, flush: true });
  };
  write(`local-source/${admission.localEvidence.source.sha256}.jsonl`, admission.localEvidence.source.bytes);
  for (const payload of admission.localEvidence.payloads) write(`local-source/payloads/${payload.sha256}.json`, payload.bytes);
  write('derived.sse', admission.fixture);
  write('source-bundle.json', canonicalTraceJson(admission.source) + '\n');
  write('normalization.json', canonicalTraceJson(admission.normalization) + '\n');
  write('reduction.json', canonicalTraceJson(admission.report) + '\n');
  return directory;
}
