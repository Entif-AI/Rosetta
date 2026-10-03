import { describe, expect, it } from 'vitest';
import { generateProjections, buildCatalog, validateCatalog } from './catalog.mjs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import { Buffer } from 'node:buffer';
describe('specification catalog #1700', () => {
  it('regenerates stable bytes and keeps Profile, Pack, schema and DocID identity separate', async () => {
    const outputs = await generateProjections();
    expect(await generateProjections()).toEqual(outputs);
    const catalog = JSON.parse(outputs['docs/governance/ROSETTA_SPEC_CATALOG.json']);
    expect(validateCatalog(catalog)).toEqual([]);
    const pack = catalog.packs.find((pack) => pack.id === 'rrp');
    expect(pack.docId).toBe('ROCK-3111-C');
    expect(pack.profiles[0]).toMatchObject({ id: 'rrp.promotion-state.v1', coreKind: 'rosetta.observation' });
    expect(catalog.schemas.find((entry) => entry.schemaId === 'rrp.promotion-state.v1').coreDescent).toBe('core-tile-profile');
    expect(catalog.packMap.overlay.fields).toContain('decisionNotes');
    expect(outputs['docs/governance/ROSETTA_PACK_MAP.csv']).not.toContain('decisionNotes');
  });
  it('rejects duplicate, unresolved, cyclic and false Profile descent identities', async () => {
    const catalog = await buildCatalog();
    catalog.packs.push({ ...catalog.packs[0] });
    expect(validateCatalog(catalog).join(';')).toMatch(/duplicate/i);
    catalog.packs.pop();
    catalog.packs[0].dependsOn = [{ doc_id: 'MISSING' }];
    expect(validateCatalog(catalog).join(';')).toMatch(/missing/i);
    catalog.packs[0].dependsOn = [{ doc_id: catalog.packs[0].docId }];
    expect(validateCatalog(catalog).join(';')).toMatch(/cycle/i);
    catalog.packs.find((pack) => pack.id === 'rrp').profiles[0].coreKind = 'rosetta.promotion_state';
    expect(validateCatalog(catalog).join(';')).toMatch(/Core|parent/i);
  });
  it('discovers manifest roots, detects changed authority and never reads planning overlays', async () => {
    const root = fileURLToPath(new URL('../../', import.meta.url));
    const before = await generateProjections();
    const after = await generateProjections({ readFile: async (file) => {
      expect(file).not.toMatch(/planning-overlay/);
      const bytes = await readFile(`${root}/${file}`);
      if (file === 'packs/rrp/pack.json') {
        const pack = JSON.parse(String(bytes)); pack.summary += ' Changed source.';
        return Buffer.from(JSON.stringify(pack));
      }
      return bytes;
    } });
    expect(after).not.toEqual(before);
    const catalog = JSON.parse(before['docs/governance/ROSETTA_SPEC_CATALOG.json']);
    expect(catalog.packs).toHaveLength(3);
    expect(catalog.schemas.find((entry) => entry.schemaId === 'source.fetch_receipt')).toMatchObject({ exposureStatus: 'fixture-only', publicAuthority: 'see-owning-contract' });
    expect(catalog.documents.find((entry) => entry.docId === 'ROCK-3002').availability).toBe('declared-only');
  });
});

describe('SpecOps compatible successor catalog #1720', () => {
  it('projects spec/plan identity and explicit relationships with exact source digests', async () => {
    const outputs = await generateProjections();
    const substrate = JSON.parse(outputs['docs/governance/ROSETTA_SUBSTRATE_CATALOG.json']);
    expect(substrate.role).toBe('derived-specops-catalog-projection');
    expect(substrate.nodes.find(n => n.id === 'entif:specops-context')).toMatchObject({kind: 'plan', task: 'T1720', issues: [1720]});
    expect(substrate.relationships).toContainEqual({from: 'entif:development-substrate', kind: 'governed-by', to: 'entif:substrate-principles'});
    for (const node of substrate.nodes) expect(node.source.sha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
