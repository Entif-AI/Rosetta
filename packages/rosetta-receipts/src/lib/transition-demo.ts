import { buildTile } from '@entif-ai/rosetta-core';
import { InMemoryTileStore } from '@entif-ai/rosetta-store';

import {
  buildReceiptBundle,
  createPromotionGenesis,
  createPromotionTransition,
  createPromotionTransitionRefusal,
  verifyReceiptBundle,
  type CreatePromotionTransitionInput,
  type PromotionState,
  type PromotionTransitionKind
} from './rosetta-receipts.js';

/** Synthetic, deterministic promotion-state evidence for inspection; no provider or model calls. */
export function buildPromotionTransitionDemo() {
  const subject = buildTile('rosetta.observation', {
    observationId: 'promotion.demo.subject',
    signal: 'Synthetic derived artifact subject.',
    source: 'offline-fixture'
  });
  const evidence = buildTile('rosetta.evaluation', {
    evaluationId: 'promotion.demo.evidence',
    summary: 'Synthetic lane-local evaluation vector.',
    verdict: 'pass'
  });
  const trustMatrix = buildTile('rosetta.evaluation', {
    evaluationId: 'promotion.demo.trust_matrix',
    summary: 'Synthetic staged trust input; not collapsed into a scalar.',
    verdict: 'pass'
  });
  const policy = buildTile('rosetta.policy', {
    policyId: 'promotion.demo.policy',
    description: 'Synthetic promotion policy evidence only'
  });

  const happy: PromotionState[] = ['active', 'cooled', 'quarantined', 'pending-revisit'];
  const happyRows = happy.map((priorState) => {
    const kind: PromotionTransitionKind =
      priorState === 'active' ? 'cool'
        : priorState === 'cooled' ? 'activate'
        : priorState === 'quarantined' ? 'revisit'
        : 'activate';
    const input: CreatePromotionTransitionInput = {
      evidenceRefs: [evidence, trustMatrix],
      kind,
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, priorState),
      subject,
      evaluationVectors: [trustMatrix]
    };
    const result = createPromotionTransition(input);
    if ('block' in result) throw new Error(`Happy-path transition unexpectedly blocked: ${result.reason}`);
    const store = new InMemoryTileStore();
    const closure = [subject, evidence, trustMatrix, policy, input.priorStateTile, result.nextStateTile, result.receipt];
    for (const tile of closure) store.put<unknown>(tile);
    const bundle = buildReceiptBundle(result.receipt);
    return {
      fromState: result.fromState,
      kind: result.kind,
      nextState: result.nextState,
      receipt: result.receipt,
      bundle,
      closure: verifyReceiptBundle(bundle, store),
      replayKind: createPromotionTransition(input).kind
    };
  });

  const pendingConfirmationSubject = buildTile('rosetta.observation', {
    observationId: 'promotion.demo.pending.subject',
    signal: 'Synthetic pending-confirmation subject.',
    source: 'offline-fixture'
  });
  const confirmInput: CreatePromotionTransitionInput = {
    evidenceRefs: [evidence, trustMatrix],
    kind: 'confirm',
    policies: [policy],
    priorStateTile: createPromotionGenesis(pendingConfirmationSubject, 'pending-confirmation'),
    subject: pendingConfirmationSubject,
    evaluationVectors: [trustMatrix]
  };
  const confirmResult = createPromotionTransition(confirmInput);
  if ('block' in confirmResult) throw new Error(`Confirm transition unexpectedly blocked: ${confirmResult.reason}`);

  const illegalTransition = createPromotionTransition({
    evidenceRefs: [evidence, trustMatrix],
    kind: 'promote',
    policies: [policy],
    priorStateTile: createPromotionGenesis(subject, 'cooled'),
    subject,
    evaluationVectors: [trustMatrix]
  });
  if (!('block' in illegalTransition) || illegalTransition.block !== 'hard') {
    throw new Error('Illegal-from-state transition should be hard-blocked.');
  }

  const softBlock = createPromotionTransition({
    evidenceRefs: [],
    kind: 'promote',
    policies: [policy],
    priorStateTile: createPromotionGenesis(subject, 'active'),
    subject,
    evaluationVectors: []
  });
  if (!('block' in softBlock) || softBlock.block !== 'soft') {
    throw new Error('Missing-evidence transition should be soft-blocked.');
  }

  const hardBlock = createPromotionTransition({
    evidenceRefs: [evidence, trustMatrix],
    kind: 'promote',
    policies: [],
    priorStateTile: createPromotionGenesis(subject, 'active'),
    subject,
    evaluationVectors: []
  });
  if (!('block' in hardBlock) || hardBlock.block !== 'hard') {
    throw new Error('Missing-policy transition should be hard-blocked.');
  }

  const softRefusal = createPromotionTransitionRefusal(
    {
      evidenceRefs: [],
      kind: 'promote',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    },
    'soft',
    'Soft-block refusal: evidence closure pending.'
  );
  const hardRefusal = createPromotionTransitionRefusal(
    {
      evidenceRefs: [evidence, trustMatrix],
      kind: 'promote',
      policies: [],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    },
    'hard',
    'Hard-block refusal: policy backing denied.'
  );

  return {
    mode: 'synthetic-offline' as const,
    note: 'Bounded promotion-state machine and direct closure proof; not execution authorization, durable storage, or trust scoring.',
    subject,
    happyRows,
    confirmResult,
    illegalTransition,
    softBlock,
    hardBlock,
    softRefusal,
    hardRefusal
  };
}
