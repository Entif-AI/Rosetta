import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  compareBehavioralCompatibility,
  parseBehavioralCapability,
  parseBehavioralComparison,
  parseBehavioralRequirement,
  BEHAVIORAL_REQUIREMENT_SCHEMA,
  BEHAVIORAL_CAPABILITY_SCHEMA,
  BEHAVIORAL_COMPARISON_SCHEMA,
  BEHAVIORAL_DIMENSION_VALUES,
  type BehavioralCapability,
  type BehavioralClaim,
  type BehavioralDimension,
  type BehavioralRequirement
} from '../index.js';
import { CAPABILITY_EFFECT_CLASSES } from './capability-effects.js';
import { CAPABILITY_IDEMPOTENCY_VALUES, CAPABILITY_REPLAY_SAFETY_VALUES } from './rosetta-schemas.js';
import { getCoreDescent } from './core-descent.js';
import { getSchemaCatalogEntry, validateSchemaCatalogCoverage } from './schema-catalog.js';

const operation = {
  capabilityId: 'urn:cap:payment-settlement', operationClass: 'settle-payment',
  implementationRef: 'urn:implementation:processor-v2', implementationVersion: '2.0.0'
};
const claim = <D extends BehavioralDimension>(
  dimension: D, value: (typeof BEHAVIORAL_DIMENSION_VALUES)[D][number] | 'unknown',
  evidenceRefs: string[] = [`urn:evidence:${dimension}:${value}`]
): BehavioralClaim => ({ dimension, value, evidenceRefs }) as BehavioralClaim;
const requirement = (required: BehavioralClaim[], overrides: Partial<BehavioralRequirement> = {}): BehavioralRequirement => ({
  profile: { id: 'behavioral.requirement.v1', version: '1.0.0' },
  requestId: 'urn:request:batch-settlement', operation,
  scope: { kind: 'path', ref: 'urn:path:settlement' }, processProfileRef: 'urn:process:batch-settlement',
  requireObserved: true, required, ...overrides
});
const capability = (normative: BehavioralClaim[], observed: BehavioralClaim[] = normative, overrides: Partial<BehavioralCapability> = {}): BehavioralCapability => ({
  profile: { id: 'behavioral.capability.v1', version: '1.0.0' },
  capabilityRecordId: 'urn:capability:processor-v2', operation, normative, observed, ...overrides
});
const compare = (req: BehavioralRequirement, cap: BehavioralCapability) => compareBehavioralCompatibility(req, cap);

describe('behavioral compatibility #1556', () => {
  it('publishes three portable schemas equal to source API and reuses existing adapter enum instances', () => {
    expect(BEHAVIORAL_DIMENSION_VALUES.effectClass).toBe(CAPABILITY_EFFECT_CLASSES);
    expect(BEHAVIORAL_DIMENSION_VALUES.idempotency).toBe(CAPABILITY_IDEMPOTENCY_VALUES);
    expect(BEHAVIORAL_DIMENSION_VALUES.replaySafety).toBe(CAPABILITY_REPLAY_SAFETY_VALUES);
    const sources = [
      ['requirement', BEHAVIORAL_REQUIREMENT_SCHEMA], ['capability', BEHAVIORAL_CAPABILITY_SCHEMA], ['comparison', BEHAVIORAL_COMPARISON_SCHEMA]
    ] as const;
    for (const [name, schema] of sources) {
      expect(JSON.parse(readFileSync(`packages/rosetta-schemas/docs/behavioral-${name}-v1.schema.json`, 'utf8'))).toEqual(schema);
      const schemaId = `behavioral.${name}.v1`;
      expect(getCoreDescent(schemaId, [])?.coreDescent).toBe('governed-extension');
      expect(getSchemaCatalogEntry(schemaId)?.sourceIssues).toContain('#1556');
    }
    expect(validateSchemaCatalogCoverage()).toEqual([]);
  });
  it('refuses structurally compatible requests with incompatible idempotency semantics', () => {
    const result = compare(requirement([claim('idempotency', 'idempotent')]), capability([claim('idempotency', 'non-idempotent')]));
    expect(result.disposition).toBe('INCOMPATIBLE');
    expect(result.dimensions).toEqual([{
      dimension: 'idempotency', requiredValue: 'idempotent', normativeValue: 'non-idempotent',
      observedValue: 'non-idempotent', disposition: 'INCOMPATIBLE',
      reasons: ['NORMATIVE_MISMATCH', 'OBSERVED_MISMATCH'],
      evidenceRefs: ['urn:evidence:idempotency:non-idempotent']
    }]);
  });

  it('does not equate at-least-once with exactly-once delivery', () => {
    const result = compare(requirement([claim('delivery', 'exactly-once')]), capability([claim('delivery', 'at-least-once')]));
    expect(result.disposition).toBe('INCOMPATIBLE');
    expect(result.dimensions[0].reasons).toContain('OBSERVED_MISMATCH');
  });

  it('keeps timeout commit state unknown when a downstream effect could have committed', () => {
    const result = compare(requirement([claim('timeoutCommit', 'not-committed')]), capability([claim('timeoutCommit', 'unknown')]));
    expect(result.disposition).toBe('UNKNOWN');
    expect(result.dimensions[0].reasons).toContain('NORMATIVE_UNKNOWN');
  });

  it('refuses unsafe whole-batch retry when only per-item replay is supported', () => {
    const result = compare(requirement([claim('partialSuccess', 'retry-whole-safe')]), capability([claim('partialSuccess', 'retry-items-only')]));
    expect(result.dimensions[0].disposition).toBe('INCOMPATIBLE');
  });

  it('separates reversible local behavior from final external settlement', () => {
    const req = requirement([claim('reversibility', 'reversible'), claim('finality', 'provisional')]);
    const cap = capability([claim('reversibility', 'irreversible'), claim('finality', 'final')]);
    const result = compare(req, cap);
    expect(result.disposition).toBe('INCOMPATIBLE');
    expect(result.dimensions.map(d => [d.dimension, d.disposition])).toEqual([
      ['finality', 'INCOMPATIBLE'], ['reversibility', 'INCOMPATIBLE']
    ]);
  });

  it('refuses out-of-order delivery despite a matching nominal operation and input schema', () => {
    const result = compare(requirement([claim('ordering', 'ordered')]), capability([claim('ordering', 'unordered')]));
    expect(result.disposition).toBe('INCOMPATIBLE');
  });

  it('exposes contradictory normative and observed claims even if observed behavior matches the request', () => {
    const result = compare(requirement([claim('atomicity', 'all-or-nothing')]), capability(
      [claim('atomicity', 'partial-commit')], [claim('atomicity', 'all-or-nothing')]
    ));
    expect(result.disposition).toBe('INCOMPATIBLE');
    expect(result.dimensions[0].reasons).toEqual(['NORMATIVE_MISMATCH', 'NORMATIVE_OBSERVED_CONFLICT']);
  });

  it('leaves a required unevidenced behavior UNKNOWN, not a default compatibility pass', () => {
    const result = compare(requirement([claim('concurrency', 'serialized')]), capability([], []));
    expect(result.disposition).toBe('UNKNOWN');
    expect(result.dimensions[0].reasons).toEqual(['NORMATIVE_MISSING', 'OBSERVED_MISSING']);
  });

  it('keeps idempotency-key scope independent from the same idempotency class', () => {
    const req = requirement([claim('idempotency', 'idempotent'), claim('idempotencyKeyScope', 'per-operation')]);
    const cap = capability([claim('idempotency', 'idempotent'), claim('idempotencyKeyScope', 'global')]);
    expect(compare(req, cap).dimensions.map(d => [d.dimension, d.disposition])).toEqual([
      ['idempotency', 'COMPATIBLE'], ['idempotencyKeyScope', 'INCOMPATIBLE']
    ]);
  });

  it('does not infer rollback of an irreversible effect from available compensation', () => {
    const req = requirement([claim('compensation', 'available'), claim('reversibility', 'reversible')]);
    const cap = capability([claim('compensation', 'available'), claim('reversibility', 'irreversible')]);
    expect(compare(req, cap).dimensions.map(d => [d.dimension, d.disposition])).toEqual([
      ['compensation', 'COMPATIBLE'], ['reversibility', 'INCOMPATIBLE']
    ]);
  });

  it('compares identical operation evidence differently for two bounded process Profiles', () => {
    const cap = capability([claim('ordering', 'unordered')]);
    const loose = requirement([claim('ordering', 'unordered')], { processProfileRef: 'urn:process:notifications' });
    const strict = requirement([claim('ordering', 'ordered')], { processProfileRef: 'urn:process:ledger' });
    expect(compare(loose, cap).disposition).toBe('COMPATIBLE');
    expect(compare(strict, cap).disposition).toBe('INCOMPATIBLE');
  });

  it('refuses duplicate dimensions, unsupported dimension/value pairs and mismatched implementation', () => {
    const one = claim('delivery', 'exactly-once');
    expect(() => parseBehavioralRequirement(requirement([one, one]))).toThrow(/Duplicate behavioral requirement dimension/);
    expect(() => parseBehavioralCapability(capability([one, one]))).toThrow(/Duplicate behavioral normative dimension/);
    expect(() => parseBehavioralCapability(capability([claim('delivery', 'at-most-once')], [one, one]))).toThrow(/Duplicate behavioral observed dimension/);
    expect(() => parseBehavioralCapability(capability([{ dimension: 'delivery', value: 'reversible', evidenceRefs: [] } as unknown as BehavioralClaim]))).toThrow(/Invalid evidence contract/);
    expect(() => parseBehavioralCapability(capability([{ dimension: 'new-global-grant', value: 'yes', evidenceRefs: [] } as unknown as BehavioralClaim]))).toThrow(/Invalid evidence contract/);
    const req = requirement([claim('ordering', 'ordered')]);
    const otherImpl = capability([claim('ordering', 'ordered')], undefined, {
      operation: { ...operation, implementationVersion: '3.0.0' }
    });
    expect(compare(req, otherImpl).dimensions[0].reasons).toEqual(['IMPLEMENTATION_MISMATCH']);
    expect(compare(req, otherImpl).offeredOperation.implementationVersion).toBe('3.0.0');
  });

  it('requires observed evidence when requested, but labels a normative-only scope explicitly', () => {
    const cap = capability([claim('effectClass', 'external-write')], []);
    const wanted = requirement([claim('effectClass', 'external-write')]);
    expect(compare(wanted, cap).disposition).toBe('UNKNOWN');
    expect(compare({ ...wanted, requireObserved: false }, cap).disposition).toBe('COMPATIBLE');
  });

  it('does not accept missing evidence refs as proof of a declared or observed guarantee', () => {
    const req = requirement([claim('replaySafety', 'replay-safe')]);
    const withoutDeclaredProof = capability([claim('replaySafety', 'replay-safe', [])]);
    const withoutObservedProof = capability([claim('replaySafety', 'replay-safe')], [claim('replaySafety', 'replay-safe', [])]);
    expect(compare(req, withoutDeclaredProof).disposition).toBe('UNKNOWN');
    expect(compare(req, withoutObservedProof).disposition).toBe('UNKNOWN');
    const conflictingButUnevidenced = capability([claim('replaySafety', 'not-replay-safe', [])]);
    expect(compare(req, conflictingButUnevidenced).disposition).toBe('UNKNOWN');
    expect(compare(req, conflictingButUnevidenced).dimensions[0].reasons).toContain('NORMATIVE_EVIDENCE_MISSING');
  });

  it('does not turn an unknown requested constraint into compatible or incompatible behavior', () => {
    const req = requirement([claim('delivery', 'unknown')]);
    const cap = capability([claim('delivery', 'at-least-once')]);
    expect(compare(req, cap).disposition).toBe('UNKNOWN');
    expect(compare(req, cap).dimensions[0].reasons).toEqual(['REQUIREMENT_UNKNOWN']);
  });

  it('requires observed behavioral claims to identify a concrete implementation revision', () => {
    const missingVersion = capability([claim('delivery', 'exactly-once')], [claim('delivery', 'exactly-once')], {
      operation: { ...operation, implementationVersion: null }
    });
    expect(() => parseBehavioralCapability(missingVersion)).toThrow('Observed behavior must identify an exact implementation and version.');
  });

  it('rejects forged aggregate results that hide an incompatible or unknown dimension', () => {
    const req = requirement([claim('ordering', 'ordered')]);
    const cap = capability([claim('ordering', 'unordered')]);
    const actual = compare(req, cap);
    expect(() => parseBehavioralComparison({ ...actual, disposition: 'COMPATIBLE' }, req)).toThrow(/aggregate hides/);
    expect(() => parseBehavioralComparison({
      ...actual, disposition: 'COMPATIBLE', dimensions: actual.dimensions.map(dimension => ({ ...dimension, disposition: 'COMPATIBLE' }))
    }, req)).toThrow(/dimension disposition contradicts reasons/);
  });

  it('rejects persisted comparisons that omit an unfavorable required dimension', () => {
    const req = requirement([claim('idempotency', 'idempotent'), claim('ordering', 'ordered')]);
    const cap = capability([claim('idempotency', 'idempotent'), claim('ordering', 'unordered')]);
    const actual = compare(req, cap);
    expect(actual.disposition).toBe('INCOMPATIBLE');

    const forged = {
      ...actual,
      disposition: 'COMPATIBLE',
      dimensions: actual.dimensions.filter(result => result.dimension !== 'ordering')
    };
    expect(forged.dimensions).toHaveLength(1);
    expect(() => parseBehavioralComparison(forged, req)).toThrow(/required dimensions/);
  });

  it('binds persisted comparison identity and required values to the trusted request', () => {
    const req = requirement([claim('delivery', 'exactly-once')]);
    const actual = compare(req, capability([claim('delivery', 'exactly-once')]));
    expect(parseBehavioralComparison(actual, req)).toEqual(actual);

    expect(() => parseBehavioralComparison(actual, undefined)).toThrow();
    expect(() => parseBehavioralComparison({ ...actual, requestId: 'urn:request:other' }, req)).toThrow(/request identity/);
    expect(() => parseBehavioralComparison({ ...actual, processProfileRef: 'urn:process:other' }, req)).toThrow(/request identity/);
    expect(() => parseBehavioralComparison({ ...actual, scope: { ...actual.scope, ref: 'urn:path:other' } }, req)).toThrow(/request identity/);
    expect(() => parseBehavioralComparison({
      ...actual, operation: { ...actual.operation, implementationVersion: '3.0.0' }
    }, req)).toThrow(/request identity/);
    expect(() => parseBehavioralComparison({
      ...actual, dimensions: actual.dimensions.map(dimension => ({ ...dimension, requiredValue: 'at-most-once' }))
    }, req)).toThrow(/required dimensions/);
  });

  it('replays deterministically across input claim ordering without mutating source records', () => {
    const first = claim('effectClass', 'external-write');
    const second = claim('idempotency', 'idempotent');
    const req = requirement([first, second], { scope: { kind: 'edge', ref: 'urn:edge:checkout' } });
    const cap = capability([second, first], [second, first]);
    const snapshot = structuredClone({ req, cap });
    const output = compare(req, cap);
    expect(output.disposition).toBe('COMPATIBLE');
    expect(parseBehavioralComparison(output, req)).toEqual(output);
    expect(compare({ ...req, required: [second, first] }, capability([first, second], [first, second]))).toEqual(output);
    expect({ req, cap }).toEqual(snapshot);
  });
});
