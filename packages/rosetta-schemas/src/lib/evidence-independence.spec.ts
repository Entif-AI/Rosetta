import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  appendEvidenceIndependence, createEvidenceIndependence, parseEvidenceIndependence,
  EVIDENCE_INDEPENDENCE_SCHEMA, type EvidenceIndependenceAssessment,
  type IndependenceSubject, type IndependenceLineage, type IndependenceDeclaration,
  type IndependenceScope
} from './evidence-independence.js';

const subject = (id: string, origin: IndependenceSubject['origin'] = 'original'): IndependenceSubject => ({
  id, record: { ref: 'record:' + id, version: '1', cid: null },
  manifestation: { ref: 'manifestation:' + id, version: '1', cid: 'digest:' + id },
  ancestry: 'complete', origin, evidenceRefs: ['evidence:' + id]
});
const edge = (descendant: string, ancestor: string, kind: IndependenceLineage['kind'] = 'derivation'): IndependenceLineage =>
  ({ descendant, ancestor, kind, evidenceRefs: ['lineage:' + descendant + ':' + ancestor] });
const declared = (a: string, b: string, kind: IndependenceDeclaration['kind']): IndependenceDeclaration =>
  ({ members: [a, b], kind, evidenceRefs: ['assessment-evidence:independent-methods'] });
const body = (subjects: IndependenceSubject[], scope: IndependenceScope, edges: IndependenceLineage[] = [],
  declarations: IndependenceDeclaration[] = []): Omit<EvidenceIndependenceAssessment, 'recordId' | 'outcome'> => ({
  profile: { id: 'evidence.independence.v1', version: '1.0.0' },
  assessmentRef: 'assessment:bounded-comparison', supersedesRef: null, observedAt: '2026-01-01T00:00:00Z',
  methodRef: 'method:declared-lineage-v1', scope, subjects, edges, declarations,
  frontier: { ref: 'frontier:1', coverage: 'complete', unresolvedRefs: [], evidenceRefs: ['receipt:ancestry'] },
  explanationRefs: ['evidence:explanation'], correctionRefs: [], revalidationRefs: [], receiptRefs: ['receipt:bounded-assessment']
});
const pair = (a = 'a', b = 'b'): IndependenceScope => ({ kind: 'pair', members: [a, b] });
const independent = () => body([subject('a'), subject('b')], pair(), [], [declared('a', 'b', 'independent-origins')]);

describe('bounded evidence independence #1597', () => {
  it('four different documents from one primary source remain common-source evidence', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const value = createEvidenceIndependence(body(
      [subject('primary'), ...ids.map(id => subject(id, 'derived'))],
      { kind: 'set', members: ids }, ids.map(id => edge(id, 'primary', 'summary'))));
    expect(value.outcome).toBe('COMMON_SOURCE');
    expect(parseEvidenceIndependence(value)).toEqual(value);
  });
  it('two independently evidenced measurements, not merely different hashes, support independent origins', () => {
    expect(createEvidenceIndependence(independent()).outcome).toBe('INDEPENDENT');
    expect(createEvidenceIndependence(body([subject('a'), subject('b')], pair())).outcome).toBe('INDEPENDENCE_UNKNOWN');
  });
  it('shared dataset with separately evidenced analyses is partial, scoped to its named cluster', () => {
    const input = body([subject('data'), subject('a', 'derived'), subject('b', 'derived'), subject('unrelated')],
      { kind: 'cluster', clusterRef: 'cluster:analysis', members: ['a', 'b'] },
      [edge('a', 'data', 'dataset-use'), edge('b', 'data', 'dataset-use')], [declared('a', 'b', 'independent-analyses')]);
    expect(createEvidenceIndependence(input).outcome).toBe('PARTIALLY_INDEPENDENT');
    expect(createEvidenceIndependence({ ...input, declarations: [] }).outcome).toBe('COMMON_SOURCE');
  });
  it('mirror and original with distinct record, manifestation and bytes remain a copy', () => {
    expect(createEvidenceIndependence(body([subject('a'), subject('b', 'derived')], pair(),
      [edge('b', 'a', 'mirror')])).outcome).toBe('DERIVED_COPY');
  });
  it('translated summary preserves transitive dependence', () => {
    expect(createEvidenceIndependence(body([subject('a'), subject('summary', 'derived'), subject('b', 'derived')], pair(),
      [edge('summary', 'a', 'summary'), edge('b', 'summary', 'translation')])).outcome).toBe('DERIVED_COPY');
  });
  it('syndication is distinct from independent publication', () => {
    expect(createEvidenceIndependence(body([subject('a'), subject('b', 'derived')], pair(),
      [edge('b', 'a', 'syndication')])).outcome).toBe('SYNDICATED');
  });
  it('Rosetta export and re-ingest preserve the self-echo path', () => {
    const input = body([subject('source'), subject('a', 'rosetta'), subject('published', 'derived'), subject('b', 'derived')], pair(),
      [edge('a', 'source'), edge('published', 'a', 'export'), edge('b', 'published', 're-ingest')]);
    expect(createEvidenceIndependence(input).outcome).toBe('SELF_REFERENTIAL_LINEAGE');
    expect(createEvidenceIndependence({ ...input, edges: [edge('a', 'source'), edge('published', 'a'), edge('b', 'published', 're-ingest')] }).outcome).toBe('DERIVED_COPY');
  });
  it('missing ancestry cannot manufacture corroboration and corrections retain earlier evidence', () => {
    const input = independent();
    input.subjects[1].ancestry = 'unknown';
    input.frontier = { ref: 'frontier:1', coverage: 'partial', unresolvedRefs: ['record:b:ancestry'], evidenceRefs: [] };
    const prior = createEvidenceIndependence(input);
    expect(prior.outcome).toBe('INDEPENDENCE_UNKNOWN');
    const corrected = createEvidenceIndependence({ ...independent(), observedAt: '2026-01-02T00:00:00Z',
      supersedesRef: prior.recordId, correctionRefs: ['correction:1'], revalidationRefs: ['revalidation:1'] });
    expect(corrected.outcome).toBe('INDEPENDENT');
    expect(appendEvidenceIndependence([prior], corrected)).toEqual([prior, corrected]);
    expect(appendEvidenceIndependence([prior, corrected], corrected)).toEqual([prior, corrected]);
    expect(() => appendEvidenceIndependence([], corrected)).toThrow(/succession/);
    expect(() => createEvidenceIndependence({ ...independent(), supersedesRef: prior.recordId })).toThrow(/revalidation/);
  });
  it('known ancestry cannot disappear behind another manifestation of the same stable record', () => {
    const a = subject('a'), alias = subject('a-alternate', 'derived'), b = subject('b', 'derived');
    alias.record = { ...a.record! };
    const input = body([a, alias, b, subject('primary')], pair(), [
      edge(alias.id, 'primary', 'translation'), edge('b', 'primary', 'summary')
    ]);
    expect(createEvidenceIndependence(input).outcome).toBe('COMMON_SOURCE');
    expect(() => createEvidenceIndependence({ ...input, declarations: [declared('a', 'b', 'independent-origins')] })).toThrow(/shared lineage/);
    const copied = { ...input, edges: [edge(alias.id, 'primary', 'translation'), edge('b', alias.id, 'mirror')] };
    expect(createEvidenceIndependence(copied).outcome).toBe('DERIVED_COPY');
  });
  it('export and re-ingest remain self-echo across exact artifact aliases without inferring events from stable identity alone', () => {
    const exported = subject('published', 'derived'), alternate = subject('alternate');
    alternate.record = { ...exported.record! };
    const differentManifestation = { ...alternate.manifestation! };
    alternate.manifestation = { ...exported.manifestation! };
    const input = body([subject('a', 'rosetta'), exported, alternate, subject('b', 'derived')], pair(), [
      edge('published', 'a', 'export'), edge('b', 'alternate', 're-ingest')
    ]);
    expect(createEvidenceIndependence(input).outcome).toBe('SELF_REFERENTIAL_LINEAGE');
    expect(createEvidenceIndependence({ ...input, edges: [edge('published', 'a', 'summary'), edge('b', 'alternate', 're-ingest')] }).outcome).toBe('DERIVED_COPY');
    alternate.manifestation = differentManifestation;
    expect(createEvidenceIndependence(input).outcome).toBe('COMMON_SOURCE');
  });
  it('two signatures over a copied payload cannot establish independence', () => {
    const a = subject('a'), b = subject('b', 'derived');
    b.manifestation = { ...b.manifestation!, cid: a.manifestation!.cid };
    b.evidenceRefs = ['signature:second'];
    a.evidenceRefs = ['signature:first'];
    const input = body([a, b], pair(), [edge('b', 'a', 'quotation')]);
    expect(createEvidenceIndependence(input).outcome).toBe('DERIVED_COPY');
    expect(() => createEvidenceIndependence({ ...input, declarations: [declared('a', 'b', 'independent-origins')] })).toThrow(/shared lineage/);
  });
  it('rights-restricted references establish bounded declared lineage without source bodies', () => {
    const a = subject('a'), b = subject('b', 'derived');
    a.evidenceRefs = ['restricted:receipt-a']; b.evidenceRefs = ['restricted:receipt-b'];
    const value = createEvidenceIndependence(body([a, b], pair(), [edge('b', 'a')]));
    expect(value.outcome).toBe('DERIVED_COPY');
    expect(JSON.stringify(value)).not.toContain('sourceBody');
    expect(() => parseEvidenceIndependence({ ...value, authorized: true })).toThrow(/additional properties/);
  });
  it('rejects fabricated completeness, cycles, missing edges, unsupported analysis and digest mutation', () => {
    const input = independent();
    expect(() => createEvidenceIndependence({ ...input, subjects: [subject('a'), subject('b', 'derived')] })).toThrow(/complete ancestry/);
    expect(() => createEvidenceIndependence({ ...input, edges: [edge('b', 'missing')] })).toThrow(/lineage edge/);
    expect(() => createEvidenceIndependence({ ...input, subjects: [subject('a', 'derived'), subject('b', 'derived')],
      edges: [edge('a', 'b'), edge('b', 'a')] })).toThrow(/Cyclic/);
    expect(() => createEvidenceIndependence({ ...input, declarations: [declared('a', 'b', 'independent-analyses')] })).toThrow(/contradicts/);
    const valid = createEvidenceIndependence(input);
    expect(() => parseEvidenceIndependence({ ...valid, outcome: 'COMMON_SOURCE' })).toThrow(/digest/);
    const clone = parseEvidenceIndependence(valid);
    clone.subjects[0].evidenceRefs.push('tampered');
    expect(valid.subjects[0].evidenceRefs).toEqual(['evidence:a']);
  });
  it('matches the exported Pack schema', () => {
    expect(JSON.parse(readFileSync('packs/schema-pack-evidence-independence/schema/evidence-independence.schema.json', 'utf8'))).toEqual(EVIDENCE_INDEPENDENCE_SCHEMA);
  });
});
