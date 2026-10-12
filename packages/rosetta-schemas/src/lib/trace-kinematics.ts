import { Ajv } from 'ajv';
import { canonicalTraceJson, traceHash } from './trace-normalization.js';
export const TRACE_KINEMATICS_PROFILE = 'trace-kin-v1';
export const TRACE_KINEMATICS_CAVEAT = 'These metrics describe client-visible representation dynamics. They do not establish provider/model internal memory compaction, forgetting, deletion, summarization, recall or causality.';
export interface TraceKinematicsMetric {
  snapshotId: string; previousSnapshotId: string | null; sourceSequence: number; runRef: string; windowRef: string; reset: boolean;
  sourceBytes: number; normalizedBytes: number; recordCount: number; objectCount: number; uniqueObjectIds: number; duplicatePayloads: number;
  deltaCounts: { added: number; changed: number; removed: number; repeated: number; unchanged: number };
  survivors: string[]; disappeared: string[]; reappeared: string[];
  keys: string[]; survivingKeys: string[]; disappearedKeys: string[]; reappearedKeys: string[];
  signatures: string[]; survivingSignatures: string[]; disappearedSignatures: string[]; reappearedSignatures: string[];
  repeatedRequests: number; repeatedTools: number; repeatedResults: number; unchangedResults: number;
  objectShrinkRatio: number; byteShrinkRatio: number; representation_shrink: boolean; compaction_candidate: boolean;
}
export interface TraceKinematicsReport {
  profile: typeof TRACE_KINEMATICS_PROFILE; profileVersion: '1.0.0'; sourceFixtureRef: string; sourceDigest: string;
  normalizationProfile: 'trace.normalization.v1'; normalizationVersion: string; normalizedDigest: string;
  caveat: typeof TRACE_KINEMATICS_CAVEAT; metrics: TraceKinematicsMetric[]; resultDigest: string;
}
const nonnegative = { type: 'integer', minimum: 0 }, strings = { type: 'array', uniqueItems: true, items: { type: 'string' } };
const metricProperties = {
  snapshotId: { type: 'string' }, previousSnapshotId: { type: ['string', 'null'] }, sourceSequence: nonnegative, runRef: { type: 'string' }, windowRef: { type: 'string' }, reset: { type: 'boolean' },
  ...Object.fromEntries(['sourceBytes','normalizedBytes','recordCount','objectCount','uniqueObjectIds','duplicatePayloads','repeatedRequests','repeatedTools','repeatedResults','unchangedResults'].map(k => [k, nonnegative])),
  deltaCounts: { type: 'object', additionalProperties: false, required: ['added','changed','removed','repeated','unchanged'], properties: Object.fromEntries(['added','changed','removed','repeated','unchanged'].map(k => [k, nonnegative])) },
  ...Object.fromEntries(['survivors','disappeared','reappeared','keys','survivingKeys','disappearedKeys','reappearedKeys','signatures','survivingSignatures','disappearedSignatures','reappearedSignatures'].map(k => [k, strings])),
  objectShrinkRatio: { type: 'number', minimum: 0, maximum: 1 }, byteShrinkRatio: { type: 'number', minimum: 0, maximum: 1 }, representation_shrink: { type: 'boolean' }, compaction_candidate: { type: 'boolean' }
};
export const TRACE_KINEMATICS_SCHEMA = { type: 'object', additionalProperties: false, required: ['profile','profileVersion','sourceFixtureRef','sourceDigest','normalizationProfile','normalizationVersion','normalizedDigest','caveat','metrics','resultDigest'], properties: {
  profile: { const: TRACE_KINEMATICS_PROFILE }, profileVersion: { const: '1.0.0' }, sourceFixtureRef: { type: 'string' }, sourceDigest: { type: 'string' }, normalizationProfile: { const: 'trace.normalization.v1' }, normalizationVersion: { type: 'string' }, normalizedDigest: { type: 'string' }, caveat: { const: TRACE_KINEMATICS_CAVEAT }, resultDigest: { type: 'string' },
  metrics: { type: 'array', items: { type: 'object', additionalProperties: false, required: Object.keys(metricProperties), properties: metricProperties } }
} };
const validate = new Ajv({ strict: false }).compile<TraceKinematicsReport>(TRACE_KINEMATICS_SCHEMA);
export function parseTraceKinematics(value: unknown): TraceKinematicsReport {
  if (!validate(value)) throw new Error('Invalid trace kinematics shape.');
  const { resultDigest, ...body } = value;
  if (traceHash(canonicalTraceJson(body)) !== resultDigest) throw new Error('Kinematics digest mismatch.');
  const prior = new Map<string, TraceKinematicsMetric>();
  let sequence = -1;
  for (const m of value.metrics) {
    const p = m.previousSnapshotId === null ? undefined : prior.get(m.previousSnapshotId);
    if (prior.has(m.snapshotId) || m.sourceSequence <= sequence || (m.previousSnapshotId !== null && !p)) throw new Error('Invalid kinematics predecessor.');
    const objectRatio = p ? Math.max(0, 1 - m.objectCount / Math.max(1, p.objectCount)) : 0;
    const byteRatio = p ? Math.max(0, 1 - m.normalizedBytes / Math.max(1, p.normalizedBytes)) : 0;
    const shrink = !!p && m.sourceSequence > p.sourceSequence && m.objectCount < p.objectCount && m.normalizedBytes < p.normalizedBytes && m.deltaCounts.removed > 0;
    const candidate = shrink && m.survivors.length > 0 && !m.reset && p?.runRef === m.runRef && p.windowRef === m.windowRef;
    if (m.objectShrinkRatio !== objectRatio || m.byteShrinkRatio !== byteRatio || m.representation_shrink !== shrink || m.compaction_candidate !== candidate) throw new Error('Kinematics criteria mismatch.');
    if (m.uniqueObjectIds !== m.objectCount || m.duplicatePayloads > m.objectCount || m.disappeared.length !== m.deltaCounts.removed || m.survivors.length + m.deltaCounts.added !== m.objectCount) throw new Error('Kinematics counts mismatch.');
    prior.set(m.snapshotId, m); sequence = m.sourceSequence;
  }
  return value;
}
