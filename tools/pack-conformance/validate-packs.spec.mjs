import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it } from 'vitest';

import {
  computePackId,
  computePackIdFromHashInput,
  validatePackGraph,
  validatePackRoot,
  validateWorkspacePacks
} from './validate-packs.mjs';

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writePack(root, manifest, files = {}) {
  await mkdir(root, { recursive: true });
  await writeJson(path.join(root, 'pack.json'), manifest);

  for (const [relativePath, text] of Object.entries(files)) {
    const filePath = path.join(root, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, text);
  }
}

function baseManifest(overrides = {}) {
  return {
    id: 'example',
    pack_id: `cidv1-sha256-${'0'.repeat(64)}`,
    kind: 'stdpack',
    title: 'Example Pack',
    name: 'Example Pack',
    doc_id: 'EXAMPLE-1',
    category: 'StdPack',
    namespace: 'example',
    version: '0.1.0',
    status: 'draft',
    compatible_core: {
      min: '3.0.0',
      max_exclusive: '4.0.0'
    },
    depends_on: [],
    owners: [{ name: 'Entif/Rosetta maintainers', role: 'editor' }],
    exports: [],
    entrypoints: {
      examples: ['examples/example.md']
    },
    profiles: [],
    source_of_truth: {
      doctrine: 'Doctrine v0.2',
      traceability_required: true
    },
    ...overrides
  };
}

describe('pack conformance', () => {
  it('rejects unsupported manifest shape before claiming a pack root is conformant', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'manifest-schema-negative-'));
    try {
      const manifest = baseManifest({ id: 'example', kind: 'stdpack', title: 'Example Pack', unexpected_grant: true });
      await writePack(root, manifest, { 'examples/example.md': 'fixture\n' });
      await writeJson(path.join(root, 'pack.json'), { ...manifest, pack_id: await computePackId(root) });
      const result = await validatePackRoot(root);
      expect(result.ok).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ code: 'manifest-schema-invalid' }));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('requires Pack Core compatibility and dependencies before validating paths and IDs', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'manifest-missing-contract-'));
    try {
      const incomplete = baseManifest({ id: 'example', kind: 'stdpack', title: 'Example Pack' });
      delete incomplete.compatible_core;
      delete incomplete.depends_on;
      await writePack(root, incomplete, { 'examples/example.md': 'fixture\n' });
      const result = await validatePackRoot(root);
      expect(result.ok).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ code: 'manifest-schema-invalid' }));
      expect(result.errors.map((error) => error.code)).not.toContain('pack-id-mismatch');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('rejects the historical primary_schema entrypoint instead of accepting a path-only false green', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'entrypoint-schema-negative-'));
    try {
      const manifest = baseManifest({ entrypoints: { primary_schema: 'schema/source.schema.json' } });
      await writePack(root, manifest, { 'schema/source.schema.json': '{}\n' });
      await writeJson(path.join(root, 'pack.json'), { ...manifest, pack_id: await computePackId(root) });
      const result = await validatePackRoot(root);
      expect(result.ok).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ code: 'manifest-schema-invalid', detail: expect.stringContaining('additional properties') }));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('rejects malformed Pack IDs as schema errors before integrity and path checks', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'pack-id-schema-negative-'));
    try {
      await writePack(root, baseManifest({ pack_id: 'not-a-content-id' }), { 'examples/example.md': 'fixture\n' });
      const result = await validatePackRoot(root);
      expect(result.ok).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ code: 'manifest-schema-invalid', detail: expect.stringContaining('/pack_id') }));
      expect(result.errors.map((error) => error.code)).not.toContain('pack-id-mismatch');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it.each([
    {
      title: 'malformed JSON',
      schemaContents: '{"type":',
      errorCode: 'schema-json-invalid'
    },
    {
      title: 'an invalid JSON Schema keyword type',
      schemaContents: '{"$schema":"https://json-schema.org/draft/2020-12/schema","type":42}',
      errorCode: 'schema-invalid'
    }
  ])('rejects declared schema entrypoints containing $title', async ({ schemaContents, errorCode }) => {
    const root = await mkdtemp(path.join(tmpdir(), 'pack-schema-negative-'));
    try {
      const manifest = baseManifest({
        entrypoints: { examples: ['examples/example.md'], schema: ['schema/example.schema.json'] }
      });
      await writePack(root, manifest, {
        'examples/example.md': 'fixture\n',
        'schema/example.schema.json': schemaContents
      });
      await writeJson(path.join(root, 'pack.json'), { ...manifest, pack_id: await computePackId(root) });
      const result = await validatePackRoot(root);
      expect(result.ok).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        code: errorCode,
        detail: expect.stringContaining('schema/example.schema.json')
      }));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('accepts a valid declared JSON Schema without imposing Ajv strict-lint policy', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'pack-schema-positive-'));
    try {
      const manifest = baseManifest({
        entrypoints: { examples: ['examples/example.md'], schema: ['schema/example.schema.json'] }
      });
      await writePack(root, manifest, {
        'examples/example.md': 'fixture\n',
        'schema/example.schema.json': JSON.stringify({
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          required: ['identifier']
        })
      });
      await writeJson(path.join(root, 'pack.json'), { ...manifest, pack_id: await computePackId(root) });
      expect((await validatePackRoot(root)).errors).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not misclassify a different JSON Schema dialect as an invalid document', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'pack-schema-dialect-'));
    try {
      const manifest = baseManifest({
        entrypoints: { examples: ['examples/example.md'], schema: ['schema/older.schema.json'] }
      });
      await writePack(root, manifest, {
        'examples/example.md': 'fixture\n',
        'schema/older.schema.json': JSON.stringify({ $schema: 'http://json-schema.org/draft-07/schema#', type: 'object' })
      });
      await writeJson(path.join(root, 'pack.json'), { ...manifest, pack_id: await computePackId(root) });
      const result = await validatePackRoot(root);
      expect(result.errors).toContainEqual(expect.objectContaining({
        code: 'schema-dialect-unsupported',
        detail: expect.stringContaining('schema/older.schema.json')
      }));
      expect(result.errors.some((error) => error.code === 'schema-invalid')).toBe(false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('reports a missing declared schema path only as a missing asset', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'pack-schema-missing-'));
    try {
      const manifest = baseManifest({
        entrypoints: { examples: ['examples/example.md'], schema: ['schema/absent.schema.json'] }
      });
      await writePack(root, manifest, { 'examples/example.md': 'fixture\n' });
      await writeJson(path.join(root, 'pack.json'), { ...manifest, pack_id: await computePackId(root) });
      const result = await validatePackRoot(root);
      expect(result.errors).toContainEqual(expect.objectContaining({
        code: 'declared-path-missing',
        detail: 'schema/absent.schema.json'
      }));
      expect(result.errors.some((error) => error.code.startsWith('schema-'))).toBe(false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('accepts distinct Profile and schema IDs only when the payload binds the declared Profile', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'evaluation-profile-descent-'));
    try {
      await cp(path.resolve('packs/schema-pack-evaluation-profiles'), root, { recursive: true });
      const manifestPath = path.join(root, 'pack.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      manifest.pack_id = await computePackId(root);
      await writeJson(manifestPath, manifest);
      expect((await validatePackRoot(root)).errors).toEqual([]);

      const profile = manifest.profiles[0];
      const schemaPath = path.join(root, profile.path);
      const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
      expect(schema.$id).not.toBe(profile.name);
      schema.properties.profile.properties.id.const = 'unrelated.profile';
      await writeJson(schemaPath, schema);
      manifest.pack_id = await computePackId(root);
      await writeJson(manifestPath, manifest);
      expect((await validatePackRoot(root)).errors).toContainEqual(expect.objectContaining({ code: 'profile-descent-missing', detail: profile.name }));
    } finally { await rm(root, { recursive: true, force: true }); }
  });
  it('rejects a Profile that drops its formal Core descent', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'profile-descent-'));
    try {
      await writePack(root, baseManifest({ id: 'rrp', profiles: [{ name: 'rrp.promotion-state.v1', path: 'schema/profile.json' }] }), {
        'examples/example.md': 'fixture', 'schema/profile.json': JSON.stringify({ $id: 'rrp.promotion-state.v1' })
      });
      const result = await validatePackRoot(root);
      expect(result.errors.some((error) => error.code === 'profile-descent-missing')).toBe(true);
    } finally { await rm(root, { recursive: true, force: true }); }
  });
  it('computes a deterministic pack_id from manifest metadata and sorted file hashes', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'pack-id-'));
    const first = path.join(tempDir, 'first');
    const second = path.join(tempDir, 'second');

    try {
      const manifest = baseManifest();
      await writePack(first, manifest, {
        'examples/example.md': 'alpha\n',
        'schema/example.schema.json': '{"type":"object"}\n'
      });
      await writePack(second, manifest, {
        'schema/example.schema.json': '{"type":"object"}\n',
        'examples/example.md': 'alpha\n'
      });

      expect(await computePackId(first)).toBe(await computePackId(second));

      await writeFile(path.join(second, 'examples/example.md'), 'beta\n');

      expect(await computePackId(first)).not.toBe(await computePackId(second));
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  it('fails a pack whose declared pack_id does not match current contents', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'pack-invalid-'));

    try {
      await writePack(tempDir, baseManifest(), {
        'examples/example.md': 'alpha\n'
      });

      const result = await validatePackRoot(tempDir);

      expect(result.ok).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'pack-id-mismatch'
        })
      );
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  it('matches the checked-in pack-id test vector', async () => {
    const vector = JSON.parse(await readFile('packs/rrp/test-vectors/pack-id-v1.expected.json', 'utf8'));

    expect(computePackIdFromHashInput(vector.input)).toBe(vector.expected_pack_id);
  });

  it('rejects self-referential and cyclic depends_on declarations', () => {
    const graph = validatePackGraph([
      {
        root: 'packs/a',
        manifest: baseManifest({
          doc_id: 'PACK-A',
          namespace: 'a',
          depends_on: [{ doc_id: 'PACK-A', version_range: '^0.1.0' }]
        })
      },
      {
        root: 'packs/b',
        manifest: baseManifest({
          doc_id: 'PACK-B',
          namespace: 'b',
          depends_on: [{ doc_id: 'PACK-C', version_range: '^0.1.0' }]
        })
      },
      {
        root: 'packs/c',
        manifest: baseManifest({
          doc_id: 'PACK-C',
          namespace: 'c',
          depends_on: [{ doc_id: 'PACK-B', version_range: '^0.1.0' }]
        })
      }
    ]);

    expect(graph.errors).toContainEqual(
      expect.objectContaining({
        code: 'depends-on-self-reference',
        root: 'packs/a'
      })
    );
    expect(graph.errors).toContainEqual(
      expect.objectContaining({
        code: 'depends-on-cycle',
        detail: 'PACK-B -> PACK-C -> PACK-B'
      })
    );
    expect(graph.errors.filter((error) => error.code === 'depends-on-cycle')).toHaveLength(1);
  });

  it('validates every pack root under packs/', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'packs-workspace-'));

    try {
      const packsRoot = path.join(tempDir, 'packs');
      const first = path.join(packsRoot, 'first');
      const second = path.join(packsRoot, 'second');
      await writePack(first, baseManifest({ doc_id: 'PACK-FIRST', namespace: 'first' }), {
        'examples/example.md': 'first\n'
      });
      const firstManifest = baseManifest({
        doc_id: 'PACK-FIRST',
        namespace: 'first',
        pack_id: await computePackId(first)
      });
      await writePack(first, firstManifest, {
        'examples/example.md': 'first\n'
      });
      await writePack(
        second,
        baseManifest({
          doc_id: 'PACK-SECOND',
          namespace: 'second',
          depends_on: [{ doc_id: 'PACK-FIRST', version_range: '^0.1.0' }]
        }),
        {
          'examples/example.md': 'second\n'
        }
      );
      const secondManifest = baseManifest({
        doc_id: 'PACK-SECOND',
        namespace: 'second',
        depends_on: [{ doc_id: 'PACK-FIRST', version_range: '^0.1.0' }],
        pack_id: await computePackId(second)
      });
      await writePack(second, secondManifest, {
        'examples/example.md': 'second\n'
      });

      const result = await validateWorkspacePacks(packsRoot);

      expect(result.ok).toBe(true);
      expect(result.errors).toEqual([]);
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });
});
