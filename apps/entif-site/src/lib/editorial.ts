export function orderSeries<
  T extends { slug: string; series: { id: string; order: number } }
>(entries: readonly T[]): T[] {
  const ordered = [...entries].sort((a, b) => a.series.order - b.series.order);
  if (
    new Set(ordered.map((entry) => entry.slug)).size !== ordered.length ||
    new Set(ordered.map((entry) => entry.series.id)).size > 1 ||
    ordered.some((entry, index) => entry.series.order !== index + 1)
  ) {
    throw new Error(
      'Series requires unique destinations and consecutive chapter positions.'
    );
  }
  return ordered;
}
