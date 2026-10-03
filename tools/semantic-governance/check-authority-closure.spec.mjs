import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  findBridgeLeakage,
  findDirectPrivateRepositoryReferences,
  findMalformedProtectedIdentifiers,
  runAuthorityClosureCheck,
} from './check-authority-closure.mjs';

async function write(root, relativePath, content) {
  const absolutePath = path.join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, 'utf8');
}

async function createCompliantFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'authority-closure-'));

  await write(
    root,
    'AGENTS.md',
    [
      'PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md',
      'AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md',
      'PUBLIC_PRIVATE_AUTHORITY_BRIDGE.yaml',
      'pnpm run governance:authority',
    ].join('\n')
  );

  await write(
    root,
    'docs/governance/AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md',
    [
      'Resolve authority before implementation.',
      'Rosetta owns data-bearing interoperability',
      'Authority closure',
      'Requirements graph',
      'Pre-commit and CI enforcement',
    ].join('\n')
  );

  await write(
    root,
    'docs/governance/PUBLIC_PRIVATE_AUTHORITY_BRIDGE.yaml',
    [
      'protected_references_use_opaque_ipr_ids_only',
      'bridges:',
      '  - public_contract: example',
      '    protected_authorities: [IPR-0001]',
    ].join('\n')
  );

  await write(root, 'README.md', 'Public Rosetta repository.');
  await write(root, 'packages/rosetta-schemas/README.md', 'Schema package.');
  await write(root, 'skills/example/SKILL.md', 'Protected authority: IPR-0001');

  return root;
}

test('direct protected-repository references are rejected', () => {
  const findings = findDirectPrivateRepositoryReferences([
    {
      path: 'AGENTS.md',
      text: 'See https://github.com/socr8s/private-ip/issues/12 for details.',
    },
  ]);

  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'authority-no-direct-private-repo-reference');
});

test('canonical protected identifiers pass and malformed identifiers fail', () => {
  const valid = findMalformedProtectedIdentifiers([
    { path: 'example.md', text: 'Protected authority IPR-0027 applies.' },
  ]);
  assert.equal(valid.length, 0);

  const invalid = findMalformedProtectedIdentifiers([
    { path: 'example.md', text: 'Protected authority IPR-27 applies.' },
  ]);
  assert.equal(invalid.length, 1);
  assert.equal(invalid[0].ruleId, 'authority-canonical-ipr-id');
});

test('public bridge rejects protected repository location keys', () => {
  const findings = findBridgeLeakage('bridges:\n  private_repository: hidden');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'authority-bridge-no-private-location');
});

test('full authority-closure check passes a compliant repository fixture', async () => {
  const root = await createCompliantFixture();
  const findings = await runAuthorityClosureCheck({ root });
  assert.deepEqual(findings, []);
});

test('full authority-closure check catches a public disclosure leak', async () => {
  const root = await createCompliantFixture();
  await write(
    root,
    'skills/example/SKILL.md',
    'Implementation notes live at github.com/socr8s/private-ip.'
  );

  const findings = await runAuthorityClosureCheck({ root });
  assert.ok(
    findings.some(
      (finding) => finding.ruleId === 'authority-no-direct-private-repo-reference'
    )
  );
});
