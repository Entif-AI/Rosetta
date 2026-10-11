import { readFileSync } from 'node:fs';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';
import {
  pageSchema,
  showcaseSchema,
  resolveShowcaseLinks,
  systemIds,
  stageIds,
  type Showcase,
} from '../../src/lib/showcase';
import type { ContentSummary } from '../../src/lib/content';

const rawPage = parseFrontmatter(
  readFileSync('content/pages/projects.md', 'utf8')
).frontmatter;
const page = pageSchema.parse(rawPage);
if (!page.showcase) throw new Error('Missing Projects fixture');
const showcase: Showcase = page.showcase;
const projectEntries: ContentSummary[] = [
  'rosetta',
  'bilqis',
  'codito',
  'indranet',
].map((slug) => ({
  id: `entif.project.${slug}`,
  slug,
  title: slug,
  description: 'Published project fixture',
  kind: 'project',
  status: 'published',
  published: new Date('2026-09-01T00:00:00Z'),
  routeTag: slug,
  tags: [],
  projects: [],
  related: [],
  noindex: false,
}));
const paper = {
  ...projectEntries[0],
  id: 'entif.research.example',
  slug: 'example',
  title: 'Example research',
  description: 'Public research fixture',
  kind: 'research' as const,
  status: 'published' as const,
  published: new Date('2026-09-10T00:00:00Z'),
  routeTag: 'research',
  tags: [],
  projects: [],
  related: [],
  noindex: false,
  report: 'ETR-2026-01',
};

describe('Projects content admission', () => {
  it('admits the complete seven-stage authored source and stable system order', () => {
    expect(stageIds.every((id) => id in showcase)).toBe(true);
    expect(showcase.stakes).toHaveLength(5);
    expect(showcase.architecture.systems.map((s) => s.id)).toEqual(systemIds);
    expect(showcase.responses).toHaveLength(6);
    expect(showcase.scenario.steps).toHaveLength(7);
    expect(`${showcase.closing.headline} ${showcase.closing.emphasis}`).toBe(
      'Let knowledge grow. Keep people in control.'
    );
  });
  it('requires showcase only for Projects, preserving other existing pages', () => {
    expect(
      pageSchema.safeParse({ ...rawPage, showcase: undefined }).success
    ).toBe(false);
    const home = parseFrontmatter(
      readFileSync('content/pages/home.md', 'utf8')
    ).frontmatter;
    expect(pageSchema.safeParse(home).success).toBe(true);
  });
  const malformed: [string, (value: Showcase) => unknown][] = [
    ['missing stage', (s) => ({ ...s, pivot: undefined })],
    [
      'blank required copy',
      (s) => ({ ...s, hero: { ...s.hero, title: '  ' } }),
    ],
    [
      'missing seventh system',
      (s) => ({
        ...s,
        architecture: {
          ...s.architecture,
          systems: s.architecture.systems.slice(0, 6),
        },
      }),
    ],
    [
      'duplicate system',
      (s) => ({
        ...s,
        architecture: {
          ...s.architecture,
          systems: s.architecture.systems.map((system, i) =>
            i === 1 ? { ...system, id: 'rosetta' } : system
          ),
        },
      }),
    ],
    [
      'wrong order',
      (s) => ({
        ...s,
        architecture: {
          ...s.architecture,
          systems: [...s.architecture.systems].reverse(),
        },
      }),
    ],
    [
      'renamed identity',
      (s) => ({
        ...s,
        architecture: {
          ...s.architecture,
          systems: s.architecture.systems.map((system, i) =>
            i === 0 ? { ...system, name: 'Another system' } : system
          ),
        },
      }),
    ],
    [
      'unknown scenario system',
      (s) => ({
        ...s,
        scenario: {
          ...s.scenario,
          steps: s.scenario.steps.map((step, i) =>
            i === 0 ? { ...step, systemId: 'unknown' } : step
          ),
        },
      }),
    ],
    [
      'duplicate response',
      (s) => ({
        ...s,
        responses: s.responses.map((r, i) =>
          i === 1 ? { ...r, id: 'meaning' } : r
        ),
      }),
    ],
    ['missing concern', (s) => ({ ...s, responses: s.responses.slice(0, 5) })],
    [
      'duplicate stake',
      (s) => ({
        ...s,
        stakes: s.stakes.map((v, i) => (i === 1 ? { ...v, id: 'insight' } : v)),
      }),
    ],
    [
      'broken fragment',
      (s) => ({ ...s, hero: { ...s.hero, ctaTarget: '#missing' } }),
    ],
    [
      'invented project',
      (s) => ({
        ...s,
        architecture: {
          ...s.architecture,
          systems: s.architecture.systems.map((v) =>
            v.id === 'gnosis' ? { ...v, projectSlug: 'gnosis' } : v
          ),
        },
      }),
    ],
    [
      'unknown contributor',
      (s) => ({
        ...s,
        responses: s.responses.map((r, i) =>
          i === 0 ? { ...r, contributors: ['Unknown'] } : r
        ),
      }),
    ],
    [
      'private source',
      (s) => ({
        ...s,
        hero: {
          ...s.hero,
          description: 'https://docs.google.com/document/private',
        },
      }),
    ],
  ];
  it.each(malformed)('rejects %s before rendering', (_, alter) => {
    expect(
      showcaseSchema.safeParse(alter(structuredClone(showcase))).success
    ).toBe(false);
  });
});

describe('public destination resolution', () => {
  it('derives only four published project links and honors a repository base path', () => {
    const links = resolveShowcaseLinks(showcase, projectEntries, '/preview/');
    expect([...links.projects.keys()]).toEqual([
      'rosetta',
      'bilqis',
      'codito',
      'indranet',
    ]);
    expect(links.projects.get('rosetta')?.href).toBe(
      '/preview/projects/rosetta/'
    );
    expect(links.projects.has('gnosis')).toBe(false);
    expect(links.responses.get('concentration')?.[0]?.link).toBeUndefined();
  });
  it('links published research metadata while excluding drafts and noindex entries', () => {
    const entries = [...projectEntries, paper];
    const links = resolveShowcaseLinks(showcase, entries, '/');
    expect(links.responses.get('meaning')?.[0]?.link?.href).toBe(
      '/tags/research/2026/09/10/example/'
    );
    for (const excluded of [
      { ...paper, status: 'draft' as const },
      { ...paper, noindex: true },
    ]) {
      expect(
        resolveShowcaseLinks(
          showcase,
          [...projectEntries, excluded],
          '/'
        ).responses.get('meaning')?.[0]?.link
      ).toBeUndefined();
    }
  });
  it('refuses explicit project/research destinations without publishable metadata', () => {
    expect(() =>
      resolveShowcaseLinks(showcase, projectEntries.slice(1), '/')
    ).toThrow('Missing published project');
    expect(() =>
      resolveShowcaseLinks(
        { ...showcase, publicResearchIds: ['entif.research.example'] },
        projectEntries,
        '/'
      )
    ).toThrow('Missing published research');
  });
});
