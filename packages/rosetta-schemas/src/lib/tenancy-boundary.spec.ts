import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TENANCY_BOUNDARY_SCHEMA,
  createTenancyBoundary,
  matchesAuthorizedTenancyFixture,
  parseTenancyBoundary,
  type TenancyBoundary,
  type TenancyBoundaryFixtureContext,
} from './tenancy-boundary.js';

const body: Omit<TenancyBoundary, 'recordId'> = {
  profile: { id: 'tenancy.boundary.v1', version: '1.0.0' },
  isolation: {
    domainRef: 'domain:A',
    versionRef: 'domain:A:v1',
    ownerRef: 'owner:A',
    authorityRef: 'authority:A',
  },
  scopeBindingRefs: ['project:binding', 'initiative:binding'],
  rights: {
    policyRef: 'policy:A',
    rightsRef: 'rights:A',
    decisionRef: 'decision:A',
    currentnessFrontierRef: 'current:1',
    revocationFrontierRef: 'revocation:1',
  },
  disclosure: {
    mode: 'hide-existence',
    softSharingRef: 'sharing:1',
    opaqueHandleRef: 'opaque:1',
  },
  provenanceRefs: ['source:A'],
  receiptRefs: ['receipt:A'],
  auditRefs: ['audit:A'],
  supersedesRefs: [],
};
const boundary = createTenancyBoundary(body);
const authorized: TenancyBoundaryFixtureContext = {
  boundaryRecordId: boundary.recordId,
  isolation: body.isolation,
  scopeBindingRef: 'project:binding',
  rights: body.rights,
  softSharingRef: body.disclosure.softSharingRef,
  isolationAllowed: true,
  scopeAllowed: true,
  rightsAllowed: true,
  disclosureAllowed: true,
};

describe('proposed tenancy boundary Profile', () => {
  it('publishes the exact executable structural contract', () => {
    expect(
      JSON.parse(
        readFileSync(
          'packages/rosetta-schemas/docs/tenancy-boundary-v1.schema.json',
          'utf8'
        )
      )
    ).toEqual(TENANCY_BOUNDARY_SCHEMA);
  });

  it('separates stable isolation identity, scope bindings and decision references', () => {
    expect(parseTenancyBoundary(boundary)).toEqual(boundary);
    const next = createTenancyBoundary({
      ...body,
      scopeBindingRefs: ['other:binding'],
      supersedesRefs: [boundary.recordId],
    });
    expect(next.isolation).toEqual(boundary.isolation);
    expect(next.recordId).not.toEqual(boundary.recordId);
    expect(() =>
      parseTenancyBoundary({ ...boundary, scopeBindingRefs: ['other:binding'] })
    ).toThrow(/digest mismatch/);
    expect(() =>
      createTenancyBoundary({ ...body, authorized: true })
    ).toThrow();
  });

  it('does not treat hierarchy, sharing or opaque decision references as permission', () => {
    for (const key of [
      'isolationAllowed',
      'scopeAllowed',
      'rightsAllowed',
      'disclosureAllowed',
    ] as const) {
      expect(
        matchesAuthorizedTenancyFixture(boundary, {
          ...authorized,
          [key]: false,
        })
      ).toBe(false);
    }
    expect(
      matchesAuthorizedTenancyFixture(boundary, {
        ...authorized,
        isolation: { ...body.isolation, domainRef: 'domain:B' },
      })
    ).toBe(false);
    expect(
      matchesAuthorizedTenancyFixture(boundary, {
        ...authorized,
        scopeBindingRef: 'unbound:scope',
      })
    ).toBe(false);
    expect(
      matchesAuthorizedTenancyFixture(boundary, {
        ...authorized,
        softSharingRef: 'sharing:other',
      })
    ).toBe(false);
    expect(matchesAuthorizedTenancyFixture(boundary, authorized)).toBe(true);
  });

  it('requires exact version, authority, policy, rights, decision and frontier coordinates', () => {
    for (const key of ['versionRef', 'ownerRef', 'authorityRef'] as const) {
      expect(
        matchesAuthorizedTenancyFixture(boundary, {
          ...authorized,
          isolation: { ...body.isolation, [key]: 'other' },
        })
      ).toBe(false);
    }
    for (const key of [
      'policyRef',
      'rightsRef',
      'decisionRef',
      'currentnessFrontierRef',
      'revocationFrontierRef',
    ] as const) {
      expect(
        matchesAuthorizedTenancyFixture(boundary, {
          ...authorized,
          rights: { ...body.rights, [key]: 'other' },
        })
      ).toBe(false);
    }
    expect(
      matchesAuthorizedTenancyFixture(boundary, {
        ...authorized,
        boundaryRecordId: 'other',
      })
    ).toBe(false);
  });

  it('provides the same neutral denial before two fixture consumer discovery operations', () => {
    const graphTraversal = vi.fn(() => ['node:visible']);
    const contextCandidates = vi.fn(() => ['block:visible']);
    // These consumers have distinct owners and candidate operations. They share
    // the reference contract, not an authorization engine or inferred grants.
    const graph = (input: unknown, decision: TenancyBoundaryFixtureContext) =>
      matchesAuthorizedTenancyFixture(input, decision)
        ? graphTraversal()
        : null;
    const compiled = (
      input: unknown,
      decision: TenancyBoundaryFixtureContext
    ) =>
      matchesAuthorizedTenancyFixture(input, decision)
        ? contextCandidates()
        : null;
    for (const consumer of [graph, compiled]) {
      expect(consumer(undefined, authorized)).toBe(null);
      expect(consumer({ ...boundary, invalid: true }, authorized)).toBe(null);
      expect(
        consumer(boundary, { ...authorized, isolationAllowed: false })
      ).toBe(null);
      expect(consumer(boundary, { ...authorized, rightsAllowed: false })).toBe(
        null
      );
    }
    expect(graphTraversal).not.toHaveBeenCalled();
    expect(contextCandidates).not.toHaveBeenCalled();
    expect(graph(boundary, authorized)).toEqual(['node:visible']);
    expect(
      compiled(boundary, {
        ...authorized,
        scopeBindingRef: 'initiative:binding',
      })
    ).toEqual(['block:visible']);
  });
});
