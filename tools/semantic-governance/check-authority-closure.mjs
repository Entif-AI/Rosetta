import console from 'node:console';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(scriptDir, '..', '..');

const REQUIRED_FILES = new Map([
  [
    'AGENTS.md',
    [
      'PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md',
      'AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md',
      'PUBLIC_PRIVATE_AUTHORITY_BRIDGE.yaml',
      'pnpm run governance:authority',
    ],
  ],
  [
    'docs/governance/AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md',
    [
      'Resolve authority before implementation.',
      'Rosetta owns data-bearing interoperability',
      'Authority closure',
      'Requirements graph',
      'Pre-commit and CI enforcement',
    ],
  ],
  [
    'docs/governance/PUBLIC_PRIVATE_AUTHORITY_BRIDGE.yaml',
    [
      'protected_references_use_opaque_ipr_ids_only',
      'bridges:',
      'protected_authorities:',
    ],
  ],
]);

const SCAN_TARGETS = [
  'AGENTS.md',
  'README.md',
  'docs/governance',
  'packages/rosetta-schemas',
  'skills',
];

const TEXT_EXTENSIONS = new Set([
  '.md',
  '.yaml',
  '.yml',
  '.json',
  '.mjs',
  '.js',
  '.ts',
  '.tsx',
  '.txt',
]);

const PRIVATE_REPOSITORY_PATTERNS = [
  /github\.com\/socr8s\/private-ip/iu,
  /\bsocr8s\/private-ip\b/iu,
];

const CANONICAL_IPR = /^IPR-\d{4}$/u;
const IPR_LIKE = /\bIPR-[A-Za-z0-9_-]+\b/gu;

function posixPath(value) {
  return value.split(path.sep).join('/');
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectTextFiles(root, relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!(await exists(absolutePath))) return [];

  const info = await stat(absolutePath);
  if (info.isFile()) {
    return TEXT_EXTENSIONS.has(path.extname(absolutePath).toLowerCase()) ||
      path.basename(absolutePath) === 'AGENTS.md'
      ? [relativePath]
      : [];
  }

  const files = [];
  for (const entry of await readdir(absolutePath, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const childRelative = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(root, childRelative)));
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(childRelative);
    }
  }
  return files;
}

export function findDirectPrivateRepositoryReferences(entries) {
  const findings = [];
  for (const entry of entries) {
    const lines = entry.text.split(/\r?\n/u);
    for (const [index, line] of lines.entries()) {
      for (const pattern of PRIVATE_REPOSITORY_PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          findings.push({
            ruleId: 'authority-no-direct-private-repo-reference',
            path: entry.path,
            line: index + 1,
            text: line.trim(),
            message:
              'Public artifacts must reference protected authority only through opaque IPR-#### identifiers, never a direct protected-repository path or URL.',
          });
          break;
        }
      }
    }
  }
  return findings;
}

export function findMalformedProtectedIdentifiers(entries) {
  const findings = [];
  for (const entry of entries) {
    const lines = entry.text.split(/\r?\n/u);
    for (const [index, line] of lines.entries()) {
      for (const match of line.matchAll(IPR_LIKE)) {
        if (!CANONICAL_IPR.test(match[0])) {
          findings.push({
            ruleId: 'authority-canonical-ipr-id',
            path: entry.path,
            line: index + 1,
            text: match[0],
            message: 'Protected authority identifiers must use the canonical IPR-#### form.',
          });
        }
      }
    }
  }
  return findings;
}

export function findBridgeLeakage(bridgeText) {
  const findings = [];
  const prohibitedKeys = [
    /^\s*private_url\s*:/imu,
    /^\s*protected_url\s*:/imu,
    /^\s*private_repository\s*:/imu,
    /^\s*protected_repository\s*:/imu,
  ];

  for (const pattern of prohibitedKeys) {
    if (pattern.test(bridgeText)) {
      findings.push({
        ruleId: 'authority-bridge-no-private-location',
        path: 'docs/governance/PUBLIC_PRIVATE_AUTHORITY_BRIDGE.yaml',
        line: null,
        text: null,
        message:
          'The public authority bridge must not encode protected repository locations. Use opaque IPR-#### identifiers only.',
      });
    }
  }

  return findings;
}

export async function runAuthorityClosureCheck({ root = defaultRoot } = {}) {
  const findings = [];
  const entries = [];

  for (const [relativePath, snippets] of REQUIRED_FILES.entries()) {
    const absolutePath = path.join(root, relativePath);
    if (!(await exists(absolutePath))) {
      findings.push({
        ruleId: 'authority-required-file',
        path: relativePath,
        line: null,
        text: null,
        message: 'Required authority-closure governance file is missing.',
      });
      continue;
    }

    const text = await readFile(absolutePath, 'utf8');
    for (const snippet of snippets) {
      if (!text.includes(snippet)) {
        findings.push({
          ruleId: 'authority-required-snippet',
          path: relativePath,
          line: null,
          text: snippet,
          message: 'Required authority-closure guidance is missing from this file.',
        });
      }
    }
  }

  const scanFiles = new Set();
  for (const target of SCAN_TARGETS) {
    for (const relativePath of await collectTextFiles(root, target)) {
      scanFiles.add(relativePath);
    }
  }

  for (const relativePath of [...scanFiles].sort()) {
    entries.push({
      path: posixPath(relativePath),
      text: await readFile(path.join(root, relativePath), 'utf8'),
    });
  }

  findings.push(...findDirectPrivateRepositoryReferences(entries));
  findings.push(...findMalformedProtectedIdentifiers(entries));

  const bridgePath = path.join(
    root,
    'docs/governance/PUBLIC_PRIVATE_AUTHORITY_BRIDGE.yaml'
  );
  if (await exists(bridgePath)) {
    findings.push(...findBridgeLeakage(await readFile(bridgePath, 'utf8')));
  }

  return findings;
}

function printFindings(findings) {
  for (const finding of findings) {
    const location = finding.line
      ? `${finding.path}:${finding.line}`
      : finding.path;
    console.error(`\n[${finding.ruleId}] ${location}`);
    console.error(finding.message);
    if (finding.text) console.error(`  ${finding.text}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const findings = await runAuthorityClosureCheck();
  if (findings.length > 0) {
    console.error(
      `Authority-closure governance check failed with ${findings.length} finding(s).`
    );
    printFindings(findings);
    process.exitCode = 1;
  } else {
    console.log('Authority-closure governance check passed.');
  }
}
