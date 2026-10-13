import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createIncident, verifyTileIntegrity } from '@entif-ai/rosetta-core';
import { validateAuthorityEnvelope } from './authority-envelope.js';
import { getCoreDescent } from './core-descent.js';
import { getSchemaCatalogEntry, validateSchemaCatalogCoverage } from './schema-catalog.js';
import {
  evaluateAgenticMessageExecutionPolicy,
  getAgenticMessageSchemaProfile,
  validateAgenticMessagePayload,
  validatePayload
} from './rosetta-schemas.js';

const authority = JSON.parse(readFileSync('packages/rosetta-schemas/fixtures/authz-v1.json', 'utf8')).child;
const incidentReport = {
  incidentId: 'incident-report-1',
  severity: 'high',
  summary: 'A source raised a suspicious-event candidate.',
  trigger: 'source-alert'
};
const domain = { tenantId: 'tenant-a', classification: 'internal', abacLabels: [] };

describe('envelope family boundaries #1799', () => {
  it('routes an ordinary incident report as inert data, without promoting it to a sealed Core Incident', () => {
    expect(validateAgenticMessagePayload('INCIDENT_ENVELOPE', incidentReport)).toMatchObject({
      ok: true,
      schemaId: 'entif.agentic-messaging.incident-envelope.v1'
    });
    expect(evaluateAgenticMessageExecutionPolicy('INCIDENT_ENVELOPE', incidentReport, domain)).toMatchObject({
      ok: true,
      plane: 'data',
      executorDisposition: 'data-plane-no-side-effects',
      requiresGuardDecision: false
    });
    expect(validatePayload('rosetta.incident', incidentReport)).toMatchObject({
      ok: false,
      errors: expect.arrayContaining(['Missing required field: encryptedBlobRef'])
    });
  });

  it('recognizes the separate Core Incident shape without claiming a live quorum-unseal implementation', () => {
    const tile = createIncident(
      'Sealed research incident',
      'high',
      ['cidv1-run-1'],
      'urn:encrypted:incident-1',
      ['reviewer-a', 'reviewer-b', 'reviewer-c'],
      '2026-10-11T12:00:00Z',
      2
    );
    expect(verifyTileIntegrity(tile).ok).toBe(true);
    expect(validatePayload(tile.kind, tile.payload).ok).toBe(true);
    expect(validatePayload('rosetta.incident', { ...tile.payload, quorumThreshold: 4 }).ok).toBe(false);
    expect(validatePayload('rosetta.incident', { ...tile.payload, encryptedBlobRef: '' }).ok).toBe(false);
  });

  it.each([
    ['unknown severity', { severity: 'uncertain' }, 'rosetta.incident severity must be low, medium, high, or critical.'],
    ['invalid timestamp', { occurredAt: 'tomorrow' }, 'rosetta.incident occurredAt must be an ISO-8601 timestamp.'],
    ['duplicate participants', { sealParticipants: ['reviewer-a', 'reviewer-a'] }, 'rosetta.incident sealParticipants must be a non-empty array of unique references.'],
    ['fractional quorum', { quorumThreshold: 1.5 }, 'rosetta.incident quorumThreshold must be within the number of seal participants.']
  ])('refuses %s on a Core Incident payload', (_label, change, error) => {
    const valid = createIncident(
      'Boundary proof', 'high', [], 'urn:encrypted:report', ['reviewer-a', 'reviewer-b'], '2026-10-11T12:00:00Z', 2
    );
    expect(validatePayload('rosetta.incident', { ...valid.payload, ...change })).toMatchObject({
      ok: false,
      errors: expect.arrayContaining([error])
    });
  });

  it('refuses to construct a purportedly sealed incident with no viable quorum or encrypted reference', () => {
    const create = (participants: string[], threshold?: number, blob = 'urn:encrypted:report') =>
      createIncident('Sealed incident', 'high', [], blob, participants, '2026-10-11T12:00:00Z', threshold);
    expect(() => create([])).toThrow('Invalid Core Incident seal declaration.');
    expect(() => create(['reviewer-a', 'reviewer-a'], 2)).toThrow('Invalid Core Incident seal declaration.');
    expect(() => create(['reviewer-a', 'reviewer-b'], 3)).toThrow('Invalid Core Incident seal declaration.');
    expect(() => create(['reviewer-a', 'reviewer-b'], 0)).toThrow('Invalid Core Incident seal declaration.');
    expect(() => create(['reviewer-a', 'reviewer-b'], 2, '')).toThrow('Invalid Core Incident seal declaration.');
  });

  it('keeps Authority Envelopes separate from transport TTL and Core Incident identity', () => {
    expect(validateAuthorityEnvelope(authority).ok).toBe(true);
    expect(validatePayload('rosetta.incident', authority).ok).toBe(false);
    expect(validateAuthorityEnvelope({ ...authority, expires_at: authority.validity.expiresAt }).ok).toBe(false);
    expect(getSchemaCatalogEntry('authz.authority_envelope.v1')).toMatchObject({ coreDescent: 'governed-extension' });
    expect(getSchemaCatalogEntry('entif.agentic-messaging.envelope.v1')).toMatchObject({ coreDescent: 'implementation-local' });
  });

  it('resolves exact owners and disallows an unqualified universal envelope schema', () => {
    expect(getAgenticMessageSchemaProfile('INCIDENT_ENVELOPE')).toMatchObject({
      schemaId: 'entif.agentic-messaging.incident-envelope.v1',
      plane: 'data'
    });
    expect(getSchemaCatalogEntry('rosetta.incident')).toMatchObject({
      sourceIssues: expect.arrayContaining(['#1799']),
      coreDescent: 'core-tile-profile'
    });
    expect(getCoreDescent('rosetta.envelope', [])).toBeUndefined();
    expect(getSchemaCatalogEntry('rosetta.envelope')).toBeUndefined();
    expect(validateSchemaCatalogCoverage()).toEqual([]);
  });
});
