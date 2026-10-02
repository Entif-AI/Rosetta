import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { validatePayload } from './rosetta-schemas.js';
import { getSchemaCatalogEntry } from './schema-catalog.js';

const ordinal = (level: 'low' | 'high') => ({
  allowedLevels: ['low', 'high'],
  level,
  representation: 'ordinal',
  schemaRef: 'salience.ordinal.v1'
});

function salienceEvaluation() {
  return {
    assessment: {
      exigency: { evidenceRefs: ['cidv1-evidence-exigency'], provenanceRefs: ['cidv1-provenance-exigency'], status: 'observed', uncertainty: { status: 'known' }, value: ordinal('high') },
      impact: { evidenceRefs: ['cidv1-evidence-impact'], provenanceRefs: ['cidv1-provenance-impact'], status: 'observed', uncertainty: { status: 'known' }, value: ordinal('high') },
      novelty: { baselineRefs: ['cidv1-expectation'], evidenceRefs: ['cidv1-evidence-novelty'], phenomenonRefs: ['cidv1-phenomenon'], provenanceRefs: ['cidv1-provenance-novelty'], status: 'observed', uncertainty: { status: 'known' }, value: ordinal('low') }
    },
    assessedAt: '2026-10-02T12:00:00.000Z',
    evaluationId: 'salience-evaluation-1',
    profile: { id: 'salience.evaluation.v1', version: '1.0.0' },
    provenanceRefs: ['cidv1-provenance-evaluation'],
    receiptRefs: ['cidv1-receipt-evaluation'],
    scope: { scale: 'event', subjectRefs: ['cidv1-subject-event'] },
    summary: 'Observed event merits attention as represented evidence.',
    validTime: { validAt: '2026-10-02T12:00:00.000Z' },
    verdict: 'pass'
  };
}

describe('salience evaluation Profile', () => {
  it('validates separate impact, exigency, and novelty assessments', () => {
    expect(validatePayload('rosetta.evaluation', salienceEvaluation()).ok).toBe(true);
  });

  it('does not let salience fields grant execution, truth, or activation', () => {
    for (const field of ['executionGrant', 'truth', 'activation']) {
      expect(validatePayload('rosetta.evaluation', { ...salienceEvaluation(), [field]: true }).ok).toBe(false);
    }
  });

  it('rejects fabricated unknown values and unsupported Profile versions', () => {
    const evaluation = salienceEvaluation();
    expect(validatePayload('rosetta.evaluation', { ...evaluation, assessment: { ...evaluation.assessment, impact: { ...evaluation.assessment.impact, status: 'unknown', value: ordinal('high') } } }).ok).toBe(false);
    expect(validatePayload('rosetta.evaluation', { ...evaluation, profile: { id: 'salience.evaluation.v1', version: '2.0.0' } }).ok).toBe(false);
  });

  it('leaves generic Core Evaluation validation unchanged when no Profile is declared', () => {
    expect(validatePayload('rosetta.evaluation', { evaluationId: 'core-1', summary: 'Core evaluation', verdict: 'pass' }).ok).toBe(true);
  });

  it('keeps the nine public salience conformance vectors independently inspectable', async () => {
    const fixtureRoot = resolve(process.cwd(), 'packs/schema-pack-evaluation-profiles/test-vectors/salience');
    const fixtureNames = (await readdir(fixtureRoot)).filter((name) => name.endsWith('.json')).sort();
    expect(fixtureNames).toHaveLength(9);

    for (const fixtureName of fixtureNames) {
      const fixture = JSON.parse(await readFile(resolve(fixtureRoot, fixtureName), 'utf8')) as { expectOk: boolean; payload?: object; payloads?: object[] };
      const payloads = fixture.payloads ?? [fixture.payload];
      expect(payloads.every((payload) => payload && validatePayload('rosetta.evaluation', payload).ok === fixture.expectOk), fixtureName).toBe(true);
    }
  });

  it('catalogs the Profile as a pack-defined evaluation mapping', () => {
    expect(getSchemaCatalogEntry('salience.evaluation.v1')).toMatchObject({
      coreDescent: 'pack-defined-schema',
      relatedCoreKinds: ['rosetta.evaluation'],
      validator: 'validateSalienceEvaluation'
    });
  });
});
