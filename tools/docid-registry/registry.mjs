import { createHash } from 'node:crypto';
import console from 'node:console';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

export const sourcePath = 'docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md';
const ledgerPath = 'docs/intake/doc-ledger.json';
const outputPath = 'docs/governance/ROSETTA_DOCID_REGISTRY.json';
const idPattern = /^ROCK-\d{4}(?:-[A-Z])?$/u;

/** Project the suite table, joining intake identity without inheriting intake authority. */
export function buildRegistry(source, ledger) {
  const matches = ledger?.documents.filter((entry) => entry.path === sourcePath);
  if (ledger && matches.length !== 1) throw new Error('Core Spine requires exactly one intake ledger path identity.');
  const header = source.indexOf('| DocID | Title | Scope & Description | Dependencies | Type | Aligned Standards |');
  if (header < 0) throw new Error('Core suite table missing; review the authority source before regenerating.');
  const lines = source.slice(header).split(/\r?\n/u);
  const rows = [];
  for (const line of lines.slice(2)) {
    if (!line.startsWith('|')) break;
    const columns = line.split('|').map((cell) => cell.trim());
    if (columns.length !== 8 || !idPattern.test(columns[1])) throw new Error('Unexpected core suite table row.');
    const [, docId, title, , dependencies, type] = columns;
    const dependsOn = [...new Set([...dependencies.matchAll(/\b(30\d{2})\b/gu)].map((match) => `ROCK-${match[1]}`))];
    rows.push({
      docId,
      title: title.replace(/^\*|\*$/gu, ''),
      type,
      authority: type.includes('Normative') ? 'normative' : 'informative',
      versionPosture: '3.0.0-suite-draft',
      dependsOn,
      availability: docId === 'ROCK-3001' ? 'checked-in' : 'declared-only',
      canonicalPath: docId === 'ROCK-3001' ? sourcePath : null,
      canonicalUri: null,
      declaredIn: sourcePath
    });
  }
  if (!rows.length) throw new Error('Core suite table has no entries.');
  const adjacencyText = source.match(/### Adjacency List of Document Dependencies[\s\S]*?```json\n([\s\S]*?)\n```/u)?.[1];
  if (!adjacencyText) throw new Error('Authoritative adjacency list missing.');
  const adjacency = JSON.parse(adjacencyText);
  if (JSON.stringify(adjacency) !== JSON.stringify(Object.fromEntries(rows.map((entry) => [entry.docId, entry.dependsOn])))) {
    throw new Error('Suite table and authoritative adjacency list disagree. Resolve the authority conflict before generation.');
  }
  return {
    formatVersion: 1,
    scope: 'core-suite',
    source: { path: sourcePath, sha256: createHash('sha256').update(source).digest('hex'), ledgerPath: ledger ? ledgerPath : null },
    documents: rows
  };
}

export function validateRegistry(registry) {
  const errors = [];
  if (registry?.formatVersion !== 1 || registry?.scope !== 'core-suite' || !Array.isArray(registry?.documents)) {
    return ['Invalid registry format or scope.'];
  }
  if (registry.source?.path !== sourcePath || !/^[a-f0-9]{64}$/u.test(registry.source?.sha256 ?? '') || (registry.source?.ledgerPath !== null && registry.source?.ledgerPath !== ledgerPath)) {
    errors.push('Invalid source identity or digest.');
  }
  const ids = new Set();
  const types = ['Standards Track (Normative)', 'Informative Note', 'Artifact (Normative)', 'Informative (process)'];
  for (const entry of registry.documents) {
    if (!entry || typeof entry !== 'object') { errors.push('Invalid document entry.'); continue; }
    if (!idPattern.test(entry.docId)) errors.push('Invalid DocID.');
    if (ids.has(entry.docId)) errors.push(`Duplicate DocID: ${entry.docId}`);
    ids.add(entry.docId);
    if (typeof entry.title !== 'string' || !entry.title.trim()) errors.push(`Missing title: ${entry.docId}`);
    if (!types.includes(entry.type) || entry.authority !== (typeof entry.type === 'string' && entry.type.includes('Normative') ? 'normative' : 'informative')) errors.push(`Invalid type/authority: ${entry.docId}`);
    if (entry.versionPosture !== '3.0.0-suite-draft' || entry.declaredIn !== sourcePath) errors.push(`Invalid declaration metadata: ${entry.docId}`);
    if (!Array.isArray(entry.dependsOn) || entry.dependsOn.some((id) => typeof id !== 'string' || !idPattern.test(id)) || new Set(entry.dependsOn).size !== entry.dependsOn.length) errors.push(`Invalid dependencies: ${entry.docId}`);
    if (entry.docId === 'ROCK-3001') {
      if (entry.canonicalPath !== sourcePath || entry.availability !== 'checked-in') errors.push('Core path/availability mismatch.');
    } else if (entry.canonicalPath !== null || entry.availability !== 'declared-only') errors.push(`Unverified companion path/availability: ${entry.docId}`);
    // The authority gives illustrative URLs, not verified canonical publication locations.
    if (entry.canonicalUri !== null) errors.push(`Unverified canonical URI: ${entry.docId}`);
  }
  const edges = new Map(registry.documents.filter((entry) => entry && Array.isArray(entry.dependsOn)).map((entry) => [entry.docId, entry.dependsOn]));
  const visited = new Set();
  const active = new Set();
  function visit(id) {
    if (active.has(id)) { errors.push(`Dependency cycle: ${id}`); return; }
    if (visited.has(id)) return;
    active.add(id);
    for (const dependency of edges.get(id) ?? []) {
      if (!ids.has(dependency)) errors.push(`Missing dependency target: ${id} -> ${dependency}`);
      else visit(dependency);
    }
    active.delete(id);
    visited.add(id);
  }
  for (const id of ids) visit(id);
  return errors;
}

async function main() {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const source = await readFile(path.join(root, sourcePath), 'utf8');
  // Public suite authority is sufficient; the intake ledger moved out in #1572.
  const registry = buildRegistry(source);
  const errors = validateRegistry(registry);
  if (errors.length) throw new Error(errors.join('\n'));
  const expected = `${JSON.stringify(registry, null, 2)}\n`;
  if (process.argv.includes('--write')) await writeFile(path.join(root, outputPath), expected);
  else if (await readFile(path.join(root, outputPath), 'utf8') !== expected) throw new Error('Registry drift: review source changes, then run pnpm run docs:registry:generate.');
  console.log(`Core suite registry verified: ${registry.documents.length} declared identities; availability is explicit.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
