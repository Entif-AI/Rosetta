import process from 'node:process';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
const sources = JSON.parse(
  readFileSync(
    new URL(
      '../../content/editorial/accelerating-the-dystopia/sources.json',
      import.meta.url
    ),
    'utf8'
  )
);

export const citationKeys = (value) => [
  ...new Set(value.match(/S\d{3}/g) ?? []),
];
export function resolveSources(keys, registry = sources) {
  return keys.map((key) => {
    const source = registry.find((row) => row.Source_ID === key);
    if (!source) throw new Error(`Unresolved editorial source: ${key}`);
    return source;
  });
}

const text = (value) => ({ type: 'text', value });
const element = (tagName, properties, children) => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const marker =
  /\[S\d{3}(?:\s*[,;]\s*S\d{3})*\](?:\s*\[S\d{3}(?:\s*[,;]\s*S\d{3})*\])*/g;

export function rehypeEditorial() {
  return (tree, file) => {
    const series = file.data.astro?.frontmatter?.series;
    if (series?.id !== 'accelerating-the-dystopia') return;
    const base = (process.env.ENTIF_SITE_BASE ?? '').replace(/^\/+|\/+$/g, '');
    const reference = `${base ? '/' + base : ''}/articles/${
      series.id
    }/17-citations/`;
    let sequence = 0;
    const walk = (node) => {
      if (['a', 'code', 'pre'].includes(node.tagName) || !node.children) return;
      node.children = node.children.flatMap((child) => {
        if (child.type === 'raw') {
          child.value = child.value.replace(
            /href="etr-source:(S\d{3})"/g,
            (_, key) => {
              resolveSources([key]);
              return `href="${reference}#source-${key}"`;
            }
          );
          return [child];
        }
        if (child.type !== 'text') {
          walk(child);
          return [child];
        }
        const result = [];
        let end = 0;
        for (const match of child.value.matchAll(marker)) {
          if (match.index > end)
            result.push(text(child.value.slice(end, match.index)));
          const resolved = resolveSources(citationKeys(match[0]));
          const id = `citation-${series.order}-${++sequence}`;
          result.push(
            element(
              'span',
              {
                className: ['editorial-citation'],
                'data-test-id': 'editorial-citation',
              },
              [
                ...resolved.map((source) =>
                  element(
                    'a',
                    {
                      href: reference + '#source-' + source.Source_ID,
                      'data-test-id': 'citation-fallback',
                    },
                    [text(`[${source.Source_ID}]`)]
                  )
                ),
                element(
                  'button',
                  {
                    type: 'button',
                    hidden: true,
                    'data-test-id': 'citation-trigger',
                    'aria-label': `Sources ${resolved
                      .map((s) => s.Source_ID)
                      .join(', ')}`,
                    'aria-expanded': 'false',
                    'aria-controls': id,
                  },
                  [text(match[0])]
                ),
                element(
                  'span',
                  {
                    id,
                    popover: 'auto',
                    className: ['editorial-citation-panel'],
                    'data-test-id': 'citation-panel',
                    role: 'group',
                    'aria-label': 'Citation sources',
                  },
                  [
                    ...resolved.map((source) =>
                      element(
                        'span',
                        { className: ['editorial-citation-source'] },
                        [
                          element(
                            'a',
                            {
                              href: reference + '#source-' + source.Source_ID,
                              'data-test-id': 'citation-reference',
                            },
                            [text(`${source.Source_ID} · ${source.Title}`)]
                          ),
                          element('span', {}, [
                            text(
                              `${source.Author_or_Institution} · ${source.Year}`
                            ),
                          ]),
                          element('span', {}, [
                            text(
                              `${source.Source_Type} · ${source.Authority_Role}`
                            ),
                          ]),
                        ]
                      )
                    ),
                    element(
                      'button',
                      {
                        type: 'button',
                        'data-test-id': 'citation-close',
                        'aria-label': 'Close citation',
                      },
                      [text('Close')]
                    ),
                  ]
                ),
              ]
            )
          );
          end = match.index + match[0].length;
        }
        if (end < child.value.length) result.push(text(child.value.slice(end)));
        return result;
      });
    };
    walk(tree);
    // Section boundaries and the opening remain authored content, not duplicated quotations.
    const beats = [];
    let current = [];
    for (const node of tree.children) {
      if (node.tagName === 'h2' && current.length) {
        beats.push(current);
        current = [];
      }
      current.push(node);
    }
    if (current.length) beats.push(current);
    tree.children = beats.map((children, index) =>
      element(
        'section',
        {
          className: ['editorial-beat'],
          'data-test-id': 'editorial-beat',
          'data-beat': index + 1,
        },
        children
      )
    );
  };
}
