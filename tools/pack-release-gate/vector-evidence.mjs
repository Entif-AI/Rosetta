import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';
import { computePackIdFromHashInput } from '../pack-conformance/validate-packs.mjs';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020.js');
const addFormats = require('ajv-formats');
const DEFAULT_BINDINGS = new URL('./vector-bindings.json', import.meta.url);

function fileDigest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function safeRelative(p) {
  return typeof p === 'string' && p.length > 0 && !path.isAbsolute(p) &&
    !path.win32.isAbsolute(p) && !p.split(/[\\/]/).includes('..') && !p.includes('\\');
}

async function readRegularFile(packRoot, relativePath) {
  if (!safeRelative(relativePath)) throw new Error(`Unsafe Pack evidence path: ${relativePath}`);
  const parts = relativePath.split('/');
  let resolved = packRoot;
  for (const part of parts) {
    resolved = path.join(resolved, part);
    const info = await lstat(resolved);
    if (info.isSymbolicLink()) throw new Error(`Linked Pack evidence path: ${relativePath}`);
  }
  if (!(await lstat(resolved)).isFile()) throw new Error(`Not a Pack evidence file: ${relativePath}`);
  const bytes = await readFile(resolved);
  return { bytes, sha256: fileDigest(bytes) };
}

async function listCaseFiles(packRoot, folder) {
  if (!safeRelative(folder)) throw new Error(`Unsafe vector folder: ${folder}`);
  let ancestor = packRoot;
  for (const segment of folder.split('/')) {
    ancestor = path.join(ancestor, segment);
    const info = await lstat(ancestor);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error(`Unsafe vector folder: ${folder}`);
  }
  const root = path.join(packRoot, folder);
  const paths = [];
  async function visit(directory, prefix) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = [prefix, entry.name].filter(Boolean).join('/');
      if (entry.isSymbolicLink()) throw new Error(`Linked vector path: ${relative}`);
      if (entry.isDirectory()) await visit(path.join(directory, entry.name), relative);
      else if (entry.isFile() && entry.name.endsWith('.json')) paths.push(relative);
      else throw new Error(`Unsupported vector asset: ${relative}`);
    }
  }
  await visit(root, folder);
  return paths.sort();
}

function payloadsFromCase(vector, file) {
  if (typeof vector?.expectOk !== 'boolean') throw new Error(`Missing boolean expectOk in ${file}`);
  const values = vector.payloads ?? (Object.hasOwn(vector, 'payload') ? [vector.payload] : null);
  if (!Array.isArray(values) || values.length === 0) throw new Error(`Missing nonempty payloads in ${file}`);
  return values;
}

function finding(status, detail, receipts = []) {
  return { status, detail, receipts };
}

export async function validatePackEvidenceBindings({
  root, manifest, bindings
}) {
  const examples = manifest.entrypoints.examples ?? [];
  const declaredTests = new Set(manifest.entrypoints.tests ?? []);
  const expectedExamples = new Set();
  const observedVectors = new Set();
  const vectorReceipts = [];
  const exampleReceipts = [];
  const errors = [];

  for (const binding of bindings) {
    try {
      if (binding.kind === 'pack-id-v1') {
        const file = binding.vector;
        if (observedVectors.has(file)) throw new Error(`Vector has two bindings: ${file}`);
        observedVectors.add(file);
        if (!declaredTests.has(file)) throw new Error(`Vector is not declared in entrypoints.tests: ${file}`);
        const asset = await readRegularFile(root, file);
        const vector = JSON.parse(asset.bytes.toString('utf8'));
        if (vector.algorithm !== 'rosetta-pack-id-v1' || vector.input?.algorithm !== vector.algorithm ||
          typeof vector.expected_pack_id !== 'string') {
          throw new Error(`Malformed pack-id-v1 vector: ${file}`);
        }
        const actual = computePackIdFromHashInput(vector.input);
        vectorReceipts.push({
          path: file, sha256: asset.sha256, algorithm: vector.algorithm,
          expected: vector.expected_pack_id, actual, count: 1
        });
        if (actual !== vector.expected_pack_id) errors.push(`Unexpected Pack-ID vector result: ${file}`);
        continue;
      }
      if (binding.kind && binding.kind !== 'json-schema') {
        throw new Error(`Unsupported Pack evidence binding: ${binding.kind}`);
      }
      if (!manifest.entrypoints.schema?.includes(binding.schema)) {
        throw new Error(`Schema is not a declared entrypoint: ${binding.schema}`);
      }
      const schemaFile = await readRegularFile(root, binding.schema);
      const schema = JSON.parse(schemaFile.bytes.toString('utf8'));
      const ajv = new Ajv2020({ strict: false, allErrors: true });
      addFormats(ajv);
      const validate = ajv.compile(schema);

      for (const examplePath of binding.examples) {
        if (expectedExamples.has(examplePath)) throw new Error(`Example has two validator bindings: ${examplePath}`);
        expectedExamples.add(examplePath);
        if (!examples.includes(examplePath)) continue; // Pack may not yet declare an optional example.
        const asset = await readRegularFile(root, examplePath);
        const payload = JSON.parse(asset.bytes.toString('utf8'));
        const valid = validate(payload);
        exampleReceipts.push({ path: examplePath, sha256: asset.sha256, schema: binding.schema, schemaSha256: schemaFile.sha256, result: valid ? 'pass' : 'fail' });
        if (!valid) errors.push(`Example ${examplePath} failed ${binding.schema}`);
      }

      const files = await listCaseFiles(root, binding.vectors);
      if (!files.length) throw new Error(`No test vectors found in ${binding.vectors}`);
      for (const file of files) {
        if (observedVectors.has(file)) throw new Error(`Vector has two bindings: ${file}`);
        observedVectors.add(file);
        if (!declaredTests.has(file)) throw new Error(`Vector is not declared in entrypoints.tests: ${file}`);
        const asset = await readRegularFile(root, file);
        const vector = JSON.parse(asset.bytes.toString('utf8'));
        const payloads = payloadsFromCase(vector, file);
        const actual = payloads.map((payload) => validate(payload));
        const matched = actual.every((valid) => valid === vector.expectOk);
        vectorReceipts.push({
          path: file, sha256: asset.sha256, schema: binding.schema,
          schemaSha256: schemaFile.sha256, expected: vector.expectOk ? 'accept' : 'reject',
          actual: matched ? (vector.expectOk ? 'accept' : 'reject') : 'mismatch',
          count: payloads.length
        });
        if (!matched) errors.push(`Unexpected vector verdict: ${file}`);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown validator error');
    }
  }

  const uncoveredExamples = examples.filter((example) => !exampleReceipts.some((receipt) => receipt.path === example));
  const declaredVectorPaths = [...declaredTests].filter((file) => file.startsWith('test-vectors/'));
  const physicalPaths = await listCaseFiles(root, 'test-vectors');
  const uncoveredVectors = [...new Set([...declaredVectorPaths, ...physicalPaths])]
    .filter((file) => !observedVectors.has(file)).sort();
  const exampleResult = errors.length ? finding('fail', errors.join('; '), exampleReceipts)
    : uncoveredExamples.length ? finding('not-evaluated', `Unbound examples: ${uncoveredExamples.join(', ')}`, exampleReceipts)
      : examples.length ? finding('pass', `Validated ${exampleReceipts.length} example assets`, exampleReceipts)
        : finding('not-evaluated', 'No example declared', exampleReceipts);

  const vectorResult = errors.length ? finding('fail', errors.join('; '), vectorReceipts)
    : uncoveredVectors.length ? finding('not-evaluated', `Unbound vectors: ${uncoveredVectors.join(', ')}`, vectorReceipts)
      : declaredVectorPaths.length ? finding('pass', `Executed ${vectorReceipts.length} vectors with ${vectorReceipts.reduce((sum, r) => sum + r.count, 0)} payloads`, vectorReceipts)
        : finding('not-applicable', 'No declared test vectors', vectorReceipts);
  return { examples: exampleResult, vectors: vectorResult };
}

export async function auditExecutablePackEvidence({ root, manifest, bindingsFile = DEFAULT_BINDINGS }) {
  const document = JSON.parse(await readFile(bindingsFile, 'utf8'));
  if (document.formatVersion !== 1 || !document.packs || typeof document.packs !== 'object') {
    throw new Error('Unrecognized Pack evidence binding contract');
  }
  const bindings = document.packs[manifest.id];
  if (!bindings) return null;
  if (!Array.isArray(bindings) || bindings.length === 0) throw new Error(`Invalid binding list for ${manifest.id}`);
  return validatePackEvidenceBindings({ root, manifest, bindings });
}
