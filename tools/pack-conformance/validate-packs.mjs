#!/usr/bin/env node
/* global console, process */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { lstat, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const PACK_ID_ALGORITHM = 'rosetta-pack-id-v1';
const DEFAULT_PACKS_ROOT = 'packs';
const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020.js');
// Ajv strict lint is not JSON Schema validity; report standard meta-schema failures only.
const packSchemaMetaValidator = new Ajv2020({ allErrors: true, strict: false });
let manifestValidator;

async function validateManifest(manifest) {
  if (!manifestValidator) {
    const schema = JSON.parse(await readFile(new URL('../../packs/_schemas/pack-manifest.schema.json', import.meta.url), 'utf8'));
    manifestValidator = new Ajv2020({ allErrors: true }).compile(schema);
  }
  return manifestValidator(manifest)
    ? []
    : (manifestValidator.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`);
}

function canonicalizeJson(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeJson(entry));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalizeJson(entry)])
    );
  }

  return value;
}

function stableJson(value) {
  return JSON.stringify(canonicalizeJson(value));
}

function sha256Hex(input) {
  return createHash('sha256').update(input).digest('hex');
}

function makeContentId(input) {
  return `cidv1-sha256-${sha256Hex(input)}`;
}

function normalizeManifestForId(manifest) {
  const rest = { ...manifest };
  delete rest.pack_id;
  return rest;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function listPackFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.DS_Store') {
      continue;
    }

    const absolutePath = path.join(current, entry.name);
    const relativePath = path.relative(root, absolutePath).split(path.sep).join('/');

    if (entry.isDirectory()) {
      files.push(...(await listPackFiles(root, absolutePath)));
      continue;
    }

    if (!entry.isFile() || relativePath === 'pack.json') {
      continue;
    }

    const bytes = await readFile(absolutePath);
    files.push({
      path: relativePath,
      sha256: sha256Hex(bytes),
      size: bytes.byteLength
    });
  }

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

export async function computePackId(packRoot) {
  await assertDirectRoot(packRoot, 'pack-root-unsafe', 'Pack root');
  const manifest = await readJson(await assertPackManifest(packRoot));
  const fileManifest = await listPackFiles(packRoot);
  const idInput = {
    algorithm: PACK_ID_ALGORITHM,
    files: fileManifest,
    manifest: normalizeManifestForId(manifest)
  };

  return computePackIdFromHashInput(idInput);
}

export function computePackIdFromHashInput(idInput) {
  return makeContentId(stableJson(idInput));
}

function validationError(code, root, detail) {
  return { code, root, detail };
}

function rootBoundaryError(code, root, detail) {
  const error = new Error(detail);
  error.code = code;
  error.root = root;
  return error;
}

function entriesFromEntrypoints(entrypoints) {
  if (!entrypoints || typeof entrypoints !== 'object' || Array.isArray(entrypoints)) {
    return [];
  }

  return Object.values(entrypoints).flatMap((value) => {
    if (typeof value === 'string') {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.filter((entry) => typeof entry === 'string');
    }

    return [];
  });
}

function entriesFromExports(exportsValue) {
  if (!Array.isArray(exportsValue)) {
    return [];
  }

  return exportsValue.map((entry) => entry?.path).filter((entry) => typeof entry === 'string');
}

async function inspectDeclaredFile(packRoot, declaredPath) {
  const root = path.resolve(packRoot);
  const segments = declaredPath.split(/[\\/]+/);
  if (
    path.isAbsolute(declaredPath) ||
    path.posix.isAbsolute(declaredPath) ||
    path.win32.isAbsolute(declaredPath) ||
    segments.includes('..')
  ) {
    return { status: 'unsafe' };
  }

  const absolutePath = path.resolve(root, declaredPath);
  const relativePath = path.relative(root, absolutePath);
  if (
    relativePath === '' ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return { status: 'unsafe' };
  }
  const identity = relativePath.split(path.sep).join('/');

  let current = root;
  let info;
  for (const segment of relativePath.split(path.sep)) {
    current = path.join(current, segment);
    try {
      info = await lstat(current);
    } catch (error) {
      if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
        return { identity, status: 'missing' };
      }
      throw error;
    }

    if (info.isSymbolicLink()) {
      return { status: 'unsafe' };
    }
  }

  return info?.isFile() ? { identity, status: 'ok', path: absolutePath } : { identity, status: 'missing' };
}

async function assertDirectRoot(root, code, label) {
  const rootPrefix = path.parse(root).root;
  let directRoot = root;
  while (directRoot.length > rootPrefix.length && /[\\/]$/u.test(directRoot)) {
    directRoot = directRoot.slice(0, -1);
  }

  let info;
  try {
    info = await lstat(directRoot);
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    throw error;
  }

  if (info.isSymbolicLink()) {
    throw rootBoundaryError(code, root, `${label} must not be a symbolic link`);
  }
}

async function assertPackManifest(packRoot) {
  const manifestPath = path.join(packRoot, 'pack.json');
  let info;
  try {
    info = await lstat(manifestPath);
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      throw rootBoundaryError('manifest-missing', packRoot, 'Pack root must contain pack.json');
    }
    throw error;
  }

  if (!info.isFile()) {
    throw rootBoundaryError('manifest-unsafe', packRoot, 'pack.json must be a regular file, not a symbolic link');
  }
  return manifestPath;
}

export async function validatePackRoot(packRoot) {
  const errors = [];
  let manifestPath;
  try {
    await assertDirectRoot(packRoot, 'pack-root-unsafe', 'Pack root');
    manifestPath = await assertPackManifest(packRoot);
  } catch (error) {
    if (!['pack-root-unsafe', 'manifest-missing', 'manifest-unsafe'].includes(error?.code)) throw error;
    return {
      computedPackId: null,
      errors: [validationError(error.code, packRoot, error.message)],
      manifest: null,
      ok: false,
      root: packRoot
    };
  }
  let manifest;
  try {
    manifest = await readJson(manifestPath);
  } catch (error) {
    return {
      computedPackId: null,
      errors: [validationError('manifest-json-invalid', packRoot, error.message)],
      manifest: null,
      ok: false,
      root: packRoot
    };
  }
  const manifestErrors = await validateManifest(manifest);
  if (manifestErrors.length) {
    return {
      computedPackId: null,
      errors: manifestErrors.map((detail) => validationError('manifest-schema-invalid', packRoot, detail)),
      manifest,
      ok: false,
      root: packRoot
    };
  }
  const declaredPackId = manifest.pack_id;
  const computedPackId = await computePackId(packRoot);
  const declaredFiles = new Map();
  const reportedMissingAssets = new Set();
  const inspect = async (relativePath) => {
    if (!declaredFiles.has(relativePath)) {
      declaredFiles.set(relativePath, await inspectDeclaredFile(packRoot, relativePath));
    }
    return declaredFiles.get(relativePath);
  };

  if (typeof declaredPackId !== 'string' || declaredPackId.length === 0) {
    errors.push(validationError('pack-id-missing', packRoot, 'pack.json must declare pack_id'));
  } else if (declaredPackId !== computedPackId) {
    errors.push(
      validationError(
        'pack-id-mismatch',
        packRoot,
        `declared ${declaredPackId}; expected ${computedPackId}`
      )
    );
  }

  for (const relativePath of [...entriesFromEntrypoints(manifest.entrypoints), ...entriesFromExports(manifest.exports)]) {
    const declaredFile = await inspect(relativePath);
    if (declaredFile.status === 'unsafe') {
      errors.push(validationError('declared-path-unsafe', packRoot, relativePath));
    } else if (declaredFile.status === 'missing' && !reportedMissingAssets.has(declaredFile.identity)) {
      errors.push(validationError('declared-path-missing', packRoot, relativePath));
      reportedMissingAssets.add(declaredFile.identity);
    }
  }

  for (const relativePath of manifest.entrypoints.schema ?? []) {
    const declaredFile = await inspect(relativePath);
    if (declaredFile.status !== 'ok') continue; // Already reported as missing or unsafe above.

    let schema;
    try {
      schema = await readJson(declaredFile.path);
    } catch (error) {
      errors.push(validationError('schema-json-invalid', packRoot, `${relativePath}: ${error.message}`));
      continue;
    }

    if (
      schema && typeof schema === 'object' && !Array.isArray(schema) &&
      typeof schema.$schema === 'string' &&
      schema.$schema !== 'https://json-schema.org/draft/2020-12/schema'
    ) {
      errors.push(validationError('schema-dialect-unsupported', packRoot, `${relativePath}: ${schema.$schema}`));
      continue;
    }

    try {
      if (!packSchemaMetaValidator.validateSchema(schema)) {
        const details = (packSchemaMetaValidator.errors ?? [])
          .map((error) => `${error.instancePath || '/'} ${error.message}`)
          .join('; ');
        errors.push(validationError('schema-invalid', packRoot, `${relativePath}: ${details}`));
      }
    } catch (error) {
      errors.push(validationError('schema-invalid', packRoot, `${relativePath}: ${error.message}`));
    }
  }

  const profileNames = new Set();
  for (const profile of manifest.profiles ?? []) {
    if (profileNames.has(profile.name)) errors.push(validationError('profile-duplicate', packRoot, profile.name));
    profileNames.add(profile.name);
    if (!profile.path) {
      errors.push(validationError('profile-path-missing', packRoot, profile.name));
      continue;
    }
    const declaredFile = await inspect(profile.path);
    if (declaredFile.status === 'unsafe') {
      errors.push(validationError('profile-path-unsafe', packRoot, `${profile.name}: ${profile.path}`));
      continue;
    }
    if (declaredFile.status === 'missing') {
      if (!reportedMissingAssets.has(declaredFile.identity)) {
        errors.push(validationError('profile-path-missing', packRoot, profile.name));
        reportedMissingAssets.add(declaredFile.identity);
      }
      continue;
    }
    const schema = await readJson(declaredFile.path);
    const descent = schema['x-rosetta'];
    const profileId = schema.properties?.profile?.const ?? schema.properties?.profile?.properties?.id?.const;
    if (typeof schema.$id !== 'string' || !schema.$id.trim() || (schema.$id !== profile.name && profileId !== profile.name) || descent?.coreDescent !== 'core-tile-profile' || !descent?.coreKind?.startsWith('rosetta.') || descent?.pack !== manifest.id || !descent?.authority) {
      errors.push(validationError('profile-descent-missing', packRoot, profile.name));
    }
  }

  return {
    computedPackId,
    errors,
    manifest,
    ok: errors.length === 0,
    root: packRoot
  };
}

function dependencyDocIds(manifest) {
  if (!Array.isArray(manifest.depends_on)) {
    return [];
  }

  return manifest.depends_on.map((entry) => entry?.doc_id).filter((entry) => typeof entry === 'string');
}

function findDependencyCycle(startDocId, graph) {
  const visited = new Set();
  const stack = [];

  function visit(docId) {
    if (stack.includes(docId)) {
      return [...stack.slice(stack.indexOf(docId)), docId];
    }

    if (visited.has(docId)) {
      return null;
    }

    visited.add(docId);
    stack.push(docId);

    for (const dependency of graph.get(docId) ?? []) {
      const cycle = visit(dependency);
      if (cycle) {
        return cycle;
      }
    }

    stack.pop();
    return null;
  }

  return visit(startDocId);
}

function cycleKey(cycle) {
  return [...new Set(cycle)].sort().join('|');
}

export function validatePackGraph(packResults) {
  const errors = [];
  const graph = new Map();
  const rootByDocId = new Map();

  for (const result of packResults) {
    const docId = result.manifest.doc_id;
    if (typeof docId !== 'string' || docId.length === 0) {
      errors.push(validationError('doc-id-missing', result.root, 'pack.json must declare doc_id'));
      continue;
    }

    if (rootByDocId.has(docId)) {
      errors.push(validationError('doc-id-duplicate', result.root, docId));
      continue;
    }

    rootByDocId.set(docId, result.root);
    graph.set(docId, dependencyDocIds(result.manifest));
  }

  for (const [docId, dependencies] of graph.entries()) {
    const root = rootByDocId.get(docId);

    if (dependencies.includes(docId)) {
      errors.push(validationError('depends-on-self-reference', root, docId));
    }
  }

  const reported = new Set();
  for (const [docId] of graph.entries()) {
    const cycle = findDependencyCycle(docId, graph);
    if (cycle && cycle.length > 2) {
      const key = cycleKey(cycle);
      const detail = cycle.join(' -> ');
      if (!reported.has(key)) {
        errors.push(validationError('depends-on-cycle', rootByDocId.get(cycle[0]), detail));
        reported.add(key);
      }
    }
  }

  return {
    errors,
    ok: errors.length === 0
  };
}

export async function findPackRoots(packsRoot = DEFAULT_PACKS_ROOT) {
  await assertDirectRoot(packsRoot, 'packs-root-unsafe', 'Packs root');
  const entries = await readdir(packsRoot, { withFileTypes: true });
  const roots = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_')) {
      continue;
    }

    const root = path.join(packsRoot, entry.name);
    if (entry.isSymbolicLink()) {
      throw rootBoundaryError('pack-root-unsafe', root, 'Pack root must not be a symbolic link');
    }
    if (!entry.isDirectory()) {
      continue;
    }
    roots.push(root);
  }

  return roots.sort((left, right) => left.localeCompare(right));
}

export async function validateWorkspacePacks(packsRoot = DEFAULT_PACKS_ROOT) {
  let roots;
  try {
    roots = await findPackRoots(packsRoot);
  } catch (error) {
    if (!['packs-root-unsafe', 'pack-root-unsafe'].includes(error?.code)) throw error;
    return {
      errors: [validationError(error.code, error.root ?? packsRoot, error.message)],
      ok: false,
      packs: []
    };
  }
  const packResults = await Promise.all(roots.map((root) => validatePackRoot(root)));
  const allManifestsValid = packResults.every((result) => result.manifest && !result.errors.some((error) => error.code.startsWith('manifest-')));
  const graphResult = allManifestsValid ? validatePackGraph(packResults) : { errors: [], ok: false };
  const errors = [...packResults.flatMap((result) => result.errors), ...graphResult.errors];

  return {
    errors,
    ok: errors.length === 0,
    packs: packResults
  };
}

export async function updateWorkspacePackIds(packsRoot = DEFAULT_PACKS_ROOT) {
  const roots = await findPackRoots(packsRoot);
  // Validate every candidate before any repair write, so one missing/linked
  // manifest cannot leave earlier Pack IDs partially updated.
  const manifests = await Promise.all(roots.map(async (root) => ({
    root,
    manifestPath: await assertPackManifest(root)
  })));
  const updated = [];

  for (const { root, manifestPath } of manifests) {
    const manifest = await readJson(manifestPath);
    const computedPackId = await computePackId(root);
    if (manifest.pack_id === computedPackId) {
      continue;
    }

    await writeFile(manifestPath, `${JSON.stringify({ ...manifest, pack_id: computedPackId }, null, 2)}\n`);
    updated.push({ pack_id: computedPackId, root });
  }

  return updated;
}

function formatErrors(errors) {
  return errors.map((error) => `${error.root}: ${error.code}: ${error.detail}`).join('\n');
}

export async function cli(argv = process.argv.slice(2), { log = console.log, error = console.error } = {}) {
  const shouldFix = argv.includes('--fix-pack-ids');
  const packsRootFlagIndex = argv.indexOf('--packs-root');
  const packsRoot =
    packsRootFlagIndex >= 0 && argv[packsRootFlagIndex + 1] ? argv[packsRootFlagIndex + 1] : DEFAULT_PACKS_ROOT;

  if (shouldFix) {
    let updated;
    try {
      updated = await updateWorkspacePackIds(packsRoot);
    } catch (caught) {
      if (!['packs-root-unsafe', 'pack-root-unsafe', 'manifest-missing', 'manifest-unsafe'].includes(caught?.code)) throw caught;
      error(`${caught.root}: ${caught.code}: ${caught.message}`);
      return 1;
    }
    for (const entry of updated) {
      log(`${entry.root}: pack_id -> ${entry.pack_id}`);
    }
    return 0;
  }

  const result = await validateWorkspacePacks(packsRoot);
  if (!result.ok) {
    error(formatErrors(result.errors));
    return 1;
  }

  log(`Pack conformance passed for ${result.packs.length} packs.`);
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const exitCode = await cli();
  process.exitCode = exitCode;
}
