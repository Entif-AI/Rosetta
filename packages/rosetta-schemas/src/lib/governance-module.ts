import { compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceObjectSchema as object, evidenceProfileSchema as profile, nullableEvidenceSchema as nullable } from './evidence-contract-validation.js';
import { createGovernedRecord, verifyGovernedRecord, governedArray as array, governedEnum as enumeration, governedDigestSchema as digest, governedRecordIdSchema as recordId } from './governed-evidence-identity.js';
import { traceHash } from './trace-normalization.js';

export const GOVERNANCE_MODULE_STATES = ['PROPOSED', 'CURRENT', 'SUPERSEDED', 'RETIRED'] as const;
export interface GovernanceModule {
  recordId: string;
  profile: { id: 'governance.module.v1'; version: '1.0.0' };
  moduleRef: string; title: string; ownerRef: string; categoryRef: string;
  versionRef: string; revisionRef: string;
  artifact: { ref: string; sha256: string };
  disclosure: 'PUBLIC' | 'OPAQUE';
  opaqueBindingRef: string | null;
  state: typeof GOVERNANCE_MODULE_STATES[number];
  supersedesRefs: string[]; replacedByRefs: string[];
  dependencies: { moduleRef: string; recordRef: string }[];
  triggers: { topicRefs: string[]; operationRefs: string[]; eventRefs: string[]; applicabilityRefs: string[] };
  conformanceRefs: string[]; provenanceRefs: string[]; receiptRefs: string[];
}
export const GOVERNANCE_MODULE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:governance.module.v1', title: 'Candidate governance module registry metadata v1',
  ...object({ recordId, profile: profile('governance.module.v1'), moduleRef: ref, title: ref, ownerRef: ref, categoryRef: ref, versionRef: ref, revisionRef: ref,
    artifact: object({ ref, sha256: digest }), disclosure: enumeration(['PUBLIC', 'OPAQUE']), opaqueBindingRef: nullable({ type: 'string', pattern: '^urn:opaque:[a-zA-Z0-9_-]{1,128}$' }),
    state: enumeration(GOVERNANCE_MODULE_STATES), supersedesRefs: refs, replacedByRefs: refs,
    dependencies: array(object({ moduleRef: ref, recordRef: recordId })),
    triggers: object({ topicRefs: refs, operationRefs: refs, eventRefs: refs, applicabilityRefs: refs }),
    conformanceRefs: support, provenanceRefs: support, receiptRefs: refs })
};
const admit = compileEvidenceContract<GovernanceModule>(GOVERNANCE_MODULE_SCHEMA);
export function parseGovernanceModule(input: unknown): GovernanceModule {
  const value = verifyGovernedRecord(admit(input));
  if (value.disclosure === 'OPAQUE' && (!value.opaqueBindingRef || value.artifact.ref !== value.opaqueBindingRef)) throw new Error('Protected module needs an opaque artifact binding.');
  if (value.disclosure === 'PUBLIC' && value.opaqueBindingRef !== null) throw new Error('Public module cannot claim a protected binding.');
  if (value.state === 'SUPERSEDED' && !value.replacedByRefs.length) throw new Error('Superseded module requires replacement reference.');
  if (value.supersedesRefs.includes(value.recordId) || value.replacedByRefs.includes(value.recordId) || value.dependencies.some(d => d.moduleRef === value.moduleRef)) throw new Error('Self-referential module metadata.');
  if (new Set(value.dependencies.map(d => d.moduleRef)).size !== value.dependencies.length) throw new Error('Ambiguous module dependency.');
  return value;
}
export const createGovernanceModule = (body: unknown): GovernanceModule => createGovernedRecord(body, parseGovernanceModule);

export interface GovernanceRegistryObservation {
  frontierRef: string;
  /** Exact records observed current by the registry owner, not a version-ranking policy. */
  current: readonly { moduleRef: string; recordRef: string; ownerRef: string }[];
}
export type GovernanceResolution = { state: 'RESOLVED'; frontierRef: string; module: GovernanceModule } | { state: 'UNKNOWN' | 'CONFLICT' | 'BLOCKED' | 'MISMATCH'; frontierRef: string };

/** Recompute from the supplied current owner observation. No persistent cache or authorization effect. */
export function resolveGovernanceModule(history: readonly unknown[], observation: GovernanceRegistryObservation, moduleRef: string): GovernanceResolution {
  const frontierRef = observation.frontierRef;
  if (!frontierRef || !moduleRef) throw new Error('Explicit registry frontier and module required.');
  const records = new Map(history.map(input => { const m = parseGovernanceModule(input); return [m.recordId, m] as const; }));
  const visit = (id: string, visiting: ReadonlySet<string>): GovernanceResolution => {
    const matches = observation.current.filter(m => m.moduleRef === id);
    if (!matches.length) return { state: 'UNKNOWN', frontierRef };
    if (matches.length !== 1 || visiting.has(id)) return { state: 'CONFLICT', frontierRef };
    const match = matches[0]!;
    const module = records.get(match.recordRef);
    if (!module || module.state !== 'CURRENT' || module.moduleRef !== id || module.ownerRef !== match.ownerRef) return { state: 'MISMATCH', frontierRef };
    for (const dep of module.dependencies) {
      const current = visit(dep.moduleRef, new Set([...visiting, id]));
      if (current.state !== 'RESOLVED' || current.module.recordId !== dep.recordRef) return { state: current.state === 'CONFLICT' ? 'CONFLICT' : 'BLOCKED', frontierRef };
    }
    return { state: 'RESOLVED', frontierRef, module };
  };
  return visit(moduleRef, new Set());
}

/** Check actual loaded UTF-8 artifact bytes against a freshly resolved exact registry record. */
export function verifyGovernanceModuleArtifact(history: readonly unknown[], observation: GovernanceRegistryObservation, moduleRef: string, loaded: { recordRef: string; revisionRef: string; utf8: string }): boolean {
  const resolution = resolveGovernanceModule(history, observation, moduleRef);
  return resolution.state === 'RESOLVED' && resolution.module.recordId === loaded.recordRef && resolution.module.revisionRef === loaded.revisionRef && resolution.module.artifact.sha256 === traceHash(loaded.utf8);
}
