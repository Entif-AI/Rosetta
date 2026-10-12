import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { verifyTileIntegrity } from '../../packages/rosetta-core/dist/index.js';
import { buildReceiptBundle, verifyReceiptBundle, verifySignedReceipt } from '../../packages/rosetta-receipts/dist/index.js';
import { InMemoryTileStore } from '../../packages/rosetta-store/dist/index.js';

async function readReceiptVector(name) {
  return JSON.parse(await readFile(`packs/rrp/test-vectors/${name}.json`, 'utf8'));
}

function executeReceiptVector(vector) {
  expect(vector.signedReceipt).toBeDefined();
  expect(Array.isArray(vector.closureTiles)).toBe(true);
  for (const tile of vector.closureTiles) expect(verifyTileIntegrity(tile).ok).toBe(true);
  expect(verifyTileIntegrity(vector.signedReceipt.receipt).ok).toBe(vector.expectation === 'verify');

  const store = new InMemoryTileStore();
  for (const tile of vector.closureTiles) store.put(tile);
  store.put(vector.signedReceipt.receipt);

  return {
    bundle: verifyReceiptBundle(buildReceiptBundle(vector.signedReceipt.receipt), store),
    signature: verifySignedReceipt(vector.signedReceipt)
  };
}

describe('RRP executable receipt evidence vectors', () => {
  it('verifies the declared positive fixture with existing integrity, signature and closure primitives', async () => {
    const pass = executeReceiptVector(await readReceiptVector('receipt-pass'));
    expect(pass.signature).toEqual({ errors: [], ok: true });
    expect(pass.bundle).toEqual({ errors: [], ok: true });
  });

  it('rejects the declared tamper fixture for payload drift and missing closure evidence', async () => {
    const tampered = executeReceiptVector(await readReceiptVector('receipt-tampered'));
    expect(tampered.signature).toEqual({
      errors: [
        'Tile canonical representation drifted from payload.',
        'Tile CID no longer matches canonical payload.'
      ],
      ok: false
    });
    expect(tampered.bundle).toEqual({
      errors: [
        'Missing closure member: cidv1-sha256-939e5dd363c7391c50121935e2d3441f2cd36f0959fb0014787fe9dfa400032f'
      ],
      ok: false
    });
  });
});
