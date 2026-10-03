import { describe, expect, it } from 'vitest';

import { buildCanonicalJsonVector, buildTextFingerprints, canonicalizeJson, normalizePlainText, splitSentences } from './rosetta-canon.js';

describe('rosetta-canon', () => {
  it('keeps object key order deterministic', () => {
    const left = canonicalizeJson({
      z: 1,
      nested: { b: 2, a: 1 }
    });
    const right = canonicalizeJson({
      nested: { a: 1, b: 2 },
      z: 1
    });

    expect(left).toBe(right);
  });

  it('uses JCS-compatible lexical key ordering for Entif canonical JSON', () => {
    expect(canonicalizeJson({ z: 1, ä: 2, a: 3 })).toBe('{"a":3,"z":1,"ä":2}');
  });

  it('keeps integer-like property names in JCS lexicographic order', () => {
    expect(canonicalizeJson({ 10: 'ten', 2: 'two', a: 'letter' })).toBe('{"10":"ten","2":"two","a":"letter"}');
  });

  it('serializes mixed keys recursively without rebuilding nested objects', () => {
    expect(
      canonicalizeJson({
        nested: [{ 10: 'ten', 2: 'two', a: 'letter' }],
        numbers: [333333333.33333329, 1e30, 4.5, 2e-3, 1e-27],
        string: '€$\u000f\nA\'B"\\\\"/'
      })
    ).toBe(
      '{"nested":[{"10":"ten","2":"two","a":"letter"}],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":"€$\\u000f\\nA\'B\\"\\\\\\\\\\"/"}'
    );
  });

  it('uses ECMAScript number serialization at JCS exponent boundaries', () => {
    expect(
      canonicalizeJson({
        minusZero: -0,
        oneE6: 1e-6,
        oneE7: 1e-7,
        oneE20: 1e20,
        oneE21: 1e21
      })
    ).toBe('{"minusZero":0,"oneE20":100000000000000000000,"oneE21":1e+21,"oneE6":0.000001,"oneE7":1e-7}');
  });

  it('sorts RFC 8785 property-name vectors by UTF-16 code units', () => {
    expect(
      canonicalizeJson({
        '€': 'Euro Sign',
        '\r': 'Carriage Return',
        'דּ': 'Hebrew Letter Dalet With Dagesh',
        1: 'One',
        '😀': 'Emoji: Grinning Face',
        '\u0080': 'Control',
        'ö': 'Latin Small Letter O With Diaeresis'
      })
    ).toBe(
      '{"\\r":"Carriage Return","1":"One","":"Control","ö":"Latin Small Letter O With Diaeresis","€":"Euro Sign","😀":"Emoji: Grinning Face","דּ":"Hebrew Letter Dalet With Dagesh"}'
    );
  });

  it('rejects non-JSON finite numbers before hashing or signing', () => {
    expect(() => canonicalizeJson({ bad: Number.NaN })).toThrow('JCS canonicalization only accepts finite JSON numbers.');
    expect(() => canonicalizeJson({ bad: Number.POSITIVE_INFINITY })).toThrow('JCS canonicalization only accepts finite JSON numbers.');
  });

  it('rejects lone surrogate strings and property names', () => {
    expect(() => canonicalizeJson('\ud800')).toThrow('JCS canonicalization does not accept lone surrogate code units.');
    expect(() => canonicalizeJson({ '\udc00': 'value' })).toThrow('JCS canonicalization does not accept lone surrogate code units.');
  });

  it('preserves JSON.stringify treatment of runtime optional values', () => {
    expect(canonicalizeJson({ included: 'value', omitted: undefined } as unknown as JsonValue)).toBe('{"included":"value"}');
    expect(canonicalizeJson([undefined] as unknown as JsonValue)).toBe('[null]');
    expect(canonicalizeJson(new Array(2) as unknown as JsonValue)).toBe('[null,null]');
    expect(canonicalizeJson(undefined as unknown as JsonValue)).toBeUndefined();
  });

  it('publishes a replayable Entif canonicalization vector', () => {
    const vector = buildCanonicalJsonVector({
      b: true,
      a: ['Rosetta', { version: 1 }]
    });

    expect(vector).toEqual({
      canonicalization: 'RFC8785_JCS',
      canonicalJson: '{"a":["Rosetta",{"version":1}],"b":true}',
      cid: 'cidv1-sha256-1a1cf9c1931a64e6d8288c5335f8a26a56405e3d023eac3a0971ea70df7494b6',
      sha256: '1a1cf9c1931a64e6d8288c5335f8a26a56405e3d023eac3a0971ea70df7494b6'
    });
  });

  it('produces the same canonical bytes and digest for differently inserted integer-like keys', () => {
    const left = buildCanonicalJsonVector(JSON.parse('{"10":"ten","2":"two","a":"letter"}'));
    const right = buildCanonicalJsonVector(JSON.parse('{"2":"two","a":"letter","10":"ten"}'));

    expect(left.canonicalJson).toBe('{"10":"ten","2":"two","a":"letter"}');
    expect(left.sha256).toBe('264a04ae1cca03183321518eb8984b19c814df554347f259085f568361e504da');
    expect(right).toEqual(left);
  });

  it('normalizes whitespace for refinery text promotion', () => {
    expect(normalizePlainText('alpha   beta\r\n\r\ngamma')).toBe('alpha beta\n\ngamma');
  });

  it('splits sentences without fragmenting common abbreviations', () => {
    expect(splitSentences('Dr. Smith met John F. Kennedy in the U.S. Read this next.')).toEqual([
      'Dr. Smith met John F. Kennedy in the U.S.',
      'Read this next.'
    ]);
    expect(splitSentences('Compare e.g. Fig. 1 vs. Fig. 2. Use p. 42 as source.')).toEqual([
      'Compare e.g. Fig. 1 vs. Fig. 2.',
      'Use p. 42 as source.'
    ]);
  });

  it('preserves ellipses instead of splitting before the next clause', () => {
    expect(splitSentences('Wait... hello world. Run the check.')).toEqual(['Wait... hello world.', 'Run the check.']);
  });

  it('keeps content fingerprints stable across formatting-only changes', () => {
    const left = buildTextFingerprints('alpha   beta\r\n\r\n gamma');
    const right = buildTextFingerprints('alpha beta\n\ngamma');

    expect(left.normalizedText).toBe(right.normalizedText);
    expect(left.contentFingerprint).toBe(right.contentFingerprint);
    expect(left.revisionFingerprint).toBe(right.revisionFingerprint);
  });

  it('changes revision fingerprints when material content changes', () => {
    const left = buildTextFingerprints('alpha beta');
    const right = buildTextFingerprints('alpha gamma');

    expect(left.contentFingerprint).not.toBe(right.contentFingerprint);
    expect(left.revisionFingerprint).not.toBe(right.revisionFingerprint);
  });
});
