// #1572 removed protected working authorities. Public checks must not require their return.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(scriptDir, '..', '..');

export const ROSETTA_V3_CORE_SCHEMA_IDS = new Set([
  'rosetta.action',
  'rosetta.evaluation',
  'rosetta.observation',
  'rosetta.receipt',
  'rosetta.run',
  'rosetta.tapestry',
  'rosetta.toolcall',
]);

export const DEFAULT_ALIAS_RULES = [
  {
    id: 'roadmap-spine-alias',
    message:
      'Use “current path to the next proof” for roadmap sequencing; Rosetta owns the operational Spine.',
    pattern: /\b(?:bootstrap|delivery|roadmap)\s+(?:execution\s+)?spine\b/iu,
  },
  {
    id: 'receipt-metaphor',
    message:
      'Use record, evidence, or attestation unless the object satisfies Rosetta Receipt semantics.',
    pattern:
      /\b(?:baton-pass|handoff|working|decision|repository|repo)\s+receipt\b/iu,
  },
  {
    id: 'genesis-profile-alias',
    message:
      'Use Genesis companion or project adoption record; Profile is a Rosetta conformance term.',
    pattern: /\bGenesis\s+profile\b|\bprofile\s+hook\b/iu,
  },
  {
    id: 'parallel-claim-taxonomy',
    message:
      'Do not establish universal Genesis claim classes alongside Rosetta epistemic/provenance semantics.',
    pattern: /\bclaim\s+classes\b/iu,
  },
  {
    id: 'parallel-operation-schema',
    message: 'Do not create a second canonical operation protocol in Genesis.',
    pattern: /\brecoverable-operation\s+contract\b/iu,
  },
];

const INTENTIONAL_DISCUSSION_PATHS = new Set([
  'docs/governance/GENESIS_SOURCE_SYNTHESIS.md',
  'docs/governance/genesis/DELIVERY_AND_COLLABORATION.md',
  'docs/governance/genesis/SEMANTIC_ALIGNMENT.md',
  'docs/governance/genesis/SEMANTIC_AUDIT.md',
  'docs/governance/genesis/SESSION_DECISION_COVERAGE.md',
  'docs/governance/genesis/V0_4_RECONCILIATION.md',
]);

const ACTIVE_TEXT_PATHS = [
  'README.md',
  'apps/entif-site/README.md',
  'apps/rosetta-cli/README.md',
  'docs/governance/AUTHORITY_STACK.md',
  'docs/governance/Genesis.md',
  'docs/governance/rosetta_governance_addendum_personhood_provenance_and_cognitive_twin_risk.md',
  'docs/RFCs/20251024 - RFC - Rosetta - Cognitive Tiles and Swarm Gnosis.md',
  'packages/rosetta-schemas/README.md',
  'packages/rosetta-schemas/docs/schema-authority-map.md',
];

const HISTORICAL_ALIGNMENT_PATHS = [
  'docs/RFCs/20251024 - RFC - Rosetta - Cognitive Tiles and Swarm Gnosis.md',
];

const APPLICATION_ALIGNMENT_PATHS = [
  'docs/governance/rosetta_governance_addendum_personhood_provenance_and_cognitive_twin_risk.md',
];

const REQUIRED_SNIPPETS = {
  'README.md': [
    'docs/governance/Genesis.md',
    'docs/governance/genesis/SEMANTIC_ALIGNMENT.md',
    'pnpm run governance:semantic',
  ],
  'docs/governance/AUTHORITY_STACK.md': [
    'genesis/SEMANTIC_ALIGNMENT.md',
    'genesis/SEMANTIC_AUDIT.md',
  ],
  'docs/governance/Genesis.md': [
    'Before introducing a named concept, artifact, state, relationship, identifier, protocol, classification, or machine-readable schema',
    'Rosetta v3 owns Rosetta meaning',
    'one universal master score',
  ],
  'docs/governance/genesis/SEMANTIC_ALIGNMENT.md': [
    'Before Genesis coins, defines, or canonizes',
    'Five rules for every reconciliation pass',
    'SEMANTIC_AUDIT.md',
  ],
  'docs/governance/genesis/SEMANTIC_AUDIT.md': [
    'rosetta.composition_provenance',
    'rosetta.translation_evidence',
    'rosetta.conformance_bundle',
    'rosetta.shacl_shapes',
    'TASK_RECEIPT',
    'INCIDENT_ENVELOPE',
    'source.*',
    'entif.*',
    'guard.decision_token',
    'adapter.capability_manifest',
    'skill.card',
  ],
  'packages/rosetta-schemas/README.md': [
    'Rosetta v3.0.0 Core Spine Specification',
    'SEMANTIC_AUDIT.md',
  ],
  'packages/rosetta-schemas/docs/schema-authority-map.md': [
    'Semantic Dispositions',
    'SEMANTIC_AUDIT.md',
  ],
};

function posixPath(value) {
  return value.split(path.sep).join('/');
}

async function readUtf8(root, relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function listGenesisCompanions(root) {
  const companionDir = path.join(root, 'docs', 'governance', 'genesis');
  const names = await readdir(companionDir);
  return names
    .filter((name) => name.endsWith('.md'))
    .map((name) => `docs/governance/genesis/${name}`);
}

export function findBannedAliasFindings(
  entries,
  rules = DEFAULT_ALIAS_RULES,
  intentionalPaths = INTENTIONAL_DISCUSSION_PATHS
) {
  const findings = [];

  for (const entry of entries) {
    if (intentionalPaths.has(entry.path)) continue;

    const lines = entry.text.split(/\r?\n/u);
    for (const [index, line] of lines.entries()) {
      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          findings.push({
            line: index + 1,
            message: rule.message,
            path: entry.path,
            ruleId: rule.id,
            text: line.trim(),
          });
        }
      }
    }
  }

  return findings;
}

export function extractSchemaIds(source) {
  const match = source.match(
    /const\s+REQUIRED_FIELDS[^=]*=\s*\{(?<body>[\s\S]*?)\n\};/u
  );
  if (!match?.groups?.body) return [];

  const ids = [];
  const keyPattern = /^\s*'([^']+)'\s*:/gmu;
  for (const keyMatch of match.groups.body.matchAll(keyPattern)) {
    ids.push(keyMatch[1]);
  }
  return ids;
}

export function findUndocumentedNonCoreSchemaIds(
  schemaIds,
  auditText,
  coreSchemaIds = ROSETTA_V3_CORE_SCHEMA_IDS
) {
  return schemaIds
    .filter(
      (schemaId) =>
        schemaId.startsWith('rosetta.') && !coreSchemaIds.has(schemaId)
    )
    .filter((schemaId) => !auditText.includes(`\`${schemaId}\``))
    .sort();
}

export function findMissingRequiredSnippets(
  fileTexts,
  requirements = REQUIRED_SNIPPETS
) {
  const findings = [];

  for (const [relativePath, snippets] of Object.entries(requirements)) {
    const text = fileTexts.get(relativePath);
    if (text === undefined) {
      findings.push({ path: relativePath, snippet: '<file missing>' });
      continue;
    }
    for (const snippet of snippets) {
      if (!text.includes(snippet))
        findings.push({ path: relativePath, snippet });
    }
  }

  return findings;
}

export function findMissingAlignmentNotes(fileTexts) {
  const findings = [];

  for (const relativePath of HISTORICAL_ALIGNMENT_PATHS) {
    const text = fileTexts.get(relativePath) ?? '';
    if (!text.includes('## Semantic authority and terminology status')) {
      findings.push({
        message:
          'Historical/working precursor needs an explicit v3 supersession and mapping note.',
        path: relativePath,
      });
    }
  }

  for (const relativePath of APPLICATION_ALIGNMENT_PATHS) {
    const text = fileTexts.get(relativePath) ?? '';
    if (!text.includes('## Semantic authority and terminology status')) {
      findings.push({
        message:
          'Application/extension authority needs an explicit v3 composition and namespace note.',
        path: relativePath,
      });
    }
  }

  return findings;
}

export async function runSemanticGovernanceCheck({ root = defaultRoot } = {}) {
  const companionPaths = await listGenesisCompanions(root);
  const paths = [
    ...new Set([
      ...ACTIVE_TEXT_PATHS,
      ...companionPaths,
      ...Object.keys(REQUIRED_SNIPPETS),
    ]),
  ].sort();
  const fileTexts = new Map();
  const missingFiles = [];

  for (const relativePath of paths) {
    try {
      fileTexts.set(relativePath, await readUtf8(root, relativePath));
    } catch (error) {
      if (error?.code === 'ENOENT') missingFiles.push(relativePath);
      else throw error;
    }
  }

  const aliasFindings = findBannedAliasFindings(
    [...fileTexts.entries()].map(([relativePath, text]) => ({
      path: posixPath(relativePath),
      text,
    }))
  );
  const snippetFindings = findMissingRequiredSnippets(fileTexts);
  const alignmentFindings = findMissingAlignmentNotes(fileTexts);

  const schemaPath = 'packages/rosetta-schemas/src/lib/rosetta-schemas.ts';
  const schemaSource = await readUtf8(root, schemaPath);
  const auditText =
    fileTexts.get('docs/governance/genesis/SEMANTIC_AUDIT.md') ?? '';
  const undocumentedSchemaIds = findUndocumentedNonCoreSchemaIds(
    extractSchemaIds(schemaSource),
    auditText
  );

  return {
    aliasFindings,
    alignmentFindings,
    missingFiles,
    ok:
      aliasFindings.length === 0 &&
      alignmentFindings.length === 0 &&
      missingFiles.length === 0 &&
      snippetFindings.length === 0 &&
      undocumentedSchemaIds.length === 0,
    snippetFindings,
    undocumentedSchemaIds,
  };
}

function printResult(result) {
  if (result.missingFiles.length > 0) {
    console.error('Missing governed files:');
    for (const relativePath of result.missingFiles)
      console.error(`- ${relativePath}`);
  }

  if (result.aliasFindings.length > 0) {
    console.error('Retired or collision-prone aliases:');
    for (const finding of result.aliasFindings) {
      console.error(
        `- ${finding.path}:${finding.line} [${finding.ruleId}] ${finding.text}`
      );
      console.error(`  ${finding.message}`);
    }
  }

  if (result.alignmentFindings.length > 0) {
    console.error('Missing semantic alignment notes:');
    for (const finding of result.alignmentFindings)
      console.error(`- ${finding.path}: ${finding.message}`);
  }

  if (result.snippetFindings.length > 0) {
    console.error('Missing required governance language or links:');
    for (const finding of result.snippetFindings)
      console.error(`- ${finding.path}: ${finding.snippet}`);
  }

  if (result.undocumentedSchemaIds.length > 0) {
    console.error(
      'Non-core rosetta.* schema IDs missing from SEMANTIC_AUDIT.md:'
    );
    for (const schemaId of result.undocumentedSchemaIds)
      console.error(`- ${schemaId}`);
  }

  if (result.ok) {
    console.log('Semantic governance checks passed.');
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  runSemanticGovernanceCheck()
    .then((result) => {
      printResult(result);
      if (!result.ok) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
