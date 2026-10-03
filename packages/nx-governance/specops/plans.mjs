import { URL } from 'node:url';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(new URL('../package.json', import.meta.url));
const { parse } = require('yaml');
export const digest = (bytes) =>
  createHash('sha256').update(bytes).digest('hex');
export function localFile(root, file) {
  if (
    typeof file !== 'string' ||
    !file ||
    path.isAbsolute(file) ||
    file.includes('\\') ||
    file.split('/').some((p) => !p || p === '..' || p === '.')
  )
    throw new Error(`non-local source: ${file}`);
  let current = path.resolve(root);
  for (const part of file.split('/')) {
    current = path.join(current, part);
    try {
      if (lstatSync(current).isSymbolicLink())
        throw new Error(`symlink source: ${file}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return current;
}
export function parseDocument(text, file) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`missing frontmatter: ${file}`);
  const meta = parse(match[1]);
  if (!meta || typeof meta !== 'object' || Array.isArray(meta))
    throw new Error(`invalid frontmatter: ${file}`);
  if (typeof meta.id !== 'string' || !meta.id.trim())
    throw new Error(`missing stable id: ${file}`);
  return {
    meta,
    body: match[2],
    text,
    path: file,
    sha256: digest(text),
    summary: match[2].match(/^#\s+(.+)$/m)?.[1] ?? meta.id,
  };
}
const strings = (v, label) => {
  if (
    !Array.isArray(v) ||
    v.some((x) => typeof x !== 'string' || !x.trim()) ||
    new Set(v).size !== v.length
  )
    throw new Error(`invalid ${label}`);
  return v;
};
export function loadPlans(root) {
  const plans = new Map();
  const ids = new Set();
  const tasks = new Set();
  for (const file of readdirSync(path.join(root, 'plans'))
    .filter((f) => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('_'))
    .sort()) {
    const relative = 'plans/' + file;
    const doc = parseDocument(
      readFileSync(localFile(root, relative), 'utf8'),
      relative
    );
    const m = doc.meta;
    const slug = file.slice(0, -3);
    if (!/^status:\s*[^\n]+$/m.test(doc.text))
      throw new Error(
        `unsupported donor frontmatter: ${slug}; use canonical YAML keys`
      );
    if (ids.has(m.id)) throw new Error(`duplicate plan id: ${m.id}`);
    ids.add(m.id);
    if (!/^T[0-9]{3,}$/.test(m.task) || tasks.has(m.task))
      throw new Error(`invalid/duplicate task identity: ${m.task}`);
    tasks.add(m.task);
    if (
      !['planned', 'in-progress', 'done', 'blocked', 'cancelled'].includes(
        m.status
      )
    )
      throw new Error(`invalid plan status: ${slug}`);
    for (const key of ['depends', 'awaits', 'specs'])
      strings(m[key], `${slug}.${key}`);
    if (
      !Array.isArray(m.issues) ||
      m.issues.some((n) => !Number.isSafeInteger(n) || n < 1) ||
      new Set(m.issues).size !== m.issues.length
    )
      throw new Error(`invalid issues: ${slug}`);
    if (m.pr != null && (!Number.isSafeInteger(m.pr) || m.pr < 1))
      throw new Error(`invalid PR: ${slug}`);
    const validation =
      doc.body.split(/^## Validation\s*$/m)[1]?.split(/^## /m)[0] ?? '';
    if (!/- \[[ x]\]/.test(validation))
      throw new Error(`missing validation checklist: ${slug}`);
    if (m.status === 'done' && (!m.pr || /- \[ \]/.test(validation)))
      throw new Error(`done requires PR and verified validation: ${slug}`);
    plans.set(slug, { ...doc, slug });
  }
  const active = new Set();
  const done = new Set();
  const visit = (slug) => {
    if (active.has(slug)) throw new Error(`dependency cycle: ${slug}`);
    if (done.has(slug)) return;
    active.add(slug);
    for (const dep of plans.get(slug).meta.depends) {
      if (!plans.has(dep)) throw new Error(`unknown dependency: ${dep}`);
      visit(dep);
    }
    active.delete(slug);
    done.add(slug);
  };
  for (const slug of plans.keys()) visit(slug);
  return plans;
}
export function readiness(plan, plans) {
  const m = plan.meta;
  if (['done', 'cancelled'].includes(m.status)) return m.status;
  if (m.awaits.length) return 'awaiting';
  if (m.depends.some((dep) => plans.get(dep)?.meta.status !== 'done'))
    return 'blocked_by_deps';
  return m.status === 'blocked'
    ? 'blocked'
    : m.status === 'in-progress'
    ? 'resume-inspection-required'
    : 'ready';
}
export function issueRequest(plans, repository, featureId) {
  return {
    formatVersion: 1,
    repository,
    featureId,
    publicationPosture: 'public',
    tasks: [...plans.values()].map((p) => ({
      id: p.meta.task,
      title: p.summary,
      body: p.body,
      issueNumber: p.meta.issues[0] ?? null,
      sourceRef: p.path,
      findingRefs: p.meta.findings ?? [],
      originTaskIds: p.meta.originTasks ?? [],
      decision: p.meta.decision ?? null,
      closedDisposition: p.meta.status === 'done' ? 'retain' : null,
      disposition: p.meta.status === 'cancelled' ? 'deferred' : 'active',
    })),
  };
}
function intent(text) {
  try {
    const d = parseDocument(text, 'history');
    return JSON.stringify({
      id: d.meta.id,
      task: d.meta.task,
      depends: d.meta.depends,
      specs: d.meta.specs,
      issues: d.meta.issues,
      body: d.body.split(/^## Validation\s*$/m)[0],
    });
  } catch {
    return text;
  }
}
export function protectHistory(status, before, after) {
  if (status === 'done' && before !== after)
    throw new Error('completed plan is frozen; add successor motion');
  if (status === 'in-progress' && intent(before) !== intent(after))
    throw new Error(
      'active plan scope/identity cannot be rewritten; reconcile through successor/owner'
    );
}
