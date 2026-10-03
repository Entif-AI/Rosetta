import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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
    pack_id: 'cidv1-sha256-placeholder',
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
