import { createRequire } from 'node:module';
import { URL } from 'node:url';
const require = createRequire(new URL('../package.json', import.meta.url));
const Ajv = require('ajv');
const validate = new Ajv({ allErrors: true }).compile(
  require('./specops/catalog.schema.json')
);
import { readFileSync } from 'node:fs';
import { loadPlans, parseDocument, localFile } from './plans.mjs';
import { loadSpecs } from './drift.mjs';
export async function buildSubstrateCatalog(root, options = {}) {
  const files = options.listFiles ?? [
    ...loadSpecs(root).map((d) => d.path),
    ...[...loadPlans(root).values()].map((d) => d.path),
  ];
  const selected = files
    .filter(
      (file) =>
        /^(specs\/.*|plans\/[^/]+)\.md$/.test(file) &&
        !file.endsWith('/README.md') &&
        !file.split('/').at(-1).startsWith('_')
    )
    .sort();
  const docs = await Promise.all(
    selected.map(async (file) =>
      parseDocument(
        String(
          await (options.readFile
            ? options.readFile(file)
            : readFileSync(localFile(root, file)))
        ),
        file
      )
    )
  );
  const specs = docs.filter((d) => d.path.startsWith('specs/'));
  const plans = loadPlans(root, {
    documents: docs.filter((d) => d.path.startsWith('plans/')),
  });
  const nodes = [
    ...specs.map((d) => ({
      id: d.meta.id,
      kind: d.meta.kind,
      title: d.summary,
      status: d.meta.status,
      owner: d.meta.owner,
      source: { path: d.path, sha256: d.sha256 },
    })),
    ...[...plans.values()].map((p) => ({
      id: p.meta.id,
      kind: 'plan',
      title: p.summary,
      status: p.meta.status,
      task: p.meta.task,
      issues: p.meta.issues,
      pr: p.meta.pr ?? null,
      source: { path: p.path, sha256: p.sha256 },
    })),
  ];
  if (new Set(nodes.map((n) => n.id)).size !== nodes.length)
    throw new Error('duplicate substrate identity');
  const byPath = new Map(specs.map((d) => [d.path, d.meta.id]));
  const edges = [];
  for (const p of plans.values()) {
    for (const file of p.meta.specs) {
      if (!byPath.has(file)) throw new Error('unresolved spec relationship');
      edges.push({ from: p.meta.id, kind: 'implements', to: byPath.get(file) });
    }
    for (const slug of p.meta.depends)
      edges.push({
        from: p.meta.id,
        kind: 'depends-on',
        to: plans.get(slug).meta.id,
      });
  }
  for (const d of specs) {
    for (const file of d.meta.principles ?? []) {
      if (!byPath.has(file.split('#')[0]))
        throw new Error('unresolved principle relationship');
      edges.push({
        from: d.meta.id,
        kind: 'governed-by',
        to: byPath.get(file.split('#')[0]),
      });
    }
    for (const rel of d.meta.relationships ?? [])
      edges.push({ from: d.meta.id, kind: rel.kind, to: rel.to });
  }
  const result = {
    formatVersion: 1,
    role: 'derived-specops-catalog-projection',
    authorityRule:
      'Owning sources control meaning; this index does not grant semantic authority.',
    nodes,
    relationships: edges,
  };
  if (!validate(result))
    throw new Error(
      'Invalid substrate projection: ' + JSON.stringify(validate.errors)
    );
  return result;
}
