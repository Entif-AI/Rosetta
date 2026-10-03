import { loadSchemas } from './load-schemas.mjs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { validateWorkspacePacks } from '../pack-conformance/validate-packs.mjs';
import { createRequire } from 'node:module';
import { createProjectGraphAsync } from '@nx/devkit';
const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(path.join(root, 'packages/nx-governance/package.json'));
const Ajv2020 = require('ajv/dist/2020.js');
const ajv = new Ajv2020({ allErrors: true }).addKeyword('x-rosetta');

export async function inspectPromotionCandidate(candidate) {
  const schemas = await loadSchemas(root);
  const errors = schemas.validatePromotionStatePayload(candidate.payload);
  if (candidate.kind !== 'rosetta.observation' || candidate.pack !== 'rrp') errors.push('Promotion must specialize Core Observation under RRP.');
  const manifest = JSON.parse(await readFile(path.join(root, 'packs/rrp/pack.json'), 'utf8'));
  const declaration = manifest.profiles.find((profile) => profile.name === candidate.payload?.profile);
  if (!declaration) errors.push('Profile is not declared in governing Pack.');
  else {
    const schema = JSON.parse(await readFile(path.join(root, 'packs/rrp', declaration.path), 'utf8'));
    const valid = ajv.getSchema(schema.$id) ?? ajv.compile(schema);
    if (!valid(candidate.payload)) errors.push(`Owning JSON schema: ${JSON.stringify(valid.errors)}`);
    if (schema['x-rosetta']?.coreKind !== 'rosetta.observation') errors.push('Profile lost declared Core parent.');
    if (schemas.getSchemaCatalogEntry(schema.$id)?.coreDescent !== 'core-tile-profile') errors.push('Profile catalog descent is missing.');
  }
  return { ok: errors.length === 0, errors };
}

export async function validateSurface(declaration, catalog, read, tasks) {
  const errors = [];
  if (declaration.status !== 'admitted' || !/^#[0-9]+$/u.test(declaration.sourceIssue)) errors.push('Unresolved semantic ownership.');
  const schema = JSON.parse(String(await read(declaration.schema)));
  const entry = catalog.find((item) => item.schemaId === schema.$id);
  if (!entry || entry.coreDescent !== declaration.coreDescent || JSON.stringify(entry.relatedCoreKinds) !== JSON.stringify(declaration.coreKinds)) errors.push('Declaration contradicts source-owned Core descent.');
  if (declaration.coreDescent === 'core-tile-profile') {
    const metadata = schema['x-rosetta'];
    if (!metadata || metadata.pack !== declaration.pack || metadata.authority !== declaration.authority || metadata.coreKind !== declaration.coreKinds?.[0]) errors.push('Profile Pack/authority/Core parent conflict.');
  }
  await read(declaration.authority);
  if (!Array.isArray(declaration.acceptance) || !declaration.acceptance.length) errors.push('No acceptance evidence.');
  const ids = new Set();
  for (const criterion of declaration.acceptance ?? []) {
    if (!criterion.id || ids.has(criterion.id) || !tasks.has(criterion.task) || !criterion.evidence?.length) errors.push('Acceptance ID/task coverage missing or ambiguous.');
    ids.add(criterion.id);
    for (const source of criterion.evidence ?? []) await read(source);
  }
  return errors;
}

export async function runProfileAdmission() {
  const load = async (file) => JSON.parse(await readFile(path.join(root, 'packs/rrp/test-vectors', file), 'utf8'));
  if ((await inspectPromotionCandidate(await load('promotion-pre-fix.json'))).ok) throw new Error('Pre-fix promotion representation escaped semantic admission.');
  const corrected = await inspectPromotionCandidate(await load('promotion-state-valid.json'));
  if (!corrected.ok) throw new Error(corrected.errors.join('\n'));
  const packs = await validateWorkspacePacks(path.join(root, 'packs'));
  if (!packs.ok) throw new Error(JSON.stringify(packs.errors));
  // Declarative ownership/coverage is checked independently of prose workflow templates.
  let surfaces = [];
  try { surfaces = await readdir(path.join(root, 'spec-surfaces')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const identities = new Set();
  const schemas = await loadSchemas(root);
  const graph = await createProjectGraphAsync();
  const tasks = new Set(Object.values(graph.nodes).flatMap((node) => Object.keys(node.data.targets ?? {}).map((target) => `${node.name}:${target}`)));
  for (const name of surfaces.sort()) {
    const declaration = JSON.parse(await readFile(path.join(root, 'spec-surfaces', name, 'admission.json'), 'utf8'));
    const errors = await validateSurface(declaration, schemas.ROSETTA_SCHEMA_CATALOG, (source) => readFile(path.join(root, source)), tasks);
    if (errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
    if (identities.has(declaration.schema)) throw new Error(`Duplicate specification owner: ${declaration.schema}`);
    identities.add(declaration.schema);
  }
  return { ok: true, provingIssue: '#1698', preFix: 'fail', corrected: 'pass', surfaces: surfaces.length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runProfileAdmission().then((result) => process.stdout.write(`${JSON.stringify(result)}\n`)).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
