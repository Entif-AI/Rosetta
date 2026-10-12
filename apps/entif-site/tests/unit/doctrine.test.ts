import { describe, expect, it } from 'vitest';
import {
  doctrineSchema,
  resolveDoctrineNavigation,
} from '../../src/lib/doctrine';

const source = {
  id: 'D07',
  slug: 'epistemic-integrity',
  title: 'Epistemic integrity',
  shortTitle: 'Truth and provenance',
  description:
    'Keep every claim attached to the evidence that actually supports it.',
  group: 'standards',
  version: '0.1.0',
  documentState: 'candidate-draft',
  sourceKind: 'document',
  sourceTitle: 'D07 — First draft v0.1.0',
  sourceDigest: 'a'.repeat(64),
  snapshotDate: '2026-10-11',
  heroImage: 'd07-epistemic-integrity',
  takeaway:
    'A persuasive account is not a substitute for an inspectable record.',
  sourceRefs: ['P02', 'C02', 'D16'],
};

describe('public doctrine admission', () => {
  it('keeps website availability distinct from institutional adoption', () => {
    expect(doctrineSchema.parse(source).documentState).toBe('candidate-draft');
    expect(
      doctrineSchema.safeParse({ ...source, documentState: 'adopted' }).success
    ).toBe(false);
  });
  it.each([
    { id: 'D17' },
    { heroImage: '../private' },
    { description: 'https://docs.google.com/document/private' },
    { sourceDigest: 'unknown' },
    { snapshotDate: '2026-99-01' },
    { sourceKind: 'registry', documentState: 'candidate-draft' },
    { id: 'D05', documentState: 'candidate-draft' },
  ])('rejects unsafe or overstated publication metadata: %j', (change) => {
    expect(doctrineSchema.safeParse({ ...source, ...change }).success).toBe(
      false
    );
  });
  it('requires an honest public overview of the internal counsel brief', () => {
    expect(
      doctrineSchema.safeParse({
        ...source,
        id: 'D05',
        documentState: 'public-overview',
      }).success
    ).toBe(true);
    expect(doctrineSchema.safeParse({ ...source, id: 'D15' }).success).toBe(
      false
    );
  });
});

describe('doctrine reading navigation', () => {
  const entries = [
    source,
    { ...source, id: 'D01', slug: 'why-nonprofit' },
    { ...source, id: 'D16', slug: 'governance-criteria' },
  ].map((data) => doctrineSchema.parse(data));
  it('orders by document number and preserves the deployment base path', () => {
    const nav = resolveDoctrineNavigation(entries, 'D07', '/preview/');
    expect(nav.previous?.href).toBe('/preview/about/doctrine/why-nonprofit/');
    expect(nav.next?.href).toBe('/preview/about/doctrine/governance-criteria/');
    expect(
      resolveDoctrineNavigation(entries, 'D01', '/').previous
    ).toBeUndefined();
    expect(resolveDoctrineNavigation(entries, 'D16', '/').next).toBeUndefined();
  });
  it('refuses an unknown current document or duplicate public identity', () => {
    const first = entries[0];
    if (!first) throw new Error('Missing test destination');
    expect(() => resolveDoctrineNavigation(entries, 'D03', '/')).toThrow();
    expect(() =>
      resolveDoctrineNavigation([...entries, first], 'D07', '/')
    ).toThrow();
    expect(() =>
      resolveDoctrineNavigation(
        [...entries, { ...first, id: 'D03' }],
        'D07',
        '/'
      )
    ).toThrow();
  });
});
