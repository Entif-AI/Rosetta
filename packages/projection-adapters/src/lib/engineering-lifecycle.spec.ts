import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildEngineeringLifecycleProjection, inspectEngineeringLifecycle } from './engineering-lifecycle.js';
import { parseEngineeringLifecycleSource, canonicalTraceJson, traceHash } from '@entif-ai/rosetta-schemas';

const fixture = () => JSON.parse(readFileSync('tools/engineering-evidence/fixtures/jcs-1693.json', 'utf8'));

describe('engineering lifecycle into existing trace evidence lanes', () => {
  it('reconstructs real JCS work through independently verified integration without a transcript', () => {
    const input = parseEngineeringLifecycleSource(fixture());
    const output = buildEngineeringLifecycleProjection(input);
    const inspection = inspectEngineeringLifecycle(output.projection);
    expect(inspection.workRef).toBe('https://github.com/Entif-AI/Rosetta/issues/1693');
    expect(inspection.records.map(r => r.event)).toEqual(['declared', 'completed', 'verification_accepted', 'integrated']);
    expect(inspection.sources.some(s => s.role === 'plan' && s.ref.includes('jcs-001'))).toBe(true);
    expect(inspection.sources.filter(s => s.role === 'hosted-verification')).toHaveLength(2);
    expect(inspection.validationRelations).toEqual(input.validationRelations);
    expect(inspection.currentState).toMatchObject({ execution: { state: 'completed' }, verification: { state: 'accepted' }, integration: { state: 'integrated' } });
    expect(inspection.limitations).toContain('Historical executor identity is not durably exposed.');
  });
  it('preserves exact external source references and deterministic closure on repeated rebuild', () => {
    const input = parseEngineeringLifecycleSource(fixture());
    const first = buildEngineeringLifecycleProjection(input);
    expect(buildEngineeringLifecycleProjection(structuredClone(input))).toEqual(first);
    expect(first.normalized.sourceDigest).toBe(first.source.manifestation.payload.byteHashes.sha256);
    expect(inspectEngineeringLifecycle(first.projection).sources).toEqual(input.sources);
    expect(first.source.record.payload.recordType).toBe('engineering-lifecycle-evidence');
  });
  it('rejects unresolvable provenance, mixed work, private policy and fabricated payloads', () => {
    const input = fixture();
    for (const mutation of [
      (v: typeof input) => { v.sources = v.sources.slice(1); },
      (v: typeof input) => { v.records[1].workRef = 'work:other'; },
      (v: typeof input) => { v.routingPolicy = 'private'; },
      (v: typeof input) => { v.sources[0].sha256 = 'not-a-digest'; },
      (v: typeof input) => { v.sources[0].fullChat = 'forbidden inline payload'; },
      (v: typeof input) => { v.validationRelations[0].greenRef = 'source:missing'; }
    ]) {
      const invalid = structuredClone(input); mutation(invalid);
      expect(() => parseEngineeringLifecycleSource(invalid)).toThrow();
    }
  });
  it('rejects a rehashed graph that changed evidence content without updating the binding', () => {
    const output = buildEngineeringLifecycleProjection(parseEngineeringLifecycleSource(fixture()));
    const projection = structuredClone(output.projection);
    const payload = projection.nodes.find(n => n.label === 'TracePayload');
    expect(payload).toBeDefined();
    if (payload) payload.properties.valueJson = '{}';
    const { closureDigest: _old, ...body } = projection;
    projection.closureDigest = traceHash(canonicalTraceJson(body));
    expect(projection.closureDigest).not.toBe(_old);
    expect(() => inspectEngineeringLifecycle(projection)).toThrow();
  });
  it('rejects a correctly rehashed projection that diverges from its exact source bundle', () => {
    const projection = structuredClone(buildEngineeringLifecycleProjection(parseEngineeringLifecycleSource(fixture())).projection);
    const node = projection.nodes.find(n => n.label === 'TraceRecord');
    if (node) node.properties.sourceSequence = 999;
    const { closureDigest: _old, ...body } = projection;
    projection.closureDigest = traceHash(canonicalTraceJson(body));
    expect(projection.closureDigest).not.toBe(_old);
    expect(() => inspectEngineeringLifecycle(projection)).toThrow(/rebuild|source|projection/i);
  });
});
