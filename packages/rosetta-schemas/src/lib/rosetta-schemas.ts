import { validatePromotionStatePayload } from './promotion-state.js';
import { makeContentId } from '@entif-ai/rosetta-cid';
import { splitSentences } from '@entif-ai/rosetta-canon';
import type { TileEnvelope } from '@entif-ai/rosetta-core';

import { isCounterfactualEvaluationProfile, validateCounterfactualEvaluation } from './counterfactual-profile.js';
import { isSalienceEvaluationProfile, validateSalienceEvaluation } from './salience-profile.js';

export interface ValidationResult {
  errors: string[];
  ok: boolean;
}

export interface CompoundCacheKeyInput {
  dataClassification?: string;
  policyVersion?: string;
  rightsDomain?: string;
  semanticIntent?: string;
  sourceBundleHash?: string;
}

export interface CompoundCacheKey {
  dataClassification: string;
  lookupKey: string;
  policyVersion: string;
  rightsDomain: string;
  semanticIntent: string;
  sourceBundleHash: string;
}

export type CompoundCacheKeyDimension = keyof Omit<CompoundCacheKey, 'lookupKey'>;

export interface CompositionProviderSource {
  challengePath: string[];
  freshnessVerifiedAt: string;
  normalizedUserMetadataCid: string;
  providerId: string;
  providerResponseCid: string;
  providerResponseTimestamp: string;
  providerResponseVersion: string;
  rightsDecisionCid: string;
  subQueryReceiptCid: string;
}

export interface CompositionSourceAttribution {
  answerFragmentId: string;
  providerId: string;
  providerResponseCid: string;
}

export interface CompositionProvenanceInput {
  answerCid: string;
  composedAt: string;
  compositionLogic: string;
  compositionReceiptCid: string;
  providers: CompositionProviderSource[];
  recordId: string;
  sourceAttributions: CompositionSourceAttribution[];
}

export interface CompositionProvenanceRecord extends CompositionProvenanceInput {
  recordCid: string;
}

export interface CompositionTrace {
  answerFragmentId: string;
  challengePath: string[];
  providerId: string;
  providerResponseCid: string;
  subQueryReceiptCid: string;
}

export type IntakeSourceType = 'discord' | 'email' | 'google-alert' | 'magazine' | 'manual' | 'newsletter' | 'rss';

export type DomainClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export interface DomainLabel {
  key: string;
  value: string;
}

export interface DomainRefInput {
  abacLabels?: DomainLabel[] | Record<string, string>;
  classification: string;
  tenantId: string;
  vendorRoute?: string;
}

export interface DomainRef {
  abacLabels: DomainLabel[];
  classification: DomainClassification;
  tenantId: string;
  vendorRoute?: string;
}

export type DomainCompareReason =
  | 'CLASSIFICATION_WIDENING'
  | 'CROSS_DOMAIN_BRIDGE_AUTHORIZED'
  | 'CROSS_DOMAIN_REUSE_DENIED'
  | 'TENANT_MISMATCH'
  | 'VENDOR_ROUTE_MISMATCH'
  | `ABAC_LABEL_MISSING:${string}`;

export interface DomainCompareOptions {
  bridgePolicyRef?: string;
}

export interface DomainCompareResult {
  ok: boolean;
  reasons: DomainCompareReason[];
}

export type AgenticMessageType =
  | 'ACTION_DECISION'
  | 'ACTION_REQUEST'
  | 'APPROVAL_REQUEST'
  | 'APPROVAL_RESPONSE'
  | 'ARTIFACT_PUBLISH'
  | 'HEALTH_REPORT'
  | 'INCIDENT_ENVELOPE'
  | 'TASK_RECEIPT'
  | 'WORK_UNIT_UPDATE';

export type AgenticMessagePlane = 'control' | 'data';

export type AgenticMessageQuarantineReason =
  | 'ACTION_BEARING_DATA_PLANE'
  | 'DOMAIN_REF_MISMATCH'
  | 'MESSAGE_SIZE_EXCEEDED'
  | 'SCHEMA_INVALID'
  | 'UNKNOWN_MESSAGE_TYPE';

export interface AgenticMessageSender {
  node_id: string;
  principal_ref: string;
}

export interface AgenticMessageEnvelope {
  domain_ref: DomainRefInput | DomainRef;
  expires_at: string;
  issued_at: string;
  msg_id: string;
  msg_type: AgenticMessageType;
  nonce: string;
  payload_hash: string;
  routing_key: string;
  schema_version: string;
  sender: AgenticMessageSender;
  sig: string;
}

export interface AgenticMessageSchemaMigration {
  additiveChangePolicy: 'minor-compatible';
  breakingChangePolicy: 'new-schema-id-major';
  dualReadWindow: 'current-and-previous-major';
}

export interface AgenticNestedComponentRef {
  field: string;
  owner: string;
}

export interface AgenticMessageSchemaProfile {
  description: string;
  migration: AgenticMessageSchemaMigration;
  nestedComponents: AgenticNestedComponentRef[];
  plane: AgenticMessagePlane;
  requiredFields: string[];
  schemaId: string;
  version: string;
}

export interface AgenticMailroomValidationStage {
  failureReasons: AgenticMessageQuarantineReason[];
  stage: 'plane-enforce' | 'schema-validate' | 'size-enforce';
}

export interface AgenticMessageValidationResult extends ValidationResult {
  quarantineReasons: AgenticMessageQuarantineReason[];
  schemaId: string;
}

export type AgenticMessageExecutorDisposition =
  | 'control-plane-no-execution'
  | 'data-plane-no-side-effects'
  | 'guard-decision-required'
  | 'quarantine';

export type AgenticMessageSecurityIncidentCode =
  | 'DATA_PLANE_CAPABILITY_PAYLOAD'
  | 'DOMAIN_REF_MISMATCH'
  | 'INLINE_ARTIFACT_PAYLOAD'
  | 'MESSAGE_SIZE_LIMIT_EXCEEDED';

export interface AgenticMessageSizePolicy {
  artifactTransferPosture: 'reference-or-future-chunking-required';
  defaultMaxMessageBytes: number;
  issueOwner: '#1142';
  parentGatekeepingIssue: '#701';
  replayStorageIssue: '#226';
  schemaRegistryIssue: '#220';
}

export interface AgenticMessageSizePolicyInput {
  envelope?: Record<string, unknown>;
  envelopeBytes?: number;
  msgType: string;
  payload?: Record<string, unknown>;
  payloadBytes?: number;
}

export interface AgenticMessageSizeTelemetryEvidence {
  artifactTransferPosture: AgenticMessageSizePolicy['artifactTransferPosture'];
  issueOwner: '#1142';
  maxMessageBytes: number;
  observedBytes: number;
  policyRef: 'agentic-message-size-policy.v1';
  stage: 'size-enforce';
}

export interface AgenticMessageSizePolicyResult extends ValidationResult {
  incidentCodes: AgenticMessageSecurityIncidentCode[];
  quarantineReasons: AgenticMessageQuarantineReason[];
  schemaId: 'entif.agentic-messaging.size-policy.v1';
  telemetryEvidence: AgenticMessageSizeTelemetryEvidence;
}

export interface AgenticMessageExecutionPolicyOptions {
  authorizationDomainRef?: DomainRefInput | DomainRef;
}

export interface AgenticMessageExecutionPolicyResult extends AgenticMessageValidationResult {
  domainComparison?: DomainCompareResult;
  executorDisposition: AgenticMessageExecutorDisposition;
  incidentCodes: AgenticMessageSecurityIncidentCode[];
  plane: AgenticMessagePlane | 'unknown';
  requiresGuardDecision: boolean;
}

export type SkillCardRiskClass = 'admin' | 'financial' | 'identity' | 'read_only' | 'write_external' | 'write_local';

export interface SkillCardSubjectRef {
  doc_id: string;
  export_ref?: string;
  pack_id: string;
  profile_ref?: string;
  version: string;
}

export interface SkillCardProvenance {
  origin: string;
  trust_ref: string;
}

export interface SkillCardInput {
  certification_ref?: string;
  io: string;
  name: string;
  one_line: string;
  provenance: SkillCardProvenance;
  risk_class: SkillCardRiskClass;
  skill_id: string;
  subject: SkillCardSubjectRef;
  tool_scopes: string[];
  triggers: string[];
  version: string;
}

export interface SkillCardValidationResult extends ValidationResult {
  schemaId: 'skill.card.v1';
}

export type CapabilityPrivilegeTier =
  | 'admin'
  | 'operator-sensitive'
  | 'read-only'
  | 'write-external'
  | 'write-local';

export type CapabilityEffectClass = 'external-write' | 'local-write' | 'payment' | 'pure-transform' | 'source-read';
export type CapabilityHintTreatment = 'advisory-only' | 'normalized' | 'rejected-inconsistent';
export type CapabilityIdempotency = 'idempotent' | 'non-idempotent' | 'unknown';
export type CapabilityReplaySafety = 'not-replay-safe' | 'replay-requires-guard' | 'replay-safe';

export interface AdapterCapabilityPosture {
  destructive: boolean;
  network_facing: boolean;
  payment_sensitive: boolean;
  sandbox_safe: boolean;
  side_effecting: boolean;
}

export interface AdapterCapabilityGuardRequirements {
  decision_required: boolean;
  policy_refs: string[];
  receipt_required: boolean;
}

export interface AdapterCapabilityHostHints {
  imported_refs?: string[];
  normalized_refs?: string[];
  rejection_reasons?: string[];
  treatment: CapabilityHintTreatment;
}

export interface AdapterCapabilityManifestInput {
  capability_id: string;
  effect_class: CapabilityEffectClass;
  fixture_refs: string[];
  guard: AdapterCapabilityGuardRequirements;
  host_hints: AdapterCapabilityHostHints;
  idempotency: CapabilityIdempotency;
  input_schema_ref: string;
  manifest_id: string;
  operation_class: string;
  output_schema_ref: string;
  posture: AdapterCapabilityPosture;
  privilege_tier: CapabilityPrivilegeTier;
  replay_safety: CapabilityReplaySafety;
  schema_version: 'adapter-capability-manifest-v1';
  verb_family: string;
  version: string;
}

export interface AdapterCapabilityManifestValidationResult extends ValidationResult {
  schemaId: 'adapter-capability-manifest-v1';
}

export interface IntakeEnvelopeReceipts {
  costUsd?: number;
  itemHash?: string;
  requestId?: string;
  runtimeMs?: number;
  tokensUsed?: number;
}

export interface IntakeEnvelopeInput {
  author?: string;
  contentPointer: string;
  itemUrl: string;
  publishedAt?: string;
  rawExcerpt: string;
  receipts?: IntakeEnvelopeReceipts;
  retrievedAt: string;
  sourceName: string;
  sourceType: IntakeSourceType;
  title: string;
}

export interface IntakeEnvelope extends IntakeEnvelopeInput {
  itemUrl: string;
  normalized: {
    highSignalImperatives: string[];
  };
  receipts: IntakeEnvelopeReceipts & {
    itemHash: string;
  };
}

export interface DailyTopShelfActionItem {
  action: string;
  source: string;
  title: string;
  why: string;
}

export interface DailyTopShelfStoreItem {
  source: string;
  title: string;
  why: string;
}

export interface DailyTopShelfDecisionChange {
  decision: string;
  source: string;
  title: string;
  why: string;
}

export interface DailyTopShelfRisk {
  source: string;
  title: string;
  watch: string;
  why: string;
}

export interface DailyTopShelfSlots {
  actThisWeek: DailyTopShelfActionItem[];
  designDecisionChange: DailyTopShelfDecisionChange;
  riskToTrack: DailyTopShelfRisk;
  storeForLater: DailyTopShelfStoreItem[];
}

export interface DailyTopShelfDigestInput {
  date: string;
  deliveredTo?: string;
  escalated?: DailyTopShelfActionItem[];
  generatedAt: string;
  slots: DailyTopShelfSlots;
}

export interface DailyTopShelfDigest extends DailyTopShelfDigestInput {
  artifactCid: string;
  artifactName: string;
  escalated: DailyTopShelfActionItem[];
}

export interface TranslationEvidenceInput {
  evidenceRefs: string[];
  lineageRefs: string[];
  normalizationProfile: string;
  receiptBundleCid: string;
  sourceConceptRefs: string[];
  supersedesRefs: string[];
  targetConceptRefs: string[];
  tolerance: number;
  transport: number[][];
  validationProfile: string;
}

export interface TranslationEvidenceArtifact extends TranslationEvidenceInput {
  ambiguity: {
    entropy: number;
  };
  artifactCid: string;
}

export type PostmortemOutcomeClass = 'FAIL' | 'PARTIAL' | 'PASS';

export interface PostmortemRubricChange {
  dimension: string;
  proposedNewThreshold: number;
  scorecard: string;
}

export interface PostmortemEvolution {
  change: string;
  target: string;
  type: 'skill' | 'workflow';
}

export interface PostmortemArtifactInput {
  attachments?: string[];
  envelopeId: string;
  outcomeClass: PostmortemOutcomeClass;
  proposedEvolution?: PostmortemEvolution[];
  receiptChain: string[];
  reproductionSteps: string[];
  rootCause: string;
  stepId: string;
  suggestedRubricChanges?: PostmortemRubricChange[];
  timestamp: string;
  workflowId: string;
}

export interface PostmortemArtifact extends PostmortemArtifactInput {
  artifactCid: string;
  retention: {
    archive: 'cold';
    warmDays: 90;
  };
  review: {
    generatedBy: 'orchestrator';
    humanReviewRequired: boolean;
  };
}

export interface TranslationEvidenceValidation {
  composition: ValidationResult;
  numerical: ValidationResult;
  structural: ValidationResult;
}

export interface ConformanceEntry {
  cid: string;
  conforms: boolean;
  errors: string[];
  kind: string;
}

export interface ConformanceBundle {
  bundleId: string;
  entries: ConformanceEntry[];
  shapeGraphCid: string;
  shapesTurtle: string;
  summary: {
    conforms: number;
    violations: number;
  };
}

const REQUIRED_FIELDS: Record<string, string[]> = {
  'guard.decision_token': ['action', 'effect', 'expiresAt', 'policyIds', 'reason', 'resource', 'tokenId'],
  'rosetta.action': ['actionId', 'intent', 'runCid'],
  'rosetta.evaluation': ['evaluationId', 'summary', 'verdict'],
  'rosetta.observation': ['observationId', 'signal', 'source'],
  'entif.intake_envelope': [
    'contentPointer',
    'itemUrl',
    'normalized',
    'rawExcerpt',
    'receipts',
    'retrievedAt',
    'sourceName',
    'sourceType',
    'title'
  ],
  'entif.daily_top_shelf_digest': ['artifactCid', 'artifactName', 'date', 'escalated', 'generatedAt', 'slots'],
  'entif.postmortem_artifact': [
    'artifactCid',
    'envelopeId',
    'outcomeClass',
    'receiptChain',
    'reproductionSteps',
    'retention',
    'review',
    'rootCause',
    'stepId',
    'timestamp',
    'workflowId'
  ],
  'adapter.capability_manifest': [
    'capability_id',
    'effect_class',
    'fixture_refs',
    'guard',
    'host_hints',
    'idempotency',
    'input_schema_ref',
    'manifest_id',
    'operation_class',
    'output_schema_ref',
    'posture',
    'privilege_tier',
    'replay_safety',
    'schema_version',
    'verb_family',
    'version'
  ],
  'skill.card': ['io', 'name', 'one_line', 'provenance', 'risk_class', 'skill_id', 'subject', 'tool_scopes', 'triggers', 'version'],
  'rosetta.composition_provenance': [
    'answerCid',
    'composedAt',
    'compositionLogic',
    'compositionReceiptCid',
    'providers',
    'recordCid',
    'recordId',
    'sourceAttributions'
  ],
  'rosetta.translation_evidence': [
    'ambiguity',
    'artifactCid',
    'evidenceRefs',
    'lineageRefs',
    'normalizationProfile',
    'receiptBundleCid',
    'sourceConceptRefs',
    'supersedesRefs',
    'targetConceptRefs',
    'tolerance',
    'transport',
    'validationProfile'
  ],
  'rosetta.receipt': ['claims', 'digests', 'policyRefs', 'receiptType', 'subjects'],
  'rosetta.run': ['runId', 'summary', 'tags'],
  'rosetta.tapestry': ['dynamicTail', 'requiredScope', 'stablePrefix', 'tapestries', 'tenant', 'totalTokens'],
  'rosetta.toolcall': ['args', 'tool', 'toolCallId'],
  'source.canonical_artifact': [
    'artifactId',
    'byteHash',
    'contentFingerprint',
    'dedupe',
    'normalizedText',
    'normalizedTextHash',
    'pidFamily',
    'provenanceRefs',
    'revisionFingerprint',
    'rightsScopes',
    'sourceManifestationCid',
    'sourceRecordCid'
  ],
  'source.correction_event': ['eventKind', 'recordedAt', 'subjectCid', 'summary'],
  'source.derived_artifact': ['artifactId', 'derivationKind', 'payloadText', 'sourceObservationCid', 'sourceSpans'],
  'source.evaluation_receipt': ['evaluatedAt', 'policyRefs', 'subjectCid', 'trustMatrixCid'],
  'source.episode': ['chronology', 'classification', 'episodeId', 'family', 'locator', 'mode', 'rawEvidenceRefs', 'rightsScope'],
  'source.fetch_receipt': ['fetchedAt', 'method', 'requestedLocator', 'resolvedLocator', 'snapshotHash', 'sourceManifestationCid'],
  'source.identity_resolution_receipt': ['confidence', 'entityType', 'evidenceSources', 'subjectCid'],
  'source.ingress_job': ['jobId', 'mode', 'parserProfile', 'policyRefs', 'sourceManifestationCid', 'sourceRecordCid', 'status'],
  'source.manifestation': ['accessRequirements', 'byteHashes', 'manifestationId', 'manifestationKind', 'mediaType', 'sourceRecordCid', 'structureProfile'],
  'source.normalization_receipt': [
    'canonicalTextHash',
    'contentFingerprint',
    'normalizationProfile',
    'parserProfile',
    'revisionFingerprint',
    'sourceManifestationCid'
  ],
  'source.package': ['members', 'packageId', 'packageKind', 'profileRefs'],
  'source.record': ['metadataBlob', 'publicationStatus', 'recordLocalId', 'recordType', 'sourceSystemId', 'stableLocators'],
  'source.registry_entry': ['defaultTrustClass', 'entryId', 'priorityTier', 'sourceSystemId'],
  'source.system_profile': ['canonicalName', 'capabilityFacets', 'curationPosture', 'evidenceRefs', 'rightsPosture', 'sourceRoles', 'sourceSystemId'],
  'source.trust_matrix': ['axes', 'notes', 'subjectCid', 'trustClass']
};

export const SUPPORTED_TILE_KIND_REQUIRED_FIELDS: Readonly<Record<string, readonly string[]>> = REQUIRED_FIELDS;

const COMPOUND_CACHE_KEY_DIMENSIONS = [
  'semanticIntent',
  'rightsDomain',
  'dataClassification',
  'policyVersion',
  'sourceBundleHash'
] as const satisfies readonly CompoundCacheKeyDimension[];

const COMPOUND_CACHE_KEY_LOOKUP_ORDER = [
  'dataClassification',
  'policyVersion',
  'rightsDomain',
  'semanticIntent',
  'sourceBundleHash'
] as const satisfies readonly CompoundCacheKeyDimension[];

const COMPOUND_CACHE_KEY_LOOKUP_NAMES: Record<CompoundCacheKeyDimension, string> = {
  dataClassification: 'data_classification',
  policyVersion: 'policy_version',
  rightsDomain: 'rights_domain',
  semanticIntent: 'semantic_intent',
  sourceBundleHash: 'source_bundle_hash'
};

export const SKILL_CARD_MAX_BYTES = 2048;

export const SKILL_CARD_RISK_CLASSES = [
  'read_only',
  'write_local',
  'write_external',
  'financial',
  'identity',
  'admin'
] as const satisfies readonly SkillCardRiskClass[];

export const SKILL_CARD_AUTHORITY_FIELD_NAMES = [
  'approval_handle',
  'approvalHandle',
  'capability_selector',
  'capabilitySelector',
  'guard_decision_token',
  'guardDecisionToken',
  'iam_decision_ref',
  'iamDecisionRef',
  'runtime_grant',
  'runtimeGrant'
] as const;

const SKILL_CARD_PACK_ID_PATTERN = /^cidv1-sha256-[a-f0-9]{64}$/u;

export const CAPABILITY_PRIVILEGE_TIERS = [
  'read-only',
  'write-local',
  'write-external',
  'operator-sensitive',
  'admin'
] as const satisfies readonly CapabilityPrivilegeTier[];

export const CAPABILITY_EFFECT_CLASSES = [
  'pure-transform',
  'source-read',
  'local-write',
  'external-write',
  'payment'
] as const satisfies readonly CapabilityEffectClass[];

export const CAPABILITY_HINT_TREATMENTS = [
  'advisory-only',
  'normalized',
  'rejected-inconsistent'
] as const satisfies readonly CapabilityHintTreatment[];

export const CAPABILITY_IDEMPOTENCY_VALUES = [
  'idempotent',
  'non-idempotent',
  'unknown'
] as const satisfies readonly CapabilityIdempotency[];

export const CAPABILITY_REPLAY_SAFETY_VALUES = [
  'replay-safe',
  'replay-requires-guard',
  'not-replay-safe'
] as const satisfies readonly CapabilityReplaySafety[];

const DOMAIN_CLASSIFICATION_RANK: Record<DomainClassification, number> = {
  public: 0,
  internal: 1,
  confidential: 2,
  restricted: 3
};

const AGENTIC_MESSAGE_MIGRATION: AgenticMessageSchemaMigration = {
  additiveChangePolicy: 'minor-compatible',
  breakingChangePolicy: 'new-schema-id-major',
  dualReadWindow: 'current-and-previous-major'
};

const AGENTIC_MESSAGE_NESTED_COMPONENTS: AgenticNestedComponentRef[] = [{ field: 'domain_ref', owner: '#711' }];

export const AGENTIC_MESSAGE_TYPE_PROFILES: Record<AgenticMessageType, AgenticMessageSchemaProfile> = {
  ACTION_DECISION: {
    description: 'Guard-issued control-plane decision artifact.',
    migration: AGENTIC_MESSAGE_MIGRATION,
    nestedComponents: AGENTIC_MESSAGE_NESTED_COMPONENTS,
    plane: 'control',
    requiredFields: ['actionId', 'decisionRef', 'effect', 'issuedBy'],
    schemaId: 'entif.agentic-messaging.action-decision.v1',
    version: '1.0.0'
  },
  ACTION_REQUEST: {
    description: 'Privileged capability request requiring an iam.decision reference.',
    migration: AGENTIC_MESSAGE_MIGRATION,
    nestedComponents: AGENTIC_MESSAGE_NESTED_COMPONENTS,
    plane: 'control',
    requiredFields: ['actionId', 'capabilityRef', 'iamDecisionRef', 'justification'],
    schemaId: 'entif.agentic-messaging.action-request.v1',
    version: '1.0.0'
  },
  APPROVAL_REQUEST: {
    description: 'Human-in-the-loop approval request.',
    migration: AGENTIC_MESSAGE_MIGRATION,
    nestedComponents: AGENTIC_MESSAGE_NESTED_COMPONENTS,
    plane: 'control',
    requiredFields: ['approvalId', 'reason', 'requestedBy', 'subjectRef'],
    schemaId: 'entif.agentic-messaging.approval-request.v1',
    version: '1.0.0'
  },
  APPROVAL_RESPONSE: {
    description: 'Human approval outcome bound to a prior approval request.',
    migration: AGENTIC_MESSAGE_MIGRATION,
    nestedComponents: AGENTIC_MESSAGE_NESTED_COMPONENTS,
    plane: 'control',
    requiredFields: ['approvalId', 'decision', 'reviewedBy'],
    schemaId: 'entif.agentic-messaging.approval-response.v1',
    version: '1.0.0'
  },
  ARTIFACT_PUBLISH: {
    description: 'Reference-only artifact publication notice.',
    migration: AGENTIC_MESSAGE_MIGRATION,
    nestedComponents: AGENTIC_MESSAGE_NESTED_COMPONENTS,
    plane: 'data',
    requiredFields: ['artifactCid', 'artifactType', 'publisherRef'],
    schemaId: 'entif.agentic-messaging.artifact-publish.v1',
    version: '1.0.0'
  },
  HEALTH_REPORT: {
    description: 'Node health status report.',
    migration: AGENTIC_MESSAGE_MIGRATION,
    nestedComponents: AGENTIC_MESSAGE_NESTED_COMPONENTS,
    plane: 'data',
    requiredFields: ['nodeId', 'observedAt', 'status'],
    schemaId: 'entif.agentic-messaging.health-report.v1',
    version: '1.0.0'
  },
  INCIDENT_ENVELOPE: {
    description: 'Typed suspicious-event report for quarantine and incident routing.',
    migration: AGENTIC_MESSAGE_MIGRATION,
    nestedComponents: AGENTIC_MESSAGE_NESTED_COMPONENTS,
    plane: 'data',
    requiredFields: ['incidentId', 'severity', 'summary', 'trigger'],
    schemaId: 'entif.agentic-messaging.incident-envelope.v1',
    version: '1.0.0'
  },
  TASK_RECEIPT: {
    description: 'Work-performed receipt with hashes and telemetry.',
    migration: AGENTIC_MESSAGE_MIGRATION,
    nestedComponents: AGENTIC_MESSAGE_NESTED_COMPONENTS,
    plane: 'data',
    requiredFields: ['artifactHashes', 'taskId', 'telemetry', 'workRef'],
    schemaId: 'entif.agentic-messaging.task-receipt.v1',
    version: '1.0.0'
  },
  WORK_UNIT_UPDATE: {
    description: 'Convoy or work-unit status heartbeat.',
    migration: AGENTIC_MESSAGE_MIGRATION,
    nestedComponents: AGENTIC_MESSAGE_NESTED_COMPONENTS,
    plane: 'data',
    requiredFields: ['progress', 'status', 'workUnitId'],
    schemaId: 'entif.agentic-messaging.work-unit-update.v1',
    version: '1.0.0'
  }
};

export const AGENTIC_MAILROOM_VALIDATION_CHECKLIST: AgenticMailroomValidationStage[] = [
  {
    failureReasons: ['MESSAGE_SIZE_EXCEEDED'],
    stage: 'size-enforce'
  },
  {
    failureReasons: ['UNKNOWN_MESSAGE_TYPE', 'SCHEMA_INVALID'],
    stage: 'schema-validate'
  },
  {
    failureReasons: ['ACTION_BEARING_DATA_PLANE', 'DOMAIN_REF_MISMATCH'],
    stage: 'plane-enforce'
  }
];

export const AGENTIC_MESSAGE_SIZE_POLICY: AgenticMessageSizePolicy = {
  artifactTransferPosture: 'reference-or-future-chunking-required',
  defaultMaxMessageBytes: 1_048_576,
  issueOwner: '#1142',
  parentGatekeepingIssue: '#701',
  replayStorageIssue: '#226',
  schemaRegistryIssue: '#220'
};

export const AGENTIC_DATA_PLANE_FORBIDDEN_FIELD_FAMILIES = {
  approvalHandles: ['approvalId', 'approvalRequestId', 'decisionRef', 'iamDecisionRef'],
  capabilitySelectors: ['capabilityRef', 'requestedAdapters', 'requestedEffects', 'requestedPrivilegeTiers'],
  responseBindings: ['responseKind:iam.decision']
} as const;

export const ARTIFACT_PUBLISH_INLINE_CONTENT_FIELDS = [
  'artifactBody',
  'artifactBytes',
  'artifactContent',
  'contentBytes',
  'inlineArtifact',
  'rawContent'
] as const;

export const AGENTIC_MESSAGE_EXECUTOR_CONTRACT: Record<AgenticMessageType, AgenticMessageExecutorDisposition> = {
  ACTION_DECISION: 'control-plane-no-execution',
  ACTION_REQUEST: 'guard-decision-required',
  APPROVAL_REQUEST: 'control-plane-no-execution',
  APPROVAL_RESPONSE: 'control-plane-no-execution',
  ARTIFACT_PUBLISH: 'data-plane-no-side-effects',
  HEALTH_REPORT: 'data-plane-no-side-effects',
  INCIDENT_ENVELOPE: 'data-plane-no-side-effects',
  TASK_RECEIPT: 'data-plane-no-side-effects',
  WORK_UNIT_UPDATE: 'data-plane-no-side-effects'
};

const AGENTIC_MESSAGE_ENVELOPE_REQUIRED_FIELDS = [
  'domain_ref',
  'expires_at',
  'issued_at',
  'msg_id',
  'msg_type',
  'nonce',
  'payload_hash',
  'routing_key',
  'schema_version',
  'sender',
  'sig'
] as const satisfies ReadonlyArray<keyof AgenticMessageEnvelope>;

const COMPOSITION_PROVIDER_REQUIRED_FIELDS = [
  'freshnessVerifiedAt',
  'normalizedUserMetadataCid',
  'providerId',
  'providerResponseCid',
  'providerResponseTimestamp',
  'providerResponseVersion',
  'rightsDecisionCid',
  'subQueryReceiptCid'
] as const satisfies ReadonlyArray<keyof CompositionProviderSource>;

const COMPOSITION_INPUT_REQUIRED_FIELDS = [
  'answerCid',
  'composedAt',
  'compositionLogic',
  'compositionReceiptCid',
  'providers',
  'recordId',
  'sourceAttributions'
] as const satisfies ReadonlyArray<keyof CompositionProvenanceInput>;

const INTAKE_ENVELOPE_REQUIRED_FIELDS = [
  'contentPointer',
  'itemUrl',
  'rawExcerpt',
  'retrievedAt',
  'sourceName',
  'sourceType',
  'title'
] as const satisfies ReadonlyArray<keyof IntakeEnvelopeInput>;

const DAILY_TOP_SHELF_REQUIRED_FIELDS = ['date', 'generatedAt', 'slots'] as const satisfies ReadonlyArray<keyof DailyTopShelfDigestInput>;

const TRANSLATION_EVIDENCE_REQUIRED_FIELDS = [
  'evidenceRefs',
  'lineageRefs',
  'normalizationProfile',
  'receiptBundleCid',
  'sourceConceptRefs',
  'supersedesRefs',
  'targetConceptRefs',
  'tolerance',
  'transport',
  'validationProfile'
] as const satisfies ReadonlyArray<keyof TranslationEvidenceInput>;

const POSTMORTEM_REQUIRED_FIELDS = [
  'envelopeId',
  'outcomeClass',
  'receiptChain',
  'reproductionSteps',
  'rootCause',
  'stepId',
  'timestamp',
  'workflowId'
] as const satisfies ReadonlyArray<keyof PostmortemArtifactInput>;

function requiredString(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function isDomainClassification(value: string): value is DomainClassification {
  return value in DOMAIN_CLASSIFICATION_RANK;
}

function normalizeLabels(labels: DomainRefInput['abacLabels']): DomainLabel[] {
  const entries = Array.isArray(labels) ? labels : Object.entries(labels ?? {}).map(([key, value]) => ({ key, value }));
  const normalized = entries.map((label) => ({
    key: normalizeToken(label.key),
    value: normalizeToken(label.value)
  }));
  const deduped = new Map(normalized.map((label) => [`${label.key}=${label.value}`, label]));

  return [...deduped.values()].sort((left, right) => {
    const leftKey = `${left.key}=${left.value}`;
    const rightKey = `${right.key}=${right.value}`;
    return leftKey.localeCompare(rightKey);
  });
}

function isIsoTimestamp(value: string): boolean {
  return !Number.isNaN(Date.parse(value)) && value.includes('T');
}

function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function dedupeList<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

function findActionBearingFieldPaths(value: unknown, path: string[] = []): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findActionBearingFieldPaths(entry, [...path, `[${index}]`]));
  }
  if (!isRecord(value)) {
    return [];
  }

  const matches: string[] = [];
  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPath = [...path, key];
    if (
      AGENTIC_DATA_PLANE_FORBIDDEN_FIELD_FAMILIES.approvalHandles.includes(
        key as (typeof AGENTIC_DATA_PLANE_FORBIDDEN_FIELD_FAMILIES.approvalHandles)[number]
      ) ||
      AGENTIC_DATA_PLANE_FORBIDDEN_FIELD_FAMILIES.capabilitySelectors.includes(
        key as (typeof AGENTIC_DATA_PLANE_FORBIDDEN_FIELD_FAMILIES.capabilitySelectors)[number]
      ) ||
      (key === 'responseKind' && nestedValue === 'iam.decision')
    ) {
      matches.push(nextPath.join('.'));
    }

    matches.push(...findActionBearingFieldPaths(nestedValue, nextPath));
  }

  return dedupeList(matches);
}

function findInlineArtifactFieldPaths(value: unknown, path: string[] = []): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findInlineArtifactFieldPaths(entry, [...path, `[${index}]`]));
  }
  if (!isRecord(value)) {
    return [];
  }

  const matches: string[] = [];
  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPath = [...path, key];
    if (ARTIFACT_PUBLISH_INLINE_CONTENT_FIELDS.includes(key as (typeof ARTIFACT_PUBLISH_INLINE_CONTENT_FIELDS)[number])) {
      matches.push(nextPath.join('.'));
    }
    matches.push(...findInlineArtifactFieldPaths(nestedValue, nextPath));
  }

  return dedupeList(matches);
}

function findSkillCardAuthorityFieldPaths(value: unknown, path: string[] = []): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findSkillCardAuthorityFieldPaths(entry, [...path, `[${index}]`]));
  }
  if (!isRecord(value)) {
    return [];
  }

  const matches: string[] = [];
  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPath = [...path, key];
    if (SKILL_CARD_AUTHORITY_FIELD_NAMES.includes(key as (typeof SKILL_CARD_AUTHORITY_FIELD_NAMES)[number])) {
      matches.push(nextPath.join('.'));
    }
    matches.push(...findSkillCardAuthorityFieldPaths(nestedValue, nextPath));
  }

  return dedupeList(matches);
}

function validateAgenticSender(sender: unknown, errors: string[]): void {
  if (!isRecord(sender)) {
    errors.push('AgenticMessageEnvelope sender must be an object.');
    return;
  }

  for (const field of ['node_id', 'principal_ref']) {
    if (!requiredString(sender[field] as string | undefined)) {
      errors.push(`AgenticMessageEnvelope sender missing required field: ${field}`);
    }
  }
}

function canonicalizeItemUrl(itemUrl: string): string {
  const url = new URL(itemUrl);
  const trackingParams = ['fbclid', 'gclid', 'mc_cid', 'mc_eid'];

  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith('utm_') || trackingParams.includes(key)) {
      url.searchParams.delete(key);
    }
  }

  url.hash = '';
  return url.toString();
}

function extractHighSignalImperatives(text: string): string[] {
  const imperativeStarters = new Set(['add', 'build', 'check', 'consider', 'create', 'do', 'implement', 'make', 'read', 'run', 'use']);

  return text
    .split(/\n+/u)
    .flatMap((line) => splitSentences(line))
    .map((sentence) => sentence.trim())
    .filter((sentence) => {
      const firstWord = sentence.match(/^[A-Za-z]+/u)?.[0].toLowerCase();
      return firstWord ? imperativeStarters.has(firstWord) : false;
    });
}

function validateSkillCardPayload(payload: object, errors: string[]): void {
  const card = payload as Record<string, unknown>;
  const byteLength = Buffer.byteLength(JSON.stringify(payload), 'utf8');

  if (byteLength > SKILL_CARD_MAX_BYTES) {
    errors.push(`skill.card exceeds Tier 0 byte budget of ${SKILL_CARD_MAX_BYTES} bytes.`);
  }
  if (!SKILL_CARD_RISK_CLASSES.includes(card.risk_class as SkillCardRiskClass)) {
    errors.push(`skill.card risk_class must be one of: ${SKILL_CARD_RISK_CLASSES.join(', ')}.`);
  }
  if (requiredString(card.one_line as string | undefined) && (card.one_line as string).length > 140) {
    errors.push('skill.card one_line must be 140 characters or fewer.');
  }
  if (!Array.isArray(card.triggers) || card.triggers.length < 3 || card.triggers.length > 8) {
    errors.push('skill.card triggers must include 3 to 8 broker-facing trigger hints.');
  }
  if (!Array.isArray(card.tool_scopes)) {
    errors.push('skill.card tool_scopes must be an array of broker-facing tool family hints.');
  } else if (card.tool_scopes.some((scope) => !requiredString(scope as string | undefined) || scope === '*')) {
    errors.push('skill.card tool_scopes entries must be broker-facing tool family hints, not wildcards.');
  }

  const subject = card.subject;
  if (!isRecord(subject)) {
    errors.push('skill.card subject must be an object.');
  } else {
    for (const field of ['doc_id', 'pack_id', 'version']) {
      if (!requiredString(subject[field] as string | undefined)) {
        errors.push(`skill.card subject missing required field: ${field}`);
      }
    }
    if (requiredString(subject.pack_id as string | undefined) && !SKILL_CARD_PACK_ID_PATTERN.test(subject.pack_id as string)) {
      errors.push('skill.card subject.pack_id must match cidv1-sha256-<64 hex>.');
    }
  }

  const provenance = card.provenance;
  if (!isRecord(provenance)) {
    errors.push('skill.card provenance must be an object.');
  } else {
    for (const field of ['origin', 'trust_ref']) {
      if (!requiredString(provenance[field] as string | undefined)) {
        errors.push(`skill.card provenance missing required field: ${field}`);
      }
    }
  }

  errors.push(
    ...findSkillCardAuthorityFieldPaths(payload).map((fieldPath) => `skill.card contains forbidden Tier 0 authority field: ${fieldPath}`)
  );
}

function validateStringArray(value: unknown, errorMessage: string, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0 || value.some((entry) => !requiredString(entry as string | undefined))) {
    errors.push(errorMessage);
  }
}

function validateAdapterCapabilityManifestPayload(payload: object, errors: string[]): void {
  const manifest = payload as Record<string, unknown>;

  if (manifest.schema_version !== 'adapter-capability-manifest-v1') {
    errors.push('adapter.capability_manifest schema_version must be adapter-capability-manifest-v1.');
  }
  if (!CAPABILITY_PRIVILEGE_TIERS.includes(manifest.privilege_tier as CapabilityPrivilegeTier)) {
    errors.push(`adapter.capability_manifest privilege_tier must be one of: ${CAPABILITY_PRIVILEGE_TIERS.join(', ')}.`);
  }
  if (!CAPABILITY_EFFECT_CLASSES.includes(manifest.effect_class as CapabilityEffectClass)) {
    errors.push(`adapter.capability_manifest effect_class must be one of: ${CAPABILITY_EFFECT_CLASSES.join(', ')}.`);
  }
  if (!CAPABILITY_IDEMPOTENCY_VALUES.includes(manifest.idempotency as CapabilityIdempotency)) {
    errors.push(`adapter.capability_manifest idempotency must be one of: ${CAPABILITY_IDEMPOTENCY_VALUES.join(', ')}.`);
  }
  if (!CAPABILITY_REPLAY_SAFETY_VALUES.includes(manifest.replay_safety as CapabilityReplaySafety)) {
    errors.push(`adapter.capability_manifest replay_safety must be one of: ${CAPABILITY_REPLAY_SAFETY_VALUES.join(', ')}.`);
  }

  if (!requiredString(manifest.input_schema_ref as string | undefined)) {
    errors.push('adapter.capability_manifest input_schema_ref is required.');
  }
  if (!requiredString(manifest.output_schema_ref as string | undefined)) {
    errors.push('adapter.capability_manifest output_schema_ref is required.');
  }
  validateStringArray(
    manifest.fixture_refs,
    'adapter.capability_manifest fixture_refs must include at least one conformance fixture reference.',
    errors
  );

  const posture = manifest.posture;
  if (!isRecord(posture)) {
    errors.push('adapter.capability_manifest posture must be an object.');
  }

  const guard = manifest.guard;
  if (!isRecord(guard)) {
    errors.push('adapter.capability_manifest guard must be an object.');
  }

  const hostHints = manifest.host_hints;
  if (!isRecord(hostHints)) {
    errors.push('adapter.capability_manifest host_hints must be an object.');
  }

  if (!isRecord(posture) || !isRecord(guard) || !isRecord(hostHints)) {
    return;
  }

  for (const field of ['destructive', 'network_facing', 'payment_sensitive', 'sandbox_safe', 'side_effecting']) {
    if (typeof posture[field] !== 'boolean') {
      errors.push(`adapter.capability_manifest posture.${field} must be boolean.`);
    }
  }
  if (typeof guard.decision_required !== 'boolean') {
    errors.push('adapter.capability_manifest guard.decision_required must be boolean.');
  }
  if (typeof guard.receipt_required !== 'boolean') {
    errors.push('adapter.capability_manifest guard.receipt_required must be boolean.');
  }
  if (!Array.isArray(guard.policy_refs)) {
    errors.push('adapter.capability_manifest guard.policy_refs must be an array.');
  }
  if (!CAPABILITY_HINT_TREATMENTS.includes(hostHints.treatment as CapabilityHintTreatment)) {
    errors.push(`adapter.capability_manifest host_hints.treatment must be one of: ${CAPABILITY_HINT_TREATMENTS.join(', ')}.`);
  }

  const requiresGuard =
    posture.side_effecting === true ||
    posture.destructive === true ||
    posture.payment_sensitive === true ||
    posture.sandbox_safe === false ||
    manifest.effect_class === 'local-write' ||
    manifest.effect_class === 'external-write' ||
    manifest.effect_class === 'payment';

  if (requiresGuard && guard.decision_required !== true) {
    errors.push('adapter.capability_manifest side-effecting capabilities require guard.decision_required=true.');
  }
  if (
    requiresGuard &&
    (!Array.isArray(guard.policy_refs) || guard.policy_refs.length === 0 || guard.policy_refs.some((entry) => !requiredString(entry as string | undefined)))
  ) {
    errors.push('adapter.capability_manifest side-effecting capabilities require at least one guard.policy_refs entry.');
  }
  if (requiresGuard && guard.receipt_required !== true) {
    errors.push('adapter.capability_manifest side-effecting capabilities require guard.receipt_required=true.');
  }
  if (posture.destructive === true && manifest.replay_safety === 'replay-safe') {
    errors.push('adapter.capability_manifest destructive capabilities cannot declare replay_safety=replay-safe.');
  }
  if (
    hostHints.treatment === 'normalized' &&
    (!Array.isArray(hostHints.normalized_refs) ||
      hostHints.normalized_refs.length === 0 ||
      hostHints.normalized_refs.some((entry) => !requiredString(entry as string | undefined)))
  ) {
    errors.push('adapter.capability_manifest normalized host hints require at least one normalized_refs entry.');
  }
  if (
    hostHints.treatment === 'rejected-inconsistent' &&
    (!Array.isArray(hostHints.rejection_reasons) ||
      hostHints.rejection_reasons.length === 0 ||
      hostHints.rejection_reasons.some((entry) => !requiredString(entry as string | undefined)))
  ) {
    errors.push('adapter.capability_manifest rejected host hints require at least one rejection_reasons entry.');
  }
}

function validateReceiptPayload(payload: object, errors: string[]): void {
  const receipt = payload as Record<string, unknown>;
  const claims = Array.isArray(receipt.claims) ? receipt.claims : [];
  const digests = Array.isArray(receipt.digests) ? receipt.digests : [];

  claims.forEach((claim, claimIndex) => {
    if (!isRecord(claim)) {
      errors.push(`Receipt claim ${claimIndex} must be an object.`);
      return;
    }

    const evidence = Array.isArray(claim.evidence) ? claim.evidence : [];
    evidence.forEach((entry, evidenceIndex) => {
      if (!isRecord(entry) || !requiredString(entry.cid as string | undefined)) {
        errors.push(`Receipt claim ${claimIndex} evidence ${evidenceIndex} missing required field: cid`);
      }
    });
  });

  digests.forEach((digest, digestIndex) => {
    if (!isRecord(digest)) {
      errors.push(`Receipt digest ${digestIndex} must be an object.`);
      return;
    }

    for (const field of ['alg', 'digest', 'of']) {
      if (!requiredString(digest[field] as string | undefined)) {
        errors.push(`Receipt digest ${digestIndex} missing required field: ${field}`);
      }
    }
  });
}

function validateCanonicalArtifactPayload(payload: object, errors: string[]): void {
  const artifact = payload as Record<string, unknown>;
  const rightsScopes = artifact.rightsScopes;
  const provenanceRefs = artifact.provenanceRefs;

  if (!Array.isArray(rightsScopes) || rightsScopes.length === 0) {
    errors.push('source.canonical_artifact rightsScopes must include at least one scope.');
  }

  if (!isRecord(provenanceRefs)) {
    errors.push('source.canonical_artifact provenanceRefs must be an object.');
    return;
  }

  for (const field of ['evaluationReceiptCid', 'fetchReceiptCid', 'normalizationReceiptCid']) {
    if (!requiredString(provenanceRefs[field] as string | undefined)) {
      errors.push(`source.canonical_artifact provenanceRefs missing required field: ${field}`);
    }
  }
}

function validateSourceSpanRefs(kind: string, sourceSpans: unknown, errors: string[]): void {
  if (!Array.isArray(sourceSpans) || sourceSpans.length === 0) {
    errors.push(`${kind} sourceSpans must include at least one span.`);
    return;
  }

  sourceSpans.forEach((span, index) => {
    if (!isRecord(span)) {
      errors.push(`${kind} sourceSpans ${index} must be an object.`);
      return;
    }

    for (const field of ['endOffset', 'sourceManifestationCid', 'sourceRecordCid', 'startOffset', 'textHash']) {
      if (!(field in span)) {
        errors.push(`${kind} sourceSpans ${index} missing required field: ${field}`);
      }
    }
  });
}

function validateDerivedArtifactPayload(payload: object, errors: string[]): void {
  const artifact = payload as Record<string, unknown>;
  if (artifact.derivationKind !== 'summary' && artifact.derivationKind !== 'extract') {
    errors.push('source.derived_artifact derivationKind must be summary or extract.');
  }

  validateSourceSpanRefs('source.derived_artifact', artifact.sourceSpans, errors);
}

export function validatePayload(kind: string, payload: object): ValidationResult {
  const errors = (REQUIRED_FIELDS[kind] ?? [])
    .filter((field) => !(field in payload))
    .map((field) => `Missing required field: ${field}`);

  if (kind === 'rosetta.evaluation' && isSalienceEvaluationProfile(payload)) {
    errors.push(...validateSalienceEvaluation(payload).errors);
  } else if (kind === 'rosetta.evaluation' && isCounterfactualEvaluationProfile(payload)) {
    errors.push(...validateCounterfactualEvaluation(payload).errors);
  } else if (kind === 'rosetta.observation' && 'profile' in payload) {
    errors.push(...validatePromotionStatePayload(payload));
  } else if (kind === 'rosetta.receipt') {
    validateReceiptPayload(payload, errors);
  } else if (kind === 'adapter.capability_manifest') {
    validateAdapterCapabilityManifestPayload(payload, errors);
  } else if (kind === 'skill.card') {
    validateSkillCardPayload(payload, errors);
  } else if (kind === 'source.canonical_artifact') {
    validateCanonicalArtifactPayload(payload, errors);
  } else if (kind === 'source.derived_artifact') {
    validateDerivedArtifactPayload(payload, errors);
  }

  return {
    errors,
    ok: errors.length === 0
  };
}

export function validateAdapterCapabilityManifest(input: Record<string, unknown>): AdapterCapabilityManifestValidationResult {
  const result = validatePayload('adapter.capability_manifest', input);

  return {
    ...result,
    schemaId: 'adapter-capability-manifest-v1'
  };
}

export function validateSkillCard(input: Record<string, unknown>): SkillCardValidationResult {
  const result = validatePayload('skill.card', input);

  return {
    ...result,
    schemaId: 'skill.card.v1'
  };
}

export function validateCompoundCacheKey(input: CompoundCacheKeyInput): ValidationResult {
  const errors = COMPOUND_CACHE_KEY_DIMENSIONS.filter((dimension) => !requiredString(input[dimension])).map(
    (dimension) => `Missing required cache key dimension: ${dimension}`
  );

  return {
    errors,
    ok: errors.length === 0
  };
}

export function buildCompoundCacheKey(input: CompoundCacheKeyInput): CompoundCacheKey {
  const validation = validateCompoundCacheKey(input);
  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  const key = input as Required<CompoundCacheKeyInput>;
  const lookupKey = COMPOUND_CACHE_KEY_LOOKUP_ORDER.map((dimension) => {
    return `${COMPOUND_CACHE_KEY_LOOKUP_NAMES[dimension]}=${encodeURIComponent(key[dimension])}`;
  }).join('|');

  return {
    dataClassification: key.dataClassification,
    lookupKey: `cache-key-v1:${lookupKey}`,
    policyVersion: key.policyVersion,
    rightsDomain: key.rightsDomain,
    semanticIntent: key.semanticIntent,
    sourceBundleHash: key.sourceBundleHash
  };
}

export function changedCompoundCacheKeyDimensions(
  before: Pick<CompoundCacheKey, CompoundCacheKeyDimension>,
  after: Pick<CompoundCacheKey, CompoundCacheKeyDimension>
): CompoundCacheKeyDimension[] {
  return COMPOUND_CACHE_KEY_DIMENSIONS.filter((dimension) => before[dimension] !== after[dimension]);
}

export function normalizeDomainRef(input: DomainRefInput): DomainRef {
  const classification = normalizeToken(input.classification);
  if (!isDomainClassification(classification)) {
    throw new Error(`Unsupported domain_ref classification: ${input.classification}`);
  }

  return {
    abacLabels: normalizeLabels(input.abacLabels),
    classification,
    tenantId: normalizeToken(input.tenantId),
    ...(input.vendorRoute === undefined ? {} : { vendorRoute: normalizeToken(input.vendorRoute) })
  };
}

export function validateDomainRef(input: DomainRefInput | DomainRef): ValidationResult {
  const errors: string[] = [];
  const tenantId = input.tenantId;
  const classification = normalizeToken(input.classification);

  if (!requiredString(tenantId)) {
    errors.push('domain_ref.tenantId is required.');
  }
  if (!isDomainClassification(classification)) {
    errors.push(`domain_ref.classification must be one of: ${Object.keys(DOMAIN_CLASSIFICATION_RANK).join(', ')}.`);
  }

  for (const label of normalizeLabels(input.abacLabels)) {
    if (!requiredString(label.key) || !requiredString(label.value)) {
      errors.push('domain_ref.abacLabels entries must include key and value.');
      break;
    }
  }

  return {
    errors,
    ok: errors.length === 0
  };
}

export function getAgenticMessageSchemaProfile(msgType: string): AgenticMessageSchemaProfile | undefined {
  return AGENTIC_MESSAGE_TYPE_PROFILES[msgType as AgenticMessageType];
}

export function validateAgenticMessageEnvelope(envelope: Record<string, unknown>): AgenticMessageValidationResult {
  const errors = AGENTIC_MESSAGE_ENVELOPE_REQUIRED_FIELDS.filter((field) => !(field in envelope)).map(
    (field) => `AgenticMessageEnvelope missing required field: ${field}`
  );
  const quarantineReasons: AgenticMessageQuarantineReason[] = [];

  if ('sender' in envelope) {
    validateAgenticSender(envelope.sender, errors);
  }

  if ('issued_at' in envelope && !isIsoTimestamp(envelope.issued_at as string)) {
    errors.push('AgenticMessageEnvelope issued_at must be an ISO-8601 timestamp.');
  }
  if ('expires_at' in envelope && !isIsoTimestamp(envelope.expires_at as string)) {
    errors.push('AgenticMessageEnvelope expires_at must be an ISO-8601 timestamp.');
  }

  const msgType = envelope.msg_type;
  if (!requiredString(msgType as string | undefined) || getAgenticMessageSchemaProfile(msgType as string) === undefined) {
    errors.push('AgenticMessageEnvelope msg_type must be one of the registered internal Agentic Messaging families.');
    quarantineReasons.push('UNKNOWN_MESSAGE_TYPE');
  }

  if ('domain_ref' in envelope && isRecord(envelope.domain_ref)) {
    const domainValidation = validateDomainRef(envelope.domain_ref as unknown as DomainRefInput | DomainRef);
    errors.push(...domainValidation.errors.map((error) => `AgenticMessageEnvelope ${error}`));
  } else if ('domain_ref' in envelope) {
    errors.push('AgenticMessageEnvelope domain_ref must be an object.');
  }

  if (errors.length > 0 && quarantineReasons.length === 0) {
    quarantineReasons.push('SCHEMA_INVALID');
  }

  return {
    errors,
    ok: errors.length === 0,
    quarantineReasons,
    schemaId: 'entif.agentic-messaging.envelope.v1'
  };
}

export function validateAgenticMessagePayload(msgType: string, payload: Record<string, unknown>): AgenticMessageValidationResult {
  const profile = getAgenticMessageSchemaProfile(msgType);

  if (profile === undefined) {
    return {
      errors: ['Agentic message type is not registered.'],
      ok: false,
      quarantineReasons: ['UNKNOWN_MESSAGE_TYPE'],
      schemaId: 'entif.agentic-messaging.unregistered'
    };
  }

  const errors = profile.requiredFields
    .filter((field) => !(field in payload))
    .map((field) => `${msgType} missing required field: ${field}`);

  return {
    errors,
    ok: errors.length === 0,
    quarantineReasons: errors.length === 0 ? [] : ['SCHEMA_INVALID'],
    schemaId: profile.schemaId
  };
}

function byteLengthOfJson(value: Record<string, unknown> | undefined): number {
  if (value === undefined) {
    return 0;
  }
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

export function evaluateAgenticMessageSizePolicy(input: AgenticMessageSizePolicyInput): AgenticMessageSizePolicyResult {
  const observedBytes =
    (input.envelopeBytes ?? byteLengthOfJson(input.envelope)) + (input.payloadBytes ?? byteLengthOfJson(input.payload));
  const maxMessageBytes = AGENTIC_MESSAGE_SIZE_POLICY.defaultMaxMessageBytes;
  const errors: string[] = [];
  const incidentCodes: AgenticMessageSecurityIncidentCode[] = [];
  const quarantineReasons: AgenticMessageQuarantineReason[] = [];

  if (observedBytes > maxMessageBytes) {
    errors.push(`${input.msgType} message size ${observedBytes} bytes exceeds max_message_size ${maxMessageBytes} bytes.`);
    incidentCodes.push('MESSAGE_SIZE_LIMIT_EXCEEDED');
    quarantineReasons.push('MESSAGE_SIZE_EXCEEDED');
  }

  if (input.msgType === 'ARTIFACT_PUBLISH' && input.payload) {
    const inlineArtifactPaths = findInlineArtifactFieldPaths(input.payload);
    if (inlineArtifactPaths.length > 0) {
      errors.push(
        ...inlineArtifactPaths.map((path) => `ARTIFACT_PUBLISH must stay reference-only; inline artifact field ${path} is not allowed.`)
      );
      incidentCodes.push('INLINE_ARTIFACT_PAYLOAD');
      quarantineReasons.push('MESSAGE_SIZE_EXCEEDED');
    }
  }

  return {
    errors,
    incidentCodes: dedupeList(incidentCodes),
    ok: errors.length === 0,
    quarantineReasons: dedupeList(quarantineReasons),
    schemaId: 'entif.agentic-messaging.size-policy.v1',
    telemetryEvidence: {
      artifactTransferPosture: AGENTIC_MESSAGE_SIZE_POLICY.artifactTransferPosture,
      issueOwner: AGENTIC_MESSAGE_SIZE_POLICY.issueOwner,
      maxMessageBytes,
      observedBytes,
      policyRef: 'agentic-message-size-policy.v1',
      stage: 'size-enforce'
    }
  };
}

export function evaluateAgenticMessageExecutionPolicy(
  msgType: string,
  payload: Record<string, unknown>,
  envelopeDomainRef: DomainRefInput | DomainRef,
  options: AgenticMessageExecutionPolicyOptions = {}
): AgenticMessageExecutionPolicyResult {
  const profile = getAgenticMessageSchemaProfile(msgType);

  if (profile === undefined) {
    return {
      errors: ['Agentic message type is not registered.'],
      executorDisposition: 'quarantine',
      incidentCodes: [],
      ok: false,
      plane: 'unknown',
      quarantineReasons: ['UNKNOWN_MESSAGE_TYPE'],
      requiresGuardDecision: false,
      schemaId: 'entif.agentic-messaging.unregistered'
    };
  }

  const payloadValidation = validateAgenticMessagePayload(msgType, payload);
  const errors = [...payloadValidation.errors];
  const incidentCodes: AgenticMessageSecurityIncidentCode[] = [];
  const quarantineReasons = [...payloadValidation.quarantineReasons];
  let domainComparison: DomainCompareResult | undefined;

  if (profile.plane === 'data') {
    const actionBearingPaths = findActionBearingFieldPaths(payload);
    if (actionBearingPaths.length > 0) {
      errors.push(
        ...actionBearingPaths.map(
          (path) => `${msgType} data-plane payload contains forbidden action-bearing field family at ${path}.`
        )
      );
      incidentCodes.push('DATA_PLANE_CAPABILITY_PAYLOAD');
      quarantineReasons.push('ACTION_BEARING_DATA_PLANE');
    }
  }

  if (profile.plane === 'control' && options.authorizationDomainRef) {
    domainComparison = compareDomainRefs(options.authorizationDomainRef, envelopeDomainRef);
    if (!domainComparison.ok) {
      errors.push(`Control-plane domain_ref mismatch: ${domainComparison.reasons.join(', ')}`);
      incidentCodes.push('DOMAIN_REF_MISMATCH');
      quarantineReasons.push('DOMAIN_REF_MISMATCH');
    }
  }

  const ok = errors.length === 0;
  return {
    domainComparison,
    errors,
    executorDisposition: ok ? AGENTIC_MESSAGE_EXECUTOR_CONTRACT[profileMsgType(msgType)] : 'quarantine',
    incidentCodes: dedupeList(incidentCodes),
    ok,
    plane: profile.plane,
    quarantineReasons: dedupeList(quarantineReasons),
    requiresGuardDecision: AGENTIC_MESSAGE_EXECUTOR_CONTRACT[profileMsgType(msgType)] === 'guard-decision-required',
    schemaId: profile.schemaId
  };
}

function profileMsgType(msgType: string): AgenticMessageType {
  return msgType as AgenticMessageType;
}

export function compareDomainRefs(
  authorization: DomainRefInput | DomainRef,
  request: DomainRefInput | DomainRef,
  options: DomainCompareOptions = {}
): DomainCompareResult {
  const authorized = normalizeDomainRef(authorization);
  const requested = normalizeDomainRef(request);
  const reasons: DomainCompareReason[] = [];

  if (authorized.tenantId !== requested.tenantId) {
    reasons.push('TENANT_MISMATCH');
  }
  if (DOMAIN_CLASSIFICATION_RANK[authorized.classification] < DOMAIN_CLASSIFICATION_RANK[requested.classification]) {
    reasons.push('CLASSIFICATION_WIDENING');
  }

  const authorizedLabels = new Set(authorized.abacLabels.map((label) => `${label.key}=${label.value}`));
  for (const label of requested.abacLabels) {
    const labelKey = `${label.key}=${label.value}`;
    if (!authorizedLabels.has(labelKey)) {
      reasons.push(`ABAC_LABEL_MISSING:${labelKey}`);
    }
  }

  if ((authorized.vendorRoute ?? requested.vendorRoute) !== undefined && authorized.vendorRoute !== requested.vendorRoute) {
    reasons.push('VENDOR_ROUTE_MISMATCH');
  }

  if (reasons.length > 0 && options.bridgePolicyRef) {
    return {
      ok: true,
      reasons: ['CROSS_DOMAIN_BRIDGE_AUTHORIZED']
    };
  }
  if (reasons.length > 0) {
    reasons.push('CROSS_DOMAIN_REUSE_DENIED');
  }

  return {
    ok: reasons.length === 0,
    reasons
  };
}

export function validateIntakeEnvelope(input: IntakeEnvelopeInput): ValidationResult {
  const errors = INTAKE_ENVELOPE_REQUIRED_FIELDS.filter((field) => !(field in input)).map(
    (field) => `Missing required field: ${field}`
  );

  if (!requiredString(input.contentPointer)) {
    errors.push('IntakeEnvelope contentPointer is required even when full-text fetch fails.');
  }
  if (!input.receipts?.itemHash) {
    errors.push('IntakeEnvelope receipts.itemHash is required.');
  }
  if (!requiredString(input.itemUrl) || !isUrl(input.itemUrl)) {
    errors.push('IntakeEnvelope itemUrl must be a URL.');
  }
  if (!requiredString(input.retrievedAt) || !isIsoTimestamp(input.retrievedAt)) {
    errors.push('IntakeEnvelope retrievedAt must be an ISO-8601 timestamp.');
  }
  if (input.publishedAt && !isIsoTimestamp(input.publishedAt)) {
    errors.push('IntakeEnvelope publishedAt must be an ISO-8601 timestamp.');
  }

  return {
    errors,
    ok: errors.length === 0
  };
}

export function buildIntakeEnvelope(input: IntakeEnvelopeInput): IntakeEnvelope {
  const itemUrl = canonicalizeItemUrl(input.itemUrl);
  const itemHash =
    input.receipts?.itemHash ??
    makeContentId(
      JSON.stringify({
        author: input.author ?? '',
        itemUrl,
        publishedAt: input.publishedAt ?? '',
        sourceName: input.sourceName,
        title: input.title
      })
    );
  const envelope = {
    ...input,
    itemUrl,
    normalized: {
      highSignalImperatives: extractHighSignalImperatives(input.rawExcerpt)
    },
    receipts: {
      ...input.receipts,
      itemHash
    }
  };
  const validation = validateIntakeEnvelope(envelope);
  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  return envelope;
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function validateActionItem(item: DailyTopShelfActionItem, label: string, errors: string[]): void {
  if (!hasText(item.why) || !hasText(item.action)) {
    errors.push(`${label} must include why and action.`);
  }
  if (!hasText(item.title) || !hasText(item.source)) {
    errors.push(`${label} must include title and source.`);
  }
}

function validateStoreItem(item: DailyTopShelfStoreItem, label: string, errors: string[]): void {
  if (!hasText(item.title) || !hasText(item.source) || !hasText(item.why)) {
    errors.push(`${label} must include title, source, and why.`);
  }
}

export function validateDailyTopShelfDigest(
  input: DailyTopShelfDigestInput & Partial<Pick<DailyTopShelfDigest, 'artifactCid' | 'artifactName'>>
): ValidationResult {
  const errors = DAILY_TOP_SHELF_REQUIRED_FIELDS.filter((field) => !(field in input)).map(
    (field) => `Missing required field: ${field}`
  );

  if (!/^\d{4}-\d{2}-\d{2}$/u.test(input.date)) {
    errors.push('DailyTopShelfDigest date must use YYYY-MM-DD.');
  }
  if (!requiredString(input.generatedAt) || !isIsoTimestamp(input.generatedAt)) {
    errors.push('DailyTopShelfDigest generatedAt must be an ISO-8601 timestamp.');
  }
  if (input.slots.actThisWeek.length !== 3) {
    errors.push('DailyTopShelfDigest must include exactly 3 actThisWeek items.');
  }
  if (input.slots.storeForLater.length !== 2) {
    errors.push('DailyTopShelfDigest must include exactly 2 storeForLater items.');
  }

  input.slots.actThisWeek.forEach((item, index) => validateActionItem(item, `Act item ${index}`, errors));
  input.slots.storeForLater.forEach((item, index) => validateStoreItem(item, `Store item ${index}`, errors));
  (input.escalated ?? []).forEach((item, index) => validateActionItem(item, `Escalated item ${index}`, errors));

  if (!hasText(input.slots.designDecisionChange.decision)) {
    errors.push('Design decision change must name the changed decision.');
  }
  validateStoreItem(input.slots.designDecisionChange, 'Design decision change', errors);

  if (!hasText(input.slots.riskToTrack.watch)) {
    errors.push('Risk to track must identify what is being watched.');
  }
  validateStoreItem(input.slots.riskToTrack, 'Risk to track', errors);

  return {
    errors,
    ok: errors.length === 0
  };
}

export function buildDailyTopShelfDigest(input: DailyTopShelfDigestInput): DailyTopShelfDigest {
  const validation = validateDailyTopShelfDigest(input);
  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  const artifactName = `daily-top-shelf-${input.date}`;
  const digestWithoutCid = {
    ...input,
    artifactName,
    escalated: input.escalated ?? []
  };

  return {
    ...digestWithoutCid,
    artifactCid: makeContentId(JSON.stringify(digestWithoutCid))
  };
}

export function validateCompositionProvenanceRecord(input: CompositionProvenanceInput): ValidationResult {
  const errors = COMPOSITION_INPUT_REQUIRED_FIELDS.filter((field) => !(field in input)).map(
    (field) => `Missing required field: ${field}`
  );

  if (input.providers.length === 0) {
    errors.push('Composition provenance must include at least one provider source.');
  }

  for (const provider of input.providers) {
    for (const field of COMPOSITION_PROVIDER_REQUIRED_FIELDS) {
      if (!provider[field]) {
        errors.push(`Provider ${provider.providerId || '<unknown>'} missing required field: ${field}`);
      }
    }
    if (provider.challengePath.length === 0) {
      errors.push(`Provider ${provider.providerId || '<unknown>'} must include a challengeability path.`);
    }
  }

  for (const attribution of input.sourceAttributions) {
    const provider = input.providers.find((candidate) => candidate.providerId === attribution.providerId);
    if (!provider) {
      errors.push(`Attribution ${attribution.answerFragmentId} references unknown provider: ${attribution.providerId}`);
    } else if (provider.providerResponseCid !== attribution.providerResponseCid) {
      errors.push(`Attribution ${attribution.answerFragmentId} provider response does not match provider source.`);
    }
  }

  return {
    errors,
    ok: errors.length === 0
  };
}

export function buildCompositionProvenanceRecord(input: CompositionProvenanceInput): CompositionProvenanceRecord {
  const validation = validateCompositionProvenanceRecord(input);
  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  const recordWithoutCid = {
    answerCid: input.answerCid,
    composedAt: input.composedAt,
    compositionLogic: input.compositionLogic,
    compositionReceiptCid: input.compositionReceiptCid,
    providers: input.providers,
    recordId: input.recordId,
    sourceAttributions: input.sourceAttributions
  };

  return {
    ...recordWithoutCid,
    recordCid: makeContentId(JSON.stringify(recordWithoutCid))
  };
}

export function traceCompositionSource(
  record: CompositionProvenanceRecord,
  answerFragmentId: string
): CompositionTrace | undefined {
  const attribution = record.sourceAttributions.find((candidate) => candidate.answerFragmentId === answerFragmentId);
  if (!attribution) {
    return undefined;
  }

  const provider = record.providers.find((candidate) => candidate.providerId === attribution.providerId);
  if (!provider) {
    return undefined;
  }

  return {
    answerFragmentId,
    challengePath: [...provider.challengePath],
    providerId: provider.providerId,
    providerResponseCid: provider.providerResponseCid,
    subQueryReceiptCid: provider.subQueryReceiptCid
  };
}

export function validatePostmortemArtifact(input: PostmortemArtifactInput): ValidationResult {
  const errors = POSTMORTEM_REQUIRED_FIELDS.filter((field) => !(field in input)).map(
    (field) => `Missing required field: ${field}`
  );

  if (input.outcomeClass !== 'FAIL' && input.outcomeClass !== 'PARTIAL' && input.outcomeClass !== 'PASS') {
    errors.push('Postmortem outcomeClass must be PASS, FAIL, or PARTIAL.');
  }
  if (!requiredString(input.rootCause)) {
    errors.push('Postmortem rootCause is required.');
  }
  if (!Array.isArray(input.reproductionSteps) || input.reproductionSteps.length === 0) {
    errors.push('Postmortem reproductionSteps must include at least one step.');
  }
  if (!Array.isArray(input.receiptChain) || input.receiptChain.length === 0) {
    errors.push('Postmortem receiptChain must include at least one receipt id.');
  }
  if (!requiredString(input.timestamp) || !isIsoTimestamp(input.timestamp)) {
    errors.push('Postmortem timestamp must be an ISO-8601 timestamp.');
  }

  return {
    errors,
    ok: errors.length === 0
  };
}

export function shouldGeneratePostmortem(outcomeClass: PostmortemOutcomeClass): boolean {
  return outcomeClass === 'FAIL' || outcomeClass === 'PARTIAL';
}

export function buildPostmortemArtifact(input: PostmortemArtifactInput): PostmortemArtifact {
  const validation = validatePostmortemArtifact(input);
  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  const artifactWithoutCid = {
    attachments: input.attachments ?? [],
    envelopeId: input.envelopeId,
    outcomeClass: input.outcomeClass,
    proposedEvolution: input.proposedEvolution ?? [],
    receiptChain: input.receiptChain,
    reproductionSteps: input.reproductionSteps,
    retention: {
      archive: 'cold' as const,
      warmDays: 90 as const
    },
    review: {
      generatedBy: 'orchestrator' as const,
      humanReviewRequired: input.outcomeClass === 'FAIL'
    },
    rootCause: input.rootCause,
    stepId: input.stepId,
    suggestedRubricChanges: input.suggestedRubricChanges ?? [],
    timestamp: input.timestamp,
    workflowId: input.workflowId
  };

  return {
    ...artifactWithoutCid,
    artifactCid: makeContentId(JSON.stringify(artifactWithoutCid))
  };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function differsFromOne(value: number, tolerance: number): boolean {
  return Math.abs(value - 1) > tolerance;
}

function computeTransportEntropy(transport: number[][]): number {
  const masses = transport.flat().filter((entry) => entry > 0);
  return -masses.reduce((entropy, mass) => entropy + mass * Math.log2(mass), 0);
}

export function validateTranslationEvidence(input: TranslationEvidenceInput): TranslationEvidenceValidation {
  const structuralErrors = TRANSLATION_EVIDENCE_REQUIRED_FIELDS.filter((field) => !(field in input)).map(
    (field) => `Missing required field: ${field}`
  );
  if (input.transport.length !== input.sourceConceptRefs.length) {
    structuralErrors.push('Transport row count must match source concept refs.');
  }
  if (input.transport.some((row) => row.length !== input.targetConceptRefs.length)) {
    structuralErrors.push('Each transport row must match target concept refs.');
  }

  const numericalErrors: string[] = [];
  input.transport.forEach((row, rowIndex) => {
    row.forEach((entry, columnIndex) => {
      if (entry < 0) {
        numericalErrors.push(`Transport entry [${rowIndex},${columnIndex}] must be nonnegative.`);
      }
    });
    const rowMass = sum(row);
    if (differsFromOne(rowMass, input.tolerance)) {
      numericalErrors.push(`Row ${rowIndex} mass ${rowMass} differs from 1 by more than tolerance ${input.tolerance}.`);
    }
  });

  for (let columnIndex = 0; columnIndex < input.targetConceptRefs.length; columnIndex += 1) {
    const columnMass = sum(input.transport.map((row) => row[columnIndex] ?? 0));
    if (differsFromOne(columnMass, input.tolerance)) {
      numericalErrors.push(`Column ${columnIndex} mass ${columnMass} differs from 1 by more than tolerance ${input.tolerance}.`);
    }
  }

  const numerical = {
    errors: numericalErrors,
    ok: numericalErrors.length === 0
  };

  return {
    composition: numerical,
    numerical,
    structural: {
      errors: structuralErrors,
      ok: structuralErrors.length === 0
    }
  };
}

export function buildTranslationEvidence(input: TranslationEvidenceInput): TranslationEvidenceArtifact {
  const validation = validateTranslationEvidence(input);
  const errors = [...validation.structural.errors, ...validation.numerical.errors];
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  const artifactWithoutCid = {
    ...input,
    ambiguity: {
      entropy: computeTransportEntropy(input.transport)
    }
  };

  return {
    ...artifactWithoutCid,
    artifactCid: makeContentId(JSON.stringify(artifactWithoutCid))
  };
}

export function composeTranslationEvidence(
  first: TranslationEvidenceArtifact,
  second: TranslationEvidenceArtifact
): TranslationEvidenceArtifact {
  if (first.targetConceptRefs.join('\0') !== second.sourceConceptRefs.join('\0')) {
    throw new Error('TranslationEvidence composition requires first targets to match second sources.');
  }

  const transport = first.transport.map((firstRow) =>
    second.targetConceptRefs.map((_, targetColumnIndex) =>
      sum(firstRow.map((firstMass, midIndex) => firstMass * second.transport[midIndex][targetColumnIndex]))
    )
  );

  return buildTranslationEvidence({
    evidenceRefs: [...new Set([...first.evidenceRefs, ...second.evidenceRefs])],
    lineageRefs: [first.artifactCid, second.artifactCid],
    normalizationProfile: first.normalizationProfile,
    receiptBundleCid: first.receiptBundleCid,
    sourceConceptRefs: [...first.sourceConceptRefs],
    supersedesRefs: [],
    targetConceptRefs: [...second.targetConceptRefs],
    tolerance: Math.max(first.tolerance, second.tolerance),
    transport,
    validationProfile: first.validationProfile
  });
}

export function emitShaclShapes(kinds = Object.keys(REQUIRED_FIELDS)): string {
  const lines = ['@prefix sh: <http://www.w3.org/ns/shacl#> .', '@prefix entif: <https://entif.ai/ns#> .', ''];

  for (const kind of kinds) {
    const required = REQUIRED_FIELDS[kind] ?? [];
    const shapeId = kind.replace(/[^a-zA-Z0-9]+/gu, '_');

    lines.push(`entif:${shapeId}Shape a sh:NodeShape ;`);
    lines.push(`  sh:message "${kind} must contain its required fields." ;`);
    required.forEach((field, index) => {
      const suffix = index === required.length - 1 ? '.' : ';';
      lines.push(`  sh:property [ sh:path entif:${field} ; sh:minCount 1 ] ${suffix}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

export function emitConformanceBundle(
  tiles: Array<Pick<TileEnvelope<object>, 'cid' | 'kind' | 'payload'>>,
  bundleId = 'entif.bootstrap.bundle'
): ConformanceBundle {
  const entries = tiles.map((tile) => {
    const validation = validatePayload(tile.kind, tile.payload);
    return {
      cid: tile.cid,
      conforms: validation.ok,
      errors: validation.errors,
      kind: tile.kind
    };
  });
  const shapesTurtle = emitShaclShapes([...new Set(tiles.map((tile) => tile.kind))]);

  return {
    bundleId,
    entries,
    shapeGraphCid: makeContentId(shapesTurtle),
    shapesTurtle,
    summary: {
      conforms: entries.filter((entry) => entry.conforms).length,
      violations: entries.filter((entry) => !entry.conforms).length
    }
  };
}
