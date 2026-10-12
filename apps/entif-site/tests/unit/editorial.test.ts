// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { orderSeries } from '../../src/lib/editorial';
import {
  citationKeys,
  resolveSources,
} from '../../src/lib/editorial-citations.mjs';

describe('editorial ordering', () => {
  const entries = [3, 1, 2].map((order) => ({
    slug: `part-${order}`,
    series: { id: 'fixture', order },
  }));
  it('derives one complete order without mutating its input', () => {
    expect(orderSeries(entries).map((entry) => entry.series.order)).toEqual([
      1, 2, 3,
    ]);
    expect(entries.map((entry) => entry.series.order)).toEqual([3, 1, 2]);
  });
  it('rejects gaps, duplicate positions and duplicate destinations', () => {
    const first = entries[0];
    const second = entries[1];
    if (!first || !second) throw new Error('Missing fixture entries');
    expect(() => orderSeries(entries.slice(0, 2))).toThrow();
    expect(() => orderSeries([second, second])).toThrow();
    expect(() =>
      orderSeries(entries.map((entry) => ({ ...entry, slug: first.slug })))
    ).toThrow();
  });
});

describe('source-key resolution', () => {
  const sources = ['S001', 'S002'].map((Source_ID) => ({
    Source_ID,
    Title: '',
    Author_or_Institution: '',
    Year: '',
    Source_Type: '',
    Authority_Role: '',
    URL: '',
    Primary_Families: '',
    Notes: '',
  }));
  it('resolves compound markers in reader order from one registry', () => {
    const keys = citationKeys('[S002; S001][S002]');
    expect(resolveSources(keys, sources)).toEqual([sources[1], sources[0]]);
  });
  it('fails closed for unknown source keys', () => {
    expect(() => resolveSources(['S999'], sources)).toThrow();
  });
});
