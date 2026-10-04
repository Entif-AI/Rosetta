import { Ajv } from 'ajv';
import {
  canonicalTraceJson,
  parseTraceNormalization,
  traceHash,
  type TraceRecord,
} from '@entif-ai/rosetta-schemas';

export const GRAPHITI_PIN = {
  version: '0.30.2',
  commit: 'eaa4128681bc53487138a4bbc22d58336ebe70d2',
};
export interface EpisodeSelection {
  recordId: string;
  effectiveAt: string | null;
  correctionAt: string | null;
  scopeRef: string;
  rightsRef: string;
  identity: 'unresolved' | 'distinct';
}
export interface SelectedEpisode extends EpisodeSelection {
  id: string;
  content: TraceRecord['preserved'];
  sourceEventAt: string | null;
  observedAt: string | null;
  recordedAt: string;
  timeBasis: TraceRecord['time']['basis'];
  sourceSequence: number;
}
export interface SelectedTraceEpisodes {
  profile: 'trace.graphiti-selection.v1';
  profileVersion: '1.0.0';
  sourceArtifactRef: string;
  sourceDigest: string;
  normalizedProfile: string;
  normalizedVersion: string;
  normalizedDigest: string;
  episodes: SelectedEpisode[];
}
export interface TemporalArtifact {
  id: string;
  kind:
    | 'entity'
    | 'fact'
    | 'edge'
    | 'episode'
    | 'invalidation'
    | 'supersession';
  interpretation: string;
  supportEpisodeIds: string[];
  validFrom: string | null;
  validUntil: string | null;
  validUntilKnownAt: string | null;
  validUntilSupportEpisodeIds: string[];
  materializedAt: string;
  supersedes: string[];
  identity: 'unresolved' | 'distinct';
}
export interface TemporalProjection {
  profile: 'trace.graphiti-projection.v1';
  profileVersion: '1.0.0';
  selected: SelectedTraceEpisodes;
  derivation: {
    mode: 'model-backed' | 'fixture-replay' | 'unavailable';
    graphitiVersion: string;
    graphitiCommit: string;
    databaseVersion: string | null;
    provider: string | null;
    model: string | null;
    modelVersion: string | null;
    extractionConfig: Record<string, unknown>;
    embedder: string | null;
    reranker: string | null;
    adapterVersion: string;
  };
  artifacts: TemporalArtifact[];
  loss: string[];
}
const text = { type: 'string', minLength: 1 };
const nullableText = { anyOf: [text, { type: 'null' }] };
const strings = { type: 'array', items: text, uniqueItems: true };
const object = (properties: Record<string, unknown>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const selectionProperties = {
  recordId: text,
  effectiveAt: nullableText,
  correctionAt: nullableText,
  scopeRef: text,
  rightsRef: text,
  identity: { enum: ['unresolved', 'distinct'] },
};
const selectionSchema = object(selectionProperties);
const digest = { type: 'string', pattern: '^[a-f0-9]{64}$' };
export const GRAPHITI_SELECTION_SCHEMA = object({
  profile: { const: 'trace.graphiti-selection.v1' },
  profileVersion: { const: '1.0.0' },
  sourceArtifactRef: text,
  sourceDigest: digest,
  normalizedProfile: { const: 'trace.normalization.v1' },
  normalizedVersion: text,
  normalizedDigest: digest,
  episodes: {
    type: 'array',
    minItems: 1,
    maxItems: 100,
    items: object({
      ...selectionProperties,
      id: text,
      content: {},
      sourceEventAt: nullableText,
      observedAt: nullableText,
      recordedAt: text,
      timeBasis: { enum: ['fixture', 'relative-redacted'] },
      sourceSequence: { type: 'integer', minimum: 0 },
    }),
  },
});
export const GRAPHITI_PROJECTION_SCHEMA = object({
  profile: { const: 'trace.graphiti-projection.v1' },
  profileVersion: { const: '1.0.0' },
  selected: GRAPHITI_SELECTION_SCHEMA,
  derivation: object({
    mode: { enum: ['model-backed', 'fixture-replay', 'unavailable'] },
    graphitiVersion: { const: GRAPHITI_PIN.version },
    graphitiCommit: { const: GRAPHITI_PIN.commit },
    databaseVersion: nullableText,
    provider: nullableText,
    model: nullableText,
    modelVersion: nullableText,
    extractionConfig: { type: 'object' },
    embedder: nullableText,
    reranker: nullableText,
    adapterVersion: { const: '1.0.0' },
  }),
  artifacts: {
    type: 'array',
    maxItems: 10000,
    items: object({
      id: text,
      kind: {
        enum: [
          'entity',
          'fact',
          'edge',
          'episode',
          'invalidation',
          'supersession',
        ],
      },
      interpretation: text,
      supportEpisodeIds: { ...strings, minItems: 1 },
      validFrom: nullableText,
      validUntil: nullableText,
      validUntilKnownAt: nullableText,
      validUntilSupportEpisodeIds: strings,
      materializedAt: text,
      supersedes: strings,
      identity: { enum: ['unresolved', 'distinct'] },
    }),
  },
  loss: { ...strings, minItems: 1 },
});
const ajv = new Ajv({ strict: false, allErrors: true });
const validateSelection = ajv.compile<EpisodeSelection>(selectionSchema);
const validateProjection = ajv.compile<TemporalProjection>(
  GRAPHITI_PROJECTION_SCHEMA
);
function instant(value: string | null): void {
  if (
    value !== null &&
    (!Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString() !== value)
  )
    throw new Error('Expected canonical UTC instant.');
}
/** Selection is explicit fixture/operator input, not a ranking or attention policy. */
export function selectTraceEpisodes(
  normalized: unknown,
  options: {
    sourceArtifactRef: string;
    selections: EpisodeSelection[];
    maxEpisodes: number;
    maxBytes: number;
  }
): SelectedTraceEpisodes {
  const report = parseTraceNormalization(normalized);
  if (
    !options.sourceArtifactRef ||
    !Number.isSafeInteger(options.maxEpisodes) ||
    options.maxEpisodes < 1 ||
    options.maxEpisodes > 100 ||
    !Number.isSafeInteger(options.maxBytes) ||
    options.maxBytes < 1 ||
    options.maxBytes > 1_000_000 ||
    options.selections.length < 1 ||
    options.selections.length > options.maxEpisodes
  )
    throw new Error('Invalid bounded episode selection.');
  const records = new Map(report.records.map((r) => [r.recordId, r]));
  if (
    new Set(options.selections.map((s) => s.recordId)).size !==
    options.selections.length
  )
    throw new Error('Duplicate selected record.');
  const provenance = {
    sourceArtifactRef: options.sourceArtifactRef,
    sourceDigest: report.sourceDigest,
    normalizedProfile: report.profile,
    normalizedVersion: report.profileVersion,
    normalizedDigest: report.normalizedDigest,
  };
  const episodes = options.selections.map((selection) => {
    if (!validateSelection(selection))
      throw new Error('Invalid episode selection shape.');
    instant(selection.effectiveAt);
    instant(selection.correctionAt);
    const record = records.get(selection.recordId);
    if (!record)
      throw new Error('Selected record missing from normalized evidence.');
    const body = {
      ...selection,
      content: structuredClone(record.preserved),
      sourceEventAt: record.time.sourceEvent ?? null,
      observedAt: record.time.observed ?? null,
      recordedAt: record.time.recorded,
      timeBasis: record.time.basis,
      sourceSequence: record.sourceSequence,
    };
    return {
      ...body,
      id:
        'episode:' + traceHash(canonicalTraceJson({ ...provenance, ...body })),
    };
  });
  const result: SelectedTraceEpisodes = {
    profile: 'trace.graphiti-selection.v1',
    profileVersion: '1.0.0',
    ...provenance,
    episodes,
  };
  if (Buffer.byteLength(canonicalTraceJson(result)) > options.maxBytes)
    throw new Error('Selected episode byte bound exceeded.');
  return result;
}
/** Verify against preserved normalized evidence, never a donor's provenance assertion alone. */
export function parseTemporalProjection(
  value: unknown,
  normalized: unknown,
  admittedSelection: SelectedTraceEpisodes
): TemporalProjection {
  if (!validateProjection(value))
    throw new Error(
      'Invalid temporal projection: ' +
        JSON.stringify(validateProjection.errors)
    );
  if (
    canonicalTraceJson(value.selected) !== canonicalTraceJson(admittedSelection)
  )
    throw new Error(
      'Projection differs from independently admitted selection.'
    );
  const selections = value.selected.episodes.map((e) => ({
    recordId: e.recordId,
    effectiveAt: e.effectiveAt,
    correctionAt: e.correctionAt,
    scopeRef: e.scopeRef,
    rightsRef: e.rightsRef,
    identity: e.identity,
  }));
  const expected = selectTraceEpisodes(normalized, {
    sourceArtifactRef: value.selected.sourceArtifactRef,
    selections,
    maxEpisodes: 100,
    maxBytes: 1_000_000,
  });
  if (canonicalTraceJson(expected) !== canonicalTraceJson(value.selected))
    throw new Error('Selected evidence binding mismatch.');
  const support = new Set(expected.episodes.map((e) => e.id));
  const identities = new Map<string, string>();
  for (const artifact of value.artifacts) {
    for (const at of [
      artifact.validFrom,
      artifact.validUntil,
      artifact.validUntilKnownAt,
      artifact.materializedAt,
    ])
      instant(at);
    if (
      artifact.validUntil !== null &&
      (artifact.validFrom === null || artifact.validUntil < artifact.validFrom)
    )
      throw new Error('Contradictory temporal interval.');
    if (
      (artifact.validUntil === null) !==
        (artifact.validUntilKnownAt === null) ||
      (artifact.validUntil === null
        ? artifact.validUntilSupportEpisodeIds.length !== 0
        : artifact.validUntilSupportEpisodeIds.length === 0)
    )
      throw new Error('Invalidation needs its own time and support.');
    if (artifact.validUntilSupportEpisodeIds.some((id) => !support.has(id)))
      throw new Error('Unresolved invalidation support.');
    if (artifact.supportEpisodeIds.some((id) => !support.has(id)))
      throw new Error('Unresolved selected evidence support.');
    const bytes = canonicalTraceJson(artifact);
    if (identities.has(artifact.id) && identities.get(artifact.id) !== bytes)
      throw new Error('Conflicting artifact identity.');
    identities.set(artifact.id, bytes);
  }
  for (const a of value.artifacts)
    if (a.supersedes.some((id) => id === a.id || !identities.has(id)))
      throw new Error('Unresolved or self supersession.');
  const byId = new Map(value.artifacts.map((a) => [a.id, a]));
  const pending = new Map(
    [...byId].map(([id, a]) => [id, a.supersedes.length])
  );
  const dependents = new Map<string, string[]>();
  for (const a of byId.values())
    for (const prior of a.supersedes)
      dependents.set(prior, [...(dependents.get(prior) ?? []), a.id]);
  const ready = [...pending]
    .filter(([, count]) => count === 0)
    .map(([id]) => id);
  for (let index = 0; index < ready.length; index++)
    for (const id of dependents.get(ready[index]) ?? []) {
      const remaining = (pending.get(id) ?? 0) - 1;
      pending.set(id, remaining);
      if (remaining === 0) ready.push(id);
    }
  if (ready.length !== byId.size) throw new Error('Cyclic supersession.');
  if (value.derivation.mode === 'unavailable' && value.artifacts.length)
    throw new Error('Unavailable projection cannot claim artifacts.');
  if (
    value.derivation.mode === 'model-backed' &&
    [
      value.derivation.provider,
      value.derivation.model,
      value.derivation.embedder,
      value.derivation.reranker,
      value.derivation.databaseVersion,
    ].some((v) => v === null)
  )
    throw new Error('Missing inference derivation identity.');
  return value;
}
export function inspectTemporalProjection(
  value: unknown,
  normalized: unknown,
  query: {
    admittedSelection: SelectedTraceEpisodes;
    effectiveAt: string;
    knownAt: string;
    allowedScopeRefs: string[];
    allowedRightsRefs: string[];
    revokedEpisodeIds: string[];
  }
) {
  const projection = parseTemporalProjection(
    value,
    normalized,
    query.admittedSelection
  );
  instant(query.effectiveAt);
  instant(query.knownAt);
  const allowed = new Set(
    projection.selected.episodes
      .filter(
        (e) =>
          query.allowedScopeRefs.includes(e.scopeRef) &&
          query.allowedRightsRefs.includes(e.rightsRef) &&
          !query.revokedEpisodeIds.includes(e.id) &&
          e.recordedAt <= query.knownAt &&
          (e.correctionAt === null || e.correctionAt <= query.knownAt)
      )
      .map((e) => e.id)
  );
  const seen = new Set<string>();
  const visible = projection.artifacts.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return (
      a.supportEpisodeIds.every((id) => allowed.has(id)) &&
      a.materializedAt <= query.knownAt &&
      a.validFrom !== null &&
      a.validFrom <= query.effectiveAt
    );
  });
  // Supersession only has effect inside the permitted knowledge/evidence frontier.
  const superseded = new Set(visible.flatMap((a) => a.supersedes));
  const artifacts = visible
    .filter((a) => !superseded.has(a.id))
    .map((a) => {
      const invalidationVisible =
        a.validUntilKnownAt !== null &&
        a.validUntilKnownAt <= query.knownAt &&
        a.validUntilSupportEpisodeIds.every((id) => allowed.has(id));
      return invalidationVisible
        ? a
        : {
            ...a,
            validUntil: null,
            validUntilKnownAt: null,
            validUntilSupportEpisodeIds: [],
          };
    })
    .filter((a) => a.validUntil === null || query.effectiveAt < a.validUntil);
  const usedSupport = new Set(
    artifacts.flatMap((a) => [
      ...a.supportEpisodeIds,
      ...a.validUntilSupportEpisodeIds.filter((id) => allowed.has(id)),
    ])
  );
  return {
    profile: 'trace.graphiti-inspection.v1',
    authority: 'derived-interpretation',
    status:
      projection.derivation.mode === 'unavailable'
        ? 'degraded'
        : 'experimental',
    effectiveAt: query.effectiveAt,
    knownAt: query.knownAt,
    support: {
      ...projection.selected,
      episodes: projection.selected.episodes.filter((e) =>
        usedSupport.has(e.id)
      ),
    },
    artifacts,
    sourceLineages: artifacts.length ? [projection.selected.sourceDigest] : [],
    loss: [
      ...projection.loss,
      'Unknown validity is omitted. Contradictions and ambiguous identities are not silently resolved. Current rights govern historical queries. Projection multiplicity is not independent evidence.',
    ],
  };
}
