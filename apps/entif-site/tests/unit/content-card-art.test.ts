// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  contentCardArtworkNames,
  getContentCardArtwork,
} from '../../src/lib/content-card-art';

describe('content-card artwork rotation', () => {
  it('uses a long unique cycle before repeating artwork', () => {
    expect(contentCardArtworkNames).toHaveLength(15);
    expect(new Set(contentCardArtworkNames).size).toBe(15);
    expect(getContentCardArtwork(0).name).toBe(
      getContentCardArtwork(contentCardArtworkNames.length).name
    );
  });
});
