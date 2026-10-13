import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020.js');
const addFormats = require('ajv-formats');

import {
  computePackId,
  computePackIdFromHashInput,
  updateWorkspacePackIds,
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

async function writePackWithCurrentId(root, manifest, files = {}) {
  await writePack(root, manifest, files);
  const current = { ...manifest, pack_id: await computePackId(root) };
  await writeJson(path.join(root, 'pack.json'), current);
  return current;
}

describe('pack conformance', () => {
  it('validates the declared standalone Evaluation Profile example and rejects an unauthorized field', async () => {
    const packRoot = path.resolve('packs/schema-pack-evaluation-profiles');
    const manifest = JSON.parse(await readFile(path.join(packRoot, 'pack.json'), 'utf8'));
    expect(manifest.entrypoints.examples).toEqual(['examples/salience-evaluation.json']);
    const example = JSON.parse(await readFile(path.join(packRoot, manifest.entrypoints.examples[0]), 'utf8'));
    const schema = JSON.parse(await readFile(path.join(packRoot, 'schema/salience-evaluation.schema.json'), 'utf8'));
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    expect(validate(example), JSON.stringify(validate.errors)).toBe(true);
    expect(validate({ ...example, executionGrant: true })).toBe(false);
  });

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

  it.each([
    ['parent traversal', '../outside.md'],
    ['absolute path', path.join(path.parse(tmpdir()).root, 'tmp', 'outside.md')]
  ])('rejects an entrypoint declared with %s before reading outside the Pack root', async (_title, declaredPath) => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'pack-path-entrypoint-'));
    const root = path.join(tempDir, 'pack');
    try {
      await mkdir(root, { recursive: true });
      await writeFile(path.join(tempDir, 'outside.md'), 'outside\n');
      await writePackWithCurrentId(root, baseManifest({ entrypoints: { examples: [declaredPath] } }));
      const result = await validatePackRoot(root);
      expect(result.errors).toContainEqual(expect.objectContaining({
        code: 'declared-path-unsafe',
        detail: declaredPath
      }));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('rejects an export path that escapes the Pack root', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'pack-path-export-'));
    const root = path.join(tempDir, 'pack');
    try {
      await mkdir(root, { recursive: true });
      await writeFile(path.join(tempDir, 'outside.json'), '{}\n');
      const manifest = baseManifest({
        entrypoints: {},
        exports: [{ kind: 'json', id: 'outside', path: '../outside.json', version: '0.1.0' }]
      });
      await writePackWithCurrentId(root, manifest);
      expect((await validatePackRoot(root)).errors).toContainEqual(expect.objectContaining({
        code: 'declared-path-unsafe',
        detail: '../outside.json'
      }));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('rejects an escaped schema path before reading the outside document', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'pack-path-schema-'));
    const root = path.join(tempDir, 'pack');
    try {
      await mkdir(root, { recursive: true });
      await writeFile(path.join(tempDir, 'outside.schema.json'), '{not-json\n');
      const manifest = baseManifest({ entrypoints: { schema: ['../outside.schema.json'] } });
      await writePackWithCurrentId(root, manifest);
      const result = await validatePackRoot(root);
      expect(result.errors).toContainEqual(expect.objectContaining({
        code: 'declared-path-unsafe',
        detail: '../outside.schema.json'
      }));
      expect(result.errors.some((error) => error.code === 'schema-json-invalid')).toBe(false);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('rejects a Profile path that escapes before reading the outside JSON', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'pack-path-profile-'));
    const root = path.join(tempDir, 'pack');
    try {
      await mkdir(root, { recursive: true });
      await writeFile(path.join(tempDir, 'profile.json'), '{not-json\n');
      const manifest = baseManifest({
        entrypoints: {},
        profiles: [{ name: 'outside-profile', path: '../profile.json' }]
      });
      await writePackWithCurrentId(root, manifest);
      const result = await validatePackRoot(root);
      expect(result.errors).toContainEqual(expect.objectContaining({
        code: 'profile-path-unsafe',
        detail: expect.stringContaining('../profile.json')
      }));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it.each([
    ['direct outside symlink', 'links/example.md', 'outside'],
    ['symlinked parent directory', 'linked/example.md', 'parent'],
    ['in-root symlink', 'links/example.md', 'inside']
  ])('rejects a declared path containing a %s', async (_title, declaredPath, mode) => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'pack-path-symlink-'));
    const root = path.join(tempDir, 'pack');
    try {
      await mkdir(path.join(root, 'links'), { recursive: true });
      const outsideDir = path.join(tempDir, 'outside');
      await mkdir(outsideDir, { recursive: true });
      await writeFile(path.join(outsideDir, 'example.md'), 'outside\n');
      await mkdir(path.join(root, 'real'), { recursive: true });
      await writeFile(path.join(root, 'real', 'example.md'), 'inside\n');

      if (mode === 'parent') {
        await symlink(outsideDir, path.join(root, 'linked'));
      } else {
        const target = mode === 'inside' ? path.join(root, 'real', 'example.md') : path.join(outsideDir, 'example.md');
        await symlink(target, path.join(root, 'links', 'example.md'));
      }

      await writePackWithCurrentId(root, baseManifest({ entrypoints: { examples: [declaredPath] } }));
      expect((await validatePackRoot(root)).errors).toContainEqual(expect.objectContaining({
        code: 'declared-path-unsafe',
        detail: declaredPath
      }));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('keeps outside mutations outside Pack identity while refusing the escaped declaration', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'pack-path-mutation-'));
    const root = path.join(tempDir, 'pack');
    const outside = path.join(tempDir, 'outside.md');
    try {
      await mkdir(root, { recursive: true });
      await writeFile(outside, 'first\n');
      const manifest = await writePackWithCurrentId(root, baseManifest({ entrypoints: { examples: ['../outside.md'] } }));
      expect((await validatePackRoot(root)).errors).toContainEqual(expect.objectContaining({ code: 'declared-path-unsafe' }));

      await writeFile(outside, 'second\n');
      expect(await computePackId(root)).toBe(manifest.pack_id);
      expect((await validatePackRoot(root)).errors).toContainEqual(expect.objectContaining({ code: 'declared-path-unsafe' }));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('accepts a regular nested declared path inside the Pack root', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'pack-path-nested-'));
    try {
      const manifest = baseManifest({ entrypoints: { examples: ['examples/nested/example.md'] } });
      await writePackWithCurrentId(root, manifest, { 'examples/nested/example.md': 'inside\n' });
      expect((await validatePackRoot(root)).errors).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('reports one missing-file error for a safe absent declared path', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'pack-path-missing-'));
    try {
      const missingPath = 'examples/missing.md';
      await writePackWithCurrentId(root, baseManifest({ entrypoints: { examples: [missingPath] } }));
      const result = await validatePackRoot(root);
      expect(result.errors.filter((error) => error.detail === missingPath)).toEqual([
        expect.objectContaining({ code: 'declared-path-missing' })
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('deduplicates one missing asset declared through schema, export and Profile surfaces', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'pack-path-missing-dedupe-'));
    try {
      const manifest = baseManifest({
        entrypoints: { schema: ['schema/missing.json'] },
        exports: [{ kind: 'json-schema', id: 'missing', path: 'schema/./missing.json', version: '0.1.0' }],
        profiles: [{ name: 'missing-profile', path: 'schema/missing.json' }]
      });
      await writePackWithCurrentId(root, manifest);
      const result = await validatePackRoot(root);
      const missingErrors = result.errors.filter((error) =>
        error.code === 'declared-path-missing' || error.code === 'profile-path-missing'
      );
      expect(missingErrors).toEqual([
        expect.objectContaining({ code: 'declared-path-missing', detail: 'schema/missing.json' })
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('keeps the Profile-specific missing-path reason when only a Profile declares the absent asset', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'pack-profile-missing-only-'));
    try {
      await writePackWithCurrentId(root, baseManifest({
        entrypoints: {},
        profiles: [{ name: 'missing-profile', path: 'schema/missing.json' }]
      }));
      expect((await validatePackRoot(root)).errors).toEqual([
        expect.objectContaining({ code: 'profile-path-missing', detail: 'missing-profile' })
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('refuses a symlink Pack root before following it to external Pack contents', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'pack-root-symlink-'));
    const outsideRoot = path.join(tempDir, 'outside-pack');
    const linkedRoot = path.join(tempDir, 'linked-pack');
    try {
      await writePackWithCurrentId(outsideRoot, baseManifest(), { 'examples/example.md': 'outside\n' });
      await symlink(outsideRoot, linkedRoot);

      for (const suppliedRoot of [linkedRoot, `${linkedRoot}${path.sep}`]) {
        expect((await validatePackRoot(suppliedRoot)).errors).toEqual([
          expect.objectContaining({ code: 'pack-root-unsafe' })
        ]);
      }

      await rm(outsideRoot, { recursive: true, force: true });
      for (const suppliedRoot of [linkedRoot, `${linkedRoot}${path.sep}`]) {
        expect((await validatePackRoot(suppliedRoot)).errors).toEqual([
          expect.objectContaining({ code: 'pack-root-unsafe' })
        ]);
      }
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('refuses a symlink workspace Packs root before discovering or reading external Packs', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'packs-root-symlink-'));
    const outsidePacks = path.join(tempDir, 'outside-packs');
    const packRoot = path.join(outsidePacks, 'example');
    const linkedPacks = path.join(tempDir, 'linked-packs');
    try {
      await writePackWithCurrentId(packRoot, baseManifest(), { 'examples/example.md': 'outside\n' });
      await symlink(outsidePacks, linkedPacks);

      for (const suppliedRoot of [linkedPacks, `${linkedPacks}${path.sep}`]) {
        expect(await validateWorkspacePacks(suppliedRoot)).toEqual(expect.objectContaining({
          ok: false,
          packs: [],
          errors: [expect.objectContaining({ code: 'packs-root-unsafe' })]
        }));
      }

      await rm(outsidePacks, { recursive: true, force: true });
      for (const suppliedRoot of [linkedPacks, `${linkedPacks}${path.sep}`]) {
        expect(await validateWorkspacePacks(suppliedRoot)).toEqual(expect.objectContaining({
          ok: false,
          packs: [],
          errors: [expect.objectContaining({ code: 'packs-root-unsafe' })]
        }));
      }
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('fails closed when a direct workspace Packs root contains a symlink Pack child', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'packs-child-symlink-'));
    const packsRoot = path.join(tempDir, 'packs');
    const outsidePack = path.join(tempDir, 'outside-pack');
    const linkedPack = path.join(packsRoot, 'linked-pack');
    try {
      await mkdir(packsRoot, { recursive: true });
      await writePackWithCurrentId(outsidePack, baseManifest(), { 'examples/example.md': 'outside\n' });
      await symlink(outsidePack, linkedPack);

      expect(await validateWorkspacePacks(packsRoot)).toEqual(expect.objectContaining({
        ok: false,
        errors: [expect.objectContaining({ code: 'pack-root-unsafe', root: linkedPack })]
      }));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('refuses Pack-ID repair through a symlink workspace Packs root before external writes', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'packs-root-fix-symlink-'));
    const outsidePacks = path.join(tempDir, 'outside-packs');
    const packRoot = path.join(outsidePacks, 'example');
    const linkedPacks = path.join(tempDir, 'linked-packs');
    try {
      await writePack(packRoot, baseManifest(), { 'examples/example.md': 'outside\n' });
      const manifestPath = path.join(packRoot, 'pack.json');
      const before = await readFile(manifestPath, 'utf8');
      await symlink(outsidePacks, linkedPacks);

      for (const suppliedRoot of [linkedPacks, `${linkedPacks}${path.sep}`]) {
        await expect(updateWorkspacePackIds(suppliedRoot)).rejects.toEqual(expect.objectContaining({
          code: 'packs-root-unsafe'
        }));
      }
      expect(await readFile(manifestPath, 'utf8')).toBe(before);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('allows Pack roots reached through a symlink ancestor when the supplied roots are direct directories', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'packs-root-ancestor-symlink-'));
    const realParent = path.join(tempDir, 'real-parent');
    const packsRoot = path.join(realParent, 'packs');
    const packRoot = path.join(packsRoot, 'example');
    const linkedParent = path.join(tempDir, 'linked-parent');
    try {
      await writePackWithCurrentId(packRoot, baseManifest(), { 'examples/example.md': 'inside\n' });
      await symlink(realParent, linkedParent);
      const linkedPacksRoot = path.join(linkedParent, 'packs');
      const linkedPackRoot = path.join(linkedPacksRoot, 'example');

      expect((await validatePackRoot(linkedPackRoot)).errors).toEqual([]);
      expect(await validateWorkspacePacks(linkedPacksRoot)).toEqual(expect.objectContaining({ ok: true }));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('fails discovery of a candidate Pack directory without pack.json and blocks Pack-ID repair before writes', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'packs-manifest-absent-'));
    const packsRoot = path.join(tempDir, 'packs');
    const first = path.join(packsRoot, 'a-existing');
    const missing = path.join(packsRoot, 'z-missing');
    try {
      await writePack(first, baseManifest(), { 'examples/example.md': 'content\n' });
      const manifestPath = path.join(first, 'pack.json');
      const before = await readFile(manifestPath, 'utf8');
      await mkdir(missing);
      await writeFile(path.join(missing, 'README.md'), 'candidate Pack without manifest\n');

      const result = await validateWorkspacePacks(packsRoot);
      expect(result.ok).toBe(false);
      expect(result.packs.map((pack) => pack.root)).toEqual([first, missing]);
      expect(result.errors).toContainEqual(expect.objectContaining({
        code: 'manifest-missing', root: missing
      }));
      await expect(updateWorkspacePackIds(packsRoot)).rejects.toEqual(expect.objectContaining({
        code: 'manifest-missing', root: missing
      }));
      expect(await readFile(manifestPath, 'utf8')).toBe(before);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('refuses symlinked pack.json in direct, workspace and Pack-ID repair paths', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'packs-manifest-symlink-'));
    const packsRoot = path.join(tempDir, 'packs');
    const root = path.join(packsRoot, 'example');
    const outsideManifest = path.join(tempDir, 'outside-pack.json');
    try {
      await writePackWithCurrentId(root, baseManifest(), { 'examples/example.md': 'content\n' });
      const manifestPath = path.join(root, 'pack.json');
      const before = await readFile(manifestPath, 'utf8');
      await writeFile(outsideManifest, before);
      await rm(manifestPath);
      await symlink(outsideManifest, manifestPath);

      expect((await validatePackRoot(root)).errors).toEqual([
        expect.objectContaining({ code: 'manifest-unsafe', root })
      ]);
      expect((await validateWorkspacePacks(packsRoot)).errors).toContainEqual(
        expect.objectContaining({ code: 'manifest-unsafe', root })
      );
      await expect(computePackId(root)).rejects.toEqual(expect.objectContaining({
        code: 'manifest-unsafe', root
      }));
      await expect(updateWorkspacePackIds(packsRoot)).rejects.toEqual(expect.objectContaining({
        code: 'manifest-unsafe', root
      }));
      expect(await readFile(outsideManifest, 'utf8')).toBe(before);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
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
