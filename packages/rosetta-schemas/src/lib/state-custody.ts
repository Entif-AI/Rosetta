import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import {
  admitMaterializedViewReuse,
  parseMaterializedView,
  type MaterializedView,
} from './materialized-view.js';
import {
  compileEvidenceContract,
  evidenceRefSchema as ref,
  evidenceRefsSchema as refs,
  supportedEvidenceSchema as support,
  evidenceObjectSchema as object,
  evidenceProfileSchema as profile,
  nullableEvidenceSchema as nullable,
} from './evidence-contract-validation.js';

type ExactArtifact = { ref: string; sha256: string };
type Classification =
  | { kind: 'NATIVE'; sourceAuthorityRef: string; restoreProcedureRef: string }
  | {
      kind: 'DERIVED';
      materializedViewRef: string;
      recipe: { ref: string; version: string };
    }
  | {
      kind: 'OPERATOR';
      purposeRef: string;
      nonRebuildableReasonRef: string;
      restoreProcedureRef: string;
    }
  | { kind: 'EPHEMERAL' };
interface CustodyBody {
  profile: { id: 'state.custody.v1'; version: '1.0.0' };
  familyRef: string;
  revisionRef: string;
  ownerRef: string;
  authorityClaimRef: string;
  custodyRef: string;
  custodianRef: string;
  writerAssignmentRefs: string[];
  classification: Classification;
  artifact: ExactArtifact | null;
  dependencyRefs: string[];
  closure: 'COMPLETE' | 'PARTIAL' | 'UNKNOWN';
  scope: {
    policyRef: string;
    rightsRef: string;
    tenantRef: string | null;
    frontierRef: string;
  };
  retentionPolicyRef: string;
  invalidationRefs: string[];
  revalidationRefs: string[];
  predecessorRef: string | null;
  provenanceRefs: string[];
  receiptRefs: string[];
}
export interface StateCustody extends CustodyBody {
  recordId: string;
}
const sha256 = { type: 'string', pattern: '^[a-f0-9]{64}$' };
const recordId = { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' };
const artifact = object({ ref, sha256 });
const literal = (value: string) => ({ const: value });
const enumeration = (values: readonly string[]) => ({ enum: values });
const classification = {
  oneOf: [
    object({
      kind: literal('NATIVE'),
      sourceAuthorityRef: ref,
      restoreProcedureRef: ref,
    }),
    object({
      kind: literal('DERIVED'),
      materializedViewRef: ref,
      recipe: object({ ref, version: ref }),
    }),
    object({
      kind: literal('OPERATOR'),
      purposeRef: ref,
      nonRebuildableReasonRef: ref,
      restoreProcedureRef: ref,
    }),
    object({ kind: literal('EPHEMERAL') }),
  ],
};
export const STATE_CUSTODY_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'urn:rosetta:state.custody.v1',
  title: 'Proposed state authority and custody declaration',
  ...object({
    recordId,
    profile: profile('state.custody.v1'),
    familyRef: ref,
    revisionRef: ref,
    ownerRef: ref,
    authorityClaimRef: ref,
    custodyRef: ref,
    custodianRef: ref,
    writerAssignmentRefs: refs,
    classification,
    artifact: nullable(artifact),
    dependencyRefs: refs,
    closure: enumeration(['COMPLETE', 'PARTIAL', 'UNKNOWN']),
    scope: object({
      policyRef: ref,
      rightsRef: ref,
      tenantRef: nullable(ref),
      frontierRef: ref,
    }),
    retentionPolicyRef: ref,
    invalidationRefs: refs,
    revalidationRefs: refs,
    predecessorRef: nullable(ref),
    provenanceRefs: support,
    receiptRefs: refs,
  }),
};
const parseCustodyShape =
  compileEvidenceContract<StateCustody>(STATE_CUSTODY_SCHEMA);
function verifyIdentity<T extends { recordId: string }>(value: T): T {
  const { recordId: id, ...body } = value;
  if (id !== 'sha256:' + traceHash(canonicalTraceJson(body)))
    throw new Error('Custody metadata digest mismatch.');
  return structuredClone(value);
}
function createRecord<T>(body: unknown, parse: (input: unknown) => T): T {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    'recordId' in body
  )
    throw new Error('Provide metadata without recordId.');
  return parse({
    ...body,
    recordId: 'sha256:' + traceHash(canonicalTraceJson(body)),
  });
}
export function parseStateCustody(input: unknown): StateCustody {
  const value = verifyIdentity(parseCustodyShape(input));
  if (value.predecessorRef === value.recordId)
    throw new Error('State declaration cannot supersede itself.');
  if (value.classification.kind === 'EPHEMERAL') {
    if (value.artifact !== null)
      throw new Error('Ephemeral state cannot claim a durable artifact.');
  } else if (!value.artifact || !value.writerAssignmentRefs.length) {
    throw new Error(
      'Durable state requires exact artifact identity and declared writer assignment.'
    );
  }
  // A materialized view depends on source closure, never on an independent
  // native-authority assertion. The closed variant prevents mixed claims.
  if (value.classification.kind === 'DERIVED' && !value.dependencyRefs.length)
    throw new Error('Derived state requires source/dependency references.');
  return value;
}
export const createStateCustody = (body: unknown): StateCustody =>
  createRecord(body, parseStateCustody);

export const RECOVERY_DISPOSITIONS = [
  'AVAILABLE',
  'SOURCE_DELETED',
  'ACCESS_LOST',
  'RETENTION_EXPIRED',
  'RIGHTS_REVOKED',
  'SOURCE_OFFLINE_OR_UNAVAILABLE',
  'RECOVERY_CLOSURE_UNKNOWN',
] as const;
type AvailabilityObservation = {
  disposition: (typeof RECOVERY_DISPOSITIONS)[number];
  evidenceRefs: string[];
};
type DependencyObservation = AvailabilityObservation & {
  dependencyRef: string;
};
type IndependentPayload = {
  artifact: ExactArtifact;
  custodyRef: string;
  custodianRef: string;
  reconstructionEvaluationRef: string;
  verificationReceiptRefs: string[];
};
type Readback = {
  artifact: ExactArtifact;
  observationRef: string;
  receiptRefs: string[];
};
type RecoveryResult =
  | { kind: 'REBUILT'; readback: Readback; rebuildReceiptRefs: string[] }
  | { kind: 'RESTORED'; readback: Readback; payload: IndependentPayload }
  | {
      kind: 'PARTIAL' | 'UNKNOWN' | 'SOURCE_UNAVAILABLE' | 'RIGHTS_RESTRICTED';
      evidenceRefs: string[];
    };
export interface StateRecovery {
  recordId: string;
  profile: { id: 'state.recovery.v1'; version: '1.0.0' };
  custodyRecordRef: string;
  actionRef: string;
  authority: {
    ownerRef: string;
    actorRef: string;
    writerAssignmentRef: string;
    policyRef: string;
    tenantRef: string | null;
    rightsDecisionRef: string;
    retentionDecisionRef: string;
    frontierRef: string;
  };
  stateDisposition: AvailabilityObservation;
  dependencies: DependencyObservation[];
  result: RecoveryResult;
  predecessorRef: string | null;
  provenanceRefs: string[];
  receiptRefs: string[];
}
const readback = object({
  artifact,
  observationRef: ref,
  receiptRefs: support,
});
const result = {
  oneOf: [
    object({ kind: literal('REBUILT'), readback, rebuildReceiptRefs: support }),
    object({
      kind: literal('RESTORED'),
      readback,
      payload: object({
        artifact,
        custodyRef: ref,
        custodianRef: ref,
        reconstructionEvaluationRef: ref,
        verificationReceiptRefs: support,
      }),
    }),
    object({
      kind: enumeration([
        'PARTIAL',
        'UNKNOWN',
        'SOURCE_UNAVAILABLE',
        'RIGHTS_RESTRICTED',
      ]),
      evidenceRefs: support,
    }),
  ],
};
export const STATE_RECOVERY_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'urn:rosetta:state.recovery.v1',
  title: 'Proposed state recovery evidence',
  ...object({
    recordId,
    profile: profile('state.recovery.v1'),
    custodyRecordRef: recordId,
    actionRef: ref,
    authority: object({
      ownerRef: ref,
      actorRef: ref,
      writerAssignmentRef: ref,
      policyRef: ref,
      tenantRef: nullable(ref),
      rightsDecisionRef: ref,
      retentionDecisionRef: ref,
      frontierRef: ref,
    }),
    stateDisposition: object({
      disposition: enumeration(RECOVERY_DISPOSITIONS),
      evidenceRefs: support,
    }),
    dependencies: {
      type: 'array',
      maxItems: 256,
      items: object({
        dependencyRef: ref,
        disposition: enumeration(RECOVERY_DISPOSITIONS),
        evidenceRefs: support,
      }),
    },
    result,
    predecessorRef: nullable(ref),
    provenanceRefs: support,
    receiptRefs: refs,
  }),
};
const parseRecoveryShape = compileEvidenceContract<StateRecovery>(
  STATE_RECOVERY_SCHEMA
);

/** Compare declared evidence; no reference or digest is an authenticated permission. */
export function parseStateRecovery(
  input: unknown,
  declaration: unknown
): StateRecovery {
  const state = parseStateCustody(declaration);
  const value = verifyIdentity(parseRecoveryShape(input));
  if (value.custodyRecordRef !== state.recordId)
    throw new Error('Recovery references a different custody declaration.');
  if (value.predecessorRef === value.recordId)
    throw new Error('Recovery cannot supersede itself.');
  if (
    value.authority.ownerRef !== state.ownerRef ||
    value.authority.tenantRef !== state.scope.tenantRef ||
    !state.writerAssignmentRefs.includes(value.authority.writerAssignmentRef)
  )
    throw new Error(
      'Recovery owner/assignment does not match the declaration.'
    );
  const observed = new Map(
    value.dependencies.map((item) => [item.dependencyRef, item])
  );
  if (
    observed.size !== value.dependencies.length ||
    value.dependencies.some(
      (item) => !state.dependencyRefs.includes(item.dependencyRef)
    )
  )
    throw new Error(
      'Recovery dependency observations must be unique and declared.'
    );
  const dispositions = [
    value.stateDisposition.disposition,
    ...value.dependencies.map((item) => item.disposition),
  ];
  const restricted = dispositions.some((item) =>
    ['ACCESS_LOST', 'RETENTION_EXPIRED', 'RIGHTS_REVOKED'].includes(item)
  );
  const unavailable = dispositions.some((item) =>
    ['SOURCE_DELETED', 'SOURCE_OFFLINE_OR_UNAVAILABLE'].includes(item)
  );
  const complete =
    state.closure === 'COMPLETE' &&
    observed.size === state.dependencyRefs.length &&
    dispositions.every((item) => item === 'AVAILABLE');
  const recovery = value.result;
  if (recovery.kind === 'RESTORED' || recovery.kind === 'REBUILT') {
    if (!complete)
      throw new Error(
        'Successful recovery requires complete permitted closure.'
      );
    if (
      state.artifact === null ||
      canonicalTraceJson(recovery.readback.artifact) !==
        canonicalTraceJson(state.artifact)
    )
      throw new Error(
        'Recovery readback differs from the exact declared artifact.'
      );
    if (recovery.kind === 'REBUILT' && state.classification.kind !== 'DERIVED')
      throw new Error('Only derived state may be rebuilt.');
    if (recovery.kind === 'RESTORED') {
      if (!['NATIVE', 'OPERATOR'].includes(state.classification.kind))
        throw new Error('Restore is for non-rebuildable durable state.');
      if (
        recovery.payload.custodyRef === state.custodyRef ||
        recovery.payload.artifact.ref === state.artifact.ref ||
        recovery.payload.verificationReceiptRefs.includes(
          recovery.payload.artifact.ref
        ) ||
        recovery.payload.reconstructionEvaluationRef ===
          recovery.payload.artifact.ref
      )
        throw new Error(
          'Restore requires independently held reconstructive payload.'
        );
    }
  } else {
    if (restricted && recovery.kind !== 'RIGHTS_RESTRICTED')
      throw new Error(
        'Restricted dependency must remain explicitly restricted.'
      );
    if (!restricted && unavailable && recovery.kind !== 'SOURCE_UNAVAILABLE')
      throw new Error(
        'Unavailable dependency must remain explicitly unavailable.'
      );
    if (
      !restricted &&
      !unavailable &&
      ['RIGHTS_RESTRICTED', 'SOURCE_UNAVAILABLE'].includes(recovery.kind)
    )
      throw new Error(
        'Recovery disposition lacks matching dependency evidence.'
      );
  }
  return value;
}
export const createStateRecovery = (
  body: unknown,
  declaration: unknown
): StateRecovery =>
  createRecord(body, (input) => parseStateRecovery(input, declaration));

/**
 * Bounded conformance composition for an exact rebuilt view. Recovery evidence
 * does not authenticate the referenced records or authorize current use. The
 * consumer must supply its independently established current admission context.
 * Unresolved custody invalidation requires the separate revalidation contract.
 */
export function admitRecoveredMaterializedViewReuse(input: {
  declaration: unknown;
  recovery: unknown;
  view: unknown;
  context: Parameters<typeof admitMaterializedViewReuse>[1];
}): MaterializedView {
  const state = parseStateCustody(input.declaration);
  const recovery = parseStateRecovery(input.recovery, state);
  const view = parseMaterializedView(input.view);
  if (
    state.classification.kind !== 'DERIVED' ||
    recovery.result.kind !== 'REBUILT'
  )
    throw new Error('Current view reuse requires a declared rebuilt view.');
  const recipe = view.environment.transformation.identity;
  if (
    state.classification.materializedViewRef !== view.recordId ||
    state.artifact === null ||
    state.artifact.ref !== view.artifact.ref ||
    state.artifact.sha256 !== view.artifact.sha256 ||
    state.classification.recipe.ref !== recipe.ref ||
    state.classification.recipe.version !== recipe.version ||
    state.scope.policyRef !== view.environment.policyRef ||
    state.scope.rightsRef !== view.environment.rightsRef ||
    state.scope.tenantRef !== view.environment.tenantRef ||
    ![
      view.source.frontier.frontierRef,
      view.source.frontier.cursorRef,
      view.source.frontier.snapshotRef,
    ].includes(state.scope.frontierRef)
  )
    throw new Error(
      'Recovered custody does not bind the exact materialized view.'
    );
  if (state.invalidationRefs.length)
    throw new Error('Custody invalidation requires independent revalidation.');
  if (input.context.requireCurrent !== true)
    throw new Error(
      'Recovered current view requires explicit current admission.'
    );
  return admitMaterializedViewReuse(view, input.context);
}
