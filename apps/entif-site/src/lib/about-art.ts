import type { ImageMetadata } from 'astro';

const artwork = import.meta.glob<ImageMetadata>('../assets/about/*.webp', {
  eager: true,
  import: 'default',
});

export function getAboutArtwork(name: string): ImageMetadata {
  const image = artwork[`../assets/about/${name}.webp`];
  if (!image) throw new Error(`Missing About artwork: ${name}`);
  return image;
}
