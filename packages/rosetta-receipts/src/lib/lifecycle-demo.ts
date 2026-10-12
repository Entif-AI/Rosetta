import { buildTile } from '@entif-ai/rosetta-core';
import { InMemoryTileStore } from '@entif-ai/rosetta-store';

import { buildReceiptBundle, createLifecycleReceipt, verifyReceiptBundle, type LifecycleOutcome } from './rosetta-receipts.js';

/** Synthetic, deterministic evidence for inspection; no provider or model calls. */
export function buildLifecycleDemo() {
  const outcomes: LifecycleOutcome[] = ['pass', 'fail', 'partial', 'deny', 'blocked-precondition', 'unknown'];
  const run = buildTile('rosetta.run', { runId: 'lifecycle.demo', summary: 'Synthetic receipt lifecycle', tags: ['fixture'] });
  const step = buildTile('rosetta.action', { actionId: 'lifecycle.demo.check', intent: 'Assess synthetic candidate', runCid: run.cid });
  const artifact = buildTile('rosetta.observation', { observationId: 'lifecycle.demo.input', signal: 'Synthetic candidate text.', source: 'offline-fixture' });
  const policy = buildTile('rosetta.policy', { policyId: 'lifecycle.demo.policy', description: 'Synthetic policy evidence only' });
  const rows = outcomes.map((outcome) => {
    const check = buildTile('rosetta.evaluation', {
      evaluationId: `lifecycle.demo.${outcome}`,
      summary: `Synthetic ${outcome} fixture; no external operation performed.`,
      verdict: outcome === 'blocked-precondition' ? 'unknown' : outcome
    }, { parents: [step.cid, artifact.cid] });
    const input = { run, step, artifacts: [artifact], check, policies: [policy], outcome, statement: check.payload.summary };
    const receipt = createLifecycleReceipt(input);
    const bundle = buildReceiptBundle(receipt);
    const store = new InMemoryTileStore();
    const missingEvidenceStore = new InMemoryTileStore();
    for (const tile of [run, step, artifact, policy, check, receipt]) {
      store.put<unknown>(tile);
      if (tile.cid !== check.cid) missingEvidenceStore.put<unknown>(tile);
    }
    return {
      outcome, check, receipt, bundle,
      closure: verifyReceiptBundle(bundle, store),
      missingEvidence: verifyReceiptBundle(bundle, missingEvidenceStore),
      replayMatches: createLifecycleReceipt(input).cid === receipt.cid
    };
  });
  return {
    mode: 'synthetic-offline' as const,
    note: 'Bounded receipt construction and direct closure proof; not execution authorization, source truth or profile certification.',
    run, step, artifact, policy, rows
  };
}
