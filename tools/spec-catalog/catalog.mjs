import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import prettier from 'prettier';
import { buildRegistry, validateRegistry, sourcePath } from '../docid-registry/registry.mjs';
import { buildSubstrateCatalog } from '../../packages/nx-governance/specops/catalog.mjs';
import { loadSchemas } from '../semantic-governance/load-schemas.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(path.join(root, 'packages/nx-governance/package.json'));
const Ajv = require('ajv');
const schema = JSON.parse(await readFile(new URL('./catalog.schema.json', import.meta.url), 'utf8'));
const validate = new Ajv({ allErrors: true }).compile(schema);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
export const outputPaths = ['docs/governance/ROSETTA_SPEC_CATALOG.json', 'docs/governance/ROSETTA_SPEC_CATALOG.md', 'docs/governance/ROSETTA_PACK_MAP.csv', 'docs/governance/ROSETTA_SUBSTRATE_CATALOG.json'];

export async function buildCatalog(options = {}) {
  const base = options.root ?? root;
  const read = options.readFile ?? ((file) => readFile(path.join(base, file)));
  const files = options.listFiles ?? (await readdir(path.join(base, 'packs'), { withFileTypes: true })).filter((entry) => entry.isDirectory() && !entry.name.startsWith('_')).map((entry) => `packs/${entry.name}/pack.json`);
  const ref = async (file, required = true) => {
    try { const bytes = await read(file); if (bytes === null) throw Object.assign(new Error('missing'), { code: 'ENOENT' }); return { path: file, sha256: hash(bytes), availability: 'checked-in' }; }
    catch (error) { if (required || error.code !== 'ENOENT') throw error; return { path: file, sha256: null, availability: 'not-checked-in' }; }
  };
  const registry = buildRegistry(String(await read(sourcePath)));
  const errors = validateRegistry(registry);
  if (errors.length) throw new Error(errors.join('\n'));
  const schemas = await loadSchemas(base);
  const coverage = schemas.validateSchemaCatalogCoverage();
  if (coverage.length) throw new Error(coverage.join('\n'));
  const sourceCatalog = 'packages/rosetta-schemas/src/lib/schema-catalog.ts';
  const descentSource = 'packages/rosetta-schemas/src/lib/core-descent.ts';
  const schemaRows = await Promise.all(schemas.ROSETTA_SCHEMA_CATALOG.map(async (entry) => ({ ...entry,
    availability: entry.exposureStatus, publicAuthority: entry.coreDescent === 'core-primitive' || entry.coreDescent === 'core-tile-profile' ? 'declared-by-owning-authority' : 'see-owning-contract',
    provenance: await Promise.all([sourceCatalog, descentSource, entry.descentAuthority].map((file) => ref(file))),
    documentation: await Promise.all([...new Set([...entry.docs, ...entry.rfcPrdAnchors])].map((file) => ref(file, false))),
    conformanceRefs: await Promise.all(entry.tests.map((file) => ref(file, false)))
  })));
  const packs = [];
  for (const file of [...files].filter((file) => /^packs\/[^/]+\/pack\.json$/u.test(file)).sort()) {
    const manifest = JSON.parse(String(await read(file)));
    const folder = path.posix.dirname(file);
    const relative = (item) => path.posix.join(folder, item);
    const profiles = [];
    for (const profile of manifest.profiles) {
      const location = relative(profile.path);
      const definition = JSON.parse(String(await read(location)));
      const authority = definition['x-rosetta'];
      profiles.push({ id: profile.name, schemaId: definition.$id, coreKind: authority?.coreKind ?? null,
        coreDescent: authority?.coreDescent ?? null, version: authority?.version ?? null,
        sourceIssues: authority?.sourceIssues ?? [], supersedes: authority?.supersedes ?? [],
        authority: authority?.authority ?? null, provenance: [await ref(file), await ref(location)],
        conformanceRefs: await Promise.all(manifest.entrypoints.tests.map((item) => ref(relative(item)))) });
    }
    packs.push({ id: manifest.id, packId: manifest.pack_id, docId: manifest.doc_id, namespace: manifest.namespace,
      title: manifest.title, family: manifest.category, status: manifest.status, version: manifest.version,
      compatibleCore: manifest.compatible_core, dependsOn: manifest.depends_on, owners: manifest.owners,
      sourceIssues: [...new Set(profiles.flatMap((profile) => profile.sourceIssues))],
      sourceIssuePosture: profiles.length ? 'declared-profile-issues-only' : 'not-declared-in-manifest',
      authorityRole: 'Pack extension; does not redefine Core', scope: manifest.summary,
      source: await ref(file), profiles,
      exports: await Promise.all(manifest.exports.map(async (entry) => ({ ...entry, source: await ref(relative(entry.path)) }))),
      assets: Object.fromEntries(await Promise.all(Object.entries(manifest.entrypoints).map(async ([kind, items]) => [kind, await Promise.all(items.map((item) => ref(relative(item))))]))),
      supersessionPosture: 'Only explicitly declared Profile supersession is projected.' });
  }
  const documents = registry.documents.map((entry) => ({ ...entry, provenance: [registry.source] }));
  const rows = [...documents.map((entry) => ({ identity: entry.docId, family: entry.type, maturity: entry.versionPosture,
    authorityRole: entry.authority, scope: 'Suite declaration; checked-in availability is explicit.',
    admissionRule: 'Owning document controls meaning; suite declaration does not prove implementation.', issueOwners: [], examples: [], sourceRef: entry.declaredIn })),
  ...packs.map((pack) => ({ identity: pack.docId, family: pack.family, maturity: `${pack.status} ${pack.version}`,
    authorityRole: pack.authorityRole, scope: pack.scope, admissionRule: 'Declared manifest, exports, Core compatibility and conformance gates.',
    issueOwners: pack.sourceIssues, examples: pack.assets.examples.map((item) => item.path), sourceRef: pack.source.path })),
  ...packs.flatMap((pack) => pack.profiles.map((profile) => ({ identity: profile.id, family: 'Profile', maturity: profile.version,
    authorityRole: `Specialization of ${profile.coreKind}`, scope: `Declared by ${pack.docId}`,
    admissionRule: 'Explicit Core descent, owning Pack schema and acceptance fixtures.', issueOwners: profile.sourceIssues,
    examples: profile.conformanceRefs.map((item) => item.path), sourceRef: profile.provenance[1].path })))];
  return { formatVersion: 1, role: 'derived-specification-projection', authorityRule: 'Sources control meaning. Absence or legacy namespace does not prove semantic nonexistence or Core authority.',
    provenance: await Promise.all([sourcePath, sourceCatalog, descentSource, 'tools/spec-catalog/catalog.mjs', 'tools/spec-catalog/catalog.schema.json'].map((file) => ref(file))),
    documents, packs, schemas: schemaRows,
    packMap: { rows, generatedFields: Object.keys(rows[0]), overlay: { joinKey: 'identity', fields: ['priority', 'sprint', 'ownerOverride', 'decisionNotes'], ownership: 'Human planning overlay is stored separately and is never read or written by this generator.' } } };
}

export function validateCatalog(catalog) {
  if (!validate(catalog)) return [`Invalid catalog schema: ${JSON.stringify(validate.errors)}`];
  const errors = [];
  const unique = (items, key, label) => { const seen = new Set(); for (const item of items) { if (seen.has(item[key])) errors.push(`Duplicate ${label}: ${item[key]}`); seen.add(item[key]); } return seen; };
  const docs = unique(catalog.documents, 'docId', 'document');
  unique(catalog.schemas, 'schemaId', 'schema');
  unique(catalog.packs, 'id', 'Pack');
  unique(catalog.packs, 'docId', 'Pack DocID');
  unique(catalog.packs, 'packId', 'PACKID');
  const profiles = catalog.packs.flatMap((pack) => pack.profiles);
  unique(profiles, 'id', 'Profile');
  const edges = new Map(catalog.packs.map((pack) => [pack.docId, pack.dependsOn.map((dependency) => dependency.doc_id)]));
  const active = new Set(); const done = new Set();
  function visit(id) {
    if (active.has(id)) { errors.push(`Dependency cycle: ${id}`); return; }
    if (done.has(id)) return;
    active.add(id);
    for (const next of edges.get(id) ?? []) { if (!edges.has(next) && !docs.has(next)) errors.push(`Missing dependency: ${id} -> ${next}`); else visit(next); }
    active.delete(id); done.add(id);
  }
  for (const id of edges.keys()) visit(id);
  for (const profile of profiles) {
    const parent = catalog.schemas.find((entry) => entry.schemaId === profile.coreKind);
    const entry = catalog.schemas.find((entry) => entry.schemaId === profile.schemaId);
    if (parent?.coreDescent !== 'core-primitive' || entry?.coreDescent !== 'core-tile-profile' || !entry.relatedCoreKinds.includes(profile.coreKind) || profile.coreDescent !== 'core-tile-profile') errors.push(`False or ambiguous Core parent: ${profile.id}`);
  }
  return errors;
}
export async function generateProjections(options = {}) {
  const catalog = await buildCatalog(options);
  const errors = validateCatalog(catalog); if (errors.length) throw new Error(errors.join('\n'));
  const quote = (value) => `"${(Array.isArray(value) ? value.join('; ') : String(value)).replaceAll('"', '""')}"`;
  const fields = catalog.packMap.generatedFields;
  const outputs = { [outputPaths[0]]: json(catalog),
    [outputPaths[1]]: `# Generated Rosetta specification catalog\n\nProjection only. Regenerate with \`pnpm exec nx sync\`; validate with \`pnpm exec nx sync:check\`.\n\n${catalog.documents.length} suite documents, ${catalog.packs.length} checked-in Packs, ${catalog.schemas.length} schema contracts.\n\n${catalog.packMap.rows.map((row) => `- ${row.identity}: [${row.family}](../../${row.sourceRef.replaceAll(' ', '%20')}) (${row.maturity})`).join('\n')}\n\n[Machine catalog](ROSETTA_SPEC_CATALOG.json) · [Pack Map CSV](ROSETTA_PACK_MAP.csv). Human planning fields join by identity in a separate overlay. Missing companion documents remain declared-only. Issue owners are projected only where sources declare them. Semantic relationships stay outside the Nx execution graph.\n`,
    [outputPaths[2]]: `${fields.join(',')}\n${catalog.packMap.rows.map((row) => fields.map((field) => quote(row[field])).join(',')).join('\n')}\n` };
  outputs[outputPaths[3]] = json(await buildSubstrateCatalog(options.root ?? root, options));
  // Nx formats synchronized JSON/Markdown. Produce the same bytes in direct checks.
  const format = await prettier.resolveConfig(options.root ?? root);
  return Object.fromEntries(await Promise.all(Object.entries(outputs).map(async ([file, bytes]) => [file, file.endsWith('.csv') ? bytes : await prettier.format(bytes, { ...format, filepath: file })])));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const outputs = await generateProjections(); for (const [file, bytes] of Object.entries(outputs)) {
    if (process.argv.includes('--write')) await writeFile(path.join(root, file), bytes);
    else if (await readFile(path.join(root, file), 'utf8') !== bytes) throw new Error(`Catalog drift: ${file}. Run nx sync.`);
  } process.stdout.write('Specification catalog and Pack Map verified.\n'); }
  catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
