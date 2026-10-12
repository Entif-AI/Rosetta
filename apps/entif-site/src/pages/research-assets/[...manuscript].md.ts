import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedEntries, type SiteEntry } from '../../lib/site-data';
import { joinBasePath } from '../../lib/content';

export const getStaticPaths: GetStaticPaths = async () => {
  return (await getPublishedEntries())
    .filter((entry) => entry.data.manuscript)
    .map((entry) => ({
      params: {
        manuscript: entry.data.manuscript
          ?.replace(/^research-assets\//, '')
          .replace(/\.md$/, ''),
      },
      props: { entry },
    }));
};

export const GET: APIRoute = ({ props }) => {
  const entry = props.entry as SiteEntry;
  const body = entry.body ?? '';
  const manuscript = `# ${entry.data.title}\n\n${body}`.replace(
    /\]\((\/research-assets\/[^)]+)\)/g,
    (_, path: string) =>
      `](${
        new URL(
          joinBasePath(import.meta.env.BASE_URL, path),
          import.meta.env.SITE
        ).href
      })`
  );
  return new Response(manuscript, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
