import { getCollection, type CollectionEntry } from 'astro:content';
import { contentSections, type ContentSummary } from './content';

export type SiteEntry = CollectionEntry<'site'>;

export const toSummary = (entry: SiteEntry): ContentSummary => ({
  id: entry.data.id,
  slug: entry.data.slug,
  title: entry.data.title,
  description: entry.data.description,
  kind: entry.data.kind,
  status: entry.data.status,
  published: entry.data.published,
  ...(entry.data.updated === undefined ? {} : { updated: entry.data.updated }),
  routeTag:
    entry.data.routeTag ??
    entry.data.projects[0] ??
    entry.data.tags[0] ??
    contentSections[entry.data.kind],
  tags: entry.data.tags,
  projects: entry.data.projects,
  related: entry.data.related,
  noindex: entry.data.noindex,
  ...(entry.data.series ? { series: entry.data.series } : {}),
});

export const getPublishedEntries = async (): Promise<readonly SiteEntry[]> => {
  const entries = await getCollection(
    'site',
    ({ data }) => data.status === 'published'
  );

  return entries.sort(
    (left, right) =>
      (right.data.updated ?? right.data.published).getTime() -
      (left.data.updated ?? left.data.published).getTime()
  );
};
