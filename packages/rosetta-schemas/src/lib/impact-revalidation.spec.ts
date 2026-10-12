import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseImpactRevalidation, appendImpactRevalidation } from './impact-revalidation.js';
import { getSchemaCatalogEntry } from './schema-catalog.js';

const cases = JSON.parse(readFileSync('tools/view-integrity/fixtures/impact-cases.json', 'utf8'));
const first = () => structuredClone(cases.valid[0].value);
describe('dependency impact and revalidation #1730', () => {
  it('registers the portable evidence contract with explicit Core descent', () => {
    expect(getSchemaCatalogEntry('impact.revalidation.v1')).toMatchObject({ ownerPackage: '@entif-ai/rosetta-schemas', coreDescent: 'governed-extension', validator: 'parseImpactRevalidation' });
  });
  for (const { name, value } of cases.valid) it(name, () => { expect(parseImpactRevalidation(value)).toEqual(value); });
  for (const { name, value } of cases.invalid) it(name, () => { expect(() => parseImpactRevalidation(value)).toThrow(); });
  it('never derives definite affectedness from dependency alone', () => {
    const value = first(); value.subjects[0].affectednessEvidenceRefs = [];
    expect(() => parseImpactRevalidation(value)).toThrow(/affectedness/i);
  });
  it('keeps irreversible external facts across additive repair and rejects destructive revision', () => {
    const previous = structuredClone(cases.valid[4].value);
    const next = { ...previous, recordId: 'urn:synthetic:repair', supersedesRefs: [previous.recordId] };
    expect(appendImpactRevalidation([previous], next)).toEqual([previous, next]);
    next.externalEffects = [];
    next.subjects = [];
    expect(() => appendImpactRevalidation([previous], next)).toThrow(/external/i);
    expect(previous.externalEffects).toHaveLength(1);
  });
  it('rejects conflicting record identity and retroactive knowledge rewriting', () => {
    const previous = first();
    const collision = { ...previous, reasonRefs: ['urn:synthetic:changed-reason'] };
    expect(() => appendImpactRevalidation([previous], collision)).toThrow(/identity/i);
    const next = { ...previous, recordId: 'urn:synthetic:later', supersedesRefs: [previous.recordId] };
    next.historicalContexts = structuredClone(previous.historicalContexts);
    next.historicalContexts[0].knownEvidenceRefs.push('urn:synthetic:new-evidence');
    expect(() => appendImpactRevalidation([previous], next)).toThrow(/historical|knowledge/i);
  });
});
