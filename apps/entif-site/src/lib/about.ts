import { z } from 'astro/zod';
import { publicCopy, doctrineIds } from './doctrine';

const icon = z.enum([
  'evidence',
  'agency',
  'network',
  'shield',
  'architecture',
  'code',
  'people',
]);
const intro = z
  .object({ eyebrow: publicCopy, title: publicCopy, description: publicCopy })
  .strict();
const value = z
  .object({ icon, title: publicCopy, description: publicCopy })
  .strict();
export const aboutSchema = z
  .object({
    heroImage: z.literal('about-hero'),
    heroAction: publicCopy,
    heroSecondaryAction: publicCopy,
    mission: intro.extend({
      note: publicCopy,
      values: z.array(value).length(4),
    }),
    principles: intro.extend({
      items: z.array(value.extend({ document: z.enum(doctrineIds) })).length(4),
    }),
    founder: z
      .object({
        eyebrow: publicCopy,
        name: publicCopy,
        role: publicCopy,
        description: publicCopy,
        quote: publicCopy,
        quoteCredit: publicCopy,
        bioLabel: publicCopy,
        skills: z
          .array(z.object({ icon, title: publicCopy }).strict())
          .length(3),
      })
      .strict(),
    doctrine: intro.extend({
      readLabel: publicCopy,
      groups: z
        .object({
          foundations: publicCopy,
          standards: publicCopy,
          research: publicCopy,
        })
        .strict(),
    }),
    closing: intro.extend({
      heroImage: z.literal('closing-purpose'),
      action: publicCopy,
    }),
  })
  .strict();

export type About = z.infer<typeof aboutSchema>;
