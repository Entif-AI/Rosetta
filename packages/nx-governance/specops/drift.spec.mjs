import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { checkDesiredState, affectedPlans } from './drift.mjs';
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'specops-drift-'));
  for (const d of ['specs', 'plans']) mkdirSync(path.join(root, d));
  writeFileSync(
    path.join(root, 'specs/rule.md'),
    '---\nid: rule\nkind: behavior\nstatus: accepted\nowner: local\nprinciples: []\nauthorities: [AUTHORITY.md]\n---\n# Behavior\n## Rule\nReturn exactly the accepted local state.\n'
  );
  writeFileSync(path.join(root, 'AUTHORITY.md'), 'Local authority.');
  writeFileSync(
    path.join(root, 'plans/motion.md'),
    '---\nid: motion\ntask: T001\nstatus: planned\ndepends: []\nawaits: []\nspecs: [specs/rule.md]\nissues: [1719]\n---\n# Motion\n## Validation\n- [ ] verify rule\n'
  );
  return root;
}
test('implementation cannot promote itself into desired-state authority', () => {
  const root = fixture();
  const result = checkDesiredState(root, {
    authoritySources: ['AUTHORITY.md', 'specs/rule.md'],
  });
  assert.equal(result.disposition, 'pass');
  writeFileSync(
    path.join(root, 'specs/rule.md'),
    readFileSync(path.join(root, 'specs/rule.md'), 'utf8').replace(
      'authorities: [AUTHORITY.md]',
      'authorities: [src/implementation.ts]'
    )
  );
  assert.throws(
    () =>
      checkDesiredState(root, {
        authoritySources: ['AUTHORITY.md', 'specs/rule.md'],
      }),
    /unapproved authority/
  );
});
test('spec amendment addresses planned/active work without rewriting frozen history', () => {
  const root = fixture();
  assert.deepEqual(
    affectedPlans(root, ['specs/rule.md']).map((x) => [x.plan, x.action]),
    [['motion', 'revise-planned-motion']]
  );
  const source = path.join(root, 'specs/rule.md');
  const before = readFileSync(path.join(root, 'plans/motion.md'), 'utf8');
  writeFileSync(
    source,
    readFileSync(source, 'utf8').replace(
      'accepted local state',
      'amended local state'
    )
  );
  assert.equal(
    checkDesiredState(root, {
      authoritySources: ['AUTHORITY.md', 'specs/rule.md'],
    }).disposition,
    'pass'
  );
  assert.equal(
    readFileSync(path.join(root, 'plans/motion.md'), 'utf8'),
    before
  );
  const p = path.join(root, 'plans/motion.md');
  writeFileSync(
    p,
    readFileSync(p, 'utf8').replace('status: planned', 'status: in-progress')
  );
  assert.equal(
    affectedPlans(root, ['specs/rule.md'])[0].action,
    'notify-active-owner'
  );
  writeFileSync(
    p,
    readFileSync(p, 'utf8')
      .replace('status: in-progress', 'status: done\npr: 1723')
      .replace('[ ]', '[x]')
  );
  assert.equal(
    affectedPlans(root, ['specs/rule.md'])[0].action,
    'add-successor-motion'
  );
});
