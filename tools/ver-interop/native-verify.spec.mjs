import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  createSigningKeyPair,
  signReceiptEd25519,
  createReceipt,
  buildReceiptBundle,
} from '../../packages/rosetta-receipts/dist/index.js';
import { compileReceiptBundleTapestry } from '../../packages/rosetta-tapestry/dist/index.js';
import { verifyInteropTrace, verifyInteropFile } from './native-verify.mjs';

const reference = JSON.parse(
  readFileSync(new URL('./interop-trace-0001.json', import.meta.url), 'utf8')
);
const schema = JSON.parse(
  readFileSync(
    new URL('./interop-trace-0001.schema.json', import.meta.url),
    'utf8'
  )
);
const copy = () => JSON.parse(JSON.stringify(reference));
const verify = (document) => verifyInteropTrace(document, schema);
const find = (result, id) => result.checks.find((check) => check.id === id);

describe('VER native interoperability witness #1466', () => {
  it('replays all 15 source Tiles against real Rosetta constructors, schemas, signing and closure', () => {
    const result = verifyInteropFile();
    expect(result).toMatchObject({
      role: 'ver-rosetta-native-interop-evidence',
      effect: 'fixture-integrity-and-provenance-only',
      fixtureId: 'VER-ROSETTA-INTEROP-TRACE-0001',
      tileCount: 15,
      disposition: 'pass',
    });
    expect(result.checks.map((check) => check.status)).toEqual([
      'pass',
      'pass',
      'pass',
      'pass',
      'pass',
      'pass',
      'pass',
    ]);
    expect(result.traceSha256).toBe(
      '2916e67dc5497aa875a5abdb6a67ac20e5fc1d05e6b3919ffbab31b82a4ec186'
    );
  });

  it('preserves the four original handoff assets byte for byte', () => {
    const manifest = readFileSync(
      new URL('./SOURCE_SHA256SUMS', import.meta.url),
      'utf8'
    )
      .trim()
      .split('\n');
    expect(manifest).toHaveLength(4);
    for (const line of manifest) {
      const match = /^([a-f0-9]{64}) {2}tools\/ver-interop\/([\w.-]+)$/.exec(
        line
      );
      expect(match).not.toBeNull();
      const digest = createHash('sha256')
        .update(readFileSync(new URL('./' + match[2], import.meta.url)))
        .digest('hex');
      expect(digest).toBe(match[1]);
    }
  });

  it('rejects changed observations even when the stored CID and canonical field are left intact', () => {
    const document = copy();
    document.tiles[3].payload.signal =
      'Observed value 117 against reference 100 before calibration.';
    expect(find(verify(document), 'native-tile-contracts').status).toBe('fail');
    expect(find(verify(document), 'observable-lineage').status).toBe('fail');
  });

  it('detects a missing provenance ancestor independent of digest failure', () => {
    const document = copy();
    document.tiles[3].parents = ['cidv1-sha256-' + '0'.repeat(64)];
    expect(find(verify(document), 'observable-lineage')).toMatchObject({
      status: 'fail',
    });
    expect(find(verify(document), 'native-tile-contracts')).toMatchObject({
      status: 'fail',
    });
  });

  it('detects a role substituted with a different, existing kind', () => {
    const document = copy();
    document.roleIndex.preCalibrationObservation =
      document.roleIndex.preCalibrationEvaluation;
    expect(find(verify(document), 'observable-lineage').status).toBe('fail');
  });

  it('refuses to conflate repeated identical tool calls with distinct parented events', () => {
    const document = copy();
    const pre = document.tiles.find(
      (tile) => tile.cid === document.roleIndex.preCalibrationToolCall
    );
    const post = document.tiles.find(
      (tile) => tile.cid === document.roleIndex.postCalibrationToolCall
    );
    expect(pre.payload.toolCallId).toBe(post.payload.toolCallId);
    expect(pre.cid).not.toBe(post.cid);
    document.roleIndex.postCalibrationToolCall =
      document.roleIndex.preCalibrationToolCall;
    expect(find(verify(document), 'observable-lineage').status).toBe('fail');
  });

  it('rejects missing post-correction measurements rather than treating an action as its effect', () => {
    const document = copy();
    document.tiles = document.tiles.filter(
      (tile) => tile.cid !== document.roleIndex.postCalibrationObservation
    );
    expect(find(verify(document), 'observable-lineage').status).toBe('fail');
    expect(verify(document).disposition).toBe('fail');
  });

  it('rejects a tampered detached Ed25519 signature', () => {
    const document = copy();
    document.signedReceipt.signature.signatureBase64 =
      'AAAAAAAAAAAAAAAAAAAAAA==';
    expect(find(verify(document), 'native-signature-and-digests').status).toBe(
      'fail'
    );
  });

  it('rejects an otherwise present receipt with a mismatched evidence digest', () => {
    const document = copy();
    document.tiles[13].payload.digests[0].digest = '0'.repeat(64);
    document.signedReceipt.receipt.payload.digests[0].digest = '0'.repeat(64);
    expect(find(verify(document), 'native-signature-and-digests').status).toBe(
      'fail'
    );
  });

  it('refuses a scientific-authority overclaim, separately from CID or signature validity', () => {
    const document = copy();
    const receiptPayload = JSON.parse(
      JSON.stringify(document.tiles[13].payload)
    );
    receiptPayload.claims[0].statement = 'A VER diagnosis is proven.';
    const receipt = createReceipt(receiptPayload);
    const keypair = createSigningKeyPair();
    document.tiles[13] = receipt;
    document.signedReceipt = signReceiptEd25519(
      receipt,
      keypair.privateKey,
      keypair.publicKeyPem
    );
    document.receiptBundle = buildReceiptBundle(receipt);
    const bundle = document.receiptBundle;
    const tapestry = compileReceiptBundleTapestry(
      bundle.receiptCid,
      bundle.subjectCids,
      bundle.evidenceCids,
      bundle.policyCids
    );
    document.tiles[14] = tapestry;
    document.roleIndex.receipt = receipt.cid;
    document.roleIndex.tapestry = tapestry.cid;
    document.expectedTraversal = document.tiles.map((tile) => tile.cid);
    const result = verify(document);
    expect(find(result, 'native-tile-contracts').status).toBe('pass');
    expect(find(result, 'native-signature-and-digests').status).toBe('pass');
    expect(find(result, 'native-receipt-closure').status).toBe('pass');
    expect(find(result, 'bounded-receipt-claims').detail).toMatch(
      /unreviewed claim/
    );
    expect(result.disposition).toBe('fail');
  });

  it('rejects a forged VER conclusion embedded in a Core-only trace handoff', () => {
    const document = copy();
    document.tiles[3].kind = 'ver.vigilance_signal';
    expect(find(verify(document), 'observable-lineage').detail).toMatch(
      /VER conclusions/
    );
  });

  it('rejects a closure list that silently drops an evidence reference', () => {
    const document = copy();
    document.receiptBundle.closureCids.pop();
    expect(find(verify(document), 'native-receipt-closure').status).toBe(
      'fail'
    );
  });

  it('detects falsely relabeled source provenance in an otherwise intact fixture', () => {
    const document = copy();
    document.sourceCommit = '0'.repeat(40);
    expect(find(verify(document), 'transport-schema').status).toBe('fail');
  });
});
