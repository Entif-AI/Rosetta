import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('workspace bootstrap contracts', () => {
  it('contains the required governance authorities and pack manifests', () => {
    const root = process.cwd();
    const requiredFiles = [
      'docs/governance/AUTHORITY_STACK.md',
      'docs/governance/REPO_SHAPE_AND_CONSTRAINTS.md',
      'docs/governance/DONOR_FIT_MAP.md',
      'docs/governance/SERVICE_INVENTORY.md',
      'docs/governance/UPSTREAM_AND_BACKUP_PLAN.md',
      'docs/governance/PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md',
      'docs/governance/AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md',
      'docs/packs/PACK_SUITE_INDEX.md',
      'packs/rrp/pack.json',
      'packs/stdpack-source-substrate/pack.json',
      'packs/vocabpack-source-taxonomy/pack.json'
    ];

    expect(requiredFiles.every((file) => existsSync(resolve(root, file)))).toBe(true);
  });

  it('declares the expected pack identifiers', () => {
    const root = process.cwd();
    const packs = [
      ['packs/rrp/pack.json', 'rrp'],
      ['packs/stdpack-source-substrate/pack.json', 'stdpack-source-substrate'],
      ['packs/vocabpack-source-taxonomy/pack.json', 'vocabpack-source-taxonomy']
    ] as const;

    for (const [relativePath, expectedId] of packs) {
      const manifest = JSON.parse(readFileSync(resolve(root, relativePath), 'utf8')) as { id: string };
      expect(manifest.id).toBe(expectedId);
    }
  });
});
