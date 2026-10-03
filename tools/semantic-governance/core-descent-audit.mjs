import { loadSchemas } from './load-schemas.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';

const root = fileURLToPath(new URL('../../', import.meta.url));
export const riskRegister = [
  { ids: ['rosetta.translation_evidence', 'rosetta.composition_provenance'], risk: 'Reserved namespace suggests Core authority.', disposition: 'retain-local', remediation: 'Keep package-internal legacy IDs; require a namespaced Pack/migration before public exchange.', owner: '#1179' },
  { ids: ['rosetta.conformance_bundle', 'rosetta.shacl_shapes'], risk: 'Generated validation output may appear normative.', disposition: 'projection', remediation: 'Treat bundles and emitted shapes as derived inspection data, not conformance execution or schema authority.', owner: '#240' },
  { ids: ['source.evaluation_receipt', 'source.fetch_receipt', 'source.normalization_receipt', 'source.identity_resolution_receipt'], risk: 'Receipt-like domain records lack canonical claims, digests and signatures.', disposition: 'pack-composition', remediation: 'Domain record is not substitutable for rosetta.receipt; attestation uses canonical receipt evidence/subject refs. No signed conformance claim.', owner: '#158' },
  { ids: ['source.trust_matrix'], risk: 'Trust axes mistaken for a canonical Matrix or universal scalar.', disposition: 'pack-composition', remediation: 'Pack axes remain lane-local inputs; canonical Matrix conversion needs explicit axis/version/subject mapping. No equivalence claim.', owner: '#803' },
  { ids: ['source.package'], risk: 'Source grouping confused with a protocol extension Pack or PACKID.', disposition: 'governed-composition', remediation: 'Membership grouping is source-domain data related to Frame composition, not a Pack manifest or release.', owner: '#1179' },
  { ids: ['source.ingress_job'], risk: 'Mutable job shorthand obscures immutable lifecycle history.', disposition: 'lifecycle-state', remediation: 'Append new state artifacts with lineage; operational scheduling remains downstream.', owner: '#1211' },
  { ids: ['skill.card', 'adapter.capability_manifest', 'guard.decision_token'], risk: 'Admission ownership mistaken for semantic Core status or authorization execution.', disposition: 'implementation-local', remediation: 'Keep governed application contracts; schemas do not grant execution authority.', owner: '#1179' },
  { ids: ['entif.daily_top_shelf_digest', 'entif.postmortem_artifact', 'entif.intake_envelope', 'entif.domain_ref.v1'], risk: 'Product records become universal semantic roots.', disposition: 'application-or-projection', remediation: 'Retain qualified application owners; digest is a projection. No Core expansion.', owner: '#1179' },
  { ids: ['rrp.promotion-state.v1'], risk: 'State hidden in prose or caller assertion.', disposition: 'resolved-profile', remediation: '#1698 declares Observation specialization and exact predecessor/receipt closure.', owner: '#1698' }
];

export async function buildAudit(catalog, base = root) {
  const rows = [];
  for (const entry of catalog) {
    const bytes = await readFile(path.join(base, entry.descentAuthority));
    rows.push({ schemaId: entry.schemaId, coreDescent: entry.coreDescent,
      authority: { path: entry.descentAuthority, sha256: createHash('sha256').update(bytes).digest('hex') },
      findings: riskRegister.filter((risk) => risk.ids.includes(entry.schemaId)),
      review: entry.family === 'agentic-messaging' ? 'Transport/application labels, including TASK_RECEIPT and INCIDENT_ENVELOPE, do not prove canonical Receipt/Incident semantics.' : 'Classification reviewed against owning contract.',
      knownGaps: entry.knownGaps });
  }
  return { formatVersion: 1, issue: '#1179', scope: 'all schema catalog entries and first-wave Pack assets',
    coreGapCandidates: [], conclusion: 'No irreducible Core gap found. Existing Core composition, governed extensions and explicit application boundaries suffice.',
    packAssets: ['packs/_schemas/pack-manifest.schema.json', 'packs/stdpack-source-substrate/schema/source-substrate.schema.json', 'packs/stdpack-source-substrate/vocab/source-substrate.ttl', 'packs/vocabpack-source-taxonomy/vocab/source-taxonomy.ttl'].map((source) => ({ source, disposition: source.includes('/vocab/') ? 'controlled-vocabulary' : 'pack-defined-schema' })), rows };
}

export async function checkAudit({ write = false } = {}) {
  const schemas = await loadSchemas(root);
  const errors = schemas.validateSchemaCatalogCoverage();
  if (errors.length) throw new Error(errors.join('\n'));
  const report = await buildAudit(schemas.ROSETTA_SCHEMA_CATALOG);
  const bytes = `${JSON.stringify(report, null, 2)}\n`;
  const output = path.join(root, 'docs/governance/CORE_DESCENT_AUDIT.json');
  if (write) await writeFile(output, bytes);
  else if (await readFile(output, 'utf8') !== bytes) throw new Error('Core-descent audit drift. Run pnpm governance:descent:generate.');
  return report;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkAudit({ write: process.argv.includes('--write') }).then((report) => process.stdout.write(`Core-descent audit passed: ${report.rows.length} entries.\n`)).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
