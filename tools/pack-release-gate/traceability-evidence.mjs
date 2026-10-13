import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';

function sourcePath(root, file) {
  if (typeof file !== 'string' || !file || file.includes('\\') || path.isAbsolute(file) ||
    path.win32.isAbsolute(file) || file.split('/').includes('..')) {
    throw new Error(`Unsafe normative artifact path: ${file}`);
  }
  return path.join(root, file);
}

async function readArtifact(root, file) {
  const resolved = sourcePath(root, file);
  let parent = root;
  for (const segment of file.split('/')) {
    parent = path.join(parent, segment);
    const stat = await lstat(parent);
    if (stat.isSymbolicLink()) throw new Error(`Linked normative artifact path: ${file}`);
  }
  if (!(await lstat(resolved)).isFile()) throw new Error(`Not a regular normative artifact: ${file}`);
  const bytes = await readFile(resolved);
  return { text: bytes.toString('utf8'), sha256: createHash('sha256').update(bytes).digest('hex') };
}

function checkTurtleHeader(text, file, manifest, rootName) {
  const header = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('#')) break;
    const match = /^#\s*([A-Za-z-]+):\s*(.*?)\s*$/.exec(line);
    if (match) header[match[1]] = match[2];
  }
  if (!Object.keys(header).length) return { status: 'not-evaluated', detail: 'No machine-readable Turtle comment header' };
  const expected = {
    DocID: manifest.doc_id,
    Version: manifest.version,
    'Source-Of-Truth': `${rootName}/pack.json`
  };
  for (const [key, value] of Object.entries(expected)) {
    if (header[key] && header[key] !== value) {
      return { status: 'fail', detail: `Header ${key} contradicts the Pack manifest: ${file}` };
    }
  }
  if (header.Status && header.Status.toLowerCase() !== manifest.status) {
    return { status: 'fail', detail: `Header Status contradicts Pack status: ${file}` };
  }
  const identity = manifest.exports?.find((entry) => entry.path === file)?.id;
  if (header.Artifact && identity && header.Artifact !== identity) {
    return { status: 'fail', detail: `Header Artifact contradicts the declared export: ${file}` };
  }
  const dependencies = (manifest.depends_on ?? []).map((entry) => entry.doc_id);
  if (header['Depends-On'] && dependencies.some((id) => !header['Depends-On'].split(/[,\s]+/).includes(id))) {
    return { status: 'fail', detail: `Header Depends-On omits manifest dependencies: ${file}` };
  }
  const missing = ['DocID', 'Artifact', 'Version', 'Status', 'Depends-On', 'Source-Of-Truth']
    .filter((key) => !header[key]);
  if (missing.length) return { status: 'not-evaluated', detail: `Incomplete Turtle header: ${missing.join(', ')}` };
  if (!identity) return { status: 'not-evaluated', detail: 'Turtle header has no declared export identity to verify' };
  return { status: 'pass', detail: 'Turtle header records DocID, artifact, version, status, dependencies and source' };
}

function checkSchemaMetadata(text, file, manifest) {
  const data = JSON.parse(text);
  const descent = data?.['x-rosetta'];
  if (!descent) return { status: 'not-evaluated', detail: 'JSON Schema has no x-rosetta descent metadata; traceability header mapping remains unresolved' };
  if (descent.pack && descent.pack !== manifest.id) {
    return { status: 'fail', detail: `x-rosetta.pack contradicts manifest: ${file}` };
  }
  // authority is the governing semantic contract; it need not equal this
  // schema's file path (for example RRP promotion-state is governed by a spec).
  return { status: 'not-evaluated', detail: 'x-rosetta Pack descent checked; governing authority and required DocID/header mapping still need independent validation' };
}

export async function auditPackTraceability({ root, manifest }) {
  const rootName = `packs/${path.basename(root)}`;
  const normativePaths = [
    ...(manifest.entrypoints.schema ?? []).map((file) => ({ file, kind: 'json-schema' })),
    ...(manifest.entrypoints.shacl ?? []).map((file) => ({ file, kind: 'turtle-shacl' }))
  ];
  if (!normativePaths.length) {
    return { status: 'not-applicable', detail: 'No required schema/SHACL header classes declared', receipts: [] };
  }
  const receipts = [];
  for (const { file, kind } of normativePaths) {
    try {
      const { text, sha256 } = await readArtifact(root, file);
      const result = kind === 'json-schema'
        ? checkSchemaMetadata(text, file, manifest)
        : checkTurtleHeader(text, file, manifest, rootName);
      receipts.push({ path: file, sha256, kind, ...result });
    } catch (error) {
      receipts.push({ path: file, kind, status: 'fail', detail: error instanceof Error ? error.message : 'Unknown traceability failure' });
    }
  }
  const failed = receipts.filter((receipt) => receipt.status === 'fail');
  const pending = receipts.filter((receipt) => receipt.status === 'not-evaluated');
  if (failed.length) return {
    status: 'fail', detail: failed.map((receipt) => `${receipt.path}: ${receipt.detail}`).join('; '), receipts
  };
  if (pending.length) return {
    status: 'not-evaluated', detail: `${pending.length} normative artifacts await accepted traceability headers or mapping`, receipts
  };
  return { status: 'pass', detail: `Verified ${receipts.length} normative artifact headers`, receipts };
}
