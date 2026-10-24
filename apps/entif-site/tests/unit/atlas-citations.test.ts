// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  ATLAS_REFERENCE_PATH,
  getAtlasChapter,
  getAtlasCitationSources,
} from '../../src/lib/atlas';

describe('Atlas citation registry', () => {
  it('resolves every cited source to a unique anchored Chapter 16 destination', () => {
    const sources = getAtlasCitationSources();
    expect(sources.length).toBeGreaterThan(100);
    expect(new Set(sources.map((source) => source.key)).size).toBe(
      sources.length
    );
    expect(new Set(sources.map((source) => source.anchor)).size).toBe(
      sources.length
    );

    for (const key of ['C03', 'B:M045', 'E:PM-2026-10-06-008', 'SCP008']) {
      const source = sources.find((candidate) => candidate.key === key);
      expect(source, `missing ${key}`).toBeDefined();
      expect(source?.title).toBeTruthy();
      expect(source?.family).toBeTruthy();
      expect(source?.detail).toBeTruthy();
    }

    const references = getAtlasChapter(16, ATLAS_REFERENCE_PATH).html;
    for (const source of sources) {
      expect(references).toContain(`id="${source.anchor}"`);
    }
  });

  it('enhances raw Atlas citation markers while preserving no-JavaScript fallback links', () => {
    const chapter = getAtlasChapter(3, ATLAS_REFERENCE_PATH).html;
    expect(chapter).toContain('data-test-id="editorial-citation"');
    expect(chapter).toContain('data-test-id="citation-trigger"');
    expect(chapter).toContain('data-test-id="citation-panel"');
    expect(chapter).toContain('data-test-id="citation-fallback"');
    expect(chapter).toContain(`${ATLAS_REFERENCE_PATH}#atlas-source-b-m045`);
  });

  it('promotes the chapter hero subtitle to a semantic second-level heading', () => {
    const chapter = getAtlasChapter(3, ATLAS_REFERENCE_PATH).html;
    expect(chapter).toContain(
      '<h2 class="subtitle">An Agentic Aberrancy Atlas Shrugged</h2>'
    );
    expect(chapter).not.toContain('<p class="subtitle">');
  });
});
