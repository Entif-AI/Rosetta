import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';
import { validatePayload } from './rosetta-schemas.js';
import { getSchemaCatalogEntry } from './schema-catalog.js';

import { describe, expect, it } from 'vitest';

import { COUNTERFACTUAL_PROFILE, validateCounterfactualEvaluation } from './counterfactual-profile.js';

const addFormats = addFormatsModule.default ?? addFormatsModule;

export function counterfactualFixture(): Record<string, unknown> {
  return {
    evaluationId: 'fixture.counterfactual.equivalent.1',
    summary: 'Synthetic deterministic candidate matches a historical decision.',
    verdict: 'pass',
    profile: { ...COUNTERFACTUAL_PROFILE },
    historical: {
      subjectRefs: ['fixture.strategy-episode.1'],
      decisionRef: 'fixture.routing-judgment.1',
      evidenceCutoff: {
        frontierRef: 'fixture.frontier.frozen.1',
        availableAt: '2026-09-01T12:00:00Z',
        inputRefs: ['fixture.observation.input.1'],
        excludedLaterEvidenceRefs: ['fixture.observation.later.1']
      },
      context: {
        authorityRefs: ['fixture.authority.1'], policyRefs: ['fixture.policy.1'],
        modelRefs: [], runtimeRefs: ['fixture.runtime.1'],
        profileRefs: ['fixture.profile.1'], budgetRefs: ['fixture.budget.1']
      }
    },
    candidate: { mechanismRef: 'fixture.mechanism.deterministic.1', version: '1.0.0', class: 'deterministic-procedure' },
    replay: { state: 'replayable', runRefs: ['fixture.run.shadow.1'], mode: 'no-live-effect', liveEffects: 'none' },
    comparison: {
      criteriaRef: 'fixture.criteria.1', comparatorRefs: ['fixture.comparator.1'],
      verifierRefs: ['fixture.verifier.1'], qualityObservationRefs: ['fixture.observation.quality.1'],
      exceptionObservationRefs: [], latencyObservationRefs: [], computeObservationRefs: [],
      tokenObservationRefs: [], costObservationRefs: ['fixture.observation.cost.1'],
      maintenanceObservationRefs: [], revalidationObservationRefs: []
    },
    disposition: 'equivalent-within-declared-criteria',
    validityScope: { scopeRef: 'fixture.scope.1', description: 'Only this authored synthetic input frontier.' },
    evidenceRefs: ['fixture.observation.input.1'], counterEvidenceRefs: [],
    provenanceRefs: ['fixture.experiment.1'], receiptRefs: ['fixture.receipt.1'],
    supersedesRefs: [], laterEvaluationRefs: []
  };
}

describe('counterfactual mechanism evaluation Profile', () => {
  it('rejects undeclared nested authority, missing sandbox and invalid cutoff dates', () => {
    for (const path of ['profile', 'historical', 'historical.evidenceCutoff', 'historical.context', 'candidate', 'replay', 'comparison', 'validityScope']) {
      const fixture = counterfactualFixture();
      let nested = fixture;
      for (const field of path.split('.')) nested = nested[field] as Record<string, unknown>;
      nested.executionGrant = true;
      expect(validateCounterfactualEvaluation(fixture).ok, path).toBe(false);
    }
    const fixture = counterfactualFixture();
    ((fixture.historical as Record<string, unknown>).evidenceCutoff as Record<string, unknown>).availableAt = '2026-02-30T00:00:00Z';
    expect(validateCounterfactualEvaluation(fixture).ok).toBe(false);
    const replay = counterfactualFixture().replay as object;
    expect(validateCounterfactualEvaluation({ ...counterfactualFixture(), replay: { ...replay, mode: 'sandbox' } }).ok).toBe(false);
    expect(validateCounterfactualEvaluation({ ...counterfactualFixture(), replay: { ...replay, mode: 'sandbox', sandboxRef: 'fixture.sandbox.1' } }).ok).toBe(true);
    expect(validateCounterfactualEvaluation({ ...counterfactualFixture(), verdict: 'activate' }).ok).toBe(false);
    expect(validateCounterfactualEvaluation({ ...counterfactualFixture(), supersedesRefs: ['fixture.counterfactual.equivalent.1'] }).ok).toBe(false);
  });

  it('routes the Profile through the existing Evaluation kind and schema catalog', () => {
    expect(validatePayload('rosetta.evaluation', counterfactualFixture()).ok).toBe(true);
    expect(validatePayload('rosetta.evaluation', { ...counterfactualFixture(), productionActivation: true }).ok).toBe(false);
    expect(getSchemaCatalogEntry(COUNTERFACTUAL_PROFILE.id)).toMatchObject({ coreDescent: 'core-tile-profile', relatedCoreKinds: ['rosetta.evaluation'], validator: 'validateCounterfactualEvaluation' });
  });

  it('validates nine independently readable public fixture cases and their portable schema', async () => {
    const root = resolve(process.cwd(), 'packs/schema-pack-evaluation-profiles');
    const ajv = new Ajv2020({ strict: false }); addFormats(ajv);
    const validate = ajv.compile(JSON.parse(await readFile(resolve(root, 'schema/counterfactual-evaluation.schema.json'), 'utf8')));
    const names = (await readdir(resolve(root, 'test-vectors/counterfactual'))).filter((name) => name.endsWith('.json'));
    expect(names).toHaveLength(9);
    for (const name of names) {
      const vector = JSON.parse(await readFile(resolve(root, 'test-vectors/counterfactual', name), 'utf8'));
      for (const payload of vector.payloads ?? [vector.payload]) {
        const before = structuredClone(payload);
        expect(validateCounterfactualEvaluation(payload).ok, name).toBe(vector.expectOk);
        expect(validate(payload), name).toBe(vector.expectOk);
        expect(payload).toEqual(before);
      }
    }
    expect(validate({ ...counterfactualFixture(), receiptRefs: [] })).toBe(false);
  });

  it('validates the nine declared public fixture cases without changing their data', () => {
    const equivalent = counterfactualFixture();
    const exception = { ...counterfactualFixture(), evaluationId: 'fixture.exception.1', disposition: 'inconclusive',
      comparison: { ...(equivalent.comparison as object), exceptionObservationRefs: ['fixture.exception.missed.1'] } };
    const worse = { ...counterfactualFixture(), evaluationId: 'fixture.worse.1', disposition: 'worse' };
    const partial = { ...counterfactualFixture(), evaluationId: 'fixture.partial.1', verdict: 'partial', disposition: 'inconclusive',
      replay: { state: 'partially-replayable', runRefs: ['fixture.run.partial.1'], mode: 'no-live-effect', liveEffects: 'none' } };
    const laterExcluded = { ...counterfactualFixture(), evaluationId: 'fixture.later-excluded.1', counterEvidenceRefs: ['fixture.observation.later.1'] };
    const rejectedEffect = { ...counterfactualFixture(), evaluationId: 'fixture.effect-rejected.1', verdict: 'fail', disposition: 'invalid',
      replay: { ...(equivalent.replay as object), effectAttempt: { requestRef: 'fixture.request.live.1', disposition: 'rejected', receiptRef: 'fixture.receipt.denied.1' } } };
    const inconclusive = { ...counterfactualFixture(), evaluationId: 'fixture.unresolved.1', verdict: 'unknown', disposition: 'inconclusive' };
    const reassessment = { ...counterfactualFixture(), evaluationId: 'fixture.reassessment.2', supersedesRefs: ['fixture.counterfactual.equivalent.1'] };
    const cases = [equivalent, exception, worse, partial, laterExcluded, rejectedEffect, inconclusive, reassessment];
    for (const fixture of cases) {
      const before = structuredClone(fixture);
      expect(validateCounterfactualEvaluation(fixture), fixture.evaluationId as string).toEqual({ errors: [], ok: true });
      expect(fixture).toEqual(before);
    }
    expect(validateCounterfactualEvaluation({ ...equivalent, productionActivation: true }).ok).toBe(false);
    expect(reassessment.supersedesRefs).toContain(equivalent.evaluationId);
  });

  it('keeps later evidence outside historical inputs and never accepts a live effect', () => {
    const fixture = counterfactualFixture();
    const historical = fixture.historical as { evidenceCutoff: Record<string, unknown> };
    historical.evidenceCutoff.inputRefs = ['fixture.observation.later.1'];
    expect(validateCounterfactualEvaluation(fixture).ok).toBe(false);
    expect(validateCounterfactualEvaluation({ ...counterfactualFixture(), replay: {
      state: 'replayable', runRefs: ['fixture.run.1'], mode: 'no-live-effect', liveEffects: 'performed'
    } }).ok).toBe(false);
  });

  it('fails visibly on missing identity, unsupported versions and incomplete comparison proof', () => {
    expect(validateCounterfactualEvaluation(null).ok).toBe(false);
    expect(validateCounterfactualEvaluation({ ...counterfactualFixture(), profile: { ...COUNTERFACTUAL_PROFILE, version: '2.0.0' } }).ok).toBe(false);
    expect(validateCounterfactualEvaluation({ ...counterfactualFixture(), evaluationId: '' }).ok).toBe(false);
    expect(validateCounterfactualEvaluation({ ...counterfactualFixture(), receiptRefs: [] }).ok).toBe(false);
    const fixture = counterfactualFixture();
    (fixture.comparison as Record<string, unknown>).qualityObservationRefs = [];
    expect(validateCounterfactualEvaluation(fixture).ok).toBe(false);
  });

  it('represents absent history and measurements without fabricating a zero or successful replay', () => {
    const fixture = counterfactualFixture();
    fixture.verdict = 'unknown';
    fixture.disposition = 'non-replayable';
    fixture.replay = { state: 'non-replayable', runRefs: [], mode: 'no-live-effect', liveEffects: 'none' };
    fixture.comparison = { criteriaRef: 'fixture.criteria.1', comparatorRefs: [], verifierRefs: [],
      qualityObservationRefs: [], exceptionObservationRefs: [], latencyObservationRefs: [],
      computeObservationRefs: [], tokenObservationRefs: [], costObservationRefs: [],
      maintenanceObservationRefs: [], revalidationObservationRefs: [] };
    expect(validateCounterfactualEvaluation(fixture)).toEqual({ errors: [], ok: true });
    expect(JSON.stringify(fixture)).not.toContain('"cost":0');
    fixture.disposition = 'better';
    expect(validateCounterfactualEvaluation(fixture).ok).toBe(false);
  });
});
