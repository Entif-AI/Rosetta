import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const identifierPattern = /^entif\.[a-z0-9.-]+$/;

const siteSchema = z
  .object({
    id: z.string().regex(identifierPattern),
    slug: z.string().regex(slugPattern),
    title: z.string().min(3).max(100),
    description: z.string().min(20).max(220),
    kind: z.enum(['research', 'project', 'protocol', 'essay', 'update']),
    status: z.enum(['draft', 'published', 'deprecated']),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    authors: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().regex(slugPattern)).default([]),
    projects: z.array(z.string().regex(slugPattern)).default([]),
    routeTag: z.string().regex(slugPattern).optional(),
    related: z.array(z.string().regex(identifierPattern)).default([]),
    sourceRefs: z.array(z.string().min(1)).default([]),
    report: z.string().optional(),
    version: z.string().optional(),
    review: z.string().optional(),
    evidenceCutoff: z.string().optional(),
    manuscript: z.string().optional(),
    featured: z.boolean().default(false),
    noindex: z.boolean().default(false),
    series: z
      .object({
        id: z.string().regex(slugPattern),
        order: z.number().int().min(1),
      })
      .optional(),
  })
  .superRefine((data, context) => {
    if (
      data.status === 'published' &&
      data.kind !== 'project' &&
      data.routeTag === undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['routeTag'],
        message: 'Published non-project content requires a stable routeTag.',
      });
    }

    if (
      data.routeTag !== undefined &&
      !data.tags.includes(data.routeTag) &&
      !data.projects.includes(data.routeTag)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['routeTag'],
        message: 'routeTag must also appear in tags or projects.',
      });
    }
  });

const pageSchema = z.object({
  slug: z.string().regex(slugPattern),
  title: z.string().min(3).max(100),
  eyebrow: z.string().min(2).max(60),
  description: z.string().min(20).max(280),
  status: z.enum(['draft', 'published']),
  sourceRefs: z.array(z.string().min(1)).default([]),
});

const site = defineCollection({
  loader: glob({
    pattern: '{projects,research,articles}/**/*.md',
    base: './content',
  }),
  schema: siteSchema,
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/pages' }),
  schema: pageSchema,
});

const ui = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/ui' }),
  schema: z.object({
    breadcrumb: z.string().min(1),
    brandTagline: z.string().min(1),
    logoAlt: z.string().min(1),
    scrollTop: z.string().min(1),
    brand: z.string().min(1),
    homeLabel: z.string().min(1),
    skip: z.string().min(1),
    navigation: z.string().min(1),
    socialLabel: z.string().min(1),
    footer: z.string().min(1),
    copyright: z.string().min(1),
    heroEyebrow: z.string().min(1),
    heroTitle: z.string().min(1),
    heroDescription: z.string().min(1),
    explore: z.string().min(1),
    trace: z.string().min(1),
    demoLabel: z.string().min(1),
    demoNote: z.string().min(1),
    selected: z.string().min(1),
    source: z.string().min(1),
    observation: z.string().min(1),
    interpretation: z.string().min(1),
    projection: z.string().min(1),
    document: z.string().min(1),
    measurement: z.string().min(1),
    inference: z.string().min(1),
    forecast: z.string().min(1),
    details: z.string().min(1),
    researchEyebrow: z.string().min(1),
    researchTitle: z.string().min(1),
    researchDescription: z.string().min(1),
    allResearch: z.string().min(1),
    principlesTitle: z.string().min(1),
    principlesEyebrow: z.string().min(1),
    principlesDescription: z.string().min(1),
    research: z.string().min(1),
    articles: z.string().min(1),
    about: z.string().min(1),
    contact: z.string().min(1),
    rosetta: z.string().min(1),
    tags: z.string().min(1),
    projects: z.string().min(1),
    team: z.string().min(1),
    archive: z.string().min(1),
    emptyArticles: z.string().min(1),
    relatedEyebrow: z.string().min(1),
    relatedTitle: z.string().min(1),
    metadata: z.string().min(1),
    contentId: z.string().min(1),
    status: z.string().min(1),
    authors: z.string().min(1),
    report: z.string().min(1),
    version: z.string().min(1),
    review: z.string().min(1),
    cutoff: z.string().min(1),
    download: z.string().min(1),
    contents: z.string().min(1),
    topics: z.string().min(1),
    tagDescription: z.string().min(1),
    tagCount: z.string().min(1),
    tagTitle: z.string().min(1),
    archiveDescription: z.string().min(1),
    notFoundTitle: z.string().min(1),
    notFoundDescription: z.string().min(1),
    notFoundEyebrow: z.string().min(1),
    notFoundHeading: z.string().min(1),
    notFoundBody: z.string().min(1),
    returnHome: z.string().min(1),
  }),
});
const editorial = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/editorial' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    report: z.string(),
    chapters: z.number().int().positive(),
    navigation: z.string(),
    previous: z.string(),
    next: z.string(),
    section: z.string(),
    sources: z.string(),
    referenceIntro: z.string(),
    sourceLink: z.string(),
    sourceLocation: z.string(),
    author: z.string(),
    year: z.string(),
    type: z.string(),
    role: z.string(),
    families: z.string(),
  }),
});
export const collections = { site, pages, ui, editorial };
