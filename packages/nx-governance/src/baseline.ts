import Ajv from 'ajv';
import { digest } from './executors/evidence';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Nx's CommonJS source loader.
import schema = require('./baseline.schema.json');

export interface SourceRef { path: string; start: number; end: number }
export type BaselineDisposition = 'aligned' | 'drift' | 'ambiguous' | 'unrequested' | 'authority-missing';
export interface ObservationCandidate {
  key: string;
  kind: 'direct' | 'inference';
  claim: string;
  confidence: number;
  evidenceRefs: SourceRef[];
  authorityRefs: SourceRef[];
  conflictRefs: SourceRef[];
  disposition: BaselineDisposition;
  rationale: string;
}
export interface BaselineRequest {
  formatVersion: 1;
  baselineId: string;
  scope: string[];
  observations: ObservationCandidate[];
}
const validate = new Ajv({ allErrors: true }).compile<BaselineRequest>(schema);

/** Capture bounded evidence; a reviewer supplies reconciliation, never code-to-intent inference. */
export function createBaseline(input: unknown, read: (file: string) => Buffer, revision: string, approvedAuthorities: string[]) {
  if (!validate(input)) throw new Error(`Invalid baseline candidate: ${JSON.stringify(validate.errors)}`);
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('An exact Git revision is required.');
  const scope = new Set(input.scope);
  const authorities = new Set(approvedAuthorities);
  const keys = new Set<string>();
  const contents = new Map<string, Buffer>();
  const readSource = (file: string) => {
    if (!contents.has(file)) contents.set(file, read(file));
    return contents.get(file)!;
  };
  for (const file of input.scope) readSource(file);
  function checkRef(ref: SourceRef, normative: boolean) {
    if (normative ? !authorities.has(ref.path) || scope.has(ref.path) : !scope.has(ref.path)) {
      throw new Error(normative ? `Unapproved or self-authorizing authority: ${ref.path}` : `Evidence outside bounded scope: ${ref.path}`);
    }
    const lines = readSource(ref.path).toString('utf8').split('\n');
    if (ref.end < ref.start || ref.end > lines.length) throw new Error(`Unresolvable source line range: ${ref.path}`);
  }
  const observations = input.observations.map((candidate) => {
    if (keys.has(candidate.key)) throw new Error(`Duplicate observation identity: ${candidate.key}`);
    keys.add(candidate.key);
    candidate.evidenceRefs.forEach((ref) => checkRef(ref, false));
    candidate.conflictRefs.forEach((ref) => checkRef(ref, false));
    candidate.authorityRefs.forEach((ref) => checkRef(ref, true));
    const disposition: BaselineDisposition = !candidate.authorityRefs.length ? 'authority-missing'
      : candidate.conflictRefs.length ? 'ambiguous' : candidate.disposition;
    return { ...candidate, id: `baseline:${input.baselineId}:${candidate.key}`, disposition };
  }).sort((a, b) => a.id.localeCompare(b.id));
  return {
    formatVersion: 1 as const, role: 'observed-behavior-not-authority' as const,
    baselineId: input.baselineId, revision, sourceState: 'captured-working-tree' as const,
    requestDigest: digest(JSON.stringify(input)), scope: [...scope].sort(),
    sources: [...contents.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([file, bytes]) => ({
      path: file, role: scope.has(file) ? 'observed-evidence' : 'governing-authority', sha256: digest(bytes),
    })),
    observations,
    candidates: observations.filter((observation) => observation.disposition !== 'aligned').map((observation) => ({
      observationId: observation.id,
      action: observation.disposition === 'authority-missing' ? 'resolve-authority'
        : observation.disposition === 'ambiguous' ? 'reconcile-evidence'
          : observation.disposition === 'unrequested' ? 'review-unrequested-behavior' : 'propose-remediation',
      role: 'proposed-work-not-requirement' as const,
    })),
  };
}
