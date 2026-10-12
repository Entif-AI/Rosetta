import { describe, expect, it } from 'vitest';

import { composePackReleaseGateReport, evaluatePackReleaseGate } from './release-gate.mjs';

describe('Pack release gate report', () => {
  it('emits the ordered passing gate without granting promotion authority', () => {
    const report = composePackReleaseGateReport({
      bootstrap: { status: 'pass' },
      packErrors: [],
      rrpReceipts: { status: 'pass' }
    });

    expect(report).toEqual({
      formatVersion: 1,
      role: 'pack-release-gate-evidence',
      effect: 'conformance-evidence-only',
      disposition: 'pass',
      sources: {
        bootstrapWorkspace: 'packages/rosetta-schemas/src/lib/workspace-contract.spec.ts',
        packConformance: 'tools/pack-conformance/validate-packs.mjs',
        rrpReceiptSemantics: 'tools/pack-conformance/rrp-receipt-vectors.spec.mjs',
        rrpReceiptTarget: 'packs-rrp:test'
      },
      stages: [
        { id: 'pack-root-manifest', status: 'pass' },
        { id: 'pack-integrity', status: 'pass' },
        { id: 'docid-dependencies', status: 'pass' },
        { id: 'bootstrap-workspace', status: 'pass' },
        { id: 'rrp-receipt-semantics', status: 'pass' }
      ],
      observedErrors: []
    });
  });

  it('reports manifest failure first and blocks every later release stage', () => {
    const report = composePackReleaseGateReport({
      bootstrap: { status: 'not-run' },
      packErrors: [
        { code: 'manifest-schema-invalid', root: 'packs/rrp', detail: '/ must NOT have additional properties' },
        { code: 'pack-id-mismatch', root: 'packs/stdpack-source-substrate', detail: 'declared old; expected new' }
      ]
    });

    expect(report.stages.map(({ id, status, ...rest }) => ({ id, status, ...rest }))).toEqual([
      {
        id: 'pack-root-manifest',
        status: 'fail',
        errors: [
          { code: 'manifest-schema-invalid', root: 'packs/rrp', detail: '/ must NOT have additional properties' }
        ]
      },
      { id: 'pack-integrity', status: 'blocked', blockedBy: 'pack-root-manifest' },
      { id: 'docid-dependencies', status: 'blocked', blockedBy: 'pack-root-manifest' },
      { id: 'bootstrap-workspace', status: 'blocked', blockedBy: 'pack-root-manifest' },
      { id: 'rrp-receipt-semantics', status: 'blocked', blockedBy: 'pack-root-manifest' }
    ]);
    expect(report.observedErrors).toEqual([
      { code: 'manifest-schema-invalid', root: 'packs/rrp', detail: '/ must NOT have additional properties' },
      { code: 'pack-id-mismatch', root: 'packs/stdpack-source-substrate', detail: 'declared old; expected new' }
    ]);
  });

  it('blocks bootstrap after an integrity failure even when later evidence was observed', () => {
    const report = composePackReleaseGateReport({
      bootstrap: { status: 'not-run' },
      packErrors: [
        { code: 'pack-id-mismatch', root: 'packs/rrp', detail: 'declared old; expected new' },
        { code: 'depends-on-cycle', root: 'packs/rrp', detail: 'ROCK-3111-C -> PACK-X -> ROCK-3111-C' }
      ]
    });

    expect(report.stages).toEqual([
      { id: 'pack-root-manifest', status: 'pass' },
      {
        id: 'pack-integrity',
        status: 'fail',
        errors: [{ code: 'pack-id-mismatch', root: 'packs/rrp', detail: 'declared old; expected new' }]
      },
      { id: 'docid-dependencies', status: 'blocked', blockedBy: 'pack-integrity' },
      { id: 'bootstrap-workspace', status: 'blocked', blockedBy: 'pack-integrity' },
      { id: 'rrp-receipt-semantics', status: 'blocked', blockedBy: 'pack-integrity' }
    ]);
  });

  it('surfaces bootstrap failure only after every Pack validation stage passes', () => {
    const report = composePackReleaseGateReport({
      bootstrap: { status: 'fail' },
      packErrors: []
    });

    expect(report.stages).toEqual([
      { id: 'pack-root-manifest', status: 'pass' },
      { id: 'pack-integrity', status: 'pass' },
      { id: 'docid-dependencies', status: 'pass' },
      {
        id: 'bootstrap-workspace',
        status: 'fail',
        errors: [
          {
            code: 'bootstrap-contract-failed',
            root: '.',
            detail: 'packages/rosetta-schemas/src/lib/workspace-contract.spec.ts failed'
          }
        ]
      },
      { id: 'rrp-receipt-semantics', status: 'blocked', blockedBy: 'bootstrap-workspace' }
    ]);
  });

  it('fails the composed gate when the signed RRP receipt pass/tamper proof fails', async () => {
    const report = await evaluatePackReleaseGate({
      runBootstrap: () => ({ status: 'pass' }),
      runRrpReceipts: () => ({ status: 'fail' })
    });

    expect(report.disposition).toBe('blocked');
    expect(report.effect).toBe('conformance-evidence-only');
    expect(report.stages.slice(-2)).toEqual([
      { id: 'bootstrap-workspace', status: 'pass' },
      {
        id: 'rrp-receipt-semantics',
        status: 'fail',
        errors: [{
          code: 'rrp-receipt-semantics-failed',
          root: 'packs/rrp',
          detail: 'packs-rrp:test failed to prove signed receipt pass/tamper semantics'
        }]
      }
    ]);
    expect(report.observedErrors).toEqual(report.stages.at(-1).errors);
  });
});
