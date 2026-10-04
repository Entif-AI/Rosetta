import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import { createRequire } from 'node:module';
import { URL } from 'node:url';
import { contextPacket } from '../../packages/nx-governance/specops/context.mjs';
const { encode } = await import(
  createRequire(
    new URL('../../packages/nx-governance/package.json', import.meta.url)
  ).resolve('@toon-format/toon')
);
const architecture = readFileSync('specs/architecture.md', 'utf8');
const principles = readFileSync('specs/principles.md', 'utf8');
const plan = readFileSync('plans/specops-context.md', 'utf8');
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const metadata = {
  repository: 'entif-ai/rosetta',
  head: git('rev-parse', 'HEAD'),
  base: git('rev-parse', 'origin/main'),
  changed: git('diff', '--name-only', 'origin/main').split('\n'),
};
const rootPacket = contextPacket(process.cwd(), 'specops-context', metadata);
const temporary = mkdtempSync(path.join(tmpdir(), 'entif-context-benchmark-'));
try {
  mkdirSync(path.join(temporary, 'specs'));
  mkdirSync(path.join(temporary, 'plans'));
  writeFileSync(path.join(temporary, 'specs/architecture.md'), architecture);
  writeFileSync(path.join(temporary, 'specs/principles.md'), principles);
  writeFileSync(path.join(temporary, 'plans/specops-context.md'), plan);
  for (const name of readdirSync('plans').filter(
    (n) => n.endsWith('.md') && n !== 'README.md'
  ))
    writeFileSync(
      path.join(temporary, 'plans', name),
      readFileSync('plans/' + name)
    );
  let fixtureCorpus = architecture + principles + plan;
  for (let i = 0; i < 22; i++) {
    const extra = architecture
      .replace(
        'entif:development-substrate',
        'fixture:independent-surface-' + i
      )
      .replace('# Development substrate', '# Independent fixture surface ' + i);
    writeFileSync(path.join(temporary, 'specs/surface-' + i + '.md'), extra);
    fixtureCorpus += extra;
  }
  const packet = contextPacket(temporary, 'specops-context', {
    ...metadata,
    changed: ['specs/architecture.md'],
  });
  assert.equal(packet.specs.length, 1);
  assert.equal(packet.principles.length, 1);
  assert.equal(packet.plan.issues[0], 1720);
  assert.ok(packet.plan.readiness);
  assert.ok(
    packet.principles[0].rules.some((r) =>
      r.text.includes('One mutable writer')
    )
  );
  assert.ok(
    packet.principles[0].rules.some((r) =>
      r.text.includes('Code observations reveal drift')
    )
  );
  assert.match(packet.specs[0].sha256, /^[a-f0-9]{64}$/);
  const measure = (corpus, p) => ({
    naiveCorpusAndPlanBytes: Buffer.byteLength(corpus),
    compactToonBytes: Buffer.byteLength(encode(p)),
    ratio: Buffer.byteLength(encode(p)) / Buffer.byteLength(corpus),
  });
  const report = {
    issue: 1720,
    role: 'context-byte-benchmark-not-quota-claim',
    repository: measure(architecture + principles + plan, rootPacket),
    fixture: {
      description:
        '24-spec corpus: current repository architecture/principles plus 22 independent fixture surfaces derived from public architecture text; one controlling plan',
      ...measure(fixtureCorpus, packet),
    },
    fidelity: {
      planIdentity: true,
      readiness: true,
      issues: true,
      governingPrinciples: true,
      sourceLocatorsAndDigests: true,
      onDemandSections: true,
    },
    limitations: [
      'Fixture is synthetic, not a claim that repository already has 24 specs',
      'Small current repository corpus can be cheaper to read directly',
      'Bytes measured; tokens/turns/quality-adjusted quota not measured',
      'No routing/model policy change; #1711 remains downstream',
    ],
  };
  assert.ok(
    report.fixture.compactToonBytes < report.fixture.naiveCorpusAndPlanBytes
  );
  writeFileSync(
    'tools/specops/evidence/context-benchmark.json',
    JSON.stringify(report, null, 2) + '\n'
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
