import { isMain } from './entrypoint.mjs';
import process from 'node:process';
import console from 'node:console';
import { execFileSync } from 'node:child_process';
import { encode } from '@toon-format/toon';
import { loadPlans, readiness } from './plans.mjs';
import { loadSpecs } from './drift.mjs';
export function sections(doc, full = false) {
  const lines = doc.body.split('\n');
  const offset =
    doc.text.slice(0, doc.text.length - doc.body.length).split('\n').length - 1;
  const headers = [];
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const mark = lines[i].match(/^\s*(```+|~~~+)/);
    if (mark) {
      if (!fence) fence = mark[1][0];
      else if (fence === mark[1][0]) fence = null;
      continue;
    }
    if (fence) continue;
    const m = lines[i].match(/^#{2,6}\s+(.+)$/);
    if (m) headers.push({ heading: m[1], index: i });
  }
  if (!headers.length) headers.push({ heading: 'Document', index: -1 });
  return headers.map((h, i) => {
    const end = headers[i + 1]?.index ?? lines.length;
    const content = lines
      .slice(h.index + 1, end)
      .join('\n')
      .trim();
    const text = full ? content : content.replace(/\s+/g, ' ').slice(0, 220);
    return {
      heading: h.heading,
      text,
      chars: content.length,
      truncated: !full && text.length < content.replace(/\s+/g, ' ').length,
      start: offset + h.index + 2,
      end: offset + end,
    };
  });
}
const source = (doc, full) => ({
  id: doc.meta.id,
  path: doc.path,
  sha256: doc.sha256,
  status: doc.meta.status,
  summary: doc.summary.slice(0, 200),
  rules: sections(doc, full),
});
export function contextPacket(root, identity, options = {}) {
  const plans = loadPlans(root);
  const matches = [...plans.values()].filter(
    (p) => p.slug === identity || p.meta.id === identity
  );
  if (matches.length !== 1) throw new Error('unknown/ambiguous plan identity');
  const plan = matches[0];
  const docs = new Map(loadSpecs(root).map((d) => [d.path, d]));
  const controlling = plan.meta.specs.map((file) => {
    if (!docs.has(file)) throw new Error(`missing controlling spec: ${file}`);
    return docs.get(file);
  });
  const principles = new Map();
  const visit = (doc) => {
    for (const ref of doc.meta.principles ?? []) {
      const file = ref.split('#')[0];
      if (!docs.has(file)) throw new Error(`missing principle: ${ref}`);
      if (principles.has(file)) continue;
      principles.set(file, docs.get(file));
      visit(docs.get(file));
    }
  };
  controlling.forEach(visit);
  const changed = new Set(options.changed ?? []);
  const relationships = [];
  for (const d of controlling)
    relationships.push({
      from: plan.meta.id,
      kind: 'implements',
      to: d.meta.id,
    });
  for (const dep of plan.meta.depends)
    relationships.push({
      from: plan.meta.id,
      kind: 'depends-on',
      to: plans.get(dep).meta.id,
    });
  for (const d of [...controlling, ...principles.values()]) {
    for (const ref of d.meta.principles ?? [])
      relationships.push({
        from: d.meta.id,
        kind: 'governed-by',
        to: docs.get(ref.split('#')[0]).meta.id,
      });
    for (const rel of d.meta.relationships ?? []) {
      if (
        ![
          'specializes',
          'constrains',
          'validated-by',
          'supersedes',
          'amends',
        ].includes(rel.kind) ||
        typeof rel.to !== 'string'
      )
        throw new Error('invalid declared semantic relationship');
      relationships.push({ from: d.meta.id, kind: rel.kind, to: rel.to });
    }
    if (changed.has(d.path))
      relationships.push({
        from: d.meta.id,
        kind: 'affected-by-current-diff',
        to: options.base ?? 'working-tree',
      });
  }
  const repository = options.repository ?? null;
  if (repository && !/^[\w.-]+\/[\w.-]+$/.test(repository))
    throw new Error('invalid GitHub repository identity');
  return {
    formatVersion: 1,
    role: 'compact-execution-context-projection',
    sourceState: 'captured-working-tree',
    plan: {
      id: plan.meta.id,
      slug: plan.slug,
      summary: plan.summary.slice(0, 200),
      status: plan.meta.status,
      readiness: readiness(plan, plans),
      inspectionRequired: plan.meta.status === 'in-progress',
      awaits: plan.meta.awaits,
      dependencies: plan.meta.depends.map((s) => ({
        id: plans.get(s).meta.id,
        status: plans.get(s).meta.status,
      })),
      issues: plan.meta.issues,
      pr: plan.meta.pr ?? null,
      path: plan.path,
      sha256: plan.sha256,
    },
    specs: controlling.map((d) => source(d, options.full)),
    principles: [...principles.values()].map((d) => source(d, true)),
    change: {
      base: options.base ?? null,
      head: options.head ?? null,
      changedSources: [...changed].filter(
        (f) => docs.has(f) || f === plan.path
      ),
    },
    lineage: {
      repository,
      issues: repository
        ? plan.meta.issues.map(
            (n) => `https://github.com/${repository}/issues/${n}`
          )
        : [],
      pr:
        repository && plan.meta.pr
          ? `https://github.com/${repository}/pull/${plan.meta.pr}`
          : null,
      commit:
        repository && options.head
          ? `https://github.com/${repository}/commit/${options.head}`
          : null,
    },
    relationships,
    help: options.full
      ? []
      : [
          'expand <spec-id> --section <exact heading> for a requirement; --full for exact source',
        ],
  };
}
export function expandSource(root, identity, heading) {
  const docs = [...loadSpecs(root), ...loadPlans(root).values()];
  const matches = docs.filter(
    (d) => d.meta.id === identity || d.path === identity || d.slug === identity
  );
  if (matches.length !== 1)
    throw new Error('unknown/ambiguous source identity');
  const d = matches[0];
  if (!heading)
    return { id: d.meta.id, path: d.path, sha256: d.sha256, content: d.text };
  const found = sections(d, true).filter((s) => s.heading === heading);
  if (found.length !== 1) throw new Error('unknown/ambiguous section');
  return {
    id: d.meta.id,
    path: d.path,
    sha256: d.sha256,
    start: found[0].start,
    end: found[0].end,
    content: found[0].text,
  };
}
if (isMain(import.meta.url)) {
  try {
    const [command, identity, ...args] = process.argv.slice(2);
    if (!identity || !['context', 'expand'].includes(command))
      throw new Error(
        'usage: context.mjs context <plan> [--base ref] [--full] | expand <id> [--section heading] [--full]'
      );
    let full = false,
      base = null,
      heading;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--full') full = true;
      else if (
        ['--base', '--section'].includes(args[i]) &&
        args[i + 1] &&
        !args[i + 1].startsWith('--')
      ) {
        if (args[i] === '--base') base = args[++i];
        else heading = args[++i];
      } else throw new Error('unknown/missing option');
    }
    if ((command === 'expand' && base) || (command === 'context' && heading))
      throw new Error('option does not apply to command');
    const root = process.cwd();
    let result;
    if (command === 'expand') {
      result = expandSource(root, identity, heading);
      if (!full && result.content.length > 1200) {
        result.chars = result.content.length;
        result.content = result.content.slice(0, 1200);
        result.truncated = true;
        result.help = ['--full preserves exact source'];
      }
    } else {
      const git = (...a) =>
        execFileSync('git', a, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        }).trim();
      const head = git('rev-parse', 'HEAD');
      const remote = git('remote').split('\n').includes('origin')
        ? git('remote', 'get-url', 'origin')
        : null;
      const repository = remote?.match(
        /github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/
      )?.[1];
      const revision = base
        ? git('rev-parse', '--verify', base + '^{commit}')
        : null;
      const changed = base
        ? git('diff', '--name-only', revision).split('\n')
        : [];
      result = contextPacket(root, identity, {
        full,
        base: revision,
        head,
        changed,
        repository,
      });
    }
    console.log(encode(result));
  } catch (error) {
    console.log(
      encode({
        error: error.message,
        help: 'Inspect the controlling source and exact identity; no authority inferred.',
      })
    );
    process.exitCode = 1;
  }
}
