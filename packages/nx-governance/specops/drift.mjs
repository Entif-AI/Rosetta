import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  loadPlans,
  parseDocument,
  localFile,
  protectHistory,
} from './plans.mjs';
export function loadSpecs(root) {
  const docs = [];
  const walk = (folder) => {
    for (const entry of readdirSync(localFile(root, folder), {
      withFileTypes: true,
    }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = folder + '/' + entry.name;
      localFile(root, file);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.md') && entry.name !== 'README.md')
        docs.push(
          parseDocument(readFileSync(localFile(root, file), 'utf8'), file)
        );
    }
  };
  walk('specs');
  return docs;
}
export function checkDesiredState(root, config) {
  const specs = loadSpecs(root);
  const plans = loadPlans(root);
  const approved = new Set(config.authoritySources);
  const ids = new Set();
  const byPath = new Map(specs.map((d) => [d.path, d]));
  for (const doc of specs) {
    const m = doc.meta;
    if (ids.has(m.id)) throw new Error(`duplicate spec id: ${m.id}`);
    ids.add(m.id);
    if (
      !['principles', 'architecture', 'behavior', 'api'].includes(m.kind) ||
      !['accepted', 'in-development'].includes(m.status) ||
      typeof m.owner !== 'string' ||
      !m.owner.trim()
    )
      throw new Error(`invalid spec ownership/state: ${doc.path}`);
    for (const key of ['principles', 'authorities'])
      if (
        !Array.isArray(m[key]) ||
        m[key].some((ref) => typeof ref !== 'string')
      )
        throw new Error(`invalid spec ${key}: ${doc.path}`);
    if (!m.authorities.length)
      throw new Error(`missing governing authority: ${doc.path}`);
    for (const ref of m.authorities) {
      if (
        !approved.has(ref) ||
        /\.(?:[cm]?[jt]sx?|py)$/.test(ref) ||
        ref === doc.path
      )
        throw new Error(`unapproved authority: ${ref}`);
      readFileSync(localFile(root, ref));
    }
    for (const ref of m.principles)
      if (!byPath.has(ref.split('#')[0]))
        throw new Error(`missing governing principle source: ${ref}`);
  }
  const claimed = new Set();
  const claim = (file, active = new Set()) => {
    if (active.has(file)) throw new Error(`principle cycle: ${file}`);
    if (claimed.has(file)) return;
    if (!byPath.has(file)) throw new Error(`unknown controlling spec: ${file}`);
    claimed.add(file);
    active.add(file);
    for (const p of byPath.get(file).meta.principles)
      claim(p.split('#')[0], active);
    active.delete(file);
  };
  for (const plan of plans.values())
    for (const file of plan.meta.specs) claim(file);
  for (const doc of specs)
    if (!claimed.has(doc.path))
      throw new Error(
        `desired state has no implementation/motion owner: ${doc.path}`
      );
  return {
    formatVersion: 1,
    role: 'desired-state-admission-projection',
    disposition: 'pass',
    specs: specs.map((s) => ({
      id: s.meta.id,
      path: s.path,
      sha256: s.sha256,
      status: s.meta.status,
      owner: s.meta.owner,
    })),
    plans: [...plans.values()].map((p) => ({
      id: p.meta.id,
      path: p.path,
      sha256: p.sha256,
      status: p.meta.status,
    })),
  };
}
export function verifyPlanHistory(root, base) {
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  const revision = git('rev-parse', '--verify', base + '^{commit}').trim();
  const files = git('ls-tree', '-r', '--name-only', revision, '--', 'plans')
    .trim()
    .split('\n')
    .filter((f) => f && f.endsWith('.md') && !f.endsWith('/README.md'));
  for (const file of files) {
    const before = git('show', revision + ':' + file);
    const doc = parseDocument(before, file);
    if (!existsSync(localFile(root, file)))
      throw new Error(`historical plan deletion: ${file}`);
    protectHistory(
      doc.meta.status,
      before,
      readFileSync(localFile(root, file), 'utf8')
    );
  }
  return { base: revision, checked: files.length };
}
export function affectedPlans(root, changed) {
  const paths = new Set(changed);
  const docs = new Map(loadSpecs(root).map((d) => [d.path, d]));
  const relevant = (file, visited = new Set()) => {
    if (paths.has(file)) return true;
    if (visited.has(file)) return false;
    visited.add(file);
    return (docs.get(file)?.meta.principles ?? []).some((ref) =>
      relevant(ref.split('#')[0], visited)
    );
  };
  return [...loadPlans(root).values()]
    .filter((p) => p.meta.specs.some((file) => relevant(file)))
    .map((p) => ({
      plan: p.slug,
      id: p.meta.id,
      issues: p.meta.issues,
      pr: p.meta.pr ?? null,
      action:
        p.meta.status === 'planned'
          ? 'revise-planned-motion'
          : p.meta.status === 'done'
          ? 'add-successor-motion'
          : 'notify-active-owner',
    }));
}
