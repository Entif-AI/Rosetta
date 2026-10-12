import { getEntry } from 'astro:content';
const entry = await getEntry('ui', 'en');
if (!entry) throw new Error('English UI copy is missing');
export const copy = entry.data;
export const formatCopy = (
  text: string,
  values: Record<string, string | number>
): string =>
  text.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? `{${key}}`)
  );
