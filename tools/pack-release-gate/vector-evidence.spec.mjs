import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { auditExecutablePackEvidence, validatePackEvidenceBindings } from './vector-evidence.mjs';

const mapping = {
  schema: 'schema/thing.schema.json',
  vectors: 'test-vectors/thing',
  examples: ['examples/thing.json']
};

async function withPack(fn) {
  const root = await mkdtemp(path.join(tmpdir(), 'pack-vector-runner-'));
  async function write(file, json) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await writeFile(path.join(root, file), `${JSON.stringify(json)}\n`);
  }
  const manifest = {
    id: 'test-pack',
    entrypoints: {
      schema: [mapping.schema],
      examples: ['examples/thing.json'],
      tests: ['test-vectors/thing/positive.json', 'test-vectors/thing/negative.json']
    }
  };
  try {
    await write(mapping.schema, { $schema: 'https://json-schema.org/draft/2020-12/schema', type: 'object', additionalProperties: false, required: ['id'], properties: { id: { type: 'integer' } } });
    await write('examples/thing.json', { id: 1 });
    await write('test-vectors/thing/positive.json', { expectOk: true, payload: { id: 2 } });
    await write('test-vectors/thing/negative.json', { expectOk: false, payload: { id: 'wrong' } });
    await fn({ root, manifest, write });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

describe('executable Pack example and test-vector evidence', () => {
  it('runs every bound positive and negative vector and emits digest-bearing receipts', async () => {
    await withPack(async ({ root, manifest }) => {
      const result = await validatePackEvidenceBindings({ root, manifest, bindings: [mapping] });
      expect(result.examples).toMatchObject({ status: 'pass', detail: 'Validated 1 example assets' });
      expect(result.vectors).toMatchObject({ status: 'pass', detail: 'Executed 2 vectors with 2 payloads' });
      expect(result.vectors.receipts.map((receipt) => receipt.actual)).toEqual(['reject', 'accept']);
      expect(result.vectors.receipts.map((receipt) => /^[0-9a-f]{64}$/.test(receipt.sha256))).toEqual([true, true]);
    });
  });

  it('fails a vector when the expected negative result becomes accepted', async () => {
    await withPack(async ({ root, manifest, write }) => {
      await write('test-vectors/thing/negative.json', { expectOk: false, payload: { id: 42 } });
      const result = await validatePackEvidenceBindings({ root, manifest, bindings: [mapping] });
      expect(result.vectors.status).toBe('fail');
      expect(result.vectors.detail).toContain('Unexpected vector verdict: test-vectors/thing/negative.json');
      expect(result.vectors.receipts[0].actual).toBe('mismatch');
    });
  });

  it('fails unknown, undeclared and malformed vector contents rather than silently skipping', async () => {
    await withPack(async ({ root, manifest, write }) => {
      await write('test-vectors/thing/undeclared.json', { expectOk: true, payload: { id: 5 } });
      const result = await validatePackEvidenceBindings({ root, manifest, bindings: [mapping] });
      expect(result.vectors.status).toBe('fail');
      expect(result.vectors.detail).toContain('not declared in entrypoints.tests');
    });
    await withPack(async ({ root, manifest, write }) => {
      await write('test-vectors/thing/negative.json', { payload: { id: 'wrong' } });
      const result = await validatePackEvidenceBindings({ root, manifest, bindings: [mapping] });
      expect(result.vectors.status).toBe('fail');
      expect(result.vectors.detail).toContain('Missing boolean expectOk');
    });
  });

  it('does not certify undeclared or unmapped examples', async () => {
    await withPack(async ({ root, manifest }) => {
      manifest.entrypoints.examples.push('examples/other.md');
      const result = await validatePackEvidenceBindings({ root, manifest, bindings: [mapping] });
      expect(result.examples.status).toBe('not-evaluated');
      expect(result.examples.detail).toContain('examples/other.md');
      expect(result.vectors.status).toBe('pass');
    });
  });

  it('marks a newly introduced unbound vector folder unevaluated, rather than skipping it', async () => {
    await withPack(async ({ root, manifest, write }) => {
      await write('test-vectors/new-family/unmapped.json', { expectOk: true, payload: { id: 3 } });
      const result = await validatePackEvidenceBindings({ root, manifest, bindings: [mapping] });
      expect(result.vectors.status).toBe('not-evaluated');
      expect(result.vectors.detail).toContain('test-vectors/new-family/unmapped.json');
      expect(result.vectors.receipts).toHaveLength(2);
    });
  });

  it('uses the real evaluation Pack mappings and executes all eighteen public schema vectors', async () => {
    const root = path.resolve('packs/schema-pack-evaluation-profiles');
    const manifest = JSON.parse(await readFile(path.join(root, 'pack.json'), 'utf8'));
    const result = await auditExecutablePackEvidence({ root, manifest });
    expect(result.vectors.status).toBe('pass');
    expect(result.vectors.receipts).toHaveLength(18);
    expect(result.vectors.receipts.filter((receipt) => receipt.expected === 'reject')).toHaveLength(2);
    expect(result.vectors.receipts.every((receipt) => receipt.actual === receipt.expected)).toBe(true);
  });

  it('checks the canonical RRP Pack-ID vector without certifying its separate receipt vectors', async () => {
    const root = path.resolve('packs/rrp');
    const manifest = JSON.parse(await readFile(path.join(root, 'pack.json'), 'utf8'));
    const result = await auditExecutablePackEvidence({ root, manifest });
    expect(result.vectors.status).toBe('not-evaluated');
    expect(result.vectors.receipts).toHaveLength(1);
    expect(result.vectors.receipts[0].path).toBe('test-vectors/pack-id-v1.expected.json');
    expect(result.vectors.receipts[0].actual).toBe('cidv1-sha256-95fca7b3518b727fb47af60439aeab5ddeb720c04af9f44fe704a0da92530b34');
    expect(result.vectors.receipts[0].expected).toBe(result.vectors.receipts[0].actual);
    expect(result.vectors.detail).toContain('test-vectors/receipt-pass.json');
  });

  it('rejects a deliberately wrong expected Pack-ID while preserving the actual fingerprint', async () => {
    await withPack(async ({ root, manifest, write }) => {
      const vector = JSON.parse(await readFile('packs/rrp/test-vectors/pack-id-v1.expected.json', 'utf8'));
      vector.expected_pack_id = `cidv1-sha256-${'0'.repeat(64)}`;
      await write('test-vectors/pack-id-v1.expected.json', vector);
      manifest.entrypoints.tests = ['test-vectors/pack-id-v1.expected.json'];
      const result = await validatePackEvidenceBindings({
        root, manifest, bindings: [{ kind: 'pack-id-v1', vector: 'test-vectors/pack-id-v1.expected.json' }]
      });
      expect(result.vectors.status).toBe('fail');
      expect(result.vectors.detail).toContain('Unexpected Pack-ID vector result');
      expect(result.vectors.receipts[0].actual).toBe('cidv1-sha256-95fca7b3518b727fb47af60439aeab5ddeb720c04af9f44fe704a0da92530b34');
    });
  });
});
