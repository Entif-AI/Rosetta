import { z } from 'astro/zod';
import { aboutSchema } from './about';
import { getContentPath, joinBasePath, type ContentSummary } from './content';

export const systemIds = [
  'rosetta',
  'bilqis',
  'gnosis',
  'akasha',
  'codito',
  'indranet',
  'guard-tripwire',
] as const;
export const stageIds = [
  'hero',
  'stakes',
  'pivot',
  'architecture',
  'responses',
  'scenario',
  'closing',
] as const;
export const responseIds = [
  'meaning',
  'inheritance',
  'memory',
  'authority',
  'concentration',
  'culture',
] as const;
const stakeIds = [
  'insight',
  'meaning',
  'mistakes',
  'authority',
  'concentration',
] as const;
const scenarioIds = [
  'indranet',
  'rosetta',
  'bilqis',
  'gnosis',
  'akasha',
  'codito',
  'guard-tripwire',
] as const;
const systemId = z.enum(systemIds);
const copy = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => !/https?:\/\/(?:docs|drive)\.google\.com|IPR-\d{4}/i.test(value),
    'Showcase copy must not contain private source destinations or protected identifiers.'
  );
const intro = z
  .object({ eyebrow: copy, headline: copy, description: copy })
  .strict();
const contributor = z.enum([
  'Rosetta',
  'Bilqis',
  'GNOSIS',
  'Akasha',
  'Codito',
  'IndraNet',
  'Guard',
  'TripWire',
]);
const publicProjectSlugs = new Map([
  ['rosetta', 'rosetta'],
  ['bilqis', 'bilqis'],
  ['codito', 'codito'],
  ['indranet', 'indranet'],
]);
const names = [
  'Rosetta',
  'Bilqis',
  'GNOSIS',
  'Akasha',
  'Codito',
  'IndraNet',
  'Guard / TripWire',
];

export const showcaseSchema = z
  .object({
    hero: z
      .object({
        eyebrow: copy,
        title: copy,
        description: copy,
        supportingText: copy,
        ctaLabel: copy,
        ctaTarget: z.literal('#uca-architecture'),
        agencyLabel: copy,
        agencyCaption: copy,
      })
      .strict(),
    stakesIntro: intro.extend({ emphasis: copy }),
    stakes: z
      .array(
        z
          .object({ id: z.enum(stakeIds), headline: copy, description: copy })
          .strict()
      )
      .length(5),
    pivot: intro.extend({ emphasis: copy }),
    architecture: intro.extend({
      systems: z
        .array(
          z
            .object({
              id: systemId,
              name: copy,
              promise: copy,
              headline: copy,
              category: copy,
              detail: copy,
              principle: copy,
              projectSlug: z.string().optional(),
            })
            .strict()
        )
        .length(7),
    }),
    responsesIntro: intro,
    responses: z
      .array(
        z
          .object({
            id: z.enum(responseIds),
            etrIds: z.array(z.string().regex(/^ETR-2026-\d{2}$/)),
            question: copy,
            concern: copy,
            response: copy,
            contributors: z.array(contributor).min(1),
          })
          .strict()
      )
      .length(6),
    scenario: intro.extend({
      steps: z
        .array(z.object({ systemId, description: copy }).strict())
        .length(7),
      conclusion: copy,
    }),
    closing: intro.extend({
      emphasis: copy,
      supportingText: copy,
      ctaLabel: copy,
      ctaTarget: z.literal('#uca-hero'),
    }),
    publicResearchIds: z
      .array(z.string().regex(/^entif\.(research|essay)\.[a-z0-9.-]+$/))
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const ordered = (
      actual: readonly string[],
      expected: readonly string[],
      path: string[]
    ) => {
      if (actual.some((id, i) => id !== expected[i]))
        ctx.addIssue({
          code: 'custom',
          path,
          message: `Expected unique IDs in order: ${expected.join(', ')}.`,
        });
    };
    ordered(
      data.stakes.map((s) => s.id),
      stakeIds,
      ['stakes']
    );
    ordered(
      data.architecture.systems.map((s) => s.id),
      systemIds,
      ['architecture', 'systems']
    );
    ordered(
      data.responses.map((r) => r.id),
      responseIds,
      ['responses']
    );
    ordered(
      data.scenario.steps.map((s) => s.systemId),
      scenarioIds,
      ['scenario', 'steps']
    );
    for (const [i, system] of data.architecture.systems.entries()) {
      if (system.name !== names[i])
        ctx.addIssue({
          code: 'custom',
          path: ['architecture', 'systems', i, 'name'],
          message: 'Use the prescribed public system identity.',
        });
      if (system.projectSlug !== publicProjectSlugs.get(system.id))
        ctx.addIssue({
          code: 'custom',
          path: ['architecture', 'systems', i, 'projectSlug'],
          message:
            'Only the four published project destinations belong to this showcase.',
        });
    }
    for (const [i, response] of data.responses.entries()) {
      if (
        new Set(response.etrIds).size !== response.etrIds.length ||
        new Set(response.contributors).size !== response.contributors.length
      )
        ctx.addIssue({
          code: 'custom',
          path: ['responses', i],
          message: 'Source and contributor references must be unique.',
        });
    }
  });

export const pageSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(3).max(100),
    eyebrow: z.string().min(2).max(60),
    description: z.string().min(20).max(280),
    status: z.enum(['draft', 'published']),
    sourceRefs: z.array(z.string().min(1)).default([]),
    showcase: showcaseSchema.optional(),
    about: aboutSchema.optional(),
  })
  .superRefine((page, ctx) => {
    if (page.slug === 'projects' && !page.showcase)
      ctx.addIssue({
        code: 'custom',
        path: ['showcase'],
        message: 'Projects requires its complete seven-stage showcase.',
      });
  });

export type Showcase = z.infer<typeof showcaseSchema>;
export type SystemId = (typeof systemIds)[number];
type PublicEntry = ContentSummary & { readonly report?: string };
export interface PublicLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

export interface ShowcaseLinks {
  readonly projects: ReadonlyMap<SystemId, PublicLink>;
  readonly responses: ReadonlyMap<
    (typeof responseIds)[number],
    readonly { readonly id: string; readonly link?: PublicLink }[]
  >;
  readonly research: readonly PublicLink[];
}

// A manuscript identifier is an attribution, never proof of a published route.
export function resolveShowcaseLinks(
  showcase: Showcase,
  entries: readonly PublicEntry[],
  base: string
): ShowcaseLinks {
  const published = entries.filter(
    (e) => e.status === 'published' && !e.noindex
  );
  const link = (entry: PublicEntry): PublicLink => ({
    id: entry.id,
    label: entry.title,
    href: joinBasePath(base, getContentPath(entry)),
  });
  const projects = new Map<SystemId, PublicLink>();
  for (const system of showcase.architecture.systems) {
    if (!system.projectSlug) continue;
    const entry = published.find(
      (e) => e.kind === 'project' && e.slug === system.projectSlug
    );
    if (!entry)
      throw new Error(`Missing published project: ${system.projectSlug}`);
    projects.set(system.id, link(entry));
  }
  const responses = new Map(
    showcase.responses.map((response) => [
      response.id,
      response.etrIds.map((id) => {
        const entry = published.find(
          (e) =>
            e.kind !== 'project' &&
            e.report === id &&
            (!e.series || e.series.order === 1)
        );
        return { id, ...(entry ? { link: link(entry) } : {}) };
      }),
    ])
  );
  const research = (showcase.publicResearchIds ?? []).map((id) => {
    const entry = published.find((e) => e.id === id && e.kind !== 'project');
    if (!entry) throw new Error(`Missing published research: ${id}`);
    return link(entry);
  });
  return { projects, responses, research };
}
