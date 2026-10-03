import { describe, expect, it } from 'vitest';

import { buildRosettaCliOutput } from './rosetta-cli.js';

describe('rosetta-cli', () => {
  it('demonstrates every bounded lifecycle outcome without claiming execution or certification', () => {
    const output = buildRosettaCliOutput();
    expect(output.lifecycleDemo.mode).toBe('synthetic-offline');
    expect(output.lifecycleDemo.rows.map((row) => row.outcome)).toEqual(['pass', 'fail', 'partial', 'deny', 'blocked-precondition', 'unknown']);
    for (const row of output.lifecycleDemo.rows) {
      expect(row.closure.ok).toBe(true);
      expect(row.replayMatches).toBe(true);
      expect(row.missingEvidence.ok).toBe(false);
    }
    expect(output.lifecycleDemo.rows[4].receipt.payload.claims[0].verdict).toBe('unknown');
  });
  it('demonstrates the bounded promotion transition contract without claiming execution or certification', () => {
    const output = buildRosettaCliOutput();
    expect(output.promotionTransitionDemo.mode).toBe('synthetic-offline');
    expect(output.promotionTransitionDemo.happyRows.map((row) => `${row.fromState}->${row.nextState}`)).toEqual([
      'active->cooled',
      'cooled->active',
      'quarantined->pending-revisit',
      'pending-revisit->active'
    ]);
    for (const row of output.promotionTransitionDemo.happyRows) {
      expect(row.closure.ok).toBe(true);
      expect(row.replayKind).toBe(row.kind);
    }
    expect(output.promotionTransitionDemo.illegalTransition.block).toBe('hard');
    expect(output.promotionTransitionDemo.softBlock.block).toBe('soft');
    expect(output.promotionTransitionDemo.hardBlock.block).toBe('hard');
    expect(output.promotionTransitionDemo.softRefusal.payload.claims[0]).toMatchObject({
      claimType: 'rrp:promotion.transition.promote.blocked',
      verdict: 'unknown'
    });
    expect(output.promotionTransitionDemo.hardRefusal.payload.claims[0]).toMatchObject({
      claimType: 'rrp:promotion.transition.promote.denied',
      verdict: 'deny'
    });
    expect(output.promotionTransitionDemo.confirmResult.nextState).toBe('active');
  });
  it('builds a bootstrap output with verified receipts and read-only projections', () => {
    const output = buildRosettaCliOutput();

    expect(output.receiptBundleVerification.ok).toBe(true);
    expect(output.signedReceiptVerification.ok).toBe(true);
    expect(output.ob1.mutable).toBe(false);
    expect(output.prism.viewMode).toBe('shadow-memory');
    expect(output.missionControl.viewMode).toBe('operator-shell');
  });

  it('exposes deterministic Bootstrap Gate verification evidence', () => {
    const output = buildRosettaCliOutput();

    expect(output).not.toHaveProperty('guardlessNote');
    expect(output.bootstrapGate.status).toBe('pass');
    expect(output.bootstrapGate.guard.effect).toBe('allow');
    expect(output.bootstrapGate.echoOutput).toBe(output.bootstrapGate.canonicalInput);
    expect(output.bootstrapGate.receiptBundleVerification.ok).toBe(true);
    expect(output.bootstrapGate.steps.map((step) => step.id)).toEqual([
      'canonicalize-input',
      'compute-cid',
      'guard-decision',
      'execute-builtin-echo',
      'mint-observation',
      'emit-receipt',
      'compile-closure',
      'verify-chain'
    ]);
  });

  it('includes schema catalog inspection data without promoting reserved interfaces', () => {
    const output = buildRosettaCliOutput();

    expect(output.schemaCatalog).toMatchObject({
      entries: expect.arrayContaining([
        expect.objectContaining({
          exposureStatus: 'downstream-contract',
          schemaId: 'entif.agentic-messaging.envelope.v1'
        }),
        expect.objectContaining({
          exposureStatus: 'reserved-interface',
          schemaId: 'entif.iam.decision.ref'
        })
      ])
    });
  });
});
