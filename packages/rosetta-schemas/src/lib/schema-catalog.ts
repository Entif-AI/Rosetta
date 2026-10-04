import {
  AGENTIC_MESSAGE_TYPE_PROFILES,
  SUPPORTED_TILE_KIND_REQUIRED_FIELDS,
  type AgenticMessageSchemaProfile
} from './rosetta-schemas.js';
import { getCoreDescent, type CoreDescentMetadata } from './core-descent.js';
export type { CoreDescent, CoreDescentMetadata } from './core-descent.js';

export type SchemaAuthorityTier =
  | 'core-spine'
  | 'governance-admission'
  | 'memory-context-cache'
  | 'projection-product-ops'
  | 'source-ingest';

export type SchemaExposureStatus =
  | 'api-visible'
  | 'cli-visible'
  | 'demo-visible'
  | 'deprecated'
  | 'downstream-contract'
  | 'fixture-only'
  | 'package-internal'
  | 'reserved-interface';

export type SchemaBoundaryKind =
  | 'consumed-nested-component'
  | 'owned-schema'
  | 'referenced-external-contract'
  | 'validation-entrypoint';

interface SchemaCatalogSourceEntry {
  authorityTier: SchemaAuthorityTier;
  boundaryKind: SchemaBoundaryKind;
  consumerPackages: string[];
  docs: string[];
  exposureStatus: SchemaExposureStatus;
  family: string;
  knownGaps: string[];
  ownerPackage: '@entif-ai/rosetta-schemas' | string;
  rfcPrdAnchors: string[];
  schemaId: string;
  sourceIssues: string[];
  sourcePrs: string[];
  tests: string[];
  validator?: string;
}

export interface RosettaSchemaCatalogEntry extends SchemaCatalogSourceEntry, CoreDescentMetadata {}

const SCHEMA_README = 'packages/rosetta-schemas/README.md';
const SCHEMA_SPEC = 'packages/rosetta-schemas/src/lib/rosetta-schemas.spec.ts';
const AUTHORITY_MAP = 'packages/rosetta-schemas/docs/schema-authority-map.md';
const AGENTIC_MESSAGING_RFC = 'docs/RFCs/20260228 - Entif v0 - Spec Proposal - Agentic Messaging.md';
const ROSETTA_CORE_SPEC = 'docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md';
const ENTIF_ROSETTA_PRD = 'docs/PRDs/20260426 - Entif and Rosetta PRD.md';
const ROSETTA_GUARD_README = 'packages/rosetta-guard/README.md';
const SALIENCE_PACK_SCHEMA = 'packs/schema-pack-evaluation-profiles/schema/salience-evaluation.schema.json';
const SALIENCE_PACK_TESTS = 'packs/schema-pack-evaluation-profiles/tests/README.md';
const SKILL_LIBRARY_DESIGN = 'docs/chats/20260323 - Chat GPT - Entif Skill Library Design.md';
const PROGRESSIVE_DISCLOSURE_SKILLS = 'docs/chats/20260323 - Chat GPT - Progressive-Disclosure Skill System.md';

function tileAuthorityTier(schemaId: string): SchemaAuthorityTier {
  if (schemaId === 'guard.decision_token') {
    return 'governance-admission';
  }
  if (schemaId.startsWith('source.') || schemaId === 'entif.intake_envelope') {
    return 'source-ingest';
  }
  if (
    schemaId === 'entif.daily_top_shelf_digest' ||
    schemaId === 'entif.postmortem_artifact' ||
    schemaId === 'rosetta.composition_provenance'
  ) {
    return 'memory-context-cache';
  }
  if (schemaId === 'rosetta.tapestry' || schemaId === 'rosetta.translation_evidence') {
    return 'projection-product-ops';
  }
  return 'core-spine';
}

function tileExposureStatus(schemaId: string): SchemaExposureStatus {
  if (schemaId.startsWith('source.') || schemaId === 'entif.intake_envelope') {
    return 'fixture-only';
  }
  if (schemaId === 'guard.decision_token') {
    return 'downstream-contract';
  }
  return 'package-internal';
}

function tileDocs(schemaId: string): string[] {
  if (schemaId === 'adapter.capability_manifest') {
    return [SCHEMA_README, AUTHORITY_MAP, ROSETTA_GUARD_README, ENTIF_ROSETTA_PRD];
  }
  if (schemaId === 'skill.card') {
    return [SCHEMA_README, SKILL_LIBRARY_DESIGN, PROGRESSIVE_DISCLOSURE_SKILLS];
  }
  if (schemaId.startsWith('source.')) {
    return [SCHEMA_README, ENTIF_ROSETTA_PRD];
  }
  if (schemaId.startsWith('rosetta.')) {
    return [SCHEMA_README, ROSETTA_CORE_SPEC];
  }
  return [SCHEMA_README];
}

function tileConsumerPackages(schemaId: string): string[] {
  if (schemaId === 'adapter.capability_manifest') {
    return ['@entif-ai/rosetta-guard', 'apps/rosetta-api', 'mcp-runtime-surfaces'];
  }
  if (schemaId === 'skill.card') {
    return ['skill-broker-runtime', '@entif-ai/rosetta-schemas'];
  }
  if (schemaId.startsWith('source.')) {
    return ['@entif-ai/source-substrate', '@entif-ai/source-registry', '@entif-ai/ingress-refinery'];
  }
  if (schemaId === 'guard.decision_token') {
    return ['@entif-ai/rosetta-guard'];
  }
  if (schemaId === 'rosetta.receipt') {
    return ['@entif-ai/rosetta-receipts', '@entif-ai/rosetta-tapestry'];
  }
  if (schemaId === 'rosetta.tapestry') {
    return ['@entif-ai/rosetta-tapestry', '@entif-ai/projection-adapters'];
  }
  if (schemaId.startsWith('rosetta.')) {
    return ['@entif-ai/rosetta-core'];
  }
  return ['@entif-ai/rosetta-schemas'];
}

function tileCatalogEntry(schemaId: string): SchemaCatalogSourceEntry {
  if (schemaId === 'adapter.capability_manifest') {
    return {
      authorityTier: 'governance-admission',
      boundaryKind: 'owned-schema',
      consumerPackages: tileConsumerPackages(schemaId),
      docs: tileDocs(schemaId),
      exposureStatus: 'downstream-contract',
      family: 'adapter-capability',
      knownGaps: [
        'Defines the shared capability vocabulary only; startup exposure profiles, runtime modes, paid execution, and bridge transport behavior remain downstream issues.'
      ],
      ownerPackage: '@entif-ai/rosetta-schemas',
      rfcPrdAnchors: [ROSETTA_CORE_SPEC, ENTIF_ROSETTA_PRD],
      schemaId,
      sourceIssues: ['#1037', '#201', '#513', '#913', '#1049', '#1053', '#1076'],
      sourcePrs: [],
      tests: [SCHEMA_SPEC],
      validator: 'validateAdapterCapabilityManifest'
    };
  }

  if (schemaId === 'skill.card') {
    return {
      authorityTier: 'governance-admission',
      boundaryKind: 'owned-schema',
      consumerPackages: tileConsumerPackages(schemaId),
      docs: tileDocs(schemaId),
      exposureStatus: 'downstream-contract',
      family: 'skill',
      knownGaps: [
        'Defines the broker-facing Tier 0 card only; playbook loading, certification flow, broker ranking, and runtime grants remain downstream issues.'
      ],
      ownerPackage: '@entif-ai/rosetta-schemas',
      rfcPrdAnchors: [ROSETTA_CORE_SPEC],
      schemaId,
      sourceIssues: ['#1057'],
      sourcePrs: [],
      tests: [SCHEMA_SPEC],
      validator: 'validateSkillCard'
    };
  }

  return {
    authorityTier: tileAuthorityTier(schemaId),
    boundaryKind: 'owned-schema',
    consumerPackages: tileConsumerPackages(schemaId),
    docs: tileDocs(schemaId),
    exposureStatus: tileExposureStatus(schemaId),
    family: schemaId.split('.')[0] ?? 'unknown',
    knownGaps: schemaId.startsWith('source.') ? ['Pack/domain records are not structurally substitutable for canonical Core artifacts; full SHACL execution is not implemented.'] : ['Structural validation only; full SHACL/RDF execution is not implemented.'],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [ROSETTA_CORE_SPEC, ENTIF_ROSETTA_PRD],
    schemaId,
    sourceIssues: ['#1114'],
    sourcePrs: [],
    tests: [SCHEMA_SPEC],
    validator: 'validatePayload'
  };
}

function agenticMessageCatalogEntry(msgType: string, profile: AgenticMessageSchemaProfile): SchemaCatalogSourceEntry {
  return {
    authorityTier: 'governance-admission',
    boundaryKind: 'owned-schema',
    consumerPackages: ['@entif-ai/rosetta-guard', 'apps/rosetta-api'],
    docs: [SCHEMA_README, AGENTIC_MESSAGING_RFC],
    exposureStatus: 'downstream-contract',
    family: 'agentic-messaging',
    knownGaps: [
      'Structural schema validation does not imply runtime authorization.',
      profile.plane === 'control' ? 'Guard and IAM semantics remain delegated to owning contracts.' : 'Data-plane routing stays side-effect free.'
    ],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [AGENTIC_MESSAGING_RFC],
    schemaId: profile.schemaId,
    sourceIssues: ['#220', '#1114'],
    sourcePrs: ['#1108'],
    tests: [SCHEMA_SPEC],
    validator: 'validateAgenticMessagePayload'
  };
}

const TILE_CATALOG_ENTRIES = Object.keys(SUPPORTED_TILE_KIND_REQUIRED_FIELDS).map(tileCatalogEntry);
TILE_CATALOG_ENTRIES.push({
  ...tileCatalogEntry('rosetta.observation'), schemaId: 'rrp.promotion-state.v1',
  authorityTier: 'governance-admission', family: 'promotion-state',
  ownerPackage: '@entif-ai/rosetta-receipts', consumerPackages: ['@entif-ai/rosetta-receipts'],
  docs: ['docs/spec/PROMOTION_TRANSITION_CONTRACT.md', 'packs/rrp/schema/promotion-state.schema.json'],
  sourceIssues: ['#10', '#1698'], knownGaps: ['Profile validation does not authorize execution or select a current state in storage.'],
  tests: ['packages/rosetta-receipts/src/lib/promotion-profile.spec.ts'], validator: 'validatePromotionStatePayload'
});

const AGENTIC_MESSAGE_CATALOG_ENTRIES = Object.entries(AGENTIC_MESSAGE_TYPE_PROFILES).map(([msgType, profile]) =>
  agenticMessageCatalogEntry(msgType, profile)
);

const BOUNDARY_CATALOG_ENTRIES: SchemaCatalogSourceEntry[] = [
  {
    authorityTier: 'memory-context-cache', boundaryKind: 'owned-schema', consumerPackages: ['@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/graph-view-v1.md', 'packages/rosetta-schemas/docs/graph-view-v1.schema.json'],
    exposureStatus: 'downstream-contract', family: 'view-integrity',
    knownGaps: ['Declared projection/source closure and rights admission do not authenticate evidence, resolve permissions, select membership or implement graph federation.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'graph.view.v1', sourceIssues: ['#1728', '#1671', '#1731', '#1730', '#1558', '#315', '#1219', '#1221'], sourcePrs: ['#1732'],
    tests: ['packages/rosetta-schemas/src/lib/graph-view.spec.ts'], validator: 'parseGraphView'
  },
  {
    authorityTier: 'memory-context-cache', boundaryKind: 'owned-schema', consumerPackages: ['@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/materialized-view-v1.md', 'packages/rosetta-schemas/docs/materialized-view-v1.schema.json'],
    exposureStatus: 'downstream-contract', family: 'view-integrity',
    knownGaps: ['Metadata identity and explicit currency admission do not authenticate artifacts, resolve current rights or implement cache/query/refresh policy.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'materialized.view.v1', sourceIssues: ['#1731', '#1567', '#1730', '#1558', '#1559'], sourcePrs: ['#1732'],
    tests: ['packages/rosetta-schemas/src/lib/materialized-view.spec.ts'], validator: 'parseMaterializedView'
  },
  {
    authorityTier: 'governance-admission', boundaryKind: 'owned-schema', consumerPackages: ['@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/impact-revalidation-v1.md', 'packages/rosetta-schemas/docs/impact-revalidation-v1.schema.json'],
    exposureStatus: 'downstream-contract', family: 'view-integrity',
    knownGaps: ['Structural evidence admission does not authenticate support, discover dependencies, rank remediation or grant rollback/write/promotion authority.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'impact.revalidation.v1', sourceIssues: ['#1730', '#1560', '#1558', '#1557'], sourcePrs: ['#1732'],
    tests: ['packages/rosetta-schemas/src/lib/impact-revalidation.spec.ts'], validator: 'parseImpactRevalidation'
  },
  {
    authorityTier: 'projection-product-ops', boundaryKind: 'owned-schema', consumerPackages: ['@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/engineering-completion-v1.md', 'packages/rosetta-schemas/docs/engineering-completion-v1.schema.json'], exposureStatus: 'downstream-contract', family: 'engineering-evidence',
    knownGaps: ['Source-linked observations and structural conformance only; no hidden telemetry reconstruction, evidence authentication, routing score or production promotion.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'engineering.run-completion.v1', sourceIssues: ['#1727', '#1509', '#1726'], sourcePrs: ['#1732'],
    tests: ['packages/rosetta-schemas/src/lib/engineering-completion.spec.ts'], validator: 'parseEngineeringCompletion'
  },
  {
    authorityTier: 'source-ingest', boundaryKind: 'owned-schema', consumerPackages: ['@entif-ai/source-substrate', '@entif-ai/ingress-refinery', '@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/engineering-lifecycle-v1.md', 'packages/rosetta-schemas/docs/engineering-lifecycle-v1.schema.json'],
    exposureStatus: 'fixture-only', family: 'engineering-evidence', knownGaps: ['Bounded source metadata and reference closure; external source authentication and unobserved historical executor/model configuration remain outside this adapter.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'engineering.lifecycle-source.v1', sourceIssues: ['#1726', '#1509'], sourcePrs: ['#1732'],
    tests: ['packages/projection-adapters/src/lib/engineering-lifecycle.spec.ts'], validator: 'parseEngineeringLifecycleSource'
  },
  {
    authorityTier: 'projection-product-ops', boundaryKind: 'owned-schema', consumerPackages: ['@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/work-lifecycle-v1.md', 'packages/rosetta-schemas/docs/work-lifecycle-v1.schema.json'],
    exposureStatus: 'downstream-contract', family: 'work-lifecycle', knownGaps: ['Structural attribution and bounded history closure do not authenticate evidence, establish real-world verifier independence or grant operational authority.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'work.lifecycle.v1', sourceIssues: ['#1509'], sourcePrs: ['#1732'],
    tests: ['packages/rosetta-schemas/src/lib/work-lifecycle.spec.ts'], validator: 'validateWorkLifecycle'
  },
  {
    authorityTier: 'projection-product-ops', boundaryKind: 'validation-entrypoint', consumerPackages: ['@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/work-lifecycle-v1.md'], exposureStatus: 'downstream-contract', family: 'work-lifecycle', knownGaps: ['Closed bounded history only; current state is an inspection projection, not scheduling or authorization.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'work.lifecycle-state.v1', sourceIssues: ['#1509'], sourcePrs: ['#1732'],
    tests: ['packages/rosetta-schemas/src/lib/work-lifecycle.spec.ts'], validator: 'materializeWorkLifecycle'
  },
  {
    authorityTier: 'core-spine',
    boundaryKind: 'owned-schema',
    consumerPackages: ['@entif-ai/rosetta-schemas', '@entif-ai/rosetta-core'],
    docs: [SCHEMA_README, AUTHORITY_MAP, 'packs/schema-pack-evaluation-profiles/schema/counterfactual-evaluation.schema.json'],
    exposureStatus: 'downstream-contract',
    family: 'evaluation-profile',
    knownGaps: ['Records declared historical frontier and sandbox evidence; does not resolve referenced evidence, enforce isolation, select mechanisms or authorize production activation.'],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [ROSETTA_CORE_SPEC],
    schemaId: 'counterfactual.evaluation.v1',
    sourceIssues: ['#1692', '#1695'],
    sourcePrs: [],
    tests: ['packages/rosetta-schemas/src/lib/counterfactual-profile.spec.ts', 'packs/schema-pack-evaluation-profiles/tests/README.md'],
    validator: 'validateCounterfactualEvaluation'
  },
  {
    authorityTier: 'core-spine',
    boundaryKind: 'owned-schema',
    consumerPackages: ['@entif-ai/rosetta-schemas', '@entif-ai/rosetta-core'],
    docs: [SCHEMA_README, AUTHORITY_MAP, SALIENCE_PACK_SCHEMA],
    exposureStatus: 'downstream-contract',
    family: 'evaluation-profile',
    knownGaps: ['Represents inspectable salience assessments only; formulas, weighting, gating, selection, activation, and execution policy remain outside this Profile.'],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [ROSETTA_CORE_SPEC],
    schemaId: 'salience.evaluation.v1',
    sourceIssues: ['#1694'],
    sourcePrs: [],
    tests: [SCHEMA_SPEC, SALIENCE_PACK_TESTS],
    validator: 'validateSalienceEvaluation'
  },
  {
    authorityTier: 'projection-product-ops', boundaryKind: 'owned-schema', consumerPackages: ['@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/trace-kinematics-v1.md'], exposureStatus: 'fixture-only', family: 'trace', knownGaps: ['Observable representation measurements; no hidden-memory or scoring authority.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'trace-kin-v1', sourceIssues: ['#1669', '#1666', '#1667'], sourcePrs: ['#1725'],
    tests: ['packages/rosetta-schemas/src/lib/trace-kinematics.spec.ts', 'packages/projection-adapters/src/lib/trace-kinematics.spec.ts'], validator: 'parseTraceKinematics'
  },
  {
    authorityTier: 'projection-product-ops', boundaryKind: 'owned-schema', consumerPackages: ['@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/trace-projection-v1.md'], exposureStatus: 'fixture-only', family: 'trace', knownGaps: ['Rebuildable development projection; no semantic storage or runtime policy.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'trace.projection.v1', sourceIssues: ['#1667', '#1666'], sourcePrs: ['#1725'],
    tests: ['packages/projection-adapters/src/lib/neo4j-trace-projection.spec.ts'], validator: 'parseTraceProjection'
  },
  {
    authorityTier: 'source-ingest', boundaryKind: 'owned-schema', consumerPackages: ['@entif-ai/ingress-refinery', '@entif-ai/projection-adapters'],
    docs: [AUTHORITY_MAP, 'packages/rosetta-schemas/docs/trace-normalization-v1.md'], exposureStatus: 'fixture-only', family: 'trace', knownGaps: ['Fixture-backed structural view; no live capture or model interpretation.'],
    ownerPackage: '@entif-ai/rosetta-schemas', rfcPrdAnchors: [ROSETTA_CORE_SPEC], schemaId: 'trace.normalization.v1', sourceIssues: ['#1666', '#1665', '#528'], sourcePrs: ['#1725'],
    tests: ['packages/rosetta-schemas/src/lib/trace-normalization.spec.ts', 'packages/ingress-refinery/src/lib/trace-normalizer.spec.ts'], validator: 'parseTraceNormalization'
  },
  {
    authorityTier: 'governance-admission',
    boundaryKind: 'owned-schema',
    consumerPackages: ['@entif-ai/rosetta-guard', 'apps/rosetta-api'],
    docs: [SCHEMA_README, AGENTIC_MESSAGING_RFC],
    exposureStatus: 'downstream-contract',
    family: 'agentic-messaging',
    knownGaps: ['Envelope validation is structural; replay storage and transport custody are owned by downstream mailroom work.'],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [AGENTIC_MESSAGING_RFC],
    schemaId: 'entif.agentic-messaging.envelope.v1',
    sourceIssues: ['#220', '#1114'],
    sourcePrs: ['#1108'],
    tests: [SCHEMA_SPEC],
    validator: 'validateAgenticMessageEnvelope'
  },
  {
    authorityTier: 'governance-admission',
    boundaryKind: 'validation-entrypoint',
    consumerPackages: ['@entif-ai/rosetta-guard'],
    docs: [SCHEMA_README, AGENTIC_MESSAGING_RFC],
    exposureStatus: 'downstream-contract',
    family: 'agentic-messaging',
    knownGaps: ['Does not execute Guard decisions or IAM semantics; it only classifies structural routing eligibility.'],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [AGENTIC_MESSAGING_RFC],
    schemaId: 'entif.agentic-messaging.execution-admission.v1',
    sourceIssues: ['#706', '#1114'],
    sourcePrs: ['#1109'],
    tests: [SCHEMA_SPEC],
    validator: 'evaluateAgenticMessageExecutionPolicy'
  },
  {
    authorityTier: 'governance-admission',
    boundaryKind: 'validation-entrypoint',
    consumerPackages: ['mailroom-runtime'],
    docs: [SCHEMA_README, AGENTIC_MESSAGING_RFC],
    exposureStatus: 'downstream-contract',
    family: 'agentic-messaging',
    knownGaps: [
      'First-wave policy uses one 1 MiB ceiling and requires artifact references or future chunking for larger transfers.',
      'Runtime custody, replay storage, and telemetry aggregation remain downstream mailroom responsibilities.'
    ],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [AGENTIC_MESSAGING_RFC],
    schemaId: 'entif.agentic-messaging.size-policy.v1',
    sourceIssues: ['#1142', '#701', '#220', '#226'],
    sourcePrs: [],
    tests: [SCHEMA_SPEC],
    validator: 'evaluateAgenticMessageSizePolicy'
  },
  {
    authorityTier: 'core-spine',
    boundaryKind: 'validation-entrypoint',
    consumerPackages: ['@entif-ai/rosetta-schemas'],
    docs: [SCHEMA_README, AUTHORITY_MAP],
    exposureStatus: 'package-internal',
    family: 'conformance',
    knownGaps: ['Summary bundles are derived validation reports, not signed Rosetta Receipts or a full conformance engine.'],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [ROSETTA_CORE_SPEC],
    schemaId: 'rosetta.conformance_bundle',
    sourceIssues: ['#1114'],
    sourcePrs: [],
    tests: [SCHEMA_SPEC],
    validator: 'emitConformanceBundle'
  },
  {
    authorityTier: 'core-spine',
    boundaryKind: 'validation-entrypoint',
    consumerPackages: ['@entif-ai/rosetta-schemas'],
    docs: [SCHEMA_README, AUTHORITY_MAP],
    exposureStatus: 'package-internal',
    family: 'conformance',
    knownGaps: ['Emits SHACL-like Turtle only; it does not run a SHACL engine.'],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [ROSETTA_CORE_SPEC],
    schemaId: 'rosetta.shacl_shapes',
    sourceIssues: ['#1114'],
    sourcePrs: [],
    tests: [SCHEMA_SPEC],
    validator: 'emitShaclShapes'
  },
  {
    authorityTier: 'governance-admission',
    boundaryKind: 'consumed-nested-component',
    consumerPackages: ['@entif-ai/rosetta-schemas'],
    docs: [SCHEMA_README, AUTHORITY_MAP],
    exposureStatus: 'downstream-contract',
    family: 'domain-ref',
    knownGaps: ['`rosetta-schemas` normalizes and compares domain_ref values but does not own every future domain policy.'],
    ownerPackage: '@entif-ai/rosetta-schemas',
    rfcPrdAnchors: [AGENTIC_MESSAGING_RFC],
    schemaId: 'entif.domain_ref.v1',
    sourceIssues: ['#711'],
    sourcePrs: ['#1105'],
    tests: [SCHEMA_SPEC],
    validator: 'validateDomainRef'
  },
  {
    authorityTier: 'governance-admission',
    boundaryKind: 'referenced-external-contract',
    consumerPackages: ['@entif-ai/rosetta-schemas', '@entif-ai/rosetta-guard'],
    docs: [SCHEMA_README, AUTHORITY_MAP],
    exposureStatus: 'reserved-interface',
    family: 'iam',
    knownGaps: ['`iam.decision` artifact semantics are intentionally out of scope for this package.'],
    ownerPackage: 'external-iam-contract',
    rfcPrdAnchors: [AGENTIC_MESSAGING_RFC],
    schemaId: 'entif.iam.decision.ref',
    sourceIssues: ['#630'],
    sourcePrs: [],
    tests: [],
    validator: undefined
  },
  {
    authorityTier: 'governance-admission',
    boundaryKind: 'referenced-external-contract',
    consumerPackages: ['@entif-ai/rosetta-guard'],
    docs: [SCHEMA_README, AUTHORITY_MAP],
    exposureStatus: 'reserved-interface',
    family: 'guard',
    knownGaps: ['Guard request/validation flow is a downstream consumer boundary, not redefined here.'],
    ownerPackage: '@entif-ai/rosetta-guard',
    rfcPrdAnchors: [AGENTIC_MESSAGING_RFC],
    schemaId: 'entif.guard.decision-request.ref',
    sourceIssues: ['#1029'],
    sourcePrs: [],
    tests: [],
    validator: undefined
  },
  {
    authorityTier: 'governance-admission',
    boundaryKind: 'referenced-external-contract',
    consumerPackages: ['mailroom-runtime'],
    docs: [SCHEMA_README, AUTHORITY_MAP],
    exposureStatus: 'reserved-interface',
    family: 'mailroom',
    knownGaps: ['Runtime mailroom custody, replay storage, and routing are downstream of the schema registry.'],
    ownerPackage: 'mailroom-runtime',
    rfcPrdAnchors: [AGENTIC_MESSAGING_RFC],
    schemaId: 'entif.mailroom.consumer-boundary.ref',
    sourceIssues: ['#718', '#946'],
    sourcePrs: [],
    tests: [],
    validator: undefined
  }
];

const MESSAGE_PROFILE_IDS = Object.values(AGENTIC_MESSAGE_TYPE_PROFILES).map((profile) => profile.schemaId);

export const ROSETTA_SCHEMA_CATALOG = [...TILE_CATALOG_ENTRIES, ...AGENTIC_MESSAGE_CATALOG_ENTRIES, ...BOUNDARY_CATALOG_ENTRIES].map((entry) => {
  const descent = getCoreDescent(entry.schemaId, MESSAGE_PROFILE_IDS);
  if (!descent) throw new Error(`Schema requires an explicit core-descent review: ${entry.schemaId}`);
  return { ...entry, ...descent };
}).sort(
  (left, right) => left.schemaId.localeCompare(right.schemaId)
) satisfies RosettaSchemaCatalogEntry[];

export function listSchemaCatalogEntries(): RosettaSchemaCatalogEntry[] {
  return [...ROSETTA_SCHEMA_CATALOG];
}

export function getSchemaCatalogEntry(schemaId: string): RosettaSchemaCatalogEntry | undefined {
  return ROSETTA_SCHEMA_CATALOG.find((entry) => entry.schemaId === schemaId);
}

export function validateSchemaCatalogCoverage(catalog: readonly (SchemaCatalogSourceEntry & Partial<CoreDescentMetadata>)[] = ROSETTA_SCHEMA_CATALOG): string[] {
  const errors: string[] = [];
  const catalogIds = new Set(catalog.map((entry) => entry.schemaId));
  if (catalogIds.size !== catalog.length) errors.push('Duplicate schema catalog identity.');

  for (const schemaId of Object.keys(SUPPORTED_TILE_KIND_REQUIRED_FIELDS)) {
    if (!catalogIds.has(schemaId)) {
      errors.push(`Missing supported tile-kind catalog entry: ${schemaId}`);
    }
  }
  if (!catalogIds.has('entif.agentic-messaging.envelope.v1')) {
    errors.push('Missing Agentic Messaging envelope catalog entry.');
  }
  for (const profile of Object.values(AGENTIC_MESSAGE_TYPE_PROFILES)) {
    if (!catalogIds.has(profile.schemaId)) {
      errors.push(`Missing Agentic Messaging catalog entry: ${profile.schemaId}`);
    }
  }

  for (const entry of catalog) {
    const expected = getCoreDescent(entry.schemaId, MESSAGE_PROFILE_IDS);
    if (!expected || entry.coreDescent !== expected.coreDescent) errors.push(`Missing or conflicting core descent: ${entry.schemaId}`);
    if (!entry.descentAuthority || entry.descentAuthority !== expected?.descentAuthority) errors.push(`Missing or conflicting descent authority: ${entry.schemaId}`);
    if (JSON.stringify(entry.relatedCoreKinds) !== JSON.stringify(expected?.relatedCoreKinds)) errors.push(`Missing or conflicting related core kinds: ${entry.schemaId}`);
    if (entry.sourceIssues.length === 0) errors.push(`Catalog entry lacks source issue: ${entry.schemaId}`);
    if (entry.exposureStatus !== 'deprecated' && entry.exposureStatus !== 'reserved-interface') {
      if (entry.tests.length === 0) {
        errors.push(`Catalog entry lacks tests: ${entry.schemaId}`);
      }
      if (entry.docs.length === 0) {
        errors.push(`Catalog entry lacks docs: ${entry.schemaId}`);
      }
    }
  }

  return errors;
}
