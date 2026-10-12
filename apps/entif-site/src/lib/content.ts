export const contentSections = {
  research: 'research',
  project: 'projects',
  protocol: 'protocols',
  essay: 'articles',
  update: 'updates',
} as const;

export type ContentKind = keyof typeof contentSections;
export type PublicationStatus = 'draft' | 'published' | 'deprecated';

export interface ContentSummary {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly kind: ContentKind;
  readonly status: PublicationStatus;
  readonly published: Date;
  readonly updated?: Date;
  readonly routeTag: string;
  readonly tags: readonly string[];
  readonly projects: readonly string[];
  readonly related: readonly string[];
  readonly noindex: boolean;
  readonly series?: { readonly id: string; readonly order: number };
}

export interface ContentCardData {
  readonly id: string;
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly kind: ContentKind;
  readonly tags: readonly string[];
  readonly projects: readonly string[];
}

export interface PublicationDateParts {
  readonly year: string;
  readonly month: string;
  readonly day: string;
}

const latestDate = (item: ContentSummary): number =>
  (item.updated ?? item.published).getTime();

const intersectionCount = (
  left: readonly string[],
  right: readonly string[]
): number => {
  const rightSet = new Set(right);
  return left.reduce((count, value) => count + Number(rightSet.has(value)), 0);
};

export const isPublished = (item: ContentSummary): boolean =>
  item.status === 'published';

export const getPublicationDateParts = (date: Date): PublicationDateParts => ({
  year: String(date.getUTCFullYear()),
  month: String(date.getUTCMonth() + 1).padStart(2, '0'),
  day: String(date.getUTCDate()).padStart(2, '0'),
});

export const getTaxonomyTerms = (
  item: Pick<ContentSummary, 'routeTag' | 'projects' | 'tags'>
): readonly string[] =>
  [...new Set([item.routeTag, ...item.projects, ...item.tags])].sort();

export const getContentPath = (
  item: Pick<
    ContentSummary,
    'kind' | 'slug' | 'published' | 'routeTag' | 'series'
  >
): string => {
  if (item.series) return `articles/${item.series.id}/${item.slug}/`;
  if (item.kind === 'project') {
    return `projects/${item.slug}/`;
  }

  const { year, month, day } = getPublicationDateParts(item.published);
  return `tags/${item.routeTag}/${year}/${month}/${day}/${item.slug}/`;
};

export const joinBasePath = (baseUrl: string, path: string): string => {
  const normalizedBase = baseUrl.replace(/^\/+|\/+$/g, '');
  const normalizedPath = path.replace(/^\/+/, '');
  const prefix = normalizedBase.length === 0 ? '/' : `/${normalizedBase}/`;

  return `${prefix}${normalizedPath}`;
};

export const toContentCard = (
  item: ContentSummary,
  baseUrl: string
): ContentCardData => ({
  id: item.id,
  href: joinBasePath(baseUrl, getContentPath(item)),
  title: item.title,
  description: item.description,
  kind: item.kind,
  tags: item.tags,
  projects: item.projects,
});

export const rankRelatedContent = (
  current: ContentSummary,
  candidates: readonly ContentSummary[],
  limit = 4
): readonly ContentSummary[] => {
  if (limit <= 0) {
    return [];
  }

  const explicit = new Set(current.related);

  return candidates
    .filter(
      (candidate) => candidate.id !== current.id && isPublished(candidate)
    )
    .map((candidate) => {
      const score =
        Number(explicit.has(candidate.id)) * 100 +
        intersectionCount(current.projects, candidate.projects) * 20 +
        intersectionCount(current.tags, candidate.tags) * 8 +
        Number(current.kind === candidate.kind);

      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        latestDate(right.candidate) - latestDate(left.candidate) ||
        left.candidate.id.localeCompare(right.candidate.id)
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
};

export const countTopics = (
  content: readonly ContentSummary[]
): ReadonlyMap<string, number> => {
  const counts = new Map<string, number>();

  for (const item of content.filter(isPublished)) {
    for (const term of getTaxonomyTerms(item)) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }

  return counts;
};
