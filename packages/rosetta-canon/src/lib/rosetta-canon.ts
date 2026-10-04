import { createHash } from 'node:crypto';

export type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface TextFingerprints {
  contentFingerprint: string;
  normalizedText: string;
  normalizationProfile: 'plain-text-collapse-v1';
  revisionFingerprint: string;
}

export interface CanonicalJsonVector {
  canonicalization: 'RFC8785_JCS';
  canonicalJson: string;
  cid: string;
  sha256: string;
}

function assertWellFormedUnicode(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new Error('JCS canonicalization rejects lone Unicode surrogates.');
      }
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new Error('JCS canonicalization rejects lone Unicode surrogates.');
    }
  }
}

export function canonicalizeJson<T extends JsonValue>(value: T): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalizeJson(entry)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const objectValue: { [key: string]: JsonValue } = value;
    // Emit sorted keys directly: ordinary objects re-enumerate integer keys numerically.
    return `{${Object.keys(objectValue).sort().map((key) => {
      assertWellFormedUnicode(key);
      return `${JSON.stringify(key)}:${canonicalizeJson(objectValue[key])}`;
    }).join(',')}}`;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error('JCS canonicalization only accepts finite JSON numbers.');
  }
  if (typeof value === 'string') assertWellFormedUnicode(value);
  return JSON.stringify(value);
}

export function normalizePlainText(input: string): string {
  return input
    .replace(/\r\n/gu, '\n')
    .replace(/[ \t]+/gu, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}

const NON_BOUNDARY_ABBREVIATIONS = new Set([
  'al.',
  'dr.',
  'e.g.',
  'etc.',
  'fig.',
  'i.e.',
  'inc.',
  'jr.',
  'llc.',
  'mr.',
  'mrs.',
  'ms.',
  'p.',
  'prof.',
  'sr.',
  'u.k.',
  'u.s.',
  'vs.',
  'vol.'
]);

const CONTEXTUAL_BOUNDARY_ABBREVIATIONS = new Set(['u.k.', 'u.s.']);

function tokenBefore(text: string, endIndex: number): string {
  const match = text.slice(0, endIndex + 1).match(/(?:[A-Za-z]\.)+$|[A-Za-z]+\.$/u);
  return match?.[0].toLowerCase() ?? '';
}

function isInitial(text: string, periodIndex: number): boolean {
  return /(?:^|\s)[A-Z]\.$/u.test(text.slice(Math.max(0, periodIndex - 2), periodIndex + 1));
}

function isSentenceBoundary(text: string, index: number): boolean {
  const mark = text[index];
  const next = text[index + 1] ?? '';

  if (!/[.!?]/u.test(mark) || !/\s/u.test(next)) {
    return false;
  }
  if (mark === '.' && (text[index - 1] === '.' || text[index + 1] === '.')) {
    return false;
  }

  const token = tokenBefore(text, index);
  const nextWord = text.slice(index + 1).trimStart().match(/^[A-Z]/u)?.[0];
  if (CONTEXTUAL_BOUNDARY_ABBREVIATIONS.has(token) && nextWord) {
    return true;
  }
  if (NON_BOUNDARY_ABBREVIATIONS.has(token) || isInitial(text, index)) {
    return false;
  }

  return true;
}

export function splitSentences(input: string): string[] {
  const text = normalizePlainText(input).replace(/\n+/gu, ' ');
  if (!text) {
    return [];
  }

  const sentences: string[] = [];
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (isSentenceBoundary(text, index)) {
      sentences.push(text.slice(start, index + 1).trim());
      start = index + 1;
      while (/\s/u.test(text[start] ?? '')) start += 1;
    }
  }

  const tail = text.slice(start).trim();
  if (tail) {
    sentences.push(tail);
  }

  return sentences;
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function buildCanonicalJsonVector(value: JsonValue): CanonicalJsonVector {
  const canonicalJson = canonicalizeJson(value);
  const sha256 = sha256Hex(canonicalJson);

  return {
    canonicalJson,
    canonicalization: 'RFC8785_JCS',
    cid: `cidv1-sha256-${sha256}`,
    sha256
  };
}

export function buildTextFingerprints(input: string): TextFingerprints {
  const normalizationProfile = 'plain-text-collapse-v1';
  const normalizedText = normalizePlainText(input);
  const contentFingerprint = sha256Hex(normalizedText);
  const revisionFingerprint = sha256Hex(
    canonicalizeJson({
      contentFingerprint,
      normalizationProfile,
      normalizedText
    })
  );

  return {
    contentFingerprint,
    normalizedText,
    normalizationProfile,
    revisionFingerprint
  };
}
