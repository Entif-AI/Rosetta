import { mkdir, copyFile } from 'node:fs/promises';
import { unified } from '@astrojs/markdown-remark';
import {
  remarkSiteAssets,
  rehypeSiteTables,
} from './src/lib/remark-site-assets.mjs';
import react from '@astrojs/react';
import { rehypeEditorial } from './src/lib/editorial-citations.mjs';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const configuredSite = process.env.ENTIF_SITE_URL ?? 'https://entif.ai';
const configuredBase = process.env.ENTIF_SITE_BASE ?? '/';
const base =
  configuredBase === '/' ? '/' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  site: configuredSite,
  base,
  output: 'static',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkSiteAssets],
      rehypePlugins: [rehypeSiteTables, rehypeEditorial],
    }),
  },
  integrations: [
    react(),
    sitemap({
      serialize(item) {
        const hyphenatedPath = item.url.replaceAll('/', '-');
        const datePattern = /\d{4}-\d{2}-\d{2}/g;
        const dateMatch = hyphenatedPath.match(datePattern);

        if (dateMatch?.length) {
          item.lastmod = new Date(dateMatch[0]).toDateString();
        }

        return item;
      },
    }),
    {
      name: 'not-found-direct-route',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          await mkdir(new URL('404/', dir), { recursive: true });
          await copyFile(
            new URL('404.html', dir),
            new URL('404/index.html', dir)
          );
        },
      },
    },
  ],
  build: {
    assets: '_assets',
  },
});
