import Ajv from 'ajv';
import { captureSourceEvidence, localPath, type SourceRef } from './source-evidence';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Nx's CommonJS source loader.
import schema = require('./convergence.schema.json');

export interface ConvergenceFinding {
  key: string;
  sourceRef: SourceRef;
  gapType: 'missing' | 'partial' | 'contradicts' | 'unrequested' | 'authority-missing';
  severity: 'blocker' | 'major' | 'minor';
  evidenceRefs: SourceRef[];
  authorityRef: SourceRef | null;
  affectedSurface: string;
  observationRefs: string[];
  remediationTaskRefs: string[];
  verificationRefs: SourceRef[];
  status: 'open' | 'remediated' | 'accepted-exception';
  exceptionRef: SourceRef | null;
}
export interface ConvergenceRequest {
  formatVersion: 1;
  featureId: string;
  runId: string;
  inventory: { key: string; authorityRef: SourceRef; verificationRefs: SourceRef[] }[];
  findings: ConvergenceFinding[];
}
const validate = new Ajv({ allErrors: true }).compile<ConvergenceRequest>(schema);

export function createConvergence(input: unknown, read: (file: string) => Buffer, revision: string, approvedAuthorities: string[]) {
  if (!validate(input)) throw new Error(`Invalid convergence candidate: ${JSON.stringify(validate.errors)}`);
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('An exact Git revision is required.');
  if (new Set(input.inventory.map((item) => item.key)).size !== input.inventory.length) throw new Error('Duplicate inventory identity.');
  if (new Set(input.findings.map((item) => item.key)).size !== input.findings.length) throw new Error('Duplicate finding identity.');
  const evidence = input.inventory.flatMap((item) => item.verificationRefs);
  const authorities = input.inventory.map((item) => item.authorityRef);
  for (const finding of input.findings) {
    if (finding.gapType !== 'authority-missing' && !finding.authorityRef) throw new Error('A governing authority is required unless explicitly missing.');
    if (finding.status === 'remediated' && !finding.verificationRefs.length) throw new Error('Remediation requires verification evidence.');
    if (finding.status === 'accepted-exception' && !finding.exceptionRef) throw new Error('Accepted exception requires an approved authority ref.');
    if (finding.gapType === 'authority-missing' && finding.status !== 'open') throw new Error('Missing authority cannot self-authorize closure.');
    evidence.push(...finding.evidenceRefs, ...finding.verificationRefs);
    if (finding.authorityRef) authorities.push(finding.authorityRef);
    if (finding.exceptionRef) authorities.push(finding.exceptionRef);
    // Missing-intent findings anchor their source in observed evidence, not invented authority.
    (finding.gapType === 'authority-missing' ? evidence : authorities).push(finding.sourceRef);
  }
  const scope = [...new Set([...evidence.map((ref) => ref.path), ...input.findings.map((finding) => localPath(finding.affectedSurface))])];
  const sources = captureSourceEvidence(scope, evidence, authorities, approvedAuthorities, read);
  const findings = input.findings.map((finding) => ({ ...finding, id: `finding:${input.featureId}:${finding.key}` })).sort((a, b) => a.id.localeCompare(b.id));
  const count = (field: 'gapType' | 'severity') => Object.fromEntries([...new Set(findings.map((finding) => finding[field]))].sort()
    .map((value) => [value, findings.filter((finding) => finding[field] === value).length]));
  const open = findings.filter((finding) => finding.status === 'open');
  return { formatVersion: 1 as const, role: 'convergence-evidence-not-authority' as const, revision,
    sourceState: 'captured-working-tree' as const, request: input, sources, findings,
    summary: { runId: input.runId, checked: input.inventory.length, actionable: open.length,
      byType: count('gapType'), bySeverity: count('severity'), blockerRefs: open.map((finding) => finding.id),
      remediationTaskRefs: [...new Set(findings.flatMap((finding) => finding.remediationTaskRefs))].sort(), disposition: open.length ? 'blocked' : 'pass' },
  };
}

export function verifyConvergence(report: unknown, read: (file: string) => Buffer, approvedAuthorities: string[], sourcePaths: string[]) {
  if (!report || typeof report !== 'object' || !('request' in report) || !('revision' in report) || typeof report.revision !== 'string') throw new Error('Malformed convergence evidence.');
  const expected = createConvergence(report.request, read, report.revision, approvedAuthorities);
  if (JSON.stringify(expected) !== JSON.stringify(report)) throw new Error('Stale source or altered convergence evidence.');
  if (JSON.stringify(expected.sources.map((source) => source.path).sort()) !== JSON.stringify([...sourcePaths].sort())) throw new Error('Convergence source inputs disagree with declared cache inputs.');
  return expected;
}
