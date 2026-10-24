export const ATLAS_SERIES_ID = 'agentic-aberrancy-atlas';

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

export const getAtlasChapter = (order: number): AtlasChapter => {
  const chapterKey = `../atlas/chapters/chapter-${String(order).padStart(
    2,
    '0'
  )}.html`;
  const html = chapterSources[chapterKey];
  if (html === undefined) {
    throw new Error(`Missing Atlas chapter source: ${chapterKey}`);
  }

  return {
    html,
    sceneCount: html.match(/data-scene-id=/g)?.length ?? 0,
  };
};
