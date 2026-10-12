import { URL } from 'node:url';
import process from 'node:process';
import { readFileSync } from 'node:fs';
export function remarkSiteAssets() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'image' && node.url.startsWith('/research-assets/')) {
        const source = readFileSync(
          new URL('../../public' + node.url, import.meta.url),
          'utf8'
        );
        const box = source
          .match(/viewBox=["']([\d. -]+)["']/)?.[1]
          .split(/\s+/)
          .map(Number);
        const width =
          box?.[2] ?? Number(source.match(/width=["']([\d.]+)/)?.[1]);
        const height =
          box?.[3] ?? Number(source.match(/height=["']([\d.]+)/)?.[1]);
        node.data ??= {};
        node.data.hProperties = {
          loading: 'lazy',
          decoding: 'async',
          width: Math.round(width),
          height: Math.round(height),
        };
        const base = (process.env.ENTIF_SITE_BASE ?? '').replace(
          /^\/+|\/+$/g,
          ''
        );
        if (base) node.url = '/' + base + node.url;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

export function rehypeSiteTables() {
  return (tree) => {
    const text = (node) =>
      node.value ?? node.children?.map(text).join(' ') ?? '';
    const walk = (node) => {
      if (node.tagName === 'table') {
        node.properties ??= {};
        node.properties.tabIndex = 0;
        node.properties.ariaLabel = text(
          node.children?.find((n) => n.tagName === 'thead') ?? node
        )
          .trim()
          .slice(0, 160);
      }
      if (node.properties?.align) {
        node.properties.className = ['align-' + node.properties.align];
        delete node.properties.align;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
