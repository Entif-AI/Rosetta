/** Classification follows SEMANTIC_AUDIT.md; it is not a conformance verdict. */
export type CoreDescent = 'core-primitive' | 'core-tile-profile' | 'pack-defined-schema' | 'lifecycle-state' | 'governed-extension' | 'implementation-local' | 'derived-projection' | 'external-contract-ref';

export interface CoreDescentMetadata {
  coreDescent: CoreDescent;
  descentAuthority: string;
  /** Semantic relationships for review, not structural substitutability. */
  relatedCoreKinds: string[];
}

const CORE = 'docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md';
const AUDIT = 'docs/governance/genesis/SEMANTIC_AUDIT.md';
const SOURCE = 'packages/source-substrate/README.md';
const SOURCE_SCHEMA = 'packs/stdpack-source-substrate/schema/source-substrate.schema.json';
const SALIENCE_SCHEMA = 'packs/schema-pack-evaluation-profiles/schema/salience-evaluation.schema.json';

export const IMPLEMENTED_CORE_PRIMITIVES = ['rosetta.run', 'rosetta.action', 'rosetta.toolcall', 'rosetta.observation', 'rosetta.evaluation', 'rosetta.receipt', 'rosetta.tapestry'] as const;

function metadata(coreDescent: CoreDescent, descentAuthority: string, relatedCoreKinds: string[] = []): CoreDescentMetadata {
  return { coreDescent, descentAuthority, relatedCoreKinds };
}

// Explicit identity registrations: new supported kinds must be reviewed, not inferred from a prefix.
const TILE_DESCENT: Record<string, CoreDescentMetadata> = {
  ...Object.fromEntries(IMPLEMENTED_CORE_PRIMITIVES.map((kind) => [kind, metadata('core-primitive', CORE, [kind])])),
  'guard.decision_token': metadata('implementation-local', AUDIT, ['rosetta.policy']),
  'adapter.capability_manifest': metadata('implementation-local', AUDIT),
  'skill.card': metadata('implementation-local', AUDIT),
  'entif.intake_envelope': metadata('implementation-local', AUDIT, ['rosetta.observation']),
  'entif.daily_top_shelf_digest': metadata('derived-projection', AUDIT),
  'entif.postmortem_artifact': metadata('implementation-local', AUDIT, ['rosetta.evaluation', 'rosetta.receipt']),
  'rosetta.translation_evidence': metadata('implementation-local', AUDIT, ['rosetta.observation', 'rosetta.receipt']),
  'rosetta.composition_provenance': metadata('implementation-local', AUDIT, ['rosetta.observation', 'rosetta.receipt']),
  'source.canonical_artifact': metadata('pack-defined-schema', SOURCE_SCHEMA, ['rosetta.observation']),
  'source.derived_artifact': metadata('pack-defined-schema', SOURCE_SCHEMA, ['rosetta.observation']),
  'source.evaluation_receipt': metadata('pack-defined-schema', SOURCE_SCHEMA, ['rosetta.evaluation', 'rosetta.receipt']),
  'source.fetch_receipt': metadata('pack-defined-schema', SOURCE_SCHEMA, ['rosetta.receipt']),
  'source.normalization_receipt': metadata('pack-defined-schema', SOURCE_SCHEMA, ['rosetta.receipt']),
  'source.manifestation': metadata('pack-defined-schema', SOURCE_SCHEMA, ['rosetta.observation']),
  'source.record': metadata('pack-defined-schema', SOURCE_SCHEMA, ['rosetta.observation']),
  'source.system_profile': metadata('pack-defined-schema', SOURCE_SCHEMA),
  'source.trust_matrix': metadata('pack-defined-schema', SOURCE_SCHEMA, ['rosetta.matrix']),
  'source.correction_event': metadata('governed-extension', SOURCE, ['rosetta.observation']),
  'source.episode': metadata('governed-extension', SOURCE, ['rosetta.observation']),
  'source.identity_resolution_receipt': metadata('governed-extension', SOURCE, ['rosetta.receipt']),
  'source.ingress_job': metadata('lifecycle-state', SOURCE, ['rosetta.action']),
  'source.package': metadata('governed-extension', SOURCE, ['rosetta.frame']),
  'source.registry_entry': metadata('governed-extension', SOURCE)
};

const BOUNDARY_DESCENT: Record<string, CoreDescentMetadata> = {
  'compiled.context.v1': metadata('derived-projection', 'packages/rosetta-schemas/docs/compiled-context-v1.md', ['rosetta.observation', 'rosetta.receipt']),
  'compiled.context.block.v1': metadata('derived-projection', 'packages/rosetta-schemas/docs/compiled-context-v1.md', ['rosetta.observation', 'rosetta.receipt']),
  'graph.view.v1': metadata('derived-projection', 'packages/rosetta-schemas/docs/graph-view-v1.md', ['rosetta.observation', 'rosetta.lattice_edge', 'rosetta.receipt']),
  'materialized.view.v1': metadata('derived-projection', 'packages/rosetta-schemas/docs/materialized-view-v1.md', ['rosetta.observation', 'rosetta.evaluation', 'rosetta.receipt']),
  'impact.revalidation.v1': metadata('governed-extension', 'packages/rosetta-schemas/docs/impact-revalidation-v1.md', ['rosetta.observation', 'rosetta.evaluation', 'rosetta.receipt', 'rosetta.action']),
  'engineering.run-completion.v1': metadata('implementation-local', 'packages/rosetta-schemas/docs/engineering-completion-v1.md', ['rosetta.action', 'rosetta.evaluation', 'rosetta.receipt']),
  'engineering.lifecycle-source.v1': metadata('implementation-local', 'packages/rosetta-schemas/docs/engineering-lifecycle-v1.md', ['rosetta.action', 'rosetta.evaluation', 'rosetta.receipt']),
  'work.lifecycle.v1': metadata('implementation-local', 'packages/rosetta-schemas/docs/work-lifecycle-v1.md', ['rosetta.action', 'rosetta.evaluation', 'rosetta.receipt']),
  'work.lifecycle-state.v1': metadata('derived-projection', 'packages/rosetta-schemas/docs/work-lifecycle-v1.md', ['rosetta.action']),
  'trace.projection.v1': metadata('derived-projection', 'packages/rosetta-schemas/docs/trace-projection-v1.md', ['rosetta.observation']),
  'trace-kin-v1': metadata('derived-projection', 'packages/rosetta-schemas/docs/trace-kinematics-v1.md', ['rosetta.observation']),
  'trace.normalization.v1': metadata('derived-projection', 'packages/rosetta-schemas/docs/trace-normalization-v1.md', ['rosetta.observation']),
  'rrp.promotion-state.v1': metadata('core-tile-profile', 'packs/rrp/schema/promotion-state.schema.json', ['rosetta.observation']),
  'entif.agentic-messaging.envelope.v1': metadata('implementation-local', AUDIT),
  'entif.agentic-messaging.execution-admission.v1': metadata('implementation-local', AUDIT),
  'entif.agentic-messaging.size-policy.v1': metadata('implementation-local', AUDIT),
  'entif.domain_ref.v1': metadata('implementation-local', AUDIT),
  'entif.iam.decision.ref': metadata('external-contract-ref', AUDIT),
  'entif.guard.decision-request.ref': metadata('external-contract-ref', AUDIT),
  'entif.mailroom.consumer-boundary.ref': metadata('external-contract-ref', AUDIT),
  'rosetta.conformance_bundle': metadata('derived-projection', AUDIT, ['rosetta.evaluation']),
  'rosetta.shacl_shapes': metadata('derived-projection', AUDIT),
  'counterfactual.evaluation.v1': metadata('core-tile-profile', 'packs/schema-pack-evaluation-profiles/schema/counterfactual-evaluation.schema.json', ['rosetta.evaluation']),
  'salience.evaluation.v1': metadata('core-tile-profile', SALIENCE_SCHEMA, ['rosetta.evaluation'])
};

export function getCoreDescent(schemaId: string, registeredMessageProfileIds: readonly string[]): CoreDescentMetadata | undefined {
  const result = (Object.hasOwn(TILE_DESCENT, schemaId) ? TILE_DESCENT[schemaId] : undefined) ??
    (Object.hasOwn(BOUNDARY_DESCENT, schemaId) ? BOUNDARY_DESCENT[schemaId] : undefined) ??
    (registeredMessageProfileIds.includes(schemaId) ? metadata('implementation-local', AUDIT) : undefined);
  return result ? { ...result, relatedCoreKinds: [...result.relatedCoreKinds] } : undefined;
}
