import { describe, expect, it } from 'vitest';

import { routeRosettaApi } from './rosetta-api.js';

describe('rosetta-api', () => {
  it('serves health status', () => {
    const result = routeRosettaApi('/health');

    expect(result.statusCode).toBe(200);
    expect(result.body).toMatchObject({ ok: true, service: 'rosetta-api' });
  });

  it('serves the bootstrap registry', () => {
    const result = routeRosettaApi('/registry');

    expect(result.statusCode).toBe(200);
    expect(result.body).toMatchObject({
      entries: expect.any(Array),
      profiles: expect.any(Array),
    });
  });

  it('serves the bootstrap demo snapshot', () => {
    const result = routeRosettaApi('/demo');

    expect(result.statusCode).toBe(200);
    expect(result.body).toMatchObject({
      conformanceBundle: {
        summary: { violations: 0 },
      },
      receiptBundle: {
        subjectCids: expect.any(Array),
      },
      signedReceipt: {
        receipt: {
          kind: 'rosetta.receipt',
        },
      },
    });
  });

  it('serves shape-compatible guarded-bootstrap inspection scenarios', () => {
    const scenarios = ['pass', 'block', 'deny', 'fail'] as const;

    for (const scenario of scenarios) {
      const result = routeRosettaApi(
        `/inspect/bootstrap-gate?scenario=${scenario}`
      );

      expect(result.statusCode).toBe(200);
      expect(result.body).toMatchObject({
        bootstrapGate: {
          status: scenario,
          verdict: scenario,
        },
        scenario,
        status: 'fixture-backed',
      });
    }
  });

  it('keeps guarded-bootstrap inspection read-only and explicit about proof boundaries', () => {
    const result = routeRosettaApi('/inspect/bootstrap-gate');

    expect(result.statusCode).toBe(200);
    expect(result.body).toMatchObject({
      bootstrapGate: {
        closureArtifact: { exists: true },
        guard: { effect: 'allow' },
        receiptBundleVerification: { ok: true },
        status: 'pass',
        steps: expect.arrayContaining([
          expect.objectContaining({ id: 'canonicalize-input', status: 'pass' }),
          expect.objectContaining({ id: 'verify-chain', status: 'pass' }),
        ]),
      },
      note: expect.stringContaining('does not grant execution'),
      scenario: 'pass',
      status: 'fixture-backed',
    });
  });

  it('rejects unsupported guarded-bootstrap scenarios', () => {
    const result = routeRosettaApi('/inspect/bootstrap-gate?scenario=unknown');

    expect(result.statusCode).toBe(400);
    expect(result.body).toMatchObject({
      acceptedScenarios: ['pass', 'block', 'deny', 'fail'],
      error: 'unsupported bootstrap gate scenario: unknown',
    });
  });

  it('serves the schema catalog as an inspection surface without changing exposure labels', () => {
    const result = routeRosettaApi('/schemas');

    expect(result.statusCode).toBe(200);
    expect(result.body).toMatchObject({
      entries: expect.arrayContaining([
        expect.objectContaining({
          exposureStatus: 'downstream-contract',
          schemaId: 'entif.agentic-messaging.envelope.v1',
        }),
        expect.objectContaining({
          exposureStatus: 'reserved-interface',
          schemaId: 'entif.iam.decision.ref',
        }),
      ]),
    });
  });

  it('rejects missing, invalid, or unknown routes', () => {
    expect(routeRosettaApi(undefined)).toMatchObject({ statusCode: 400 });
    expect(routeRosettaApi('http://%')).toMatchObject({ statusCode: 400 });
    expect(routeRosettaApi('/missing')).toMatchObject({ statusCode: 404 });
  });
});
