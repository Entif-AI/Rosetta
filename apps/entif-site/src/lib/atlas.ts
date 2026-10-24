export const ATLAS_SERIES_ID = 'agentic-aberrancy-atlas';
export const ATLAS_REFERENCE_PATH =
  '/articles/agentic-aberrancy-atlas/16-appendices-and-references/';

const chapterSources = import.meta.glob<string>(
  '../atlas/chapters/chapter-*.html',
  {
    query: '?raw',
    import: 'default',
    eager: true,
  }
);

export interface AtlasChapter {
  readonly html: string;
  readonly sceneCount: number;
}

export interface AtlasCitationSource {
  readonly key: string;
  readonly anchor: string;
  readonly title: string;
  readonly family: string;
  readonly detail: string;
  readonly targetHeadingId: string;
}

interface ReferenceSection {
  readonly sceneNumber: number;
  readonly headingId: string;
  readonly title: string;
  readonly summary: string;
  readonly html: string;
}

const citationPattern =
  /<span class="citation">((?:[^<]|<span class="citation-source">[^<]+<\/span>)*)<\/span>/g;
const citationSourcePattern = /<span class="citation-source">([^<]+)<\/span>/g;

const decodeHtml = (value: string): string =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&nbsp;', ' ');

const plainText = (value: string): string =>
  decodeHtml(
    value
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );

const firstSentence = (value: string): string => {
  const clean = plainText(value).replace(
    /^(?:Preserved observation|Author-side interpretation):\s*/i,
    ''
  );
  const sentence = clean.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? clean;
  return sentence.length <= 240
    ? sentence
    : `${sentence.slice(0, 237).trim()}…`;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const citationAnchor = (key: string): string => {
  const slug = key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `atlas-source-${slug}`;
};

const getRawChapter = (order: number): string => {
  const chapterKey = `../atlas/chapters/chapter-${String(order).padStart(
    2,
    '0'
  )}.html`;
  const html = chapterSources[chapterKey];
  if (html === undefined) {
    throw new Error(`Missing Atlas chapter source: ${chapterKey}`);
  }
  return html;
};

const getReferenceSections = (html: string): readonly ReferenceSection[] => {
  const starts: { readonly index: number; readonly sceneNumber: number }[] = [];
  for (const match of html.matchAll(
    /<section class="scene scroll-scene" id="c16-s(\d+)"/g
  )) {
    if (match.index === undefined) continue;
    starts.push({ index: match.index, sceneNumber: Number(match[1]) });
  }

  return starts.flatMap((start, index) => {
    const next = starts[index + 1];
    const sectionHtml = html.slice(start.index, next?.index ?? html.length);
    const heading = sectionHtml.match(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/);
    if (!heading?.[1] || !heading[2]) return [];
    const prose = sectionHtml.match(
      /<div class="source-prose"[^>]*>([\s\S]*?)<\/div>/
    )?.[1];
    const paragraphs = prose
      ? [...prose.matchAll(/<p>([\s\S]*?)<\/p>/g)].flatMap((match) =>
          match[1] ? [match[1]] : []
        )
      : [];
    const summaryParagraph =
      paragraphs.find((paragraph) =>
        /Author-side interpretation:/i.test(plainText(paragraph))
      ) ??
      paragraphs[0] ??
      '';
    return [
      {
        sceneNumber: start.sceneNumber,
        headingId: heading[1],
        title: plainText(heading[2]),
        summary: firstSentence(summaryParagraph),
        html: sectionHtml,
      },
    ];
  });
};

const familyForKey = (key: string): string => {
  if (/^C\d{2}$/.test(key)) return 'Failure Atlas deep case';
  if (/^B:M\d{3}$/.test(key)) return 'Bilqis Mistakes ledger record';
  if (/^E:PM-\d{4}-\d{2}-\d{2}-\d{3}$/.test(key))
    return 'Entif postmortem / incident record';
  if (/^D\d{2}$/.test(key)) return 'Session minutes / durable run document';
  if (/^T\d{2}$/.test(key)) return 'Conversation / transcript source';
  if (/^GH\d{2}$/.test(key)) return 'GitHub issue / pull-request evidence';
  if (/^H\d{2}$/.test(key)) return 'Thematic-frame source';
  if (/^SCP\d{3}$/.test(key)) return 'Source-corpus provenance record';
  return 'Atlas source record';
};

const fallbackSceneForKey = (key: string): number => {
  if (key === 'SCP008') return 83;
  if (/^(?:B:M|E:PM-)/.test(key)) return 81;
  if (/^(?:D|T|GH)\d{2}$/.test(key)) return 88;
  return 83;
};

const buildCitationSources = (): readonly AtlasCitationSource[] => {
  const referenceHtml = getRawChapter(16);
  const sections = getReferenceSections(referenceHtml);
  const sectionByNumber = new Map(
    sections.map((section) => [section.sceneNumber, section])
  );
  const keys: string[] = [];

  for (let order = 1; order <= 16; order += 1) {
    for (const match of getRawChapter(order).matchAll(citationSourcePattern)) {
      const key = match[1];
      if (key && !keys.includes(key)) keys.push(key);
    }
  }

  return keys.map((key) => {
    const caseMatch = key.match(/^C(\d{2})$/);
    const thematicMatch = key.match(/^H(\d{2})$/);
    let target: ReferenceSection | undefined;

    if (caseMatch?.[1]) {
      target = sectionByNumber.get(17 + Number(caseMatch[1]));
    } else if (thematicMatch?.[1]) {
      target = sections.find((section) => section.title.startsWith(`${key}.`));
    } else {
      target = sections.find(
        (section) =>
          section.sceneNumber >= 18 &&
          section.sceneNumber <= 53 &&
          section.html.includes(key)
      );
    }

    target ??= sectionByNumber.get(fallbackSceneForKey(key));
    if (!target) throw new Error(`Missing Atlas reference target for ${key}`);

    const family = familyForKey(key);
    const detail =
      target.summary ||
      `${family} cited by the Atlas. Chapter 16 preserves its source family and reference context.`;
    const title = target.title.startsWith(`${key}.`)
      ? target.title.slice(key.length + 1).trim()
      : target.title;

    return {
      key,
      anchor: citationAnchor(key),
      title,
      family,
      detail,
      targetHeadingId: target.headingId,
    };
  });
};

const citationSources = buildCitationSources();
const sourceByKey = new Map(
  citationSources.map((source) => [source.key, source])
);

const injectReferenceAnchors = (html: string): string => {
  const sourcesByHeading = new Map<string, AtlasCitationSource[]>();
  for (const source of citationSources) {
    const group = sourcesByHeading.get(source.targetHeadingId) ?? [];
    group.push(source);
    sourcesByHeading.set(source.targetHeadingId, group);
  }

  let anchored = html;
  for (const [headingId, sources] of sourcesByHeading) {
    const opening = `<h2 id="${headingId}">`;
    const anchors = sources
      .map(
        (source) =>
          `<span id="${
            source.anchor
          }" class="atlas-reference-anchor" data-test-id="atlas-reference-anchor" data-source-key="${escapeHtml(
            source.key
          )}" aria-hidden="true"></span>`
      )
      .join('');
    anchored = anchored.replace(opening, `${opening}${anchors}`);
  }
  return anchored;
};

const promoteHeroSubtitle = (html: string): string =>
  html.replace(
    /<p class="subtitle">([\s\S]*?)<\/p>/,
    '<h2 class="subtitle">$1</h2>'
  );

const enhanceCitations = (
  html: string,
  order: number,
  referencePath: string
): string => {
  let sequence = 0;
  return html.replace(citationPattern, (_, inner: string) => {
    const keys = [...inner.matchAll(citationSourcePattern)].flatMap((match) =>
      match[1] ? [match[1]] : []
    );
    const sources = keys.flatMap((key) => {
      const source = sourceByKey.get(key);
      return source ? [source] : [];
    });
    if (sources.length === 0) return `<span class="citation">${inner}</span>`;

    const marker = inner.replace(citationSourcePattern, '$1');
    const panelId = `atlas-citation-${order}-${++sequence}`;
    const fallback = sources
      .map(
        (source) =>
          `<a href="${escapeHtml(referencePath)}#${
            source.anchor
          }" data-test-id="citation-fallback">[${escapeHtml(source.key)}]</a>`
      )
      .join('');
    const cards = sources
      .map(
        (source) =>
          `<span class="editorial-citation-source"><a href="${escapeHtml(
            referencePath
          )}#${source.anchor}" data-test-id="citation-reference">${escapeHtml(
            source.key
          )} · ${escapeHtml(source.title)}</a><span>${escapeHtml(
            source.family
          )}</span><span>${escapeHtml(source.detail)}</span></span>`
      )
      .join('');
    const citationKeys = escapeHtml(keys.join(','));

    return `<span class="citation editorial-citation atlas-citation" data-test-id="editorial-citation" data-citation-keys="${citationKeys}">${fallback}<button type="button" hidden data-test-id="citation-trigger" data-citation-keys="${citationKeys}" aria-label="Sources ${escapeHtml(
      keys.join(', ')
    )}" aria-expanded="false" aria-controls="${panelId}">${marker}</button><span id="${panelId}" popover="auto" class="editorial-citation-panel atlas-citation-panel" data-test-id="citation-panel" role="group" aria-label="Citation sources">${cards}<button type="button" data-test-id="citation-close" aria-label="Close citation">Close</button></span></span>`;
  });
};

export const getAtlasCitationSources = (): readonly AtlasCitationSource[] =>
  citationSources;

export const getAtlasChapter = (
  order: number,
  referencePath = ATLAS_REFERENCE_PATH
): AtlasChapter => {
  const raw = getRawChapter(order);
  const semantic = promoteHeroSubtitle(raw);
  const anchored = order === 16 ? injectReferenceAnchors(semantic) : semantic;
  const html = enhanceCitations(anchored, order, referencePath);

  return {
    html,
    sceneCount: raw.match(/data-scene-id=/g)?.length ?? 0,
  };
};
