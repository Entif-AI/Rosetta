import type { ImageMetadata } from 'astro';
import { getAboutArtwork } from './about-art';

export const contentCardArtworkNames = [
  'd03-provenance',
  'd09-attention',
  'd06-ethics',
  'd12-memory',
  'd02-charter',
  'd10-apprenticeship',
  'd05-legal-design',
  'd14-research-ethics',
  'd08-consent',
  'd11-authority',
  'd01-nonprofit',
  'd07-epistemic-integrity',
  'd04-governance',
  'd13-moral-uncertainty',
  'd16-conformance',
] as const;

export interface ContentCardArtwork {
  readonly name: (typeof contentCardArtworkNames)[number];
  readonly image: ImageMetadata;
}

export function getContentCardArtwork(index: number): ContentCardArtwork {
  const normalized =
    ((index % contentCardArtworkNames.length) +
      contentCardArtworkNames.length) %
    contentCardArtworkNames.length;
  const name = contentCardArtworkNames[normalized];
  if (name === undefined) throw new Error('Missing content-card artwork');
  return { name, image: getAboutArtwork(name) };
}
