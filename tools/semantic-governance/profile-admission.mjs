import { loadSchemas } from './load-schemas.mjs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { validateWorkspacePacks } from '../pack-conformance/validate-packs.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));

export async function inspectPromotionCandidate(candidate) {
  const schemas = await loadSchemas(root);
  const errors = schemas.validatePromotionStatePayload(candidate.payload);
  if (candidate.kind !== 'rosetta.observation' || candidate.pack !== 'rrp') errors.push('Promotion must specialize Core Observation under RRP.');
  const manifest = JSON.parse(await readFile(path.join(root, 'packs/rrp/pack.json'), 'utf8'));
  const declaration = manifest.profiles.find((profile) => profile.name === candidate.payload?.profile);
  if (!declaration) errors.push('Profile is not declared in governing Pack.');
  else {
    const schema = JSON.parse(await readFile(path.join(root, 'packs/rrp', declaration.path), 'utf8'));
    if (schema['x-rosetta']?.coreKind !== 'rosetta.observation') errors.push('Profile lost declared Core parent.');
    if (schemas.getSchemaCatalogEntry(schema.$id)?.coreDescent !== 'core-tile-profile') errors.push('Profile catalog descent is missing.');
  }
  return { ok: errors.length === 0, errors };
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
  for (const name of surfaces.sort()) {
    const declaration = JSON.parse(await readFile(path.join(root, 'spec-surfaces', name, 'admission.json'), 'utf8'));
    if (declaration.status !== 'admitted' || !declaration.coreDescent || !/^#[0-9]+$/.test(declaration.sourceIssue)) throw new Error(`Unresolved semantic ownership: ${name}`);
    if (identities.has(declaration.schema)) throw new Error(`Duplicate specification owner: ${declaration.schema}`);
    identities.add(declaration.schema);
    for (const field of ['authority', 'schema']) await readFile(path.join(root, declaration[field]));
    if (!Array.isArray(declaration.acceptance) || !declaration.acceptance.length) throw new Error(`No acceptance evidence: ${name}`);
    for (const criterion of declaration.acceptance) {
      if (!criterion.id || !criterion.task || !criterion.evidence?.length) throw new Error(`Acceptance/task coverage missing: ${name}`);
      for (const source of criterion.evidence) await readFile(path.join(root, source));
    }
  }
  return { ok: true, provingIssue: '#1698', preFix: 'fail', corrected: 'pass', surfaces: surfaces.length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runProfileAdmission().then((result) => process.stdout.write(`${JSON.stringify(result)}\n`)).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
