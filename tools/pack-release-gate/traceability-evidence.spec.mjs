import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { auditPackTraceability } from './traceability-evidence.mjs';

async function withArtifacts(test) {
  const root = await mkdtemp(path.join(tmpdir(), 'rosetta-traceability-'));
  const manifest = {
    id: 'fixture', doc_id: 'PACK-FIXTURE', version: '0.1.0', status: 'draft',
    depends_on: [{ doc_id: 'PACK-OTHER' }],
    exports: [{ path: 'shacl/example.ttl', id: 'fixture.shape' }],
    entrypoints: { shacl: ['shacl/example.ttl'], schema: [] }
  };
  const write = async (file, text) => {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await writeFile(path.join(root, file), text);
  };
  try { await test({ root, manifest, write }); }
  finally { await rm(root, { recursive: true, force: true }); }
}

function completeHeader(rootName) {
  return [
    '# DocID: PACK-FIXTURE',
    '# Artifact: fixture.shape',
    '# Version: 0.1.0',
    '# Status: Draft',
    '# Depends-On: Rosetta-v3.0.0, PACK-OTHER',
    `# Source-Of-Truth: packs/${rootName}/pack.json`,
    '@prefix sh: <http://www.w3.org/ns/shacl#> .',
    ''
  ].join('\n');
}

describe('format-aware Pack provenance evidence', () => {
  it('verifies a complete Turtle comment header against its manifest and export', async () => {
    await withArtifacts(async ({ root, manifest, write }) => {
      await write('shacl/example.ttl', completeHeader(path.basename(root)));
      const result = await auditPackTraceability({ root, manifest });
      expect(result.status).toBe('pass');
      expect(result.receipts[0]).toMatchObject({ path: 'shacl/example.ttl', kind: 'turtle-shacl', status: 'pass' });
      expect(result.receipts[0].sha256).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  it('does not accept absent, incomplete or contradictory Turtle headers', async () => {
    await withArtifacts(async ({ root, manifest, write }) => {
      await write('shacl/example.ttl', '@prefix sh: <http://www.w3.org/ns/shacl#> .\n');
      expect((await auditPackTraceability({ root, manifest })).status).toBe('not-evaluated');
      await write('shacl/example.ttl', '# DocID: PACK-FIXTURE\n@prefix sh: <http://www.w3.org/ns/shacl#> .\n');
      expect((await auditPackTraceability({ root, manifest })).status).toBe('not-evaluated');
      await write('shacl/example.ttl', completeHeader(path.basename(root)).replace('PACK-FIXTURE', 'PACK-WRONG'));
      const mismatch = await auditPackTraceability({ root, manifest });
      expect(mismatch.status).toBe('fail');
      expect(mismatch.detail).toContain('DocID');
    });
  });

  it('rejects contradictory JSON descent metadata without pretending it satisfies DocID headers', async () => {
    await withArtifacts(async ({ root, manifest, write }) => {
      manifest.entrypoints.shacl = [];
      manifest.entrypoints.schema = ['schema/example.json'];
      await write('schema/example.json', JSON.stringify({ $id: 'fixture-schema', 'x-rosetta': { pack: 'other-pack' } }));
      expect((await auditPackTraceability({ root, manifest })).status).toBe('fail');
      await write('schema/example.json', JSON.stringify({ $id: 'fixture-schema', 'x-rosetta': { pack: 'fixture' } }));
      const partial = await auditPackTraceability({ root, manifest });
      expect(partial.status).toBe('not-evaluated');
      expect(partial.receipts[0].detail).toContain('required DocID/header mapping');
    });
  });

  it('reports the actual schema and SHACL inventory across existing Packs', async () => {
    const rrpRoot = path.resolve('packs/rrp');
    const rrp = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(rrpRoot, 'pack.json'), 'utf8'));
    const result = await auditPackTraceability({ root: rrpRoot, manifest: rrp });
    expect(result.status).toBe('not-evaluated');
    expect(result.receipts).toHaveLength(3);
    expect(result.receipts.every(({ status }) => status === 'not-evaluated')).toBe(true);
  });
});
