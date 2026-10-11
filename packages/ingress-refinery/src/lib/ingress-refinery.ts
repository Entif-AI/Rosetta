import { buildTextFingerprints, canonicalizeJson, normalizePlainText, type JsonValue } from '@entif-ai/rosetta-canon';
import { makeContentId, sha256Hex } from '@entif-ai/rosetta-cid';
import {
  buildTile,
  createAction,
  createEvaluation,
  createObservation,
  createPolicy,
  createRun,
  createSourceObservation,
  createToolCall,
  type ObservationPayload,
  type SourceSpanRef,
  type TileEnvelope
} from '@entif-ai/rosetta-core';
import { evaluateGuard, type GuardRule } from '@entif-ai/rosetta-guard';
import {
  buildReceiptBundle,
  createReceipt,
  createSigningKeyPair,
  digestTile,
  signReceiptEd25519,
  verifyReceiptBundle,
  type ReceiptPayload
} from '@entif-ai/rosetta-receipts';
import { emitConformanceBundle } from '@entif-ai/rosetta-schemas';
import { InMemoryTileStore } from '@entif-ai/rosetta-store';
import { compileReceiptBundleTapestry } from '@entif-ai/rosetta-tapestry';
import {
  createBoundedListingSnapshotPackageTile,
  createSourceRecordTile,
  createSourceManifestationTile,
  createSourceSystemProfileTile,
  createTrustMatrixTile,
  type RawEvidenceRef,
  type SourceChronology,
  type SourceEpisode,
  type SourceFamily,
  type SourceManifestation,
  type SourcePackage,
  type SourceRecord,
  type SourceSystemProfile,
  type TrustMatrix
} from '@entif-ai/source-substrate';
import { bootstrapSourceProfiles } from '@entif-ai/source-registry';

export interface IngressJob {
  jobId: string;
  sourcePackageCid?: string;
  sourceRecordCid: string;
  sourceManifestationCid: string;
  parserProfile: string;
  policyRefs: string[];
  mode: 'parse-only';
  status: 'evaluated' | 'normalized' | 'parsed';
}

export interface SourceEpisodeRequest {
  chronology: SourceChronology;
  locator?: string;
  rawEvidenceRefs: RawEvidenceRef[];
  requestedMode?: 'parse-only' | 'side-effect';
  rightsScope: string[];
  sourcePackageCid?: string;
}

export interface FetchReceiptPayload {
  requestedLocator: string;
  resolvedLocator: string;
  fetchedAt: string;
  method: string;
  snapshotHash: string;
  sourceManifestationCid: string;
  sourcePackageCid?: string;
}

export interface NormalizationReceiptPayload {
  canonicalTextHash: string;
  contentFingerprint: string;
  normalizationProfile: string;
  parserProfile: string;
  revisionFingerprint: string;
  sourceManifestationCid: string;
  sourcePackageCid?: string;
}

export interface EvaluationReceiptPayload {
  subjectCid: string;
  trustMatrixCid: string;
  evaluatedAt: string;
  policyRefs: string[];
  sourcePackageCid?: string;
}

export interface CanonicalArtifact {
  artifactId: string;
  sourceRecordCid: string;
  sourceManifestationCid: string;
  byteHash: string;
  contentFingerprint: string;
  normalizedText: string;
  normalizedTextHash: string;
  pidFamily: string[];
  rightsScopes: string[];
  sourcePackageCid?: string;
  provenanceRefs: {
    evaluationReceiptCid: string;
    fetchReceiptCid: string;
    normalizationReceiptCid: string;
    sourcePackageCid?: string;
  };
  dedupe: {
    byteIdentityKey: string;
    conceptualClusterKey: string;
    manifestationKey: string;
    recordFamilyKey: string;
  };
  revisionFingerprint: string;
  revisionParentCid?: string;
}

export interface DerivedTextArtifact {
  artifactId: string;
  derivationKind: 'extract' | 'summary';
  payloadText: string;
  sourceObservationCid: string;
  sourceSpans: SourceSpanRef[];
}

export interface BootstrapDemoSnapshot {
  action: TileEnvelope;
  canonicalArtifact: TileEnvelope<CanonicalArtifact>;
  conformanceBundle: ReturnType<typeof emitConformanceBundle>;
  evaluation: TileEnvelope;
  evaluationReceipt: TileEnvelope<EvaluationReceiptPayload>;
  fetchReceipt: TileEnvelope<FetchReceiptPayload>;
  manifestation: TileEnvelope<SourceManifestation>;
  normalizationReceipt: TileEnvelope<NormalizationReceiptPayload>;
  observation: TileEnvelope;
  policyTile: TileEnvelope;
  receipt: TileEnvelope<ReceiptPayload>;
  receiptBundle: ReturnType<typeof buildReceiptBundle>;
  record: TileEnvelope<SourceRecord>;
  run: TileEnvelope;
  signedReceipt: ReturnType<typeof signReceiptEd25519>;
  sourceSystem: TileEnvelope;
  tapestry: TileEnvelope;
  toolCall: TileEnvelope;
  trustMatrix: TileEnvelope<TrustMatrix>;
}

export interface SourceObservationArtifacts {
  canonicalArtifact: TileEnvelope<CanonicalArtifact>;
  derivedArtifacts: Array<TileEnvelope<DerivedTextArtifact>>;
  evaluationReceipt: TileEnvelope<EvaluationReceiptPayload>;
  fetchReceipt: TileEnvelope<FetchReceiptPayload>;
  normalizationReceipt: TileEnvelope<NormalizationReceiptPayload>;
  observation: TileEnvelope<ObservationPayload>;
  transformReceipt: TileEnvelope<ReceiptPayload>;
  transformReceiptBundle: ReturnType<typeof buildReceiptBundle>;
  trustMatrix: TileEnvelope<TrustMatrix>;
}

export interface RefineryLineageOptions {
  fetchedAt?: string;
  fetchMethod?: string;
  requestedLocator?: string;
  resolvedLocator?: string;
  sourcePackageCid?: string;
}

export interface GitHubTreeEntry {
  path: string;
  sha: string;
  size?: number;
  type: 'blob' | 'tree';
}

export type GitHubAcquisitionMode = 'fixture' | 'live' | 'local';

export interface GitHubTextAcquisitionRequest {
  acquisitionMode: GitHubAcquisitionMode;
  blobSha: string;
  capturedAt: string;
  incompleteSearch?: boolean;
  maxItems?: number;
  mediaType: 'text/markdown' | 'text/plain';
  owner: string;
  path: string;
  ref: string;
  repo: string;
  text: string;
  treeEntries: GitHubTreeEntry[];
  treeSha: string;
  truncated?: boolean;
}

export interface GitHubTextAcquisitionResult {
  acquisitionMode: GitHubAcquisitionMode;
  canonicalArtifact: TileEnvelope<CanonicalArtifact>;
  episode: TileEnvelope<SourceEpisode>;
  evaluationReceipt: TileEnvelope<EvaluationReceiptPayload>;
  fetchReceipt: TileEnvelope<FetchReceiptPayload>;
  ingressJob: TileEnvelope<IngressJob>;
  listingSnapshot: TileEnvelope<SourcePackage>;
  manifestation: TileEnvelope<SourceManifestation>;
  normalizationReceipt: TileEnvelope<NormalizationReceiptPayload>;
  record: TileEnvelope<SourceRecord>;
  sourceSystem: TileEnvelope<SourceSystemProfile>;
  trustMatrix: TileEnvelope<TrustMatrix>;
}

const SUPPORTED_GITHUB_TEXT_MEDIA_TYPES = new Set<string>(['text/markdown', 'text/plain']);

export type BootstrapGateStatus = 'block' | 'deny' | 'fail' | 'pass';

export type BootstrapGateStepId =
  | 'canonicalize-input'
  | 'compute-cid'
  | 'guard-decision'
  | 'execute-builtin-echo'
  | 'mint-observation'
  | 'emit-receipt'
  | 'compile-closure'
  | 'verify-chain';

export interface BootstrapGateStepSnapshot {
  artifactCid?: string;
  errors: string[];
  id: BootstrapGateStepId;
  status: BootstrapGateStatus;
}

export interface BootstrapGateOptions {
  additionalPolicyCids?: string[];
  guardRules?: GuardRule[];
  input?: JsonValue;
  maxEchoBytes?: number;
}

export interface BootstrapGateInputPayload {
  canonicalInput: string;
  input: JsonValue;
  inputCid: string;
  purpose: 'bootstrap-gate.builtin-echo';
}

export interface BootstrapGateSnapshot {
  canonicalInput: string;
  closureArtifact: {
    cid?: string;
    exists: boolean;
    kind: 'rosetta.tapestry';
  };
  echoOutput?: string;
  errors: string[];
  guard: {
    decisionCid: string;
    effect: 'allow' | 'deny';
    policyIds: string[];
    reason: string;
  };
  guardDecision: ReturnType<typeof evaluateGuard>;
  inputArtifact: TileEnvelope<BootstrapGateInputPayload>;
  inputCid: string;
  policy: ReturnType<typeof createPolicy>;
  receipt?: TileEnvelope<ReceiptPayload>;
  receiptBundle: ReturnType<typeof buildReceiptBundle>;
  receiptBundleVerification: {
    errors: string[];
    ok: boolean;
  };
  status: BootstrapGateStatus;
  steps: BootstrapGateStepSnapshot[];
  tapestry?: ReturnType<typeof compileReceiptBundleTapestry>;
  toolCall?: ReturnType<typeof createToolCall>;
  observation?: TileEnvelope<ObservationPayload>;
  verdict: BootstrapGateStatus;
}

function defaultTrustAxes() {
  return {
    affiliation: 0.8,
    artifactIntegrity: 0.9,
    authorship: 0.7,
    correctionResponsiveness: 0.7,
    corroborationDensity: 0.6,
    invalidationSensitivity: 0.5,
    licenseClarity: 0.8,
    manipulationRisk: 0.2,
    metadataRichness: 0.9,
    novelty: 0.4,
    rarity: 0.3,
    recordIdentity: 0.85,
    reviewRigor: 0.6,
    stewardship: 0.85
  };
}

const DEFAULT_BOOTSTRAP_GATE_INPUT: JsonValue = {
  message: 'Bootstrap Green requires guarded builtin.echo receipt closure.',
  tool: 'builtin.echo'
};

function emptyBlockedReceiptBundle(inputCid: string): ReturnType<typeof buildReceiptBundle> {
  return {
    bundleId: `bundle.${inputCid.slice(-12)}.blocked`,
    closureCids: [],
    evidenceCids: [],
    policyCids: [],
    receiptCid: '',
    subjectCids: []
  };
}

function blockedSteps(ids: BootstrapGateStepId[], error: string): BootstrapGateStepSnapshot[] {
  return ids.map((id) => ({
    errors: [error],
    id,
    status: 'block'
  }));
}

export function buildBootstrapGateSnapshot(options: BootstrapGateOptions = {}): BootstrapGateSnapshot {
  const input = options.input ?? DEFAULT_BOOTSTRAP_GATE_INPUT;
  const canonicalInput = canonicalizeJson(input);
  const inputCid = makeContentId(canonicalInput);
  const inputArtifact = buildTile<BootstrapGateInputPayload>(
    'rosetta.bootstrap.input',
    {
      canonicalInput,
      input,
      inputCid,
      purpose: 'bootstrap-gate.builtin-echo'
    },
    { pack: 'bootstrap.gate' }
  );
  const policy = createPolicy(
    'bootstrap builtin.echo no-side-effect gate',
    'allow',
    [
      { field: 'action', operator: 'eq', value: 'builtin.echo' },
      { field: 'sideEffect', operator: 'eq', value: false }
    ],
    ['builtin.echo']
  );
  const guardDecision = evaluateGuard(
    {
      action: 'builtin.echo',
      mode: 'parse-only',
      resource: 'builtin://echo',
      sideEffect: false
    },
    options.guardRules ?? [
      {
        actionPattern: 'builtin.echo',
        effect: 'allow',
        id: policy.payload.policyId,
        mode: 'parse-only',
        resourcePattern: 'builtin://echo'
      }
    ]
  );
  const guard = {
    decisionCid: guardDecision.cid,
    effect: guardDecision.payload.effect,
    policyIds: guardDecision.payload.policyIds,
    reason: guardDecision.payload.reason
  };
  const guardPolicyBacked = guard.effect !== 'allow' || guard.policyIds.includes(policy.payload.policyId);
  const guardPolicyError = 'Guard allow decision is not backed by the bootstrap policy artifact.';
  const initialSteps: BootstrapGateStepSnapshot[] = [
    { artifactCid: inputArtifact.cid, errors: [], id: 'canonicalize-input', status: 'pass' },
    { artifactCid: inputCid, errors: [], id: 'compute-cid', status: 'pass' },
    {
      artifactCid: guardDecision.cid,
      errors:
        guard.effect === 'deny'
          ? [`Guard denied builtin.echo: ${guard.reason}`]
          : guardPolicyBacked
            ? []
            : [guardPolicyError],
      id: 'guard-decision',
      status: guard.effect === 'deny' ? 'deny' : guardPolicyBacked ? 'pass' : 'block'
    }
  ];

  if (guard.effect !== 'allow') {
    const errors = [`Guard denied builtin.echo: ${guard.reason}`];

    return {
      canonicalInput,
      closureArtifact: { exists: false, kind: 'rosetta.tapestry' },
      errors,
      guard,
      guardDecision,
      inputArtifact,
      inputCid,
      policy,
      receiptBundle: emptyBlockedReceiptBundle(inputCid),
      receiptBundleVerification: { errors, ok: false },
      status: 'deny',
      steps: [
        ...initialSteps,
        ...blockedSteps(
          ['execute-builtin-echo', 'mint-observation', 'emit-receipt', 'compile-closure', 'verify-chain'],
          'Guard denied builtin.echo before execution.'
        )
      ],
      verdict: 'deny'
    };
  }

  if (!guardPolicyBacked) {
    const errors = [guardPolicyError];

    return {
      canonicalInput,
      closureArtifact: { exists: false, kind: 'rosetta.tapestry' },
      errors,
      guard,
      guardDecision,
      inputArtifact,
      inputCid,
      policy,
      receiptBundle: emptyBlockedReceiptBundle(inputCid),
      receiptBundleVerification: { errors, ok: false },
      status: 'block',
      steps: [
        ...initialSteps,
        ...blockedSteps(
          ['execute-builtin-echo', 'mint-observation', 'emit-receipt', 'compile-closure', 'verify-chain'],
          guardPolicyError
        )
      ],
      verdict: 'block'
    };
  }

  const maxEchoBytes = options.maxEchoBytes ?? 4096;
  if (Buffer.byteLength(canonicalInput, 'utf8') > maxEchoBytes) {
    const errors = [`builtin.echo input exceeds ${maxEchoBytes} byte bound.`];

    return {
      canonicalInput,
      closureArtifact: { exists: false, kind: 'rosetta.tapestry' },
      errors,
      guard,
      guardDecision,
      inputArtifact,
      inputCid,
      policy,
      receiptBundle: emptyBlockedReceiptBundle(inputCid),
      receiptBundleVerification: { errors, ok: false },
      status: 'fail',
      steps: [
        ...initialSteps,
        { errors, id: 'execute-builtin-echo', status: 'fail' },
        ...blockedSteps(['mint-observation', 'emit-receipt', 'compile-closure', 'verify-chain'], 'builtin.echo did not execute.')
      ],
      verdict: 'fail'
    };
  }

  const toolCall = createToolCall(
    'builtin.echo',
    {
      canonicalInput,
      inputCid,
      maxBytes: maxEchoBytes
    },
    [inputArtifact.cid, guardDecision.cid]
  );
  const echoOutput = canonicalInput;
  const observation = createObservation('builtin.echo', echoOutput, [toolCall.cid, inputArtifact.cid]);
  const evaluation = createEvaluation('builtin.echo output matches canonical input under allow guard.', 'pass', [
    guardDecision.cid,
    observation.cid
  ]);
  const receipt = createReceipt({
    claims: [
      {
        claimType: 'rrp:claim.bootstrap-gate.guarded-echo',
        confidence: 1,
        evidence: [{ cid: guardDecision.cid }, { cid: toolCall.cid }, { cid: observation.cid }, { cid: evaluation.cid }],
        statement: 'Guarded builtin.echo executed without side effects and emitted the canonical input.',
        verdict: 'pass'
      }
    ],
    digests: [
      digestTile(inputArtifact, 'bootstrap-gate.input'),
      digestTile(guardDecision, 'bootstrap-gate.guard'),
      digestTile(observation, 'bootstrap-gate.observation')
    ],
    policyRefs: [policy.cid, ...(options.additionalPolicyCids ?? [])],
    receiptType: 'rrp:bootstrap-gate.builtin-echo',
    subjects: [
      { cid: inputArtifact.cid, role: 'rrp:subject.canonical-input' },
      { cid: observation.cid, role: 'rrp:subject.echo-observation' }
    ]
  });
  const receiptBundle = buildReceiptBundle(receipt);
  const tapestry = compileReceiptBundleTapestry(
    receipt.cid,
    receiptBundle.subjectCids,
    receiptBundle.evidenceCids,
    receiptBundle.policyCids
  );
  const store = new InMemoryTileStore();

  const closureTiles: TileEnvelope[] = [inputArtifact, policy, guardDecision, toolCall, observation, evaluation, receipt, tapestry];
  closureTiles.forEach((tile) => store.put(tile));

  const receiptBundleVerification = verifyReceiptBundle(receiptBundle, store);
  const closureArtifact = {
    cid: tapestry.cid,
    exists: store.has(tapestry.cid),
    kind: 'rosetta.tapestry' as const
  };
  const errors = [
    ...(guard.effect === 'allow' ? [] : [`Guard denied builtin.echo: ${guard.reason}`]),
    ...(echoOutput === canonicalInput ? [] : ['builtin.echo output drifted from canonical input.']),
    ...receiptBundleVerification.errors,
    ...(closureArtifact.exists ? [] : [`Missing closure artifact: ${tapestry.cid}`])
  ];
  const status: BootstrapGateStatus = errors.length === 0 ? 'pass' : 'block';

  return {
    canonicalInput,
    closureArtifact,
    echoOutput,
    errors,
    guard,
    guardDecision,
    inputArtifact,
    inputCid,
    observation,
    policy,
    receipt,
    receiptBundle,
    receiptBundleVerification,
    status,
    steps: [
      ...initialSteps,
      { artifactCid: toolCall.cid, errors: [], id: 'execute-builtin-echo', status: 'pass' },
      { artifactCid: observation.cid, errors: [], id: 'mint-observation', status: 'pass' },
      { artifactCid: receipt.cid, errors: [], id: 'emit-receipt', status: 'pass' },
      { artifactCid: tapestry.cid, errors: [], id: 'compile-closure', status: 'pass' },
      { artifactCid: tapestry.cid, errors, id: 'verify-chain', status }
    ],
    tapestry,
    toolCall,
    verdict: status
  };
}

export function createIngressJob(
  sourceRecordCid: string,
  sourceManifestationCid: string,
  lineage: RefineryLineageOptions = {}
): TileEnvelope<IngressJob> {
  return buildTile(
    'source.ingress_job',
    {
      jobId: `job.${sourceRecordCid.slice(-8)}.${sourceManifestationCid.slice(-8)}`,
      mode: 'parse-only',
      parserProfile: 'text/plain@v1',
      policyRefs: ['policy.parse-only.default'],
      sourceManifestationCid,
      ...(lineage.sourcePackageCid ? { sourcePackageCid: lineage.sourcePackageCid } : {}),
      sourceRecordCid,
      status: 'parsed'
    },
    {
      pack: 'ingress-refinery',
      parents: [sourceRecordCid, sourceManifestationCid, ...(lineage.sourcePackageCid ? [lineage.sourcePackageCid] : [])]
    }
  );
}

function classifySourceFamily(record: TileEnvelope<SourceRecord>, manifestation: TileEnvelope<SourceManifestation>): {
  confidence: number;
  family: SourceFamily;
  reasons: string[];
} {
  const recordType = record.payload.recordType.toLowerCase();
  const sourceSystemId = record.payload.sourceSystemId.toLowerCase();
  const metadataText = JSON.stringify(record.payload.metadataBlob).toLowerCase();
  const structureProfile = manifestation.payload.structureProfile.toLowerCase();

  if (sourceSystemId === 'github' && recordType === 'github-issue') {
    return {
      confidence: 1,
      family: 'github-issue',
      reasons: ['The admitted source record is explicitly a GitHub issue REST object, not a Git blob.']
    };
  }

  if (recordType.includes('chat') || metadataText.includes('chatgpt') || structureProfile.includes('chat')) {
    return {
      confidence: 0.95,
      family: 'chat-transcript',
      reasons: ['Record or manifestation metadata matched chat transcript signals.']
    };
  }

  if (sourceSystemId === 'arxiv' || recordType.includes('arxiv') || metadataText.includes('arxiv')) {
    return {
      confidence: 0.9,
      family: 'arxiv-paper',
      reasons: ['Record metadata matched arXiv paper signals.']
    };
  }

  if (sourceSystemId === 'github' || recordType.includes('github') || metadataText.includes('github')) {
    return {
      confidence: 0.85,
      family: 'github-text',
      reasons: ['Record metadata matched GitHub text signals.']
    };
  }

  return {
    confidence: 0.1,
    family: 'unresolved',
    reasons: ['No supported source-family classifier matched.']
  };
}

export function createParseOnlySourceEpisode(
  record: TileEnvelope<SourceRecord>,
  manifestation: TileEnvelope<SourceManifestation>,
  request: SourceEpisodeRequest
): TileEnvelope<SourceEpisode> {
  if (request.requestedMode && request.requestedMode !== 'parse-only') {
    throw new Error('Source episode creation is parse-only; side-effect ingest modes are not allowed.');
  }

  const classification = classifySourceFamily(record, manifestation);
  const locator = request.locator ?? manifestation.payload.fetchableUrl ?? record.payload.stableLocators[0] ?? 'local://unresolved';
  const parents = [record.cid, manifestation.cid, ...(request.sourcePackageCid ? [request.sourcePackageCid] : [])];

  return buildTile(
    'source.episode',
    {
      chronology: request.chronology,
      classification: {
        confidence: classification.confidence,
        reasons: classification.reasons
      },
      episodeId: `episode.${classification.family}.${record.cid.slice(-8)}.${manifestation.cid.slice(-8)}`,
      family: classification.family,
      locator,
      mode: 'parse-only',
      rawEvidenceRefs: request.rawEvidenceRefs,
      rightsScope: request.rightsScope,
      sourceManifestationCid: manifestation.cid,
      ...(request.sourcePackageCid ? { sourcePackageCid: request.sourcePackageCid } : {}),
      sourceRecordCid: record.cid
    },
    { pack: 'source-substrate', parents }
  );
}

export function refineTextArtifact(
  record: TileEnvelope<SourceRecord>,
  manifestation: TileEnvelope<SourceManifestation>,
  rawText: string,
  policyRefs: string[] = ['policy.parse-only.default'],
  lineage: RefineryLineageOptions = {}
): {
  canonicalArtifact: TileEnvelope<CanonicalArtifact>;
  evaluationReceipt: TileEnvelope<EvaluationReceiptPayload>;
  fetchReceipt: TileEnvelope<FetchReceiptPayload>;
  normalizationReceipt: TileEnvelope<NormalizationReceiptPayload>;
  trustMatrix: TileEnvelope<TrustMatrix>;
} {
  const fingerprints = buildTextFingerprints(rawText);
  const normalizedText = fingerprints.normalizedText;
  const byteHash = sha256Hex(rawText);
  const normalizedTextHash = fingerprints.contentFingerprint;
  const lineageParents = lineage.sourcePackageCid ? [lineage.sourcePackageCid] : [];
  const fetchReceipt = buildTile(
    'source.fetch_receipt',
    {
      fetchedAt: lineage.fetchedAt ?? new Date('2026-04-13T00:15:00.000Z').toISOString(),
      method: lineage.fetchMethod ?? 'bootstrap-import',
      requestedLocator: lineage.requestedLocator ?? manifestation.payload.fetchableUrl ?? record.payload.stableLocators[0] ?? 'local://unknown',
      resolvedLocator: lineage.resolvedLocator ?? manifestation.payload.fetchableUrl ?? record.payload.stableLocators[0] ?? 'local://unknown',
      snapshotHash: byteHash,
      sourceManifestationCid: manifestation.cid,
      ...(lineage.sourcePackageCid ? { sourcePackageCid: lineage.sourcePackageCid } : {})
    },
    { pack: 'ingress-refinery', parents: [manifestation.cid, ...lineageParents] }
  );
  const normalizationReceipt = buildTile(
    'source.normalization_receipt',
    {
      canonicalTextHash: normalizedTextHash,
      contentFingerprint: fingerprints.contentFingerprint,
      normalizationProfile: fingerprints.normalizationProfile,
      parserProfile: 'text/plain@v1',
      revisionFingerprint: fingerprints.revisionFingerprint,
      sourceManifestationCid: manifestation.cid,
      ...(lineage.sourcePackageCid ? { sourcePackageCid: lineage.sourcePackageCid } : {})
    },
    { pack: 'ingress-refinery', parents: [fetchReceipt.cid, ...lineageParents] }
  );
  const trustMatrix = createTrustMatrixTile(
    {
      axes: defaultTrustAxes(),
      notes: ['Trust remains multi-axis; repository confidence is not authorship proof.'],
      subjectCid: manifestation.cid,
      trustClass: 'repository'
    },
    [record.cid, manifestation.cid]
  );
  const evaluationReceipt = buildTile(
    'source.evaluation_receipt',
    {
      evaluatedAt: new Date('2026-04-13T00:20:00.000Z').toISOString(),
      policyRefs,
      subjectCid: manifestation.cid,
      ...(lineage.sourcePackageCid ? { sourcePackageCid: lineage.sourcePackageCid } : {}),
      trustMatrixCid: trustMatrix.cid
    },
    { pack: 'ingress-refinery', parents: [trustMatrix.cid, ...lineageParents] }
  );
  const identifiers = Object.values(record.payload.metadataBlob)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === 'string' && /^(10\.|orcid:|ror:|swh:)/u.test(value));

  const canonicalArtifact = buildTile(
    'source.canonical_artifact',
    {
      artifactId: `artifact.${manifestation.payload.manifestationId}`,
      byteHash,
      contentFingerprint: fingerprints.contentFingerprint,
      dedupe: {
        byteIdentityKey: byteHash,
        conceptualClusterKey: normalizePlainText(String(record.payload.metadataBlob.title ?? record.payload.recordLocalId)).toLowerCase(),
        manifestationKey: sha256Hex(`${record.cid}:${manifestation.payload.manifestationKind}:${manifestation.payload.mediaType}`),
        recordFamilyKey: sha256Hex(`${record.payload.sourceSystemId}:${record.payload.recordLocalId}`)
      },
      normalizedText,
      normalizedTextHash,
      pidFamily: identifiers,
      provenanceRefs: {
        evaluationReceiptCid: evaluationReceipt.cid,
        fetchReceiptCid: fetchReceipt.cid,
        normalizationReceiptCid: normalizationReceipt.cid,
        ...(lineage.sourcePackageCid ? { sourcePackageCid: lineage.sourcePackageCid } : {})
      },
      rightsScopes: manifestation.payload.accessRequirements,
      revisionFingerprint: fingerprints.revisionFingerprint,
      sourceManifestationCid: manifestation.cid,
      ...(lineage.sourcePackageCid ? { sourcePackageCid: lineage.sourcePackageCid } : {}),
      sourceRecordCid: record.cid
    },
    {
      pack: 'ingress-refinery',
      parents: [fetchReceipt.cid, normalizationReceipt.cid, evaluationReceipt.cid, ...lineageParents]
    }
  );

  return {
    canonicalArtifact,
    evaluationReceipt,
    fetchReceipt,
    normalizationReceipt,
    trustMatrix
  };
}

function githubPathUrlSegment(path: string): string {
  return path
    .split('/')
    .filter((part) => part.length > 0)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function githubRootPath(path: string): string {
  const parts = path.split('/').filter((part) => part.length > 0);
  parts.pop();
  return parts.join('/');
}

function assertRequiredGitHubTextRequest(request: GitHubTextAcquisitionRequest): void {
  for (const field of ['blobSha', 'capturedAt', 'owner', 'path', 'ref', 'repo', 'treeSha'] as const) {
    if (request[field].trim().length === 0) {
      throw new Error(`GitHub parse-only acquisition requires ${field}.`);
    }
  }
}

export function acquireGitHubTextThroughRefinery(request: GitHubTextAcquisitionRequest): GitHubTextAcquisitionResult {
  assertRequiredGitHubTextRequest(request);

  const incompleteSearch = request.incompleteSearch === true;
  const truncated = request.truncated === true;

  if (truncated) {
    throw new Error('Refusing truncated GitHub listing before item fetch.');
  }
  if (incompleteSearch) {
    throw new Error('Refusing incomplete GitHub listing before item fetch.');
  }
  if (request.maxItems !== undefined && request.treeEntries.length > request.maxItems) {
    throw new Error('Refusing over-bounded GitHub listing before item fetch.');
  }
  if (!SUPPORTED_GITHUB_TEXT_MEDIA_TYPES.has(request.mediaType)) {
    throw new Error(`Unsupported GitHub text media type: ${request.mediaType}`);
  }

  const treeEntry = request.treeEntries.find((entry) => entry.path === request.path);
  if (!treeEntry) {
    throw new Error(`GitHub listing does not include requested path: ${request.path}`);
  }
  if (treeEntry.type !== 'blob') {
    throw new Error(`GitHub requested path is not a text blob: ${request.path}`);
  }
  if (treeEntry.sha !== request.blobSha) {
    throw new Error(`GitHub listing blob SHA does not match fetched blob for path: ${request.path}`);
  }

  const sourceProfile = bootstrapSourceProfiles.find((profile) => profile.sourceSystemId === 'github');
  if (!sourceProfile) {
    throw new Error('GitHub source-system profile is not registered.');
  }

  const sourceSystem = createSourceSystemProfileTile(sourceProfile);
  const encodedPath = githubPathUrlSegment(request.path);
  const rootPath = githubRootPath(request.path);
  const blobUrl = `https://github.com/${request.owner}/${request.repo}/blob/${request.ref}/${encodedPath}`;
  const rawUrl = `https://raw.githubusercontent.com/${request.owner}/${request.repo}/${request.ref}/${encodedPath}`;
  const record = createSourceRecordTile(
    {
      metadataBlob: {
        acquisitionMode: request.acquisitionMode,
        blobSha: request.blobSha,
        owner: request.owner,
        path: request.path,
        ref: request.ref,
        repo: request.repo,
        title: `${request.owner}/${request.repo}/${request.path}`,
        treeSha: request.treeSha
      },
      publicationStatus: 'published',
      recordLocalId: `${request.owner}/${request.repo}:${request.ref}:${request.path}`,
      recordType: 'github-text-file',
      sourceSystemId: 'github',
      stableLocators: [blobUrl]
    },
    [sourceSystem.cid]
  );
  const listingSnapshot = createBoundedListingSnapshotPackageTile(
    {
      boundedness: {
        incompleteSearch,
        isComplete: true,
        itemCount: request.treeEntries.length,
        ...(request.maxItems !== undefined ? { maxItems: request.maxItems } : {}),
        pagination: { mode: 'single-page' },
        signals: [`github.tree.truncated=${truncated}`, `github.tree.sha=${request.treeSha}`],
        truncated
      },
      discoveredRecordCids: [record.cid],
      members: [record.cid],
      packageId: `github.tree.${request.owner}.${request.repo}.${request.ref}.${rootPath || 'root'}`,
      profileRefs: [sourceSystem.cid],
      scope: {
        authorityRef: request.ref,
        capturedAt: request.capturedAt,
        locator: `https://github.com/${request.owner}/${request.repo}/tree/${request.ref}/${githubPathUrlSegment(rootPath)}`,
        scope: {
          owner: request.owner,
          path: rootPath,
          ref: request.ref,
          repo: request.repo,
          treeSha: request.treeSha
        },
        sourceKind: 'github-tree',
        sourceSystemId: 'github'
      }
    },
    [sourceSystem.cid]
  );
  const manifestation = createSourceManifestationTile(
    {
      accessRequirements: ['public'],
      byteHashes: {
        githubBlobSha: request.blobSha,
        sha256: sha256Hex(request.text)
      },
      contentLanguage: 'en',
      fetchableUrl: rawUrl,
      manifestationId: `github.blob.${request.blobSha}`,
      manifestationKind: 'github-blob',
      mediaType: request.mediaType,
      sourceRecordCid: record.cid,
      structureProfile: request.mediaType === 'text/markdown' ? 'markdown' : 'plain-text'
    },
    [record.cid, listingSnapshot.cid]
  );
  const episode = createParseOnlySourceEpisode(record, manifestation, {
    chronology: {
      primary: {
        date: request.capturedAt.slice(0, 10),
        kind: 'fetchedAt',
        source: 'github-tree'
      }
    },
    locator: blobUrl,
    rawEvidenceRefs: [{ evidenceId: `raw.github.${request.blobSha}`, evidenceKind: 'remote-fetch', locator: rawUrl, sha256: sha256Hex(request.text) }],
    rightsScope: ['public'],
    sourcePackageCid: listingSnapshot.cid
  });
  const ingressJob = createIngressJob(record.cid, manifestation.cid, { sourcePackageCid: listingSnapshot.cid });
  const refined = refineTextArtifact(record, manifestation, request.text, ['policy.parse-only.default'], {
    fetchedAt: request.capturedAt,
    fetchMethod: `github-${request.acquisitionMode}-fetch`,
    requestedLocator: blobUrl,
    resolvedLocator: rawUrl,
    sourcePackageCid: listingSnapshot.cid
  });

  return {
    acquisitionMode: request.acquisitionMode,
    episode,
    ingressJob,
    listingSnapshot,
    manifestation,
    record,
    sourceSystem,
    ...refined
  };
}

function firstSentence(value: string): string {
  const match = value.trim().match(/^.*?[.!?](?:\s|$)/u);
  return (match?.[0] ?? value).trim();
}

export function refineTextToObservationArtifacts(
  record: TileEnvelope<SourceRecord>,
  manifestation: TileEnvelope<SourceManifestation>,
  rawText: string,
  policyRefs: string[] = ['policy.parse-only.default']
): SourceObservationArtifacts {
  const refined = refineTextArtifact(record, manifestation, rawText, policyRefs);
  const sourceSpan: SourceSpanRef = {
    endOffset: rawText.length,
    sourceManifestationCid: manifestation.cid,
    sourceRecordCid: record.cid,
    startOffset: 0,
    textHash: refined.canonicalArtifact.payload.byteHash
  };
  const observation = createSourceObservation('ingress-refinery', refined.canonicalArtifact.payload.normalizedText, [sourceSpan], [
    refined.canonicalArtifact.cid
  ]);
  const derivedArtifacts: Array<TileEnvelope<DerivedTextArtifact>> = [
    buildTile(
      'source.derived_artifact',
      {
        artifactId: `derived.summary.${observation.cid.slice(-12)}`,
        derivationKind: 'summary',
        payloadText: firstSentence(refined.canonicalArtifact.payload.normalizedText),
        sourceObservationCid: observation.cid,
        sourceSpans: [sourceSpan]
      },
      { pack: 'ingress-refinery', parents: [observation.cid] }
    ),
    buildTile(
      'source.derived_artifact',
      {
        artifactId: `derived.extract.${observation.cid.slice(-12)}`,
        derivationKind: 'extract',
        payloadText: refined.canonicalArtifact.payload.normalizedText,
        sourceObservationCid: observation.cid,
        sourceSpans: [sourceSpan]
      },
      { pack: 'ingress-refinery', parents: [observation.cid] }
    )
  ];
  const transformReceipt = createReceipt({
    claims: [
      {
        claimType: 'rrp:claim.transformed',
        confidence: 1,
        evidence: [{ cid: manifestation.cid, span: `bytes:${sourceSpan.startOffset}-${sourceSpan.endOffset}` }, { cid: refined.canonicalArtifact.cid }],
        statement: 'Source manifestation span transformed into a Rosetta observation tile.',
        verdict: 'pass'
      }
    ],
    digests: [digestTile(observation, 'observation.canonical')],
    policyRefs: [],
    receiptType: 'rrp:transform.source-observation',
    subjects: [{ cid: observation.cid, role: 'rrp:subject.observation' }]
  });

  return {
    ...refined,
    derivedArtifacts,
    observation,
    transformReceipt,
    transformReceiptBundle: buildReceiptBundle(transformReceipt)
  };
}

export function buildBootstrapDemoSnapshot(): BootstrapDemoSnapshot {
  const sourceProfile = bootstrapSourceProfiles.find((profile) => profile.sourceSystemId === 'datacite') ?? bootstrapSourceProfiles[0];
  const sourceSystem = createSourceSystemProfileTile(sourceProfile);
  const run = createRun('Bootstrap a Rosetta source-aware provenance loop.', ['bootstrap', 'source-substrate']);
  const action = createAction(run.cid, 'Normalize and evaluate a source-aware text artifact.');
  const policyTile = buildTile(
    'rosetta.observation',
    {
      observationId: 'policy.parse-only.default',
      signal: 'Parse-only ingress is the only authorized bootstrap action.',
      source: 'policy'
    },
    { pack: 'policy.parse-only.default', parents: [action.cid] }
  );
  const toolCall = createToolCall('source-registry.lookup', { sourceSystemId: sourceSystem.payload.sourceSystemId }, [action.cid]);
  const observation = createObservation('datacite', 'Metadata registry lookup completed.', [toolCall.cid]);
  const record = createSourceRecordTile(
    {
      metadataBlob: {
        doi: '10.5281/zenodo.7189481',
        orcid: 'orcid:0000-0000-0000-0000',
        ror: 'ror:03yrm5c26',
        swhid: 'swh:1:dir:bootstrap-demo',
        title: 'Generalist repository comparison chart'
      },
      publicationStatus: 'published',
      recordLocalId: '10.5281/zenodo.7189481',
      recordType: 'dataset',
      sourceSystemId: sourceSystem.payload.sourceSystemId,
      stableLocators: ['https://doi.org/10.5281/zenodo.7189481']
    },
    [sourceSystem.cid, observation.cid]
  );
  const manifestation = createSourceManifestationTile(
    {
      accessRequirements: ['public'],
      byteHashes: { sha256: sha256Hex('bootstrap-demo-source') },
      contentLanguage: 'en',
      fetchableUrl: 'https://doi.org/10.5281/zenodo.7189481',
      manifestationId: 'doi-landing-page',
      manifestationKind: 'landing-page',
      mediaType: 'text/plain',
      sourceRecordCid: record.cid,
      structureProfile: 'plain-text'
    },
    [record.cid]
  );
  const { canonicalArtifact, evaluationReceipt, fetchReceipt, normalizationReceipt, trustMatrix } = refineTextArtifact(
    record,
    manifestation,
    'Repository profiles should be modeled separately from the records they host.',
    [policyTile.cid]
  );
  const evaluation = createEvaluation('Source-aware bootstrap slice passed parse-only refinement.', 'pass', [canonicalArtifact.cid]);
  const receipt = createReceipt({
    claims: [
      {
        claimType: 'rrp:claim.refined',
        confidence: 0.92,
        evidence: [{ cid: fetchReceipt.cid }, { cid: normalizationReceipt.cid }, { cid: evaluationReceipt.cid }],
        statement: 'Artifact refined through source-aware parse-only ingress.',
        verdict: 'pass'
      }
    ],
    digests: [digestTile(canonicalArtifact, 'canonical-artifact')],
    policyRefs: [policyTile.cid],
    receiptType: 'rrp:refinery.refinement',
    subjects: [{ cid: canonicalArtifact.cid, role: 'rrp:subject.canonical-artifact' }]
  });
  const keys = createSigningKeyPair();
  const signedReceipt = signReceiptEd25519(receipt, keys.privateKey, keys.publicKeyPem);
  const receiptBundle = buildReceiptBundle(receipt);
  const tapestry = compileReceiptBundleTapestry(receipt.cid, receiptBundle.subjectCids, receiptBundle.evidenceCids, receiptBundle.policyCids);
  const conformanceBundle = emitConformanceBundle([
    sourceSystem,
    record,
    manifestation,
    fetchReceipt,
    normalizationReceipt,
    evaluationReceipt,
    trustMatrix,
    canonicalArtifact,
    policyTile,
    receipt
  ]);

  return {
    action,
    canonicalArtifact,
    conformanceBundle,
    evaluation,
    evaluationReceipt,
    fetchReceipt,
    manifestation,
    normalizationReceipt,
    observation,
    policyTile,
    receipt,
    receiptBundle,
    record,
    run,
    signedReceipt,
    sourceSystem,
    tapestry,
    toolCall,
    trustMatrix
  };
}
