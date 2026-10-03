import Ajv from 'ajv';
import { digest, captureSourceEvidence, type SourceRef } from './source-evidence';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Nx's CommonJS source loader.
import schema = require('./baseline.schema.json');

export type { SourceRef } from './source-evidence';
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
  const keys = new Set<string>();
  const sources = captureSourceEvidence(input.scope, input.observations.flatMap((entry) => [...entry.evidenceRefs, ...entry.conflictRefs]),
    input.observations.flatMap((entry) => entry.authorityRefs), approvedAuthorities, read);
  const observations = input.observations.map((candidate) => {
    if (keys.has(candidate.key)) throw new Error(`Duplicate observation identity: ${candidate.key}`);
    keys.add(candidate.key);
    const disposition: BaselineDisposition = !candidate.authorityRefs.length ? 'authority-missing'
      : candidate.conflictRefs.length ? 'ambiguous' : candidate.disposition;
    return { ...candidate, id: `baseline:${input.baselineId}:${candidate.key}`, disposition };
  }).sort((a, b) => a.id.localeCompare(b.id));
  return {
    formatVersion: 1 as const, role: 'observed-behavior-not-authority' as const,
    baselineId: input.baselineId, revision, sourceState: 'captured-working-tree' as const,
    requestDigest: digest(JSON.stringify(input)), scope: [...input.scope].sort(), sources,
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
