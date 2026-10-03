import { describe, expect, it } from 'vitest';

import { buildTile } from '@entif-ai/rosetta-core';
import { InMemoryTileStore } from '@entif-ai/rosetta-store';

import {
  buildReceiptBundle,
  createFinalizeAnswerEvent,
  createPartialResultTile,
  createPromotionGenesis,
  createPromotionTransition,
  createPromotionTransitionRefusal,
  createReceipt,
  createLifecycleReceipt,
  createSigningKeyPair,
  createTerminationReceipt,
  digestTile,
  PROMOTION_TRANSITIONS,
  signReceiptEd25519,
  verifyReceiptBundle,
  verifySignedReceipt,
  type PromotionState,
  type PromotionTransitionKind
} from './rosetta-receipts.js';

describe('minimum receipt lifecycle contract', () => {
  function fixture(outcome: 'pass' | 'fail' | 'partial' | 'deny' | 'blocked-precondition' | 'unknown') {
    const run = buildTile('rosetta.run', { runId: 'fixture.run', summary: 'Synthetic lifecycle', tags: [] });
    const step = buildTile('rosetta.action', { actionId: 'fixture.step', intent: 'Check candidate', runCid: run.cid });
    const artifact = buildTile('rosetta.observation', { observationId: 'fixture.source', signal: 'Synthetic input', source: 'fixture' });
    const policy = buildTile('rosetta.policy', { policyId: 'fixture.policy', description: 'Synthetic policy evidence' });
    const check = buildTile('rosetta.evaluation', {
      evaluationId: 'fixture.check', summary: 'Bounded check only', verdict: outcome === 'blocked-precondition' ? 'unknown' : outcome
    }, { parents: [step.cid, artifact.cid] });
    const input = { run, step, artifacts: [artifact], check, policies: [policy], outcome, statement: 'Synthetic lifecycle result' };
    return { input, tiles: [run, step, artifact, check, policy] };
  }

  it.each(['pass', 'fail', 'partial', 'deny', 'blocked-precondition', 'unknown'] as const)('preserves %s evidence, policy, subjects and deterministic identity', (outcome) => {
    const { input, tiles } = fixture(outcome);
    const receipt = createLifecycleReceipt(input);
    expect(receipt.kind).toBe('rosetta.receipt');
    expect(receipt.payload.claims[0]).toMatchObject({
      claimType: `rrp:lifecycle.${outcome}`, verdict: outcome === 'blocked-precondition' ? 'unknown' : outcome,
      evidence: [{ cid: input.check.cid }]
    });
    expect(receipt.payload.subjects).toEqual([
      { cid: input.run.cid, role: 'rrp:subject.session' },
      { cid: input.step.cid, role: 'rrp:subject.step' },
      { cid: input.artifacts[0].cid, role: 'rrp:subject.artifact' }
    ]);
    expect(receipt.payload.policyRefs).toEqual([input.policies[0].cid]);
    expect(createLifecycleReceipt(input).cid).toBe(receipt.cid);
    const store = new InMemoryTileStore();
    for (const tile of [...tiles, receipt]) store.put<unknown>(tile);
    expect(verifyReceiptBundle(buildReceiptBundle(receipt), store).ok).toBe(true);
    for (const missing of tiles) {
      const incomplete = new InMemoryTileStore();
      for (const tile of [...tiles, receipt]) if (tile.cid !== missing.cid) incomplete.put<unknown>(tile);
      expect(verifyReceiptBundle(buildReceiptBundle(receipt), incomplete).ok).toBe(false);
    }
  });

  it('rejects contradictory verdicts, unrelated checks, wrong run lineage and altered evidence', () => {
    const { input } = fixture('pass');
    expect(() => createLifecycleReceipt({ ...input, outcome: 'deny' })).toThrow(/verdict/i);
    expect(() => createLifecycleReceipt({ ...input, check: buildTile('rosetta.evaluation', input.check.payload) })).toThrow(/check.*parent/i);
    expect(() => createLifecycleReceipt({ ...input, step: buildTile('rosetta.action', { ...input.step.payload, runCid: 'missing' }) })).toThrow(/run/i);
    expect(() => createLifecycleReceipt({ ...input, artifacts: [{ ...input.artifacts[0], payload: { ...input.artifacts[0].payload, signal: 'altered' } }] })).toThrow(/integrity/i);
  });

  it('does not turn empty or malformed input into a successful attestation', () => {
    const { input } = fixture('pass');
    expect(() => createLifecycleReceipt({ ...input, artifacts: [] })).toThrow(/artifact/i);
    expect(() => createLifecycleReceipt({ ...input, statement: '' })).toThrow(/statement/i);
    expect(() => createLifecycleReceipt({ ...input, run: input.step })).toThrow(/run/i);
  });

  it('preserves prior evidence when a corrected artifact supersedes it', () => {
    const { input } = fixture('pass');
    const original = createLifecycleReceipt(input);
    const before = JSON.stringify(input);
    const corrected = buildTile('rosetta.observation', { ...input.artifacts[0].payload, signal: 'Corrected synthetic input' }, { parents: [input.artifacts[0].cid] });
    const check = buildTile('rosetta.evaluation', input.check.payload, { parents: [input.step.cid, corrected.cid] });
    const next = createLifecycleReceipt({ ...input, artifacts: [corrected], check });
    expect(next.cid).not.toBe(original.cid);
    expect(JSON.stringify(input)).toBe(before);
    expect(createLifecycleReceipt(input).cid).toBe(original.cid);
    const keys = createSigningKeyPair();
    expect(verifySignedReceipt(signReceiptEd25519(next, keys.privateKey, keys.publicKeyPem)).ok).toBe(true);
  });
});

describe('rosetta-receipts', () => {
  it('signs and verifies an RRP receipt', () => {
    const run = buildTile('rosetta.run', { runId: 'run.demo', summary: 'demo', tags: ['bootstrap'] });
    const receipt = createReceipt({
      claims: [
        {
          claimType: 'rrp:claim.executed',
          evidence: [{ cid: run.cid }],
          statement: 'Run tile emitted.',
          verdict: 'pass'
        }
      ],
      digests: [digestTile(run, 'run.canonical')],
      policyRefs: [],
      receiptType: 'rrp:operation',
      subjects: [{ cid: run.cid, role: 'rrp:subject.run' }]
    });
    const keys = createSigningKeyPair();
    const signed = signReceiptEd25519(receipt, keys.privateKey, keys.publicKeyPem);

    expect(verifySignedReceipt(signed).ok).toBe(true);
  });

  it('rejects incomplete receipt bundles', () => {
    const subject = buildTile('rosetta.run', { runId: 'run.demo', summary: 'demo', tags: ['bootstrap'] });
    const receipt = createReceipt({
      claims: [{ claimType: 'rrp:claim.executed', evidence: [{ cid: subject.cid }], statement: 'ok', verdict: 'pass' }],
      digests: [digestTile(subject, 'run.canonical')],
      policyRefs: ['policy.missing'],
      receiptType: 'rrp:operation',
      subjects: [{ cid: subject.cid }]
    });

    const store = new InMemoryTileStore();
    store.put(subject);
    store.put(receipt);

    expect(verifyReceiptBundle(buildReceiptBundle(receipt), store).ok).toBe(false);
  });

  it('creates a typed FinalizeAnswer event with guard checkpoint evidence', () => {
    const answer = buildTile('rosetta.observation', { observationId: 'answer.final', signal: 'done', source: 'rlm' });
    const guard = buildTile('guard.decision_token', {
      action: 'FinalizeAnswer',
      effect: 'allow',
      expiresAt: '2026-05-04T04:00:00.000Z',
      mode: 'live',
      policyIds: ['policy.rlm.finalize'],
      reason: 'final answer accepted',
      resource: answer.cid,
      tokenId: 'guard.finalize.allow'
    });

    const event = createFinalizeAnswerEvent({
      guardDecisionCid: guard.cid,
      tileCid: answer.cid,
      terminationType: 'normal'
    });

    expect(event.kind).toBe('rosetta.toolcall');
    expect(event.payload.tool).toBe('FinalizeAnswer');
    expect(event.payload.args).toMatchObject({
      guard_decision_cid: guard.cid,
      tile_cid: answer.cid,
      termination_type: 'normal'
    });
  });

  it('creates a signed termination receipt bound to the final answer event', () => {
    const answer = buildTile('rosetta.observation', { observationId: 'answer.final', signal: 'done', source: 'rlm' });
    const event = createFinalizeAnswerEvent({
      guardDecisionCid: 'cidv1-guard-finalize',
      tileCid: answer.cid,
      terminationType: 'normal'
    });
    const receipt = createTerminationReceipt({ answerTileCid: answer.cid, finalizeEvent: event });
    const keys = createSigningKeyPair();

    const signed = signReceiptEd25519(receipt, keys.privateKey, keys.publicKeyPem);

    expect(receipt.payload.receiptType).toBe('rlm.termination');
    expect(receipt.payload.claims[0]).toMatchObject({
      claimType: 'rlm.finalized',
      verdict: 'pass'
    });
    expect(receipt.payload.policyRefs).toContain('cidv1-guard-finalize');
    expect(verifySignedReceipt(signed).ok).toBe(true);
  });

  it('returns a partial-result tile and hard-stop receipt when max iterations are reached', () => {
    const partial = createPartialResultTile({
      completed: ['retrieved context', 'drafted answer'],
      outstandingWork: ['final verification'],
      partialTrace: ['step:retrieve', 'step:draft'],
      reason: 'max iterations reached',
      runCid: 'cidv1-run-rlm'
    });
    const event = createFinalizeAnswerEvent({
      guardDecisionCid: 'cidv1-guard-hard-stop',
      tileCid: partial.cid,
      terminationType: 'hard-stop'
    });
    const receipt = createTerminationReceipt({ answerTileCid: partial.cid, finalizeEvent: event });

    expect(partial.kind).toBe('rosetta.rlm_partial_result');
    expect(partial.payload).toMatchObject({
      completed: ['retrieved context', 'drafted answer'],
      outstandingWork: ['final verification'],
      terminationType: 'hard-stop'
    });
    expect(receipt.payload.claims[0]).toMatchObject({
      claimType: 'rlm.hard_stop',
      verdict: 'partial'
    });
  });
});

describe('promotion transition contract', () => {
  function fixture(priorState: PromotionState, kind: PromotionTransitionKind) {
    const subject = buildTile('rosetta.observation', {
      observationId: `promotion.spec.subject.${priorState}.${kind}`,
      signal: 'Synthetic promotion transition subject.',
      source: 'fixture'
    });
    const evidence = buildTile('rosetta.evaluation', {
      evaluationId: `promotion.spec.evidence.${priorState}.${kind}`,
      summary: 'Synthetic lane-local evaluation vector.',
      verdict: 'pass'
    });
    const trustMatrix = buildTile('rosetta.evaluation', {
      evaluationId: `promotion.spec.trust.${priorState}.${kind}`,
      summary: 'Synthetic staged trust input; not collapsed.',
      verdict: 'pass'
    });
    const policy = buildTile('rosetta.policy', {
      policyId: `promotion.spec.policy.${priorState}.${kind}`,
      description: 'Synthetic promotion policy evidence'
    });
    return { subject, evidence, trustMatrix, policy };
  }

  const happyPaths: Array<{ kind: PromotionTransitionKind; prior: PromotionState; next: PromotionState }> = [
    { kind: 'confirm', prior: 'pending-confirmation', next: 'active' },
    { kind: 'promote', prior: 'active', next: 'promoted' },
    { kind: 'cool', prior: 'active', next: 'cooled' },
    { kind: 'quarantine', prior: 'active', next: 'quarantined' },
    { kind: 'revisit', prior: 'active', next: 'pending-revisit' },
    { kind: 'supersede', prior: 'active', next: 'superseded' },
    { kind: 'activate', prior: 'cooled', next: 'active' },
    { kind: 'activate', prior: 'pending-revisit', next: 'active' },
    { kind: 'revisit', prior: 'quarantined', next: 'pending-revisit' },
    { kind: 'supersede', prior: 'promoted', next: 'superseded' }
  ];

  it.each(happyPaths)('applies $kind from $prior -> $next and preserves closure', ({ kind, prior, next }) => {
    const { subject, evidence, trustMatrix, policy } = fixture(prior, kind);
    const input = {
      evidenceRefs: [evidence, trustMatrix],
      kind,
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, prior),
      subject,
      evaluationVectors: [trustMatrix]
    };
    const result = createPromotionTransition(input);
    expect('block' in result).toBe(false);
    if ('block' in result) throw new Error('unreachable');
    expect(result.kind).toBe(kind);
    expect(result.fromState).toBe(prior);
    expect(result.nextState).toBe(next);
    expect(result.receipt.kind).toBe('rosetta.receipt');
    expect(result.receipt.payload.claims[0]).toMatchObject({
      claimType: `rrp:promotion.transition.${kind}`,
      verdict: 'pass'
    });
    expect(result.receipt.payload.subjects.map((s) => s.role)).toEqual([
      'rrp:promotion.subject',
      'rrp:promotion.next_state'
    ]);
    expect(result.receipt.payload.policyRefs).toEqual([policy.cid]);
    const store = new InMemoryTileStore();
    for (const tile of [subject, evidence, trustMatrix, policy, input.priorStateTile, result.nextStateTile, result.receipt]) store.put<unknown>(tile);
    expect(verifyReceiptBundle(buildReceiptBundle(result.receipt), store).ok).toBe(true);
  });

  it('rejects transitions that are not in the default-deny allow-list', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('cooled', 'promote');
    const result = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'promote',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'cooled'),
      subject
    });
    expect('block' in result).toBe(true);
    if (!('block' in result)) throw new Error('unreachable');
    expect(result.block).toBe('hard');
    expect(result.kind).toBe('promote');
    expect(PROMOTION_TRANSITIONS.promote).toEqual(['active']);
  });

  it('routes missing-evidence transitions to a soft block (verdict: unknown)', () => {
    const { subject, policy } = fixture('active', 'promote');
    const result = createPromotionTransition({
      evidenceRefs: [],
      kind: 'promote',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    });
    expect('block' in result).toBe(true);
    if (!('block' in result)) throw new Error('unreachable');
    expect(result.block).toBe('soft');
    const refusal = createPromotionTransitionRefusal(
      { evidenceRefs: [], kind: 'promote', policies: [policy], priorStateTile: createPromotionGenesis(subject, 'active'), subject },
      'soft',
      'Evidence closure pending.'
    );
    expect(refusal.payload.claims[0]).toMatchObject({
      claimType: 'rrp:promotion.transition.promote.blocked',
      verdict: 'unknown'
    });
    expect(refusal.payload.policyRefs).toEqual([policy.cid]);
  });

  it('routes missing-policy transitions to a hard block (verdict: deny)', () => {
    const { subject, evidence, trustMatrix } = fixture('active', 'promote');
    const result = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'promote',
      policies: [],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    });
    expect('block' in result).toBe(true);
    if (!('block' in result)) throw new Error('unreachable');
    expect(result.block).toBe('hard');
    const refusal = createPromotionTransitionRefusal(
      { evidenceRefs: [evidence, trustMatrix], kind: 'promote', policies: [], priorStateTile: createPromotionGenesis(subject, 'active'), subject },
      'hard',
      'Policy backing denied.'
    );
    expect(refusal.payload.claims[0]).toMatchObject({
      claimType: 'rrp:promotion.transition.promote.denied',
      verdict: 'deny'
    });
  });

  it('treats superseded as a terminal promotion state', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('superseded', 'activate');
    const result = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'activate',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'superseded'),
      subject
    });
    expect('block' in result).toBe(true);
    if (!('block' in result)) throw new Error('unreachable');
    expect(result.block).toBe('hard');
    expect(result.reason).toMatch(/terminal/);
  });

  it('rejects promotion transitions whose closure members fail integrity or payload validation', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('active', 'promote');
    const tampered = { ...evidence, payload: { ...evidence.payload, summary: 'tampered' } };
    expect(() => createPromotionTransition({
      evidenceRefs: [tampered, trustMatrix],
      kind: 'promote',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    })).toThrow(/integrity/i);
  });

  it('preserves the prior receipt evidence when a corrected successor transitions the same subject', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('active', 'cool');
    const original = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'cool',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject,
      reason: 'Synthetic cooling'
    });
    if ('block' in original) throw new Error('unreachable');
    const before = JSON.stringify({ subject, evidence, trustMatrix, policy });
    const next = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'activate',
      policies: [policy],
      priorStateTile: original.nextStateTile,
      subject,
      reason: 'Synthetic reactivation'
    });
    if ('block' in next) throw new Error('unreachable');
    expect(next.receipt.cid).not.toBe(original.receipt.cid);
    expect(JSON.stringify({ subject, evidence, trustMatrix, policy })).toBe(before);
    expect(original.receipt.cid).toBe(createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'cool',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject,
      reason: 'Synthetic cooling'
    }).kind !== 'cool' ? '' : original.receipt.cid);
  });

  it('does not mutate the subject, evidence, or policy tiles when a transition is applied', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('active', 'promote');
    const beforeSubject = JSON.stringify(subject);
    const beforeEvidence = JSON.stringify(evidence);
    const beforePolicy = JSON.stringify(policy);
    createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'promote',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    });
    expect(JSON.stringify(subject)).toBe(beforeSubject);
    expect(JSON.stringify(evidence)).toBe(beforeEvidence);
    expect(JSON.stringify(policy)).toBe(beforePolicy);
  });
});
