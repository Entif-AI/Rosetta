import { createHash } from 'node:crypto';

export interface SourceRef { path: string; start: number; end: number }
export const digest = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
export function localPath(file: string) {
  if (!file || file.startsWith('/') || file.includes('\\') || file.split('/').includes('..')) throw new Error(`Non-local evidence path: ${file}`);
  return file;
}
/** Shared provenance boundary for baseline and convergence projections. */
export function captureSourceEvidence(scope: string[], evidence: SourceRef[], authorities: SourceRef[],
  approvedAuthorities: string[], read: (file: string) => Buffer) {
  const selected = new Set(scope.map(localPath));
  const approved = new Set(approvedAuthorities);
  const bytes = new Map<string, Buffer>();
  const capture = (file: string) => {
    localPath(file);
    if (!bytes.has(file)) bytes.set(file, read(file));
    return bytes.get(file)!;
  };
  for (const file of selected) capture(file);
  const check = (ref: SourceRef, normative: boolean) => {
    if (normative ? !approved.has(ref.path) || selected.has(ref.path) : !selected.has(ref.path)) {
      throw new Error(normative ? `Unapproved or self-authorizing authority: ${ref.path}` : `Evidence outside bounded scope: ${ref.path}`);
    }
    const lines = capture(ref.path).toString('utf8').split('\n');
    if (!Number.isInteger(ref.start) || !Number.isInteger(ref.end) || ref.start < 1 || ref.end < ref.start || ref.end > lines.length) {
      throw new Error(`Unresolvable source line range: ${ref.path}`);
    }
  };
  evidence.forEach((ref) => check(ref, false));
  authorities.forEach((ref) => check(ref, true));
  return [...bytes.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([file, content]) => ({
    path: file, role: selected.has(file) ? 'observed-evidence' : 'governing-authority', sha256: digest(content),
  }));
}
