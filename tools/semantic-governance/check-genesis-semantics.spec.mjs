import { describe, expect, it } from 'vitest';

import {
  extractSchemaIds,
  findBannedAliasFindings,
  findMissingAlignmentNotes,
  findMissingRequiredSnippets,
  findUndocumentedNonCoreSchemaIds,
} from './check-genesis-semantics.mjs';

describe('semantic duplication aliases', () => {
  it('detects roadmap use of Spine and Receipt metaphors', () => {
    const findings = findBannedAliasFindings([
      {
        path: 'README.md',
        text: 'Bootstrap execution spine.\nActive baton-pass receipt.',
      },
    ]);

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      'roadmap-spine-alias',
      'receipt-metaphor',
    ]);
    expect(findings[0]).toMatchObject({ line: 1, path: 'README.md' });
    expect(findings[1]).toMatchObject({ line: 2, path: 'README.md' });
  });

  it('does not flag the canonical Rosetta operational Spine', () => {
    const findings = findBannedAliasFindings([
      {
        path: 'docs/ARCHITECTURE.md',
        text: 'Rosetta uses the Run -> Action -> ToolCall -> Observation -> Evaluation operational Spine.',
      },
    ]);

    expect(findings).toEqual([]);
  });

  it('allows governance companions to quote retired aliases for reconciliation', () => {
    const findings = findBannedAliasFindings([
      {
        path: 'docs/governance/genesis/SEMANTIC_AUDIT.md',
        text: '`decision receipt` is retired.',
      },
    ]);

    expect(findings).toEqual([]);
  });
});

describe('schema authority coverage', () => {
  it('extracts schema IDs from the required-fields registry', () => {
    const ids = extractSchemaIds(`
const REQUIRED_FIELDS: Record<string, string[]> = {
  'rosetta.run': ['runId'],
  'rosetta.translation_evidence': ['artifactCid'],
  'source.record': ['recordLocalId']
};
`);

    expect(ids).toEqual([
      'rosetta.run',
      'rosetta.translation_evidence',
      'source.record',
    ]);
  });

  it('reports undocumented non-core rosetta namespace IDs only', () => {
    const missing = findUndocumentedNonCoreSchemaIds(
      ['rosetta.run', 'rosetta.translation_evidence', 'source.record'],
      '# Audit\n\n`rosetta.composition_provenance` is documented.'
    );

    expect(missing).toEqual(['rosetta.translation_evidence']);
  });

  it('accepts an explicitly documented non-core schema ID', () => {
    const missing = findUndocumentedNonCoreSchemaIds(
      ['rosetta.run', 'rosetta.translation_evidence'],
      '# Audit\n\n`rosetta.translation_evidence` is a provisional extension.'
    );

    expect(missing).toEqual([]);
  });
});

describe('required semantic-governance language', () => {
  it('reports missing snippets and missing files', () => {
    const findings = findMissingRequiredSnippets(
      new Map([
        ['docs/governance/Genesis.md', 'Rosetta v3 owns Rosetta meaning.'],
        ['README.md', 'See docs/governance/Genesis.md.'],
      ]),
      {
        'README.md': [
          'docs/governance/Genesis.md',
          'pnpm run governance:semantic',
        ],
        'docs/governance/Genesis.md': ['Rosetta v3 owns Rosetta meaning'],
        'missing.md': ['anything'],
      }
    );

    expect(findings).toEqual([
      { path: 'README.md', snippet: 'pnpm run governance:semantic' },
      { path: 'missing.md', snippet: '<file missing>' },
    ]);
  });

  it('accepts complete required snippets', () => {
    const findings = findMissingRequiredSnippets(
      new Map([['README.md', 'Genesis and pnpm run governance:semantic']]),
      { 'README.md': ['Genesis', 'pnpm run governance:semantic'] }
    );

    expect(findings).toEqual([]);
  });
});

describe('historical and application alignment notes', () => {
  it('requires explicit semantic authority notes on governed source families', () => {
    const findings = findMissingAlignmentNotes(new Map());

    expect(findings.length).toBeGreaterThan(0);
    expect(
      findings.some((finding) =>
        finding.path.includes('Cognitive Tiles and Swarm Gnosis')
      )
    ).toBe(true);
    expect(
      findings.some((finding) =>
        finding.path.includes('personhood_provenance')
      )
    ).toBe(true);
  });

  it('accepts files that contain the alignment heading', () => {
    const heading = '## Semantic authority and terminology status';
    const files = new Map([
      [
        'docs/RFCs/20251024 - RFC - Rosetta - Cognitive Tiles and Swarm Gnosis.md',
        heading,
      ],
      ['docs/RFCs/ontological_mixture_of_concepts_research_spec.md', heading],
      [
        'docs/PRDs/20251024 - PRD - Rosetta - Cognitive Tapestries via Semantic Latticing.md',
        heading,
      ],
      [
        'docs/RFCs/20260324 - Entif AI - Specification - Agentic Memory and Graph Design Doctrine.md',
        heading,
      ],
      [
        'docs/PRDs/20260426 - Entif - PRD - Context CLI and Memory Services.md',
        heading,
      ],
      [
        'docs/governance/rosetta_governance_addendum_personhood_provenance_and_cognitive_twin_risk.md',
        heading,
      ],
    ]);

    expect(findMissingAlignmentNotes(files)).toEqual([]);
  });
});
