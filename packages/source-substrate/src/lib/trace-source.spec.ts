import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { deriveTraceFixture } from './trace-source.js';

describe('trace-src-redaction-v1', () => {
  it('keeps only safe structure, ordinal equality and relative time with an explicit loss manifest', () => {
    const raw = 'data: ' + JSON.stringify({ type: 'input_message', conversation_id: 'private-conversation', input_message: {
      id: 'private-message', author: { role: 'user', name: 'Private Name' }, content: { parts: ['private text'], content_type: 'text' },
      status: 'finished_successfully', create_time: 123, metadata: { parent_id: 'private-parent', request_id: 'private-request', token: 'Bearer SECRET', host: 'private.example' }
    } }) + '\n\n' + 'data: ' + JSON.stringify({ type: 'resume_conversation_token', token: 'eyJ.secret.signature' }) + '\n\n';
    const a = deriveTraceFixture(raw, { start: 0, count: 2 });
    expect(a).toEqual(deriveTraceFixture(raw, { start: 0, count: 2 }));
    expect(a.fixture).toContain('message-001');
    expect(a.fixture).toContain('redacted-text-001');
    expect(a.fixture).not.toMatch(/private|SECRET|eyJ\.|Bearer/);
    expect(a.manifest.actions.some(x => x.action === 'dropped')).toBe(true);
    expect(a.manifest.profile).toBe('trace-src-redaction-v1');
  });
  it('checks immutable captured-derived bytes and the separate original/public manifestations', () => {
    const fixture = readFileSync('packages/source-substrate/test-vectors/trace/captured-derived.sse', 'utf8');
    const bundle = JSON.parse(readFileSync('packages/source-substrate/test-vectors/trace/source-bundle.json', 'utf8'));
    expect(fixture.match(/^data:/gm)).toHaveLength(75);
    expect(fixture).toContain('stream_handoff');
    expect(fixture).toContain('resume_conversation_token');
    expect(fixture).toContain('in_progress');
    expect(fixture).toContain('finished_successfully');
    expect(fixture).not.toMatch(/Bearer\s|eyJ[A-Za-z0-9_-]+\.|https?:|[0-9a-f]{8}-[0-9a-f]{4}/i);
    expect(bundle.original.cid).not.toBe(bundle.derived.cid);
    expect(bundle.derived.parents).toContain(bundle.original.cid);
    expect(bundle.original.payload.accessRequirements).toContain('no-external-publish');
    expect(bundle.derived.payload.byteHashes.sha256).toBe(createHash('sha256').update(fixture).digest('hex'));
    expect(bundle.episode.payload.family).toBe('chat-transcript');
    expect(readFileSync('packages/source-substrate/test-vectors/trace/generated-edges.sse', 'utf8')).toContain('generated-fixture');
  });
  it('refuses malformed framing and out-of-bounds capture windows', () => {
    expect(() => deriveTraceFixture('data: invalid\n\n', { start: 0, count: 1 })).toThrow();
    expect(() => deriveTraceFixture('data: {}\n\n', { start: 0, count: 2 })).toThrow();
  });
});
