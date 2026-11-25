import {
  compileEvidenceContract,
  evidenceObjectSchema as object,
  evidenceProfileSchema as profile,
  evidenceRefSchema as ref,
  evidenceRefsSchema as refs,
  nullableEvidenceSchema as nullable,
  supportedEvidenceSchema as support,
} from './evidence-contract-validation.js';
import { canonicalTraceJson, traceHash } from './trace-normalization.js';

/** Proposed public reference contract. Neither this record nor its digest grants rights. */
export interface TenancyBoundary {
  recordId: string;
  profile: { id: 'tenancy.boundary.v1'; version: '1.0.0' };
  isolation: {
    domainRef: string;
    versionRef: string;
    ownerRef: string;
    authorityRef: string;
  };
  scopeBindingRefs: string[];
  rights: {
    policyRef: string;
    rightsRef: string;
    decisionRef: string;
    currentnessFrontierRef: string;
    revocationFrontierRef: string;
  };
  disclosure: {
    mode: 'hide-existence';
    softSharingRef: string | null;
    opaqueHandleRef: string | null;
  };
  provenanceRefs: string[];
  receiptRefs: string[];
  auditRefs: string[];
  supersedesRefs: string[];
}

export const TENANCY_BOUNDARY_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'urn:rosetta:tenancy.boundary.v1',
  title: 'Proposed hard-isolation and current-rights reference Profile v1',
  ...object({
    recordId: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' },
    profile: profile('tenancy.boundary.v1'),
    isolation: object({
      domainRef: ref,
      versionRef: ref,
      ownerRef: ref,
      authorityRef: ref,
    }),
    scopeBindingRefs: support,
    rights: object({
      policyRef: ref,
      rightsRef: ref,
      decisionRef: ref,
      currentnessFrontierRef: ref,
      revocationFrontierRef: ref,
    }),
    disclosure: object({
      mode: { const: 'hide-existence' },
      softSharingRef: nullable(ref),
      opaqueHandleRef: nullable(ref),
    }),
    provenanceRefs: support,
    receiptRefs: refs,
    auditRefs: refs,
    supersedesRefs: refs,
  }),
};

const admit = compileEvidenceContract<TenancyBoundary>(TENANCY_BOUNDARY_SCHEMA);

/** Internal structural inspection only. Error details are not public admission responses. */
export function parseTenancyBoundary(input: unknown): TenancyBoundary {
  const value = admit(input);
  const { recordId, ...body } = value;
  if (recordId !== 'sha256:' + traceHash(canonicalTraceJson(body)))
    throw new Error('Tenancy boundary metadata digest mismatch.');
  if (value.supersedesRefs.includes(recordId))
    throw new Error('Tenancy boundary cannot supersede itself.');
  return value;
}

export function createTenancyBoundary(input: unknown): TenancyBoundary {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    'recordId' in input
  )
    throw new Error('Provide tenancy boundary metadata without recordId.');
  return parseTenancyBoundary({
    ...input,
    recordId: 'sha256:' + traceHash(canonicalTraceJson(input)),
  });
}

/**
 * Fixture-only compatibility check. The consumer must already have resolved and
 * authenticated the exact boundary and request through independent owners.
 * It supplies the decision for this request, not untrusted record assertions.
 * This function does not fetch candidates, resolve rights or authorize release.
 */
export interface TenancyBoundaryFixtureContext {
  boundaryRecordId: string;
  isolation: TenancyBoundary['isolation'];
  scopeBindingRef: string;
  rights: TenancyBoundary['rights'];
  softSharingRef: string | null;
  isolationAllowed: boolean;
  scopeAllowed: boolean;
  rightsAllowed: boolean;
  disclosureAllowed: boolean;
}

export function matchesAuthorizedTenancyFixture(
  input: unknown,
  context: TenancyBoundaryFixtureContext
): boolean {
  // A grant in one coordinate never substitutes for another. All denied,
  // absent and malformed boundaries have the same outward disposition.
  if (
    context?.isolationAllowed !== true ||
    context.scopeAllowed !== true ||
    context.rightsAllowed !== true ||
    context.disclosureAllowed !== true
  )
    return false;
  try {
    const value = parseTenancyBoundary(input);
    return (
      value.recordId === context.boundaryRecordId &&
      canonicalTraceJson(value.isolation) ===
        canonicalTraceJson(context.isolation) &&
      value.scopeBindingRefs.includes(context.scopeBindingRef) &&
      canonicalTraceJson(value.rights) === canonicalTraceJson(context.rights) &&
      value.disclosure.softSharingRef === context.softSharingRef
    );
  } catch {
    return false;
  }
}
