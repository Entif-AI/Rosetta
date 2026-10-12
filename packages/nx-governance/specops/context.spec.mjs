import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { contextPacket, expandSource } from './context.mjs';
test('compact context preserves governing rules, readiness, identity, locators and digests', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'specops-context-'));
  mkdirSync(path.join(root, 'specs'));
  mkdirSync(path.join(root, 'plans'));
  writeFileSync(
    path.join(root, 'specs/principles.md'),
    '---\nid: principles\nkind: principles\nstatus: accepted\nowner: local\nprinciples: []\nauthorities: [AUTHORITY.md]\n---\n# Principles\n## Protect intent\nCode cannot author desired state.\n'
  );
  writeFileSync(
    path.join(root, 'specs/rule.md'),
    '---\nid: rule\nkind: behavior\nstatus: accepted\nowner: local\nprinciples: [specs/principles.md]\nauthorities: [AUTHORITY.md]\n---\n# Behavior\n## Requirement R1\nReturn the agreed state.\n'
  );
  writeFileSync(
    path.join(root, 'plans/motion.md'),
    '---\nid: motion\ntask: T001\nstatus: planned\ndepends: []\nawaits: []\nspecs: [specs/rule.md]\nissues: [1720]\n---\n# Motion\n## Validation\n- [ ] verify rule\n'
  );
  const p = contextPacket(root, 'motion', {
    changed: ['specs/rule.md'],
    repository: 'entif-ai/rosetta',
    base: 'fixture-base',
  });
  assert.equal(p.plan.readiness, 'ready');
  assert.equal(p.plan.issues[0], 1720);
  assert.equal(p.specs.length, 1);
  assert.equal(
    p.principles[0].rules[0].text,
    'Code cannot author desired state.'
  );
  assert.match(p.specs[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(p.change.base, 'fixture-base');
  assert.ok(p.relationships.some((r) => r.kind === 'affected-by-current-diff'));
  assert.equal(
    expandSource(root, 'rule', 'Requirement R1').content.trim(),
    'Return the agreed state.'
  );
  assert.throws(() => expandSource(root, '../secret'), /unknown/);
});
