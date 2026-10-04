import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { validateSalienceEvaluation } from './salience-profile.js';

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
  it('rejects escalation at every owned nested boundary and invalid Core verdicts', () => {
    for (const path of ['profile', 'scope', 'validTime', 'assessment.impact.uncertainty']) {
      const payload = salienceEvaluation() as unknown as Record<string, unknown>;
      let target = payload;
      for (const key of path.split('.')) target = target[key] as Record<string, unknown>;
      target.executionGrant = true;
      expect(validateSalienceEvaluation(payload).ok, path).toBe(false);
    }
    expect(validateSalienceEvaluation({ ...salienceEvaluation(), verdict: 'activate' }).ok).toBe(false);
    expect(validateSalienceEvaluation(null).ok).toBe(false);
  });

  it('checks value encodings, finite numbers, references, baseline and valid time', () => {
    const invalidValues = [
      { representation: 'scalar', schemaRef: 's', value: NaN },
      { representation: 'scalar', schemaRef: 's', value: Infinity },
      { representation: 'scalar', schemaRef: 's', value: 1, level: 'high' },
      { representation: 'ordinal', schemaRef: 's', level: 'high', allowedLevels: [] },
      { representation: 'opaque', schemaRef: 's', value: {} }
    ];
    for (const value of invalidValues) {
      const payload = salienceEvaluation();
      expect(validateSalienceEvaluation({ ...payload, assessment: { ...payload.assessment, impact: { ...payload.assessment.impact, value } } }).ok).toBe(false);
    }
    expect(validateSalienceEvaluation({ ...salienceEvaluation(), assessedAt: '2026-02-30T12:00:00Z' }).ok).toBe(false);
    expect(validateSalienceEvaluation({ ...salienceEvaluation(), validTime: { validFrom: '2026-10-03T00:00:00Z', validTo: '2026-10-02T00:00:00Z' } }).ok).toBe(false);
    expect(validateSalienceEvaluation({ ...salienceEvaluation(), receiptRefs: [''] }).ok).toBe(false);
    expect(validateSalienceEvaluation({ ...salienceEvaluation(), validTime: { validFrom: '2026-10-02T00:00:00.000000002Z', validTo: '2026-10-02T00:00:00.000000001Z' } }).ok).toBe(false);
    const payload = salienceEvaluation();
    expect(validateSalienceEvaluation({ ...payload, assessment: { ...payload.assessment, novelty: { ...payload.assessment.novelty, baselineRefs: [] } } }).ok).toBe(false);
    expect(validateSalienceEvaluation({ ...payload, assessment: { ...payload.assessment, impact: { ...payload.assessment.impact, value: { representation: 'reference', schemaRef: 'fixture.vector.schema', valueRef: 'fixture.vector.1' } } } }).ok).toBe(true);
  });

  it('validates public vectors and boundary failures with the portable JSON Schema', async () => {
    const ajv = new Ajv2020({ strict: false });
    addFormats(ajv);
    const schema = JSON.parse(await readFile(resolve(process.cwd(), 'packs/schema-pack-evaluation-profiles/schema/salience-evaluation.schema.json'), 'utf8'));
    const validate = ajv.compile(schema);
    const fixtures = resolve(process.cwd(), 'packs/schema-pack-evaluation-profiles/test-vectors/salience');
    for (const name of await readdir(fixtures)) {
      const vector = JSON.parse(await readFile(resolve(fixtures, name), 'utf8'));
      for (const payload of vector.payloads ?? [vector.payload]) expect(validate(payload), name).toBe(vector.expectOk);
    }
    for (const path of ['profile', 'scope', 'validTime', 'assessment.impact.uncertainty']) {
      const payload = salienceEvaluation() as unknown as Record<string, unknown>;
      let target = payload;
      for (const key of path.split('.')) target = target[key] as Record<string, unknown>;
      target.truth = true;
      expect(validate(payload), path).toBe(false);
    }
    const payload = salienceEvaluation();
    const invalid = { ...payload, assessment: { ...payload.assessment, impact: { ...payload.assessment.impact, value: { representation: 'scalar', schemaRef: 's', value: 'large' } } } };
    expect(validate(invalid)).toBe(false);
    expect(validate({ ...payload, verdict: 'activate' })).toBe(false);
    expect(validate({ ...payload, assessedAt: '2016-12-31T23:59:60Z' })).toBe(false);
  });

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

  it('catalogs the Pack-defined Profile as an Evaluation specialization', () => {
    expect(getSchemaCatalogEntry('salience.evaluation.v1')).toMatchObject({
      coreDescent: 'core-tile-profile',
      relatedCoreKinds: ['rosetta.evaluation'],
      validator: 'validateSalienceEvaluation'
    });
  });
});
