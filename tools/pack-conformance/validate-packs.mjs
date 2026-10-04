#!/usr/bin/env node
/* global console, process */
import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACK_ID_ALGORITHM = 'rosetta-pack-id-v1';
const DEFAULT_PACKS_ROOT = 'packs';

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
  const manifest = await readJson(path.join(packRoot, 'pack.json'));
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

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

export async function validatePackRoot(packRoot) {
  const errors = [];
  const manifestPath = path.join(packRoot, 'pack.json');
  const manifest = await readJson(manifestPath);
  const declaredPackId = manifest.pack_id;
  const computedPackId = await computePackId(packRoot);

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
    if (!(await fileExists(path.join(packRoot, relativePath)))) {
      errors.push(validationError('declared-path-missing', packRoot, relativePath));
    }
  }

  const profileNames = new Set();
  for (const profile of manifest.profiles ?? []) {
    if (profileNames.has(profile.name)) errors.push(validationError('profile-duplicate', packRoot, profile.name));
    profileNames.add(profile.name);
    if (!profile.path || !(await fileExists(path.join(packRoot, profile.path)))) {
      errors.push(validationError('profile-path-missing', packRoot, profile.name));
      continue;
    }
    const schema = await readJson(path.join(packRoot, profile.path));
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
  const entries = await readdir(packsRoot, { withFileTypes: true });
  const roots = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) {
      continue;
    }

    const root = path.join(packsRoot, entry.name);
    if (await fileExists(path.join(root, 'pack.json'))) {
      roots.push(root);
    }
  }

  return roots.sort((left, right) => left.localeCompare(right));
}

export async function validateWorkspacePacks(packsRoot = DEFAULT_PACKS_ROOT) {
  const roots = await findPackRoots(packsRoot);
  const packResults = await Promise.all(roots.map((root) => validatePackRoot(root)));
  const graphResult = validatePackGraph(packResults);
  const errors = [...packResults.flatMap((result) => result.errors), ...graphResult.errors];

  return {
    errors,
    ok: errors.length === 0,
    packs: packResults
  };
}

export async function updateWorkspacePackIds(packsRoot = DEFAULT_PACKS_ROOT) {
  const roots = await findPackRoots(packsRoot);
  const updated = [];

  for (const root of roots) {
    const manifestPath = path.join(root, 'pack.json');
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
    const updated = await updateWorkspacePackIds(packsRoot);
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
