import { deriveBoundaryTraceSource, type BoundarySourceOptions } from '@entif-ai/source-substrate';
import { canonicalTraceJson } from '@entif-ai/rosetta-schemas';
import { normalizeTrace } from './trace-normalizer.js';

/** Source custody and normalization are separate outputs. Never export localEvidence. */
export function normalizeBoundaryTrace(raw: string, options: BoundarySourceOptions) {
  const source = deriveBoundaryTraceSource(raw, options);
  const normalization = normalizeTrace(source.fixture, {
    sourceFixtureRef: source.source.derived.cid, recordedAt: options.recordedAt, profileVersion: 'trace-live-source-v1',
  });
  return { ...source, normalization, report: { ...source.report,
    normalizedBytes: Buffer.byteLength(canonicalTraceJson(normalization)) } };
}
