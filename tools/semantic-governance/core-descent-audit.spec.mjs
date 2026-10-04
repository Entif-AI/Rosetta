import { describe, expect, it } from 'vitest';
import { loadSchemas } from './load-schemas.mjs';
import { buildAudit } from './core-descent-audit.mjs';
const schemas = await loadSchemas();

describe('first-wave Core-descent audit #1179', () => {
  it('classifies emitted shapes as a projection and append-only jobs as lifecycle state', () => {
    expect(schemas.getSchemaCatalogEntry('rosetta.shacl_shapes').coreDescent).toBe('derived-projection');
    expect(schemas.getSchemaCatalogEntry('source.ingress_job').coreDescent).toBe('lifecycle-state');
  });
  it('covers every schema and records each known gap without claiming new Core authority', async () => {
    const report = await buildAudit(schemas.ROSETTA_SCHEMA_CATALOG);
    expect(report.rows.map((row) => row.schemaId)).toEqual(schemas.ROSETTA_SCHEMA_CATALOG.map((row) => row.schemaId));
    expect(report.coreGapCandidates).toEqual([]);
    expect(report.rows.every((row) => row.authority.sha256.length === 64)).toBe(true);
    for (const row of report.rows) expect(row.knownGaps).toEqual(schemas.getSchemaCatalogEntry(row.schemaId).knownGaps);
    expect(report.rows.find((row) => row.schemaId === 'source.package').findings[0].remediation).toMatch(/not a Pack/);
  });
  it('prevents source receipt-like records from satisfying canonical Receipt validation', () => {
    expect(schemas.validatePayload('source.evaluation_receipt', { evaluatedAt: 'fixture', policyRefs: [], subjectCid: 'subject', trustMatrixCid: 'matrix' }).ok).toBe(true);
    expect(schemas.validatePayload('rosetta.receipt', { evaluatedAt: 'fixture', policyRefs: [], subjectCid: 'subject', trustMatrixCid: 'matrix' }).ok).toBe(false);
  });
});
