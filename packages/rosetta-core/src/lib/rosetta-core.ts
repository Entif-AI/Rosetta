import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
import { makeContentId } from '@entif-ai/rosetta-cid';

export type CoreKind =
  | 'rosetta.run'
  | 'rosetta.action'
  | 'rosetta.toolcall'
  | 'rosetta.observation'
  | 'rosetta.evaluation'
  | 'rosetta.receipt'
  | 'rosetta.tapestry'
  | 'rosetta.form.token'
  | 'rosetta.form.phoneme'
  | 'rosetta.form.image_patch'
  | 'rosetta.form.datetime'
  | 'rosetta.lexeme'
  | 'rosetta.concept'
  | 'rosetta.frame'
  | 'rosetta.lattice_edge'
  | 'rosetta.conjecture'
  | 'rosetta.episteme'
  | 'rosetta.matrix'
  | 'rosetta.policy'
  | 'rosetta.policy.deprecation'
  | 'rosetta.incident'
  | 'rosetta.delta_capsule'
  | 'rosetta.speciation'
  | 'rosetta.axis_translator'
  | 'guard.decision_token'
  | 'source.system_profile'
  | 'source.record'
  | 'source.manifestation'
  | 'source.package'
  | 'source.registry_entry'
  | 'source.fetch_receipt'
  | 'source.normalization_receipt'
  | 'source.identity_resolution_receipt'
  | 'source.evaluation_receipt'
  | 'source.correction_event'
  | 'source.trust_matrix'
  | 'source.canonical_artifact'
  | 'source.ingress_job'
  | string;

export interface TileEnvelope<P = unknown> {
  cid: string;
  kind: CoreKind;
  pack: string;
  version: string;
  parents: string[];
  createdAt: string;
  canonical: string;
  payload: P;
}

export interface TileBuildOptions {
  createdAt?: string;
  pack?: string;
  parents?: string[];
  version?: string;
}

export interface TileIntegrityResult {
  errors: string[];
  expectedCanonical: string;
  expectedCid: string;
  ok: boolean;
}

export interface RunPayload {
  runId: string;
  summary: string;
  tags: string[];
}

export interface ActionPayload {
  actionId: string;
  intent: string;
  runCid: string;
}

export interface ToolCallPayload {
  args: Record<string, JsonValue>;
  tool: string;
  toolCallId: string;
}

export interface ObservationPayload {
  observationId: string;
  signal: string;
  source: string;
  sourceSpans?: SourceSpanRef[];
}

export interface SourceSpanRef {
  endOffset: number;
  sourceManifestationCid: string;
  sourceRecordCid: string;
  startOffset: number;
  textHash: string;
}

export interface EvaluationPayload {
  evaluationId: string;
  summary: string;
  verdict: 'deny' | 'fail' | 'partial' | 'pass' | 'unknown';
}

export interface TapestryPayload {
  dynamicTail: string[];
  requiredScope: string;
  stablePrefix: string[];
  tapestries: string[];
  tenant: string;
  totalTokens: number;
}

function deriveTileBody<P>(kind: CoreKind, payload: P, options: TileBuildOptions): Omit<TileEnvelope<P>, 'cid' | 'canonical' | 'createdAt'> {
  return {
    kind,
    pack: options.pack ?? 'rosetta.core',
    parents: [...(options.parents ?? [])].sort(),
    payload,
    version: options.version ?? '0.1.0'
  };
}

export function buildTile<P>(kind: CoreKind, payload: P, options: TileBuildOptions = {}): TileEnvelope<P> {
  const body = deriveTileBody(kind, payload, options);
  const canonical = canonicalizeJson(body as unknown as JsonValue);

  return {
    ...body,
    canonical,
    cid: makeContentId(canonical),
    createdAt: options.createdAt ?? new Date('2026-04-13T00:00:00.000Z').toISOString()
  };
}

export function verifyTileIntegrity<P>(tile: TileEnvelope<P>): TileIntegrityResult {
  const body = deriveTileBody(tile.kind, tile.payload, {
    pack: tile.pack,
    parents: tile.parents,
    version: tile.version
  });
  const expectedCanonical = canonicalizeJson(body as unknown as JsonValue);
  const expectedCid = makeContentId(expectedCanonical);
  const errors: string[] = [];

  if (tile.canonical !== expectedCanonical) {
    errors.push('Tile canonical representation drifted from payload.');
  }

  if (tile.cid !== expectedCid) {
    errors.push('Tile CID no longer matches canonical payload.');
  }

  return {
    errors,
    expectedCanonical,
    expectedCid,
    ok: errors.length === 0
  };
}

export function createRun(summary: string, tags: string[] = ['bootstrap']): TileEnvelope<RunPayload> {
  return buildTile('rosetta.run', {
    runId: `run.${makeContentId(summary).slice(-12)}`,
    summary,
    tags
  });
}

export function createAction(runCid: string, intent: string): TileEnvelope<ActionPayload> {
  return buildTile(
    'rosetta.action',
    {
      actionId: `action.${makeContentId(intent).slice(-12)}`,
      intent,
      runCid
    },
    { parents: [runCid] }
  );
}

export function createToolCall(tool: string, args: Record<string, JsonValue>, parents: string[] = []): TileEnvelope<ToolCallPayload> {
  return buildTile(
    'rosetta.toolcall',
    {
      args,
      tool,
      toolCallId: `tool.${makeContentId(`${tool}:${canonicalizeJson(args)}`).slice(-12)}`
    },
    { pack: 'rosetta.tools', parents }
  );
}

export function createObservation(source: string, signal: string, parents: string[] = []): TileEnvelope<ObservationPayload> {
  return buildTile(
    'rosetta.observation',
    {
      observationId: `observation.${makeContentId(`${source}:${signal}`).slice(-12)}`,
      signal,
      source
    },
    { parents }
  );
}

export function createSourceObservation(
  source: string,
  signal: string,
  sourceSpans: SourceSpanRef[],
  parents: string[] = []
): TileEnvelope<ObservationPayload> {
  const sourceParents = sourceSpans.flatMap((span) => [span.sourceRecordCid, span.sourceManifestationCid]);

  return buildTile(
    'rosetta.observation',
    {
      observationId: `observation.${makeContentId(`${source}:${signal}:${canonicalizeJson(sourceSpans as unknown as JsonValue)}`).slice(-12)}`,
      signal,
      source,
      sourceSpans
    },
    { parents: [...new Set([...sourceParents, ...parents])] }
  );
}

export function createEvaluation(summary: string, verdict: EvaluationPayload['verdict'], parents: string[] = []): TileEnvelope<EvaluationPayload> {
  return buildTile(
    'rosetta.evaluation',
    {
      evaluationId: `evaluation.${makeContentId(`${summary}:${verdict}`).slice(-12)}`,
      summary,
      verdict
    },
    { parents }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1 — Forms (raw signal → structured token)
// ─────────────────────────────────────────────────────────────────────────────

export interface FormTokenPayload {
  formId: string;
  surface: string;           // exact substring from source
  offset: number;             // byte offset in source
  length: number;             // byte length
  tokenType: 'word' | 'punct' | 'whitespace' | 'symbol' | 'number' | 'emoji';
  observationCid: string;
}

export interface FormPhonemePayload {
  formId: string;
  phoneme: string;
  audioStartMs: number;
  audioEndMs: number;
  confidence: number;
  observationCid: string;
}

export interface FormImagePatchPayload {
  formId: string;
  patchData: string;          // base64 or reference
  bboxX: number;
  bboxY: number;
  bboxW: number;
  bboxH: number;
  featureVector?: number[];
  observationCid: string;
}

export interface FormDatetimePayload {
  formId: string;
  rawText: string;
  parsedIso: string;
  granularity: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
  observationCid: string;
}

export function createFormToken(
  surface: string,
  offset: number,
  length: number,
  tokenType: FormTokenPayload['tokenType'],
  observationCid: string,
  parents: string[] = []
): TileEnvelope<FormTokenPayload> {
  return buildTile(
    'rosetta.form.token',
    {
      formId: `form.token.${makeContentId(`${surface}:${offset}`).slice(-12)}`,
      surface,
      offset,
      length,
      tokenType,
      observationCid
    },
    { parents: [observationCid, ...parents] }
  );
}

export function createFormPhoneme(
  phoneme: string,
  audioStartMs: number,
  audioEndMs: number,
  confidence: number,
  observationCid: string,
  parents: string[] = []
): TileEnvelope<FormPhonemePayload> {
  return buildTile(
    'rosetta.form.phoneme',
    {
      formId: `form.phoneme.${makeContentId(`${phoneme}:${audioStartMs}`).slice(-12)}`,
      phoneme,
      audioStartMs,
      audioEndMs,
      confidence,
      observationCid
    },
    { parents: [observationCid, ...parents] }
  );
}

export function createFormImagePatch(
  patchData: string,
  bboxX: number,
  bboxY: number,
  bboxW: number,
  bboxH: number,
  observationCid: string,
  parents: string[] = []
): TileEnvelope<FormImagePatchPayload> {
  return buildTile(
    'rosetta.form.image_patch',
    {
      formId: `form.img.${makeContentId(patchData.slice(0, 40)).slice(-12)}`,
      patchData,
      bboxX, bboxY, bboxW, bboxH,
      observationCid
    },
    { parents: [observationCid, ...parents] }
  );
}

export function createFormDatetime(
  rawText: string,
  parsedIso: string,
  granularity: FormDatetimePayload['granularity'],
  observationCid: string,
  parents: string[] = []
): TileEnvelope<FormDatetimePayload> {
  return buildTile(
    'rosetta.form.datetime',
    {
      formId: `form.dt.${makeContentId(rawText).slice(-12)}`,
      rawText,
      parsedIso,
      granularity,
      observationCid
    },
    { parents: [observationCid, ...parents] }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2 — Lexemes (language-bound word senses)
// ─────────────────────────────────────────────────────────────────────────────

export interface LexemePayload {
  lexemeId: string;
  lemma: string;                        // canonical form
  pos: 'noun' | 'verb' | 'adj' | 'adv' | 'pron' | 'det' | 'prep' | 'conj' | 'intj' | 'punct';
  language: string;                     // BCP-47 tag, e.g. 'en'
  senses: LexemeSense[];
  formCids: string[];                  // linked Form tiles
}

export interface LexemeSense {
  senseId: string;
  definition: string;
  lexId?: string;                      // external WordNet-style ID (XID anchor)
  weight: number;                       // prior probability of this sense
}

export function createLexeme(
  lemma: string,
  pos: LexemePayload['pos'],
  language: string,
  senses: LexemeSense[],
  formCids: string[],
  parents: string[] = []
): TileEnvelope<LexemePayload> {
  return buildTile(
    'rosetta.lexeme',
    {
      lexemeId: `lex.${language}.${makeContentId(lemma).slice(-12)}`,
      lemma,
      pos,
      language,
      senses,
      formCids
    },
    { parents: [...formCids, ...parents] }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3 — Concepts (language-neutral semantic nodes)
// ─────────────────────────────────────────────────────────────────────────────

export interface ConceptPayload {
  conceptId: string;
  rid?: string;                        // stable Rosetta ID (optional)
  label: string;                       // human-readable canonical label
  namespace: string;
  description?: string;
  xid?: string;                        // external anchor (Wikidata QID, WordNet synset, etc.)
  xidPack?: string;                    // which pack owns the XID
  properties?: Record<string, string>;
}

export function createConcept(
  label: string,
  namespace: string,
  options: {
    rid?: string;
    description?: string;
    xid?: string;
    xidPack?: string;
    properties?: Record<string, string>;
    parents?: string[];
  } = {}
): TileEnvelope<ConceptPayload> {
  const { rid, description, xid, xidPack, properties, parents = [] } = options;
  return buildTile(
    'rosetta.concept',
    {
      conceptId: `concept.${makeContentId(label).slice(-12)}`,
      rid,
      label,
      namespace,
      description,
      xid,
      xidPack,
      properties
    },
    { parents }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3 — Frames (structured semantic context with roles)
// ─────────────────────────────────────────────────────────────────────────────

export interface FrameRole {
  roleName: string;
  required: boolean;
  expectedType?: string;               // concept namespace or RID
  filledBy?: string[];                 // concept CIDs, if filled
  variable?: boolean;                  // true = query variable (unknown at authoring time)
}

export interface FramePayload {
  frameId: string;
  frameType: string;                   // e.g. 'CapitalRelationFrame', 'GreetingFrame', 'QuestionFrame'
  rid?: string;
  roles: FrameRole[];
  description?: string;
  conceptCids: string[];               // concepts involved in this frame
}

export function createFrame(
  frameType: string,
  roles: FrameRole[],
  conceptCids: string[],
  options: {
    rid?: string;
    description?: string;
    parents?: string[];
  } = {}
): TileEnvelope<FramePayload> {
  const { rid, description, parents = [] } = options;
  return buildTile(
    'rosetta.frame',
    {
      frameId: `frame.${makeContentId(frameType).slice(-12)}`,
      frameType,
      rid,
      roles,
      description,
      conceptCids
    },
    { parents: [...conceptCids, ...parents] }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3 — Lattice Edges (typed graph relationships)
// ─────────────────────────────────────────────────────────────────────────────

export type LatticeEdgeFamily =
  | 'semantic'
  | 'temporal'
  | 'provenance'
  | 'causal'
  | 'structural';

export type LatticeEdgeRelation =
  | 'subclass_of' | 'instance_of' | 'part_of'
  | 'specializes' | 'generalizes'
  | 'derived_from' | 'next_in_sequence'
  | 'capital_of' | 'located_in' | 'caused_by'
  | string;                           // extensible

export interface LatticeEdgePayload {
  edgeId: string;
  sourceCid: string;
  targetCid: string;
  relation: LatticeEdgeRelation;
  family: LatticeEdgeFamily;
  bidirectional?: boolean;
  weight?: number;
}

export function createLatticeEdge(
  sourceCid: string,
  targetCid: string,
  relation: LatticeEdgeRelation,
  family: LatticeEdgeFamily,
  options: {
    bidirectional?: boolean;
    weight?: number;
    parents?: string[];
  } = {}
): TileEnvelope<LatticeEdgePayload> {
  const { bidirectional = false, weight = 1.0, parents = [] } = options;
  return buildTile(
    'rosetta.lattice_edge',
    {
      edgeId: `edge.${makeContentId(`${sourceCid}:${relation}:${targetCid}`).slice(-12)}`,
      sourceCid,
      targetCid,
      relation,
      family,
      bidirectional,
      weight
    },
    { parents: [sourceCid, targetCid, ...parents] }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONJECTURES — Ambiguity tracking at every layer
// ─────────────────────────────────────────────────────────────────────────────

export type ConjectureLayer = 'L1_form_lexeme' | 'L2_lexeme_concept' | 'L3_concept_frame';

export interface ConjectureOption {
  targetCid: string;                  // the candidate tile CID
  weight: number;                     // probability or confidence score
  evidence?: string;
}

export interface ConjecturePayload {
  conjectureId: string;
  sourceCid: string;                  // the thing we're interpreting
  layer: ConjectureLayer;
  options: ConjectureOption[];
  method: string;                     // e.g. 'wn_sense_2', 'vector_sim', 'llm_judgment'
  nonReplayable: boolean;
  selectedCid?: string;               // resolved choice (filled after resolution)
}

export function createConjecture(
  sourceCid: string,
  layer: ConjectureLayer,
  options: ConjectureOption[],
  method: string,
  nonReplayable: boolean = false,
  selectedCid?: string,
  parents: string[] = []
): TileEnvelope<ConjecturePayload> {
  return buildTile(
    'rosetta.conjecture',
    {
      conjectureId: `conj.${makeContentId(`${sourceCid}:${layer}:${method}`).slice(-12)}`,
      sourceCid,
      layer,
      options,
      method,
      nonReplayable,
      selectedCid
    },
    { parents: [sourceCid, ...parents] }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EPISTEME — Belief state assessment
// ─────────────────────────────────────────────────────────────────────────────

export type EpistemicMode = 'EMPIRICAL' | 'TESTIMONIAL' | 'REVELATORY' | 'INFERENTIAL' | 'AXIOMATIC';

export interface EpistemePayload {
  epistemeId: string;
  claim: string;                      // the claim being assessed
  mode: EpistemicMode;
  witnessScope?: string;              // who/what can contest this
  contestability: 'high' | 'medium' | 'low' | 'uncountable';
  allowedUse?: string[];
  prohibitedUse?: string[];
  supportingEvidenceCids: string[];
  contradictingEvidenceCids: string[];
  confidence: number;                // 0–1
  confidenceBreakdown?: {
    ethos?: number;
    logos?: number;
    pathos?: number;
    quixote?: number;
  };
}

export function createEpisteme(
  claim: string,
  mode: EpistemicMode,
  supportingEvidenceCids: string[],
  contradictingEvidenceCids: string[],
  confidence: number,
  options: {
    witnessScope?: string;
    contestability?: EpistemePayload['contestability'];
    allowedUse?: string[];
    prohibitedUse?: string[];
    confidenceBreakdown?: EpistemePayload['confidenceBreakdown'];
    parents?: string[];
  } = {}
): TileEnvelope<EpistemePayload> {
  const {
    witnessScope,
    contestability = 'medium',
    allowedUse,
    prohibitedUse,
    confidenceBreakdown,
    parents = []
  } = options;
  return buildTile(
    'rosetta.episteme',
    {
      epistemeId: `episteme.${makeContentId(claim).slice(-12)}`,
      claim,
      mode,
      witnessScope,
      contestability,
      allowedUse,
      prohibitedUse,
      supportingEvidenceCids,
      contradictingEvidenceCids,
      confidence,
      confidenceBreakdown
    },
    { parents: [...supportingEvidenceCids, ...contradictingEvidenceCids, ...parents] }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MATRIX — ELPQ evaluation axes
// ─────────────────────────────────────────────────────────────────────────────

export interface AxisScore {
  value: number;                      // raw score
  errorBars?: [number, number];       // ± uncertainty
  method?: string;
}

export interface MatrixPayload {
  matrixId: string;
  subjectCid: string;                 // what is being evaluated
  ethos?: AxisScore;
  logos?: AxisScore;
  pathos?: AxisScore;
  quixote?: AxisScore;
  overall?: number;                   // composite score if desired
  axisVersion: string;                // which axis registry version was used
}

export function createMatrix(
  subjectCid: string,
  scores: {
    ethos?: number | AxisScore;
    logos?: number | AxisScore;
    pathos?: number | AxisScore;
    quixote?: number | AxisScore;
    overall?: number;
  },
  axisVersion: string = '1.0.0',
  parents: string[] = []
): TileEnvelope<MatrixPayload> {
  const normalize = (s: number | AxisScore | undefined): AxisScore | undefined => {
    if (s === undefined) return undefined;
    if (typeof s === 'number') return { value: s };
    return s;
  };
  return buildTile(
    'rosetta.matrix',
    {
      matrixId: `matrix.${makeContentId(subjectCid).slice(-12)}`,
      subjectCid,
      ethos: normalize(scores.ethos),
      logos: normalize(scores.logos),
      pathos: normalize(scores.pathos),
      quixote: normalize(scores.quixote),
      overall: scores.overall,
      axisVersion
    },
    { parents: [subjectCid, ...parents] }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POLICY — Governance rules
// ─────────────────────────────────────────────────────────────────────────────

export type PolicyEffect = 'allow' | 'deny' | 'audit' | 'warn';

export interface PolicyCondition {
  field: string;                      // dot-notation path, e.g. 'payload.verdict'
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'in' | 'contains';
  value: unknown;
}

export interface PolicyPayload {
  policyId: string;
  name: string;
  description?: string;
  effect: PolicyEffect;
  conditions: PolicyCondition[];
  appliesTo: string[];                // tile kinds or operations this applies to
  deprecation?: {
    deprecatedAt: string;
    supersedes?: string;
    migrationNote?: string;
  };
}

export function createPolicy(
  name: string,
  effect: PolicyEffect,
  conditions: PolicyCondition[],
  appliesTo: string[],
  options: {
    description?: string;
    deprecation?: PolicyPayload['deprecation'];
    parents?: string[];
  } = {}
): TileEnvelope<PolicyPayload> {
  const { description, deprecation, parents = [] } = options;
  return buildTile(
    deprecation ? 'rosetta.policy.deprecation' : 'rosetta.policy',
    {
      policyId: `policy.${makeContentId(name).slice(-12)}`,
      name,
      description,
      effect,
      conditions,
      appliesTo,
      deprecation
    },
    { parents }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENT — Sealed critical event envelope
// ─────────────────────────────────────────────────────────────────────────────

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentPayload {
  incidentId: string;
  severity: IncidentSeverity;
  title: string;
  involvedRunCids: string[];
  encryptedBlobRef: string;           // reference to where encrypted content lives
  sealParticipants: string[];        // keys needed to unseal (quorum)
  quorumThreshold: number;            // how many participants needed
  occurredAt: string;
}

export function createIncident(
  title: string,
  severity: IncidentSeverity,
  involvedRunCids: string[],
  encryptedBlobRef: string,
  sealParticipants: string[],
  occurredAt: string,
  quorumThreshold?: number,
  parents: string[] = []
): TileEnvelope<IncidentPayload> {
  const threshold = quorumThreshold ?? Math.ceil(sealParticipants.length * 0.6);
  if (
    !encryptedBlobRef.trim() ||
    sealParticipants.length === 0 ||
    sealParticipants.some((participant) => !participant.trim()) ||
    new Set(sealParticipants).size !== sealParticipants.length ||
    !Number.isSafeInteger(threshold) ||
    threshold < 1 ||
    threshold > sealParticipants.length
  ) {
    throw new Error('Invalid Core Incident seal declaration.');
  }
  return buildTile(
    'rosetta.incident',
    {
      incidentId: `incident.${makeContentId(title).slice(-12)}`,
      title,
      severity,
      involvedRunCids,
      encryptedBlobRef,
      sealParticipants,
      quorumThreshold: threshold,
      occurredAt
    },
    { parents: [...involvedRunCids, ...parents] }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELTA CAPSULE — Change propagation bundle
// ─────────────────────────────────────────────────────────────────────────────

export interface DeltaCapsulePayload {
  deltaId: string;
  description: string;
  prerequisites?: string[];           // prior delta IDs required before applying this
  tileCids: string[];                 // all tiles in this change set
  migrationSteps?: string[];         // human-readable migration instructions
  supersedes?: string;                // prior delta being replaced
  appliesTo: string[];               // profiles/namespaces this applies to
}

export function createDeltaCapsule(
  description: string,
  tileCids: string[],
  appliesTo: string[],
  options: {
    prerequisites?: string[];
    migrationSteps?: string[];
    supersedes?: string;
    parents?: string[];
  } = {}
): TileEnvelope<DeltaCapsulePayload> {
  const { prerequisites, migrationSteps, supersedes, parents = [] } = options;
  return buildTile(
    'rosetta.delta_capsule',
    {
      deltaId: `delta.${makeContentId(description).slice(-12)}`,
      description,
      prerequisites,
      tileCids,
      migrationSteps,
      supersedes,
      appliesTo
    },
    { parents: [...tileCids, ...parents] }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIATION — New concept proposal (governance)
// ─────────────────────────────────────────────────────────────────────────────

export interface SpeciationPayload {
  proposalId: string;
  proposedKind: string;               // the new tile kind or extension being proposed
  rationale: string;
  proposedBy: string;
  affectedNamespaces: string[];
  priorArt?: string[];               // existing concepts this builds on
}

export function createSpeciation(
  proposedKind: string,
  rationale: string,
  proposedBy: string,
  affectedNamespaces: string[],
  priorArt: string[] = [],
  parents: string[] = []
): TileEnvelope<SpeciationPayload> {
  return buildTile(
    'rosetta.speciation',
    {
      proposalId: `speciation.${makeContentId(proposedKind).slice(-12)}`,
      proposedKind,
      rationale,
      proposedBy,
      affectedNamespaces,
      priorArt
    },
    { parents }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AXIS TRANSLATOR — Rubric/axis evolution
// ─────────────────────────────────────────────────────────────────────────────

export interface AxisMapping {
  fromAxis: string;
  toAxis: string;
  formula: string;                   // e.g. 'x * 0.8 + 0.1'
}

export interface AxisTranslatorPayload {
  translatorId: string;
  fromVersion: string;
  toVersion: string;
  mappings: AxisMapping[];
  applicability: string[];            // which tile kinds or namespaces this applies to
}

export function createAxisTranslator(
  fromVersion: string,
  toVersion: string,
  mappings: AxisMapping[],
  applicability: string[],
  parents: string[] = []
): TileEnvelope<AxisTranslatorPayload> {
  return buildTile(
    'rosetta.axis_translator',
    {
      translatorId: `translator.${makeContentId(`${fromVersion}:${toVersion}`).slice(-12)}`,
      fromVersion,
      toVersion,
      mappings,
      applicability
    },
    { parents }
  );
}
