import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTile, verifyTileIntegrity } from '@entif-ai/rosetta-core';
import { parseAuthorityEnvelope, validateAuthorityDelegation, validateAuthorityEnvelope, AUTHORITY_ENVELOPE_SCHEMA } from './authority-envelope.js';
import { getSchemaCatalogEntry, validateSchemaCatalogCoverage } from './schema-catalog.js';
import { validatePayload } from './rosetta-schemas.js';

const fixtures = JSON.parse(readFileSync('packages/rosetta-schemas/fixtures/authz-v1.json', 'utf8'));
const parent = () => structuredClone(fixtures.parent);
const child = () => structuredClone(fixtures.child);

describe('Authority Envelope Profile #1746', () => {
  it('exports a governed extension with its public JSON Schema', () => {
    expect(getSchemaCatalogEntry('authz.authority_envelope.v1')).toMatchObject({ coreDescent: 'governed-extension', authorityTier: 'governance-admission', validator: 'validateAuthorityEnvelope' });
    expect(validateSchemaCatalogCoverage()).toEqual([]);
    expect(JSON.parse(readFileSync('packages/rosetta-schemas/docs/authority-envelope-v1.schema.json', 'utf8'))).toEqual(AUTHORITY_ENVELOPE_SCHEMA);
  });
  it('validates an attenuated projection through the standard Core wrapper', () => {
    const value = parseAuthorityEnvelope(child());
    expect(validateAuthorityDelegation(value, parseAuthorityEnvelope(parent())).ok).toBe(true);
    const tile = buildTile('authz.authority_envelope.v1', value, { pack: 'authz', parents: value.delegation.lineageRefs });
    expect(verifyTileIntegrity(tile).ok).toBe(true);
    expect(validatePayload(tile.kind, tile.payload).ok).toBe(true);
    expect(value.actorEvidenceRefs).toEqual([]);
  });
  for (const { name, value } of fixtures.represented) it(`preserves ${name} even with intact integrity`, () => {
    expect(parseAuthorityEnvelope(value).validity.state).toBe(name);
    expect(verifyTileIntegrity(buildTile('authz.authority_envelope.v1', value)).ok).toBe(true);
    expect(validateAuthorityEnvelope(value)).not.toHaveProperty('effect');
  });
  it.each(['rosetta.receipt', 'iam.decision', 'adapter.capability_manifest', 'prompt', 'role'])('rejects %s as an authority source role', kind => {
    const value = child(); value.authoritySources = [{ kind, ref: 'urn:untrusted:claim' }];
    expect(validateAuthorityEnvelope(value).ok).toBe(false);
  });
  it('rejects missing target, unknown states, malformed timestamps and authority fields', () => {
    const missing = child(); delete missing.scope.target;
    const unknown = child(); unknown.validity.state = 'unknown';
    const time = child(); time.validity.expiresAt = 'tomorrow';
    const empty = child(); empty.authoritySources = [];
    const fake = child(); fake.grant = true;
    for (const value of [null, [], missing, unknown, time, empty, fake]) expect(validateAuthorityEnvelope(value).ok).toBe(false);
  });
  it('retains target, policy and source frontier drift for explicit current-state evaluation', () => {
    for (const field of ['target', 'policy', 'source']) {
      const value = child();
      if (field === 'target') {
        value.scope.target.resourceRef = 'urn:repo:other';
        value.delegation.ceiling.target.resourceRef = 'urn:repo:other';
      }
      if (field === 'policy') value.policy.frontierRef = 'urn:policy-frontier:stale';
      if (field === 'source') value.provenance.sourceFrontierRef = 'urn:source-frontier:stale';
      expect(parseAuthorityEnvelope(value)).toEqual(value);
      expect(value).not.toEqual(fixtures.child);
    }
  });
  it.each(['operation', 'effect', 'target', 'domain', 'context', 'depth', 'parent', 'lineage', 'expiry', 'policy', 'sources'])('rejects child %s amplification or broken lineage', field => {
    const value = child();
    if (field === 'operation') value.scope.operations.push('delete');
    if (field === 'effect') value.scope.effects.push('payment');
    if (field === 'target') value.scope.target.resourceRef = 'urn:repo:other';
    if (field === 'domain') value.scope.target.domainRef.tenantId = 'tenant-b';
    if (field === 'context') value.contextConstraints = {};
    if (field === 'depth') value.delegation.depthRemaining = 3;
    if (field === 'parent') value.delegation.parentEnvelopeRef = 'urn:authz:other';
    if (field === 'lineage') value.delegation.lineageRefs = [];
    if (field === 'expiry') value.validity.expiresAt = '2026-10-07T00:00:00Z';
    if (field === 'policy') value.policy.version = 'other';
    if (field === 'sources') value.authoritySources[0].ref = 'urn:authority:other';
    expect(validateAuthorityDelegation(value, parent()).ok).toBe(false);
  });
  it('rejects further delegation when the parent does not permit it', () => {
    const value = parent(); value.delegation.furtherDelegation = false;
    expect(validateAuthorityDelegation(child(), value).ok).toBe(false);
  });
});
