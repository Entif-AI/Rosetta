import { z } from 'astro/zod';
import { joinBasePath } from './content';

export const doctrineIds = [
  'D01',
  'D02',
  'D03',
  'D04',
  'D05',
  'D06',
  'D07',
  'D08',
  'D09',
  'D10',
  'D11',
  'D12',
  'D13',
  'D14',
  'D16',
] as const;
export const publicCopy = z
  .string()
  .trim()
  .min(1)
  .refine(
    (text) =>
      !/https?:\/\/(?:docs|drive)\.google\.com|IPR-\d{4}|private-ip/i.test(
        text
      ),
    'Public presentation must not contain protected source destinations or mechanisms.'
  );
export const doctrineSchema = z
  .object({
    id: z.enum(doctrineIds),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: publicCopy.pipe(z.string().max(120)),
    shortTitle: publicCopy.pipe(z.string().max(60)),
    description: publicCopy.pipe(z.string().min(20).max(280)),
    group: z.enum(['foundations', 'standards', 'research']),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    documentState: z.enum(['candidate-draft', 'public-overview']),
    sourceKind: z.literal('document'),
    sourceTitle: publicCopy,
    sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
    snapshotDate: z.iso.date(),
    heroImage: z
      .string()
      .regex(/^d(?:0[1-9]|1[0-6])-[a-z0-9]+(?:-[a-z0-9]+)*$/),
    takeaway: publicCopy,
    sourceRefs: z
      .array(z.string().regex(/^(?:[PCEH]\d{2,3}|GC\d{3}|D\d{2})$/))
      .default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.id === 'D05' && data.documentState !== 'public-overview')
      ctx.addIssue({
        code: 'custom',
        path: ['documentState'],
        message:
          'The internal counsel brief has a public overview, not a public full-text mirror.',
      });
  });
export type Doctrine = z.infer<typeof doctrineSchema>;
type Destination = Pick<Doctrine, 'id' | 'slug' | 'title' | 'shortTitle'>;

export function getDoctrinePath(slug: string, base = '/'): string {
  return joinBasePath(base, `about/doctrine/${slug}/`);
}

export function resolveDoctrineNavigation(
  entries: readonly Destination[],
  current: string,
  base: string
): {
  previous: (Destination & { href: string }) | undefined;
  next: (Destination & { href: string }) | undefined;
} {
  if (
    new Set(entries.map((e) => e.id)).size !== entries.length ||
    new Set(entries.map((e) => e.slug)).size !== entries.length
  )
    throw new Error('Doctrine identities and routes must be unique.');
  const ordered = [...entries].sort((a, b) => a.id.localeCompare(b.id));
  const index = ordered.findIndex((e) => e.id === current);
  if (index < 0) throw new Error(`Unknown doctrine document: ${current}`);
  const link = (entry: Destination | undefined) =>
    entry ? { ...entry, href: getDoctrinePath(entry.slug, base) } : undefined;
  return { previous: link(ordered[index - 1]), next: link(ordered[index + 1]) };
}
