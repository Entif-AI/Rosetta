import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRegistry, validateRegistry } from './registry.mjs';

const source = `| DocID | Title | Scope & Description | Dependencies | Type | Aligned Standards |
| :---- | :---- | :---- | :---- | :---- | :---- |
| ROCK-3001 | *Core* | Base | – (Base of all) | Standards Track (Normative) | None |
| ROCK-3002 | *Data* | Data model | 3001 (Core Spec) | Standards Track (Normative) | None |
| ROCK-3006 | *Guide* | Usage | 3001, 3002 | Informative Note | None |

### Adjacency List of Document Dependencies
\`\`\`json
{"ROCK-3001":[],"ROCK-3002":["ROCK-3001"],"ROCK-3006":["ROCK-3001","ROCK-3002"]}
\`\`\``;
const ledger = { documents: [{ path: 'docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md', title: 'Intake title is not normative' }] };

test('derives public suite identity directly when the protected intake ledger is absent', () => {
  const registry = buildRegistry(source);
  assert.equal(registry.source.ledgerPath, null);
  assert.deepEqual(validateRegistry(registry), []);
  assert.deepEqual(registry.documents, buildRegistry(source, ledger).documents);
});

test('projects exact suite titles, dependencies and authority without inventing companion files', () => {
  const registry = buildRegistry(source, ledger);
  assert.equal(registry.documents[0].title, 'Core');
  assert.equal(registry.documents[0].availability, 'checked-in');
  assert.equal(registry.documents[1].canonicalPath, null);
  assert.equal(registry.documents[1].canonicalUri, null);
  assert.equal(registry.documents[1].availability, 'declared-only');
  assert.deepEqual(registry.documents[2].dependsOn, ['ROCK-3001', 'ROCK-3002']);
  assert.equal(registry.documents[2].authority, 'informative');
  assert.deepEqual(validateRegistry(registry), []);
  assert.deepEqual(buildRegistry(source, ledger), registry);
});

test('rejects duplicate identities, unresolved internal edges and cycles', () => {
  const registry = buildRegistry(source, ledger);
  registry.documents.push({ ...registry.documents[0] });
  assert.match(validateRegistry(registry).join(';'), /duplicate/i);
  registry.documents.pop();
  registry.documents[1].dependsOn = ['ROCK-3999'];
  assert.match(validateRegistry(registry).join(';'), /missing dependency/i);
  registry.documents[1].dependsOn = ['ROCK-3001'];
  registry.documents[0].dependsOn = ['ROCK-3002'];
  assert.match(validateRegistry(registry).join(';'), /cycle/i);
});

test('rejects malformed metadata and absent source ledger identity', () => {
  assert.throws(() => buildRegistry(source, { documents: [] }), /ledger/i);
  assert.throws(() => buildRegistry('no suite table', ledger), /table/i);
  assert.throws(() => buildRegistry(source.replace('3001, 3002', '3001'), ledger), /disagree/i);
  const registry = buildRegistry(source, ledger);
  registry.documents[0].canonicalPath = '../outside.md';
  registry.documents[1].canonicalUri = 'invented';
  registry.documents[2].authority = 'normative';
  const errors = validateRegistry(registry).join(';');
  assert.match(errors, /path/i);
  assert.match(errors, /URI/i);
  assert.match(errors, /authority/i);
});
