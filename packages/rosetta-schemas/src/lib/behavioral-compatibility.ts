import { CAPABILITY_EFFECT_CLASSES } from './capability-effects.js';
import { CAPABILITY_IDEMPOTENCY_VALUES, CAPABILITY_REPLAY_SAFETY_VALUES } from './rosetta-schemas.js';
import {
  compileEvidenceContract,
  evidenceObjectSchema as object,
  evidenceProfileSchema as profile,
  evidenceRefSchema as ref,
  evidenceRefsSchema as refs,
  nullableEvidenceSchema as nullable
} from './evidence-contract-validation.js';

/** The three adapter dimensions share the existing vocabulary, without reinterpreting their meaning. */
export const BEHAVIORAL_DIMENSION_VALUES = {
  effectClass: CAPABILITY_EFFECT_CLASSES,
  idempotency: CAPABILITY_IDEMPOTENCY_VALUES,
  replaySafety: CAPABILITY_REPLAY_SAFETY_VALUES,
  idempotencyKeyScope: ['per-operation', 'per-resource', 'per-actor', 'global', 'not-applicable'],
  delivery: ['at-most-once', 'at-least-once', 'exactly-once'],
  ordering: ['ordered', 'unordered'],
  acknowledgment: ['accepted-only', 'durably-committed'],
  timeoutCommit: ['not-committed', 'may-have-committed'],
  atomicity: ['all-or-nothing', 'partial-commit'],
  partialSuccess: ['retry-whole-safe', 'retry-items-only', 'manual-reconciliation'],
  finality: ['final', 'provisional'],
  reversibility: ['reversible', 'irreversible'],
  compensation: ['available', 'unavailable'],
  concurrency: ['serialized', 'conflict-detected', 'unconstrained']
} as const;

export type BehavioralDimension = keyof typeof BEHAVIORAL_DIMENSION_VALUES;
export type BehavioralClaim = {
  [D in BehavioralDimension]: {
    dimension: D;
    value: (typeof BEHAVIORAL_DIMENSION_VALUES)[D][number] | 'unknown';
    evidenceRefs: string[];
  }
}[BehavioralDimension];
export type BehavioralDisposition = 'COMPATIBLE' | 'INCOMPATIBLE' | 'UNKNOWN';
export interface BehavioralOperation {
  capabilityId: string;
  operationClass: string;
  implementationRef: string | null;
  implementationVersion: string | null;
}
export interface BehavioralScope { kind: 'node' | 'edge' | 'path'; ref: string }
export interface BehavioralRequirement {
  profile: { id: 'behavioral.requirement.v1'; version: '1.0.0' };
  requestId: string;
  operation: BehavioralOperation;
  scope: BehavioralScope;
  processProfileRef: string;
  requireObserved: boolean;
  required: BehavioralClaim[];
}
export interface BehavioralCapability {
  profile: { id: 'behavioral.capability.v1'; version: '1.0.0' };
  capabilityRecordId: string;
  operation: BehavioralOperation;
  normative: BehavioralClaim[];
  observed: BehavioralClaim[];
}
export type BehavioralReason =
  | 'OPERATION_MISMATCH' | 'IMPLEMENTATION_MISMATCH'
  | 'REQUIREMENT_UNKNOWN'
  | 'NORMATIVE_MISSING' | 'NORMATIVE_UNKNOWN' | 'NORMATIVE_MISMATCH' | 'NORMATIVE_EVIDENCE_MISSING'
  | 'OBSERVED_MISSING' | 'OBSERVED_UNKNOWN' | 'OBSERVED_MISMATCH' | 'OBSERVED_EVIDENCE_MISSING'
  | 'NORMATIVE_OBSERVED_CONFLICT';
export interface BehavioralComparison {
  profile: { id: 'behavioral.comparison.v1'; version: '1.0.0' };
  requestId: string;
  capabilityRecordId: string;
  scope: BehavioralScope;
  processProfileRef: string;
  operation: BehavioralOperation;
  offeredOperation: BehavioralOperation;
  disposition: BehavioralDisposition;
  dimensions: {
    dimension: BehavioralDimension;
    requiredValue: string;
    normativeValue: string | null;
    observedValue: string | null;
    disposition: BehavioralDisposition;
    reasons: BehavioralReason[];
    evidenceRefs: string[];
  }[];
}

const operationSchema = object({
  capabilityId: ref,
  operationClass: ref,
  implementationRef: nullable(ref),
  implementationVersion: nullable(ref)
});
const scopeSchema = object({ kind: { enum: ['node', 'edge', 'path'] }, ref });
const claimSchema = {
  oneOf: Object.entries(BEHAVIORAL_DIMENSION_VALUES).map(([dimension, values]) => object({
    dimension: { const: dimension }, value: { enum: [...new Set([...values, 'unknown'])] }, evidenceRefs: refs
  }))
};
const claimList = (minItems: number) => ({ type: 'array', minItems, maxItems: Object.keys(BEHAVIORAL_DIMENSION_VALUES).length, items: claimSchema });

export const BEHAVIORAL_REQUIREMENT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'urn:rosetta:behavioral.requirement.v1',
  ...object({
    profile: profile('behavioral.requirement.v1'), requestId: ref, operation: operationSchema,
    scope: scopeSchema, processProfileRef: ref, requireObserved: { type: 'boolean' }, required: claimList(1)
  })
};
export const BEHAVIORAL_CAPABILITY_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'urn:rosetta:behavioral.capability.v1',
  ...object({
    profile: profile('behavioral.capability.v1'), capabilityRecordId: ref, operation: operationSchema,
    normative: claimList(0), observed: claimList(0)
  })
};
const dispositions = ['COMPATIBLE', 'INCOMPATIBLE', 'UNKNOWN'] as const;
const reasonCodes: BehavioralReason[] = [
  'OPERATION_MISMATCH', 'IMPLEMENTATION_MISMATCH',
  'REQUIREMENT_UNKNOWN',
  'NORMATIVE_MISSING', 'NORMATIVE_UNKNOWN', 'NORMATIVE_MISMATCH', 'NORMATIVE_EVIDENCE_MISSING',
  'OBSERVED_MISSING', 'OBSERVED_UNKNOWN', 'OBSERVED_MISMATCH', 'OBSERVED_EVIDENCE_MISSING',
  'NORMATIVE_OBSERVED_CONFLICT'
];
export const BEHAVIORAL_COMPARISON_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:behavioral.comparison.v1',
  ...object({
    profile: profile('behavioral.comparison.v1'), requestId: ref, capabilityRecordId: ref,
    scope: scopeSchema, processProfileRef: ref, operation: operationSchema,
    offeredOperation: operationSchema,
    disposition: { enum: dispositions },
    dimensions: {
      type: 'array', minItems: 1, maxItems: Object.keys(BEHAVIORAL_DIMENSION_VALUES).length,
      items: object({
        dimension: { enum: Object.keys(BEHAVIORAL_DIMENSION_VALUES) },
        requiredValue: ref, normativeValue: nullable(ref), observedValue: nullable(ref),
        disposition: { enum: dispositions },
        reasons: { type: 'array', uniqueItems: true, items: { enum: reasonCodes } },
        evidenceRefs: refs
      })
    }
  })
};

const admitRequirement = compileEvidenceContract<BehavioralRequirement>(BEHAVIORAL_REQUIREMENT_SCHEMA);
const admitCapability = compileEvidenceContract<BehavioralCapability>(BEHAVIORAL_CAPABILITY_SCHEMA);
const admitComparison = compileEvidenceContract<BehavioralComparison>(BEHAVIORAL_COMPARISON_SCHEMA);

function rejectDuplicateDimensions(claims: BehavioralClaim[], name: string): void {
  if (new Set(claims.map(claim => claim.dimension)).size !== claims.length) {
    throw new Error(`Duplicate behavioral ${name} dimension.`);
  }
}

export function parseBehavioralRequirement(input: unknown): BehavioralRequirement {
  const value = admitRequirement(input);
  rejectDuplicateDimensions(value.required, 'requirement');
  return structuredClone(value);
}

export function parseBehavioralCapability(input: unknown): BehavioralCapability {
  const value = admitCapability(input);
  rejectDuplicateDimensions(value.normative, 'normative');
  rejectDuplicateDimensions(value.observed, 'observed');
  if (value.observed.length && (!value.operation.implementationRef || !value.operation.implementationVersion)) {
    throw new Error('Observed behavior must identify an exact implementation and version.');
  }
  return structuredClone(value);
}

const incompatibleReasons = new Set<BehavioralReason>([
  'OPERATION_MISMATCH', 'IMPLEMENTATION_MISMATCH', 'NORMATIVE_MISMATCH',
  'OBSERVED_MISMATCH', 'NORMATIVE_OBSERVED_CONFLICT'
]);
export function parseBehavioralComparison(input: unknown): BehavioralComparison {
  const value = admitComparison(input);
  if (new Set(value.dimensions.map(dimension => dimension.dimension)).size !== value.dimensions.length) {
    throw new Error('Duplicate behavioral comparison dimension.');
  }
  for (const dimension of value.dimensions) {
    const expected = dimension.reasons.some(reason => incompatibleReasons.has(reason)) ? 'INCOMPATIBLE'
      : dimension.reasons.length ? 'UNKNOWN' : 'COMPATIBLE';
    if (dimension.disposition !== expected) throw new Error('Behavioral comparison dimension disposition contradicts reasons.');
  }
  const aggregate = value.dimensions.some(dimension => dimension.disposition === 'INCOMPATIBLE') ? 'INCOMPATIBLE'
    : value.dimensions.some(dimension => dimension.disposition === 'UNKNOWN') ? 'UNKNOWN' : 'COMPATIBLE';
  if (value.disposition !== aggregate) throw new Error('Behavioral comparison aggregate hides an incompatible or unknown dimension.');
  return structuredClone(value);
}

/** Compatibility evidence over explicit dimensions only; never an apply/retry authorization. */
export function compareBehavioralCompatibility(requestInput: unknown, capabilityInput: unknown): BehavioralComparison {
  const request = parseBehavioralRequirement(requestInput);
  const capability = parseBehavioralCapability(capabilityInput);
  const offered = capability.operation;
  const wanted = request.operation;
  const operationMismatch = wanted.capabilityId !== offered.capabilityId || wanted.operationClass !== offered.operationClass;
  const implementationMismatch =
    (wanted.implementationRef !== null && wanted.implementationRef !== offered.implementationRef) ||
    (wanted.implementationVersion !== null && wanted.implementationVersion !== offered.implementationVersion);
  const normative = new Map(capability.normative.map(claim => [claim.dimension, claim]));
  const observed = new Map(capability.observed.map(claim => [claim.dimension, claim]));

  const dimensions = request.required.map(required => {
    const declared = normative.get(required.dimension);
    const seen = observed.get(required.dimension);
    const incompatible = new Set<BehavioralReason>();
    const unknown = new Set<BehavioralReason>();
    const wantedValue = required.value;
    if (wantedValue === 'unknown') unknown.add('REQUIREMENT_UNKNOWN');
    if (operationMismatch) incompatible.add('OPERATION_MISMATCH');
    if (implementationMismatch) incompatible.add('IMPLEMENTATION_MISMATCH');
    if (!declared) unknown.add('NORMATIVE_MISSING');
    else if (declared.value === 'unknown') unknown.add('NORMATIVE_UNKNOWN');
    else {
      if (!declared.evidenceRefs.length) unknown.add('NORMATIVE_EVIDENCE_MISSING');
      else if (wantedValue !== 'unknown' && declared.value !== wantedValue) incompatible.add('NORMATIVE_MISMATCH');
    }
    if (seen) {
      if (seen.value === 'unknown') unknown.add('OBSERVED_UNKNOWN');
      else if (!seen.evidenceRefs.length) unknown.add('OBSERVED_EVIDENCE_MISSING');
      else {
        if (wantedValue !== 'unknown' && seen.value !== wantedValue) incompatible.add('OBSERVED_MISMATCH');
        if (declared && declared.value !== 'unknown' && declared.evidenceRefs.length && declared.value !== seen.value) {
          incompatible.add('NORMATIVE_OBSERVED_CONFLICT');
        }
      }
    } else if (request.requireObserved) unknown.add('OBSERVED_MISSING');

    const disposition = incompatible.size ? 'INCOMPATIBLE' : unknown.size ? 'UNKNOWN' : 'COMPATIBLE';
    return {
      dimension: required.dimension, requiredValue: wantedValue,
      normativeValue: declared?.value ?? null, observedValue: seen?.value ?? null,
      disposition,
      reasons: [...incompatible, ...unknown].sort() as BehavioralReason[],
      evidenceRefs: [...new Set([...(declared?.evidenceRefs ?? []), ...(seen?.evidenceRefs ?? [])])].sort()
    };
  }).sort((left, right) => left.dimension.localeCompare(right.dimension));
  const disposition = dimensions.some(result => result.disposition === 'INCOMPATIBLE') ? 'INCOMPATIBLE'
    : dimensions.some(result => result.disposition === 'UNKNOWN') ? 'UNKNOWN' : 'COMPATIBLE';
  return parseBehavioralComparison({
    profile: { id: 'behavioral.comparison.v1', version: '1.0.0' },
    requestId: request.requestId, capabilityRecordId: capability.capabilityRecordId,
    scope: request.scope, processProfileRef: request.processProfileRef,
    operation: request.operation, offeredOperation: capability.operation, disposition, dimensions
  });
}
