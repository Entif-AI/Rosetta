import { describe, expect, it } from 'vitest';
import { createCompiledContext, parseCompiledContext, parseCompiledContextBlock, admitCompiledContextVisibility, compiledContextSourceLineages, appendCompiledContext, type CompiledContext } from './compiled-context.js';

const binding = () => ({ source: { ref: 'urn:synthetic:source', version: '1', cid: 'cid:synthetic-source' }, lineageRef: 'urn:synthetic:one-witness', spanRefs: ['urn:synthetic:span:1'], provenanceRefs: ['urn:synthetic:source'], policyRef: 'urn:synthetic:policy:1', rightsRef: 'urn:synthetic:rights:1' });
const block = () => ({ blockRef: 'urn:synthetic:block:1', familyRef: 'urn:synthetic:evidence-block', sourceBindings: [binding()], originalAuthorityClass: 'evidence' as 'evidence' | 'advisory' | 'constraint' | 'unknown', authorityClass: 'evidence' as 'evidence' | 'advisory' | 'constraint' | 'unknown', evidenceRefs: ['urn:synthetic:evidence'], receiptRefs: ['urn:synthetic:receipt'], originalConflictRefs: [] as string[], conflictRefs: [] as string[], representation: { mode: 'inline' as 'inline' | 'reference', inlineContent: 'Synthetic evidence.' as string | null, contentRef: null as string | null }, placement: 'dynamic-tail' as 'stable-prefix' | 'dynamic-tail' | 'unclassified', estimates: { tokens: 4 as number | null, bytes: 19 as number | null, methodRef: 'urn:synthetic:estimate' }, compression: { outcome: 'none' as 'none' | 'applied' | 'declined' | 'restored-uncompressed', profileRef: null as string | null, preservationRefs: [] as string[], lossRefs: [] as string[] }, reasonCodes: [] as string[], freshnessRef: 'urn:synthetic:observation:recent' as string | null });
const body = () => ({ profile: { id: 'compiled.context.v1' as const, version: '1.0.0' as const }, familyRef: 'urn:synthetic:context-family', scope: { kind: 'task' as 'task' | 'thread', boundaryRef: 'urn:synthetic:task', tenantRef: 'urn:synthetic:tenant', workspaceRef: 'urn:synthetic:workspace', projectRef: null }, intended: { consumerRef: 'urn:synthetic:consumer', taskRef: 'urn:synthetic:task' as string | null, threadRef: 'urn:synthetic:thread' as string | null, runRef: 'urn:synthetic:run' }, producerRef: 'urn:synthetic:compiler-A', blocks: [block()], conflicts: [] as CompiledContext['conflicts'], omissions: [] as CompiledContext['omissions'], coverage: 'complete' as 'complete' | 'partial' | 'unknown', mode: 'deterministic' as 'deterministic' | 'model-assisted' | 'unknown', estimates: { tokens: null, bytes: null, methodRef: 'urn:synthetic:estimate' }, privacy: { posture: 'public' as 'public' | 'restricted' | 'redacted' | 'unknown', outcomeRefs: ['urn:synthetic:privacy-decision'] }, identitySensitive: { posture: 'none' as 'none' | 'restricted' | 'redacted' | 'unknown', outcomeRefs: [] as string[] }, safeHold: { state: 'inactive' as 'active' | 'inactive' | 'unknown', authorityRef: null as string | null }, cache: null as CompiledContext['cache'], effectAuthority: 'none' as const, budgetRefs: ['urn:synthetic:rolling-budget'], createdAt: '2026-10-04T15:00:00Z', supersedesRefs: [] as string[] });
const current = () => ({ consumerRef: 'urn:synthetic:consumer', scopeRef: 'urn:synthetic:task', decisions: [{ sourceRef: binding().source.ref, policyRef: binding().policyRef, rightsRef: binding().rightsRef, allowed: true, decisionRef: 'urn:synthetic:current-rights' }] });
function contradicted() {
  const data = body(); const second = block(); second.blockRef = 'urn:synthetic:block:2'; second.representation.inlineContent = 'Contradictory synthetic evidence.';
  data.blocks.push(second); data.blocks.forEach(b => { b.originalConflictRefs = ['urn:synthetic:conflict']; b.conflictRefs = ['urn:synthetic:conflict']; });
  data.conflicts = [{ conflictRef: 'urn:synthetic:conflict', participantRefs: data.blocks.map(b => b.blockRef), evidenceRefs: ['urn:synthetic:conflict-evidence'] }]; return data;
}
describe('compiled-context public outcomes #1729', () => {
  it('admits standalone blocks with the same authority and contradiction invariants', () => {
    expect(parseCompiledContextBlock(block())).toEqual(block());
    const invalid = block(); invalid.originalConflictRefs = ['urn:synthetic:conflict'];
    expect(() => parseCompiledContextBlock(invalid)).toThrow(/conflict|contradiction/i);
  });
  it('represents inline evidence with exact source, receipt and evidence refs', () => {
    const value = createCompiledContext(body()); expect(parseCompiledContext(value)).toEqual(value);
    expect(admitCompiledContextVisibility(value, current()).blocks[0].sourceBindings[0].source).toEqual(binding().source);
  });
  it('references exact source spans without a second inline payload', () => {
    const data = body(); data.blocks[0].representation = { mode: 'reference', inlineContent: null, contentRef: 'urn:synthetic:bounded-content' };
    expect(createCompiledContext(data).blocks[0].sourceBindings[0].spanRefs).toEqual(['urn:synthetic:span:1']);
    data.blocks[0].representation.inlineContent = 'Mixed payload'; expect(() => createCompiledContext(data)).toThrow(/representation/i);
  });
  it('keeps contradictory evidence as separate attributed blocks', () => {
    const value = createCompiledContext(contradicted()); expect(value.blocks).toHaveLength(2); expect(value.conflicts[0].participantRefs).toHaveLength(2);
  });
  it('retains operational summaries as advisory', () => {
    const data = body(); data.blocks[0].authorityClass = 'advisory'; data.blocks[0].originalAuthorityClass = 'advisory'; data.blocks[0].familyRef = 'urn:synthetic:operational-summary';
    expect(createCompiledContext(data).blocks[0].authorityClass).toBe('advisory');
  });
  it('admits different private placement outcomes without requiring a placement algorithm', () => {
    const prefix = body(); prefix.blocks[0].placement = 'stable-prefix';
    const tail = body(); tail.producerRef = 'urn:synthetic:compiler-B';
    expect(createCompiledContext(prefix).blocks[0].sourceBindings).toEqual(createCompiledContext(tail).blocks[0].sourceBindings);
    expect(createCompiledContext(prefix).blocks[0].authorityClass).toBe(createCompiledContext(tail).blocks[0].authorityClass);
  });
  it('preserves provenance, spans and contradiction through declared compression/loss', () => {
    const data = contradicted(); data.blocks[0].compression = { outcome: 'applied', profileRef: 'urn:synthetic:compression-profile', preservationRefs: ['urn:synthetic:preservation-proof'], lossRefs: ['urn:synthetic:omitted-repetition'] };
    expect(createCompiledContext(data).blocks[0].sourceBindings).toEqual([binding()]);
    data.blocks[0].conflictRefs = []; expect(() => createCompiledContext(data)).toThrow(/conflict|contradiction/i);
  });
  it.each(['declined', 'restored-uncompressed'] as const)('represents compression %s with a public reason', outcome => {
    const data = body(); data.blocks[0].compression.outcome = outcome; data.blocks[0].reasonCodes = ['urn:synthetic:preserve-fidelity'];
    expect(createCompiledContext(data).blocks[0].compression.outcome).toBe(outcome);
  });
  it('declares omission and downgrade without hiding the authority change', () => {
    const data = body(); data.omissions = [{ candidateRef: 'urn:synthetic:excluded-candidate', disposition: 'omitted', reasonCodes: ['urn:synthetic:outside-task'], evidenceRefs: ['urn:synthetic:outcome'], conflictRefs: [] }];
    data.blocks[0].authorityClass = 'advisory'; data.blocks[0].reasonCodes = ['urn:synthetic:insufficient-current-support'];
    expect(createCompiledContext(data).omissions).toHaveLength(1);
    data.blocks[0].reasonCodes = []; expect(() => createCompiledContext(data)).toThrow(/downgrade|reason/i);
  });
  it('records privacy exclusion without including the excluded payload', () => {
    const data = body(); data.blocks = []; data.privacy.posture = 'redacted'; data.identitySensitive.posture = 'restricted';
    data.omissions = [{ candidateRef: 'urn:synthetic:opaque-candidate', disposition: 'omitted', reasonCodes: ['urn:synthetic:privacy-exclusion'], evidenceRefs: ['urn:synthetic:privacy-decision'], conflictRefs: [] }];
    expect(admitCompiledContextVisibility(createCompiledContext(data), { ...current(), decisions: [] }).blocks).toHaveLength(0);
  });
  it('represents active safe hold without granting effects', () => {
    const data = body(); data.safeHold = { state: 'active', authorityRef: 'urn:synthetic:halt-authority' };
    expect(createCompiledContext(data).effectAuthority).toBe('none');
  });
  it('keeps cache/provider-prefix observations non-authoritative', () => {
    const data = body(); data.cache = { domainRef: 'urn:synthetic:cache-domain', providerPrefixRef: 'urn:synthetic:provider-prefix', observationRefs: ['urn:synthetic:cache-observation'], authority: 'non-authoritative' };
    expect(createCompiledContext(data).cache?.authority).toBe('non-authoritative');
  });
  it('keeps an older governing constraint distinct from newer attention material', () => {
    const data = body(); const old = block(); old.blockRef = 'urn:synthetic:older-constraint'; old.authorityClass = 'constraint'; old.originalAuthorityClass = 'constraint'; old.freshnessRef = 'urn:synthetic:older-observation';
    data.blocks.unshift(old); const value = createCompiledContext(data);
    expect(value.blocks.map(b => b.authorityClass)).toEqual(['constraint', 'evidence']);
    expect(value.blocks[0].freshnessRef).toBe('urn:synthetic:older-observation');
  });
  it('distinguishes task and thread packages over the same sources', () => {
    const task = createCompiledContext(body()); const thread = body(); thread.scope.kind = 'thread'; thread.scope.boundaryRef = 'urn:synthetic:thread';
    const value = createCompiledContext(thread); expect(value.blocks).toEqual(task.blocks); expect(value.recordId).not.toBe(task.recordId);
    expect(admitCompiledContextVisibility(value, { ...current(), scopeRef: 'urn:synthetic:thread' }).scope.kind).toBe('thread');
    expect(() => admitCompiledContextVisibility(value, current())).toThrow(/scope/i);
  });
  it('fences previously authorized cached content before visibility or counts after revocation', () => {
    const value = createCompiledContext(body()); const revoked = { ...current(), decisions: [{ ...current().decisions[0], allowed: false }] };
    expect(() => admitCompiledContextVisibility(value, revoked)).toThrow(/rights/i);
    expect(() => compiledContextSourceLineages(value, revoked)).toThrow(/rights/i);
  });
  it('admits model-off partial/unavailable source coverage with explicit omissions', () => {
    const data = body(); data.coverage = 'partial'; data.mode = 'deterministic'; data.omissions = [{ candidateRef: 'urn:synthetic:unavailable', disposition: 'unavailable', reasonCodes: ['urn:synthetic:source-unavailable'], evidenceRefs: ['urn:synthetic:unavailability'], conflictRefs: [] }];
    expect(createCompiledContext(data).coverage).toBe('partial');
    data.coverage = 'complete'; expect(() => createCompiledContext(data)).toThrow(/coverage|unavailable/i);
  });
  it('counts one lineage across graph/vector/summary/context representations', () => {
    const data = body(); for (const family of ['graph', 'vector', 'summary']) data.blocks.push({ ...block(), blockRef: 'urn:synthetic:'+family, familyRef: 'urn:synthetic:'+family });
    expect(compiledContextSourceLineages(createCompiledContext(data), current())).toEqual(['urn:synthetic:one-witness']);
  });
  it('rejects advisory-as-evidence promotion', () => {
    const data = body(); data.blocks[0].originalAuthorityClass = 'advisory'; expect(() => createCompiledContext(data)).toThrow(/authority|advisory/i);
  });
  it('rejects cache state used as truth authority', () => {
    const data = { ...body(), cache: { domainRef: 'urn:synthetic:cache', providerPrefixRef: null, observationRefs: [], authority: 'truth' } };
    expect(() => createCompiledContext(data)).toThrow(/contract|authorit/i);
  });
  it('rejects silent contradiction collapse and preserves rights-excluded participants', () => {
    const data = contradicted(); data.blocks.pop(); expect(() => createCompiledContext(data)).toThrow(/conflict|participant|contradiction/i);
    data.omissions = [{ candidateRef: 'urn:synthetic:block:2', disposition: 'omitted', reasonCodes: ['urn:synthetic:rights-revoked'], evidenceRefs: ['urn:synthetic:current-rights'], conflictRefs: ['urn:synthetic:conflict'] }];
    expect(createCompiledContext(data).conflicts[0].participantRefs).toHaveLength(2);
  });
  it('rejects compiled context used as write authority', () => {
    expect(() => createCompiledContext({ ...body(), effectAuthority: 'write' })).toThrow(/contract|authority/i);
  });
  it('requires exact current policy/rights decisions rather than truthy malformed permission', () => {
    const value = createCompiledContext(body()); const decision = current().decisions[0];
    expect(() => admitCompiledContextVisibility(value, { ...current(), decisions: [{ ...decision, allowed: 'false' as unknown as boolean }] })).toThrow(/rights/i);
    expect(() => admitCompiledContextVisibility(value, { ...current(), decisions: [{ ...decision, rightsRef: 'urn:synthetic:rights:2' }] })).toThrow(/rights/i);
    expect(() => admitCompiledContextVisibility(value, { ...current(), decisions: [] })).toThrow(/rights/i);
  });
  it('preserves additive context revisions and rejects metadata tampering', () => {
    const first = createCompiledContext(body()); const next = createCompiledContext({ ...body(), createdAt: '2026-10-04T15:01:00Z', supersedesRefs: [first.recordId] });
    expect(appendCompiledContext([first], next)).toEqual([first, next]);
    expect(() => parseCompiledContext({ ...first, coverage: 'unknown' })).toThrow(/digest/i);
    expect(() => appendCompiledContext([first], createCompiledContext({ ...body(), createdAt: next.createdAt }))).toThrow(/supersession/i);
  });
  it('retains unknown estimates and rejects negative or fractional token observations', () => {
    const data = body(); data.blocks[0].estimates.tokens = null; expect(createCompiledContext(data).blocks[0].estimates.tokens).toBeNull();
    data.blocks[0].estimates.tokens = -1; expect(() => createCompiledContext(data)).toThrow(/contract/i);
    data.blocks[0].estimates.tokens = 1.5; expect(() => createCompiledContext(data)).toThrow(/contract/i);
  });
});
