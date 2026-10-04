import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { compileEvidenceContract, collectEvidenceSourceLineages, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceObjectSchema as object, evidenceProfileSchema as profile, evidenceIdentitySchema as identity, evidenceTimestampSchema as timestamp, nullableEvidenceSchema as nullable, type EvidenceIdentity } from './evidence-contract-validation.js';

export type ContextAuthorityClass = 'evidence' | 'advisory' | 'constraint' | 'unknown';
export interface ContextSourceBinding {
  source: EvidenceIdentity; lineageRef: string; spanRefs: string[]; provenanceRefs: string[]; policyRef: string; rightsRef: string;
}
export interface ContextEstimates { tokens: number | null; bytes: number | null; methodRef: string }
export interface CompiledContextBlock {
  blockRef: string; familyRef: string; sourceBindings: ContextSourceBinding[];
  originalAuthorityClass: ContextAuthorityClass; authorityClass: ContextAuthorityClass;
  evidenceRefs: string[]; receiptRefs: string[]; originalConflictRefs: string[]; conflictRefs: string[];
  representation: { mode: 'inline' | 'reference'; inlineContent: string | null; contentRef: string | null };
  placement: 'stable-prefix' | 'dynamic-tail' | 'unclassified'; estimates: ContextEstimates;
  compression: { outcome: 'none' | 'applied' | 'declined' | 'restored-uncompressed'; profileRef: string | null; preservationRefs: string[]; lossRefs: string[] };
  reasonCodes: string[]; freshnessRef: string | null;
}
export interface CompiledContext {
  recordId: string; profile: { id: 'compiled.context.v1'; version: '1.0.0' }; familyRef: string;
  scope: { kind: 'task' | 'thread'; boundaryRef: string; tenantRef: string | null; workspaceRef: string | null; projectRef: string | null };
  intended: { consumerRef: string; taskRef: string | null; threadRef: string | null; runRef: string | null };
  producerRef: string; blocks: CompiledContextBlock[];
  conflicts: { conflictRef: string; participantRefs: string[]; evidenceRefs: string[] }[];
  omissions: { candidateRef: string; disposition: 'omitted' | 'unavailable'; reasonCodes: string[]; evidenceRefs: string[]; conflictRefs: string[] }[];
  coverage: 'complete' | 'partial' | 'unknown'; mode: 'deterministic' | 'model-assisted' | 'unknown'; estimates: ContextEstimates;
  privacy: { posture: 'public' | 'restricted' | 'redacted' | 'unknown'; outcomeRefs: string[] };
  identitySensitive: { posture: 'none' | 'restricted' | 'redacted' | 'unknown'; outcomeRefs: string[] };
  safeHold: { state: 'active' | 'inactive' | 'unknown'; authorityRef: string | null };
  cache: { domainRef: string; providerPrefixRef: string | null; observationRefs: string[]; authority: 'non-authoritative' } | null;
  effectAuthority: 'none'; budgetRefs: string[]; createdAt: string; supersedesRefs: string[];
}
export interface CompiledContextVisibilityContext {
  consumerRef: string; scopeRef: string;
  decisions: { sourceRef: string; policyRef: string; rightsRef: string; allowed: boolean; decisionRef: string }[];
}
const array = (items: object, minItems = 0) => ({ type: 'array', minItems, maxItems: 256, items });
const authority = { enum: ['evidence', 'advisory', 'constraint', 'unknown'] };
const estimate = nullable({ type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER });
const estimates = object({ tokens: estimate, bytes: estimate, methodRef: ref });
export const COMPILED_CONTEXT_BLOCK_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:compiled.context.block.v1', title: 'Compiled context block v1',
  ...object({ blockRef: ref, familyRef: ref,
    sourceBindings: array(object({ source: identity, lineageRef: ref, spanRefs: refs, provenanceRefs: support, policyRef: ref, rightsRef: ref }), 1),
    originalAuthorityClass: authority, authorityClass: authority, evidenceRefs: refs, receiptRefs: refs, originalConflictRefs: refs, conflictRefs: refs,
    representation: object({ mode: { enum: ['inline', 'reference'] }, inlineContent: nullable({ type: 'string', minLength: 1, maxLength: 262144 }), contentRef: nullable(ref) }),
    placement: { enum: ['stable-prefix', 'dynamic-tail', 'unclassified'] }, estimates,
    compression: object({ outcome: { enum: ['none', 'applied', 'declined', 'restored-uncompressed'] }, profileRef: nullable(ref), preservationRefs: refs, lossRefs: refs }),
    reasonCodes: refs, freshnessRef: nullable(ref)
  })
};
export const COMPILED_CONTEXT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:compiled.context.v1', title: 'Compiled context artifact v1',
  ...object({ recordId: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' }, profile: profile('compiled.context.v1'), familyRef: ref,
    scope: object({ kind: { enum: ['task', 'thread'] }, boundaryRef: ref, tenantRef: nullable(ref), workspaceRef: nullable(ref), projectRef: nullable(ref) }),
    intended: object({ consumerRef: ref, taskRef: nullable(ref), threadRef: nullable(ref), runRef: nullable(ref) }), producerRef: ref,
    blocks: array({ $ref: COMPILED_CONTEXT_BLOCK_SCHEMA.$id }),
    conflicts: array(object({ conflictRef: ref, participantRefs: { ...support, minItems: 2 }, evidenceRefs: support })),
    omissions: array(object({ candidateRef: ref, disposition: { enum: ['omitted', 'unavailable'] }, reasonCodes: support, evidenceRefs: support, conflictRefs: refs })),
    coverage: { enum: ['complete', 'partial', 'unknown'] }, mode: { enum: ['deterministic', 'model-assisted', 'unknown'] }, estimates,
    privacy: object({ posture: { enum: ['public', 'restricted', 'redacted', 'unknown'] }, outcomeRefs: refs }),
    identitySensitive: object({ posture: { enum: ['none', 'restricted', 'redacted', 'unknown'] }, outcomeRefs: refs }),
    safeHold: object({ state: { enum: ['active', 'inactive', 'unknown'] }, authorityRef: nullable(ref) }),
    cache: nullable(object({ domainRef: ref, providerPrefixRef: nullable(ref), observationRefs: refs, authority: { const: 'non-authoritative' } })),
    effectAuthority: { const: 'none' }, budgetRefs: refs, createdAt: timestamp, supersedesRefs: refs
  })
};
const admit = compileEvidenceContract<CompiledContext>(COMPILED_CONTEXT_SCHEMA, [COMPILED_CONTEXT_BLOCK_SCHEMA]);
const admitBlock = compileEvidenceContract<CompiledContextBlock>(COMPILED_CONTEXT_BLOCK_SCHEMA);
function validateContextBlock(block: CompiledContextBlock): void {
  if (block.originalConflictRefs.some(conflict => !block.conflictRefs.includes(conflict))) throw new Error('Transformation cannot collapse an original contradiction.');
  if (block.originalAuthorityClass !== block.authorityClass) {
    if (!['advisory', 'unknown'].includes(block.authorityClass)) throw new Error('Context packaging cannot promote source authority.');
    if (!block.reasonCodes.length) throw new Error('Authority downgrade requires a public reason.');
  }
  if (block.authorityClass === 'evidence' && !block.evidenceRefs.length) throw new Error('Evidence-bearing context requires evidence references.');
  const rep = block.representation;
  if (rep.mode === 'inline' ? rep.inlineContent === null || rep.contentRef !== null : rep.contentRef === null || rep.inlineContent !== null) throw new Error('Context representation must select exactly one inline/reference payload.');
  if (block.compression.outcome === 'applied' && (!block.compression.profileRef || !block.compression.preservationRefs.length)) throw new Error('Applied compression requires an attributable Profile and preservation evidence.');
  if (['declined', 'restored-uncompressed'].includes(block.compression.outcome) && !block.reasonCodes.length) throw new Error('Compression fallback requires a public reason.');
}
export function parseCompiledContextBlock(input: unknown): CompiledContextBlock {
  const block = admitBlock(input);
  validateContextBlock(block);
  return block;
}
export function parseCompiledContext(input: unknown): CompiledContext {
  const value = admit(input);
  const { recordId, ...body } = value;
  if (recordId !== 'sha256:' + traceHash(canonicalTraceJson(body))) throw new Error('Compiled context metadata digest mismatch.');
  const boundary = value.scope.kind === 'task' ? value.intended.taskRef : value.intended.threadRef;
  if (!boundary || boundary !== value.scope.boundaryRef) throw new Error('Compiled context scope must bind its intended task/thread boundary.');
  const participants = new Map([...value.blocks.map(block => [block.blockRef, block.conflictRefs] as const), ...value.omissions.map(omission => [omission.candidateRef, omission.conflictRefs] as const)]);
  if (participants.size !== value.blocks.length + value.omissions.length) throw new Error('Duplicate or both included/omitted context candidate identity.');
  const conflicts = new Map(value.conflicts.map(conflict => [conflict.conflictRef, conflict]));
  if (conflicts.size !== value.conflicts.length) throw new Error('Duplicate contradiction identity.');
  for (const conflict of value.conflicts) {
    if (conflict.participantRefs.some(participant => !participants.get(participant)?.includes(conflict.conflictRef))) throw new Error('Contradiction participant is missing or no longer exposes the conflict.');
  }
  for (const [participant, conflictRefs] of participants) {
    if (conflictRefs.some(conflict => !conflicts.get(conflict)?.participantRefs.includes(participant))) throw new Error('Context participant has an unresolved contradiction.');
  }
  value.blocks.forEach(validateContextBlock);
  if (value.coverage === 'complete' && value.omissions.some(omission => omission.disposition === 'unavailable')) throw new Error('Unavailable sources cannot claim complete coverage.');
  if (value.safeHold.state === 'active' && !value.safeHold.authorityRef) throw new Error('Active safe hold requires its authority reference.');
  if (value.supersedesRefs.includes(value.recordId)) throw new Error('Compiled context cannot supersede itself.');
  collectEvidenceSourceLineages(value.blocks.flatMap(block => block.sourceBindings));
  return value;
}
export function createCompiledContext(input: unknown): CompiledContext {
  if (!input || typeof input !== 'object' || Array.isArray(input) || 'recordId' in input) throw new Error('Provide compiled context metadata without recordId.');
  return parseCompiledContext({ ...input, recordId: 'sha256:' + traceHash(canonicalTraceJson(input)) });
}

/** Current source policy/rights decisions come from their owners, never the cached package. */
export function admitCompiledContextVisibility(input: unknown, context: CompiledContextVisibilityContext): CompiledContext {
  const value = parseCompiledContext(input);
  if (context.consumerRef !== value.intended.consumerRef || context.scopeRef !== value.scope.boundaryRef) throw new Error('Context consumer/scope differs from the declared package.');
  const decisions = new Map(context.decisions.map(decision => [decision.sourceRef, decision]));
  if (decisions.size !== context.decisions.length) throw new Error('Ambiguous current rights decisions for one source.');
  for (const binding of value.blocks.flatMap(block => block.sourceBindings)) {
    const decision = decisions.get(binding.source.ref);
    if (!decision || decision.allowed !== true || typeof decision.decisionRef !== 'string' || !decision.decisionRef.trim() || decision.policyRef !== binding.policyRef || decision.rightsRef !== binding.rightsRef) throw new Error('Current source policy/rights decision does not permit context visibility.');
  }
  return value;
}
export function compiledContextSourceLineages(input: unknown, context: CompiledContextVisibilityContext): string[] {
  const value = admitCompiledContextVisibility(input, context);
  return collectEvidenceSourceLineages(value.blocks.flatMap(block => block.sourceBindings));
}
export function appendCompiledContext(history: readonly CompiledContext[], next: CompiledContext): CompiledContext[] {
  const records: CompiledContext[] = [];
  for (const input of [...history, next]) {
    const value = parseCompiledContext(input);
    if (records.some(record => record.recordId === value.recordId)) continue;
    if (value.supersedesRefs.some(ref => !records.some(record => record.recordId === ref))) throw new Error('Unresolved compiled context supersession.');
    const previous = records.at(-1);
    if (previous && (previous.familyRef !== value.familyRef || !value.supersedesRefs.includes(previous.recordId))) throw new Error('Context revision requires family identity and explicit supersession.');
    records.push(value);
  }
  return structuredClone(records);
}
