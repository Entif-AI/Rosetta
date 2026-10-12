import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';

export interface TraceRedactionManifest {
  profile: 'trace-src-redaction-v1';
  origin: 'captured-derived-fixture';
  window: { start: number; count: number };
  actions: { path: string; action: 'dropped' | 'substituted' | 'preserved'; count: number }[];
}

function jsonValue(value: unknown): value is JsonValue {
  return value === null || typeof value === 'string' || typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    (Array.isArray(value) ? value.every(jsonValue) : typeof value === 'object' && Object.values(value).every(jsonValue));
}

const idKinds: Record<string, string> = {
  id: 'message', message_id: 'message', parent_id: 'message', conversation_id: 'conversation',
  turn_id: 'turn', turn_exchange_id: 'turn', working_turn_id: 'turn', request_id: 'request',
  tool_call_id: 'tool', result_for: 'request'
};
const enums = new Set(['v1', 'input_message', 'resume_conversation_token', 'stream_handoff', 'server_ste_metadata',
  'conversation_detail_metadata', 'system', 'user', 'assistant', 'tool', 'analysis', 'final', 'commentary',
  'text', 'in_progress', 'finished_successfully', 'all', 'add', 'replace', 'append', 'remove']);
const containers = new Set(['message', 'input_message', 'author', 'metadata', 'content', 'parts', 'v']);
const enumFields = new Set(['type', 'role', 'channel', 'status', 'content_type', 'o']);
const boolFields = new Set(['end_turn']);

/** Disclosure allowlist. Unknown fields are dropped even when their value looks harmless. */
export function deriveTraceFixture(raw: string, window: { start: number; count: number }): { fixture: string; manifest: TraceRedactionManifest } {
  const frames = raw.replace(/\r\n/g, '\n').split(/\n\n+/).filter(x => x.trim());
  if (!Number.isSafeInteger(window.start) || !Number.isSafeInteger(window.count) || window.start < 0 || window.count < 1 || window.start + window.count > frames.length) {
    throw new Error('Invalid bounded capture window.');
  }
  const mappings = new Map<string, Map<string, string>>();
  const counts = new Map<string, { path: string; action: 'dropped' | 'substituted' | 'preserved'; count: number }>();
  const record = (path: string, action: 'dropped' | 'substituted' | 'preserved') => {
    const key = `${action}:${path}`;
    const prior = counts.get(key);
    if (prior) prior.count += 1; else counts.set(key, { path, action, count: 1 });
  };
  const ordinal = (kind: string, value: string): string => {
    let map = mappings.get(kind);
    if (!map) { map = new Map(); mappings.set(kind, map); }
    let id = map.get(value);
    if (!id) { id = `${kind}-${String(map.size + 1).padStart(3, '0')}`; map.set(value, id); }
    return id;
  };
  let timeBase: number | undefined;
  const clean = (value: JsonValue, path: string, text = false): JsonValue => {
    if (typeof value === 'string') {
      record(path, 'substituted');
      return ordinal('redacted-text', value);
    }
    if (Array.isArray(value)) return value.map(x => clean(x, `${path}[]`, text));
    if (value && typeof value === 'object') {
      const out: { [key: string]: JsonValue } = {};
      for (const [key, child] of Object.entries(value)) {
        if (Object.hasOwn(idKinds, key) && typeof child === 'string') {
          out[key] = ordinal(idKinds[key], child); record(`${path}.${key}`, 'substituted');
        } else if (enumFields.has(key) && typeof child === 'string' && enums.has(child)) {
          out[key] = child; record(`${path}.${key}`, 'preserved');
        } else if (containers.has(key)) {
          out[key] = clean(child, `${path}.${key}`, key === 'parts');
        } else if ((key === 'create_time' || key === 'update_time') && typeof child === 'number') {
          timeBase ??= child;
          out[key] = new Date(Date.UTC(2000, 0, 1) + Math.round((child - timeBase) * 1000)).toISOString();
          record(`${path}.${key}`, 'substituted');
        } else if ((key === 'c' && typeof child === 'number') || (boolFields.has(key) && typeof child === 'boolean') || ((key === 'error' || key === 'error_code') && child === null)) {
          out[key] = child; record(`${path}.${key}`, 'preserved');
        } else if (key === 'p' && typeof child === 'string' && /^\/(message|content|parts|status)(\/(content|parts|status|\d+))*$/.test(child)) {
          out[key] = child; record(`${path}.p`, 'preserved');
        } else {
          record(`${path}.*`, 'dropped');
        }
      }
      return out;
    }
    return value;
  };
  const output = frames.slice(window.start, window.start + window.count).map((frame, index) => {
    const lines = frame.split('\n');
    const data = lines.filter(x => x.startsWith('data:')).map(x => x.slice(5).trimStart()).join('\n');
    if (!data) {
      if (!lines.filter(x => x.trim()).every(x => x.startsWith(':'))) throw new Error('Captured event has no SSE data.');
      record('$.transport_comment', 'dropped');
      return `event: message\ndata: ${canonicalizeJson({ source_sequence: window.start + index, captured: { type: 'transport_comment' } })}\n\n`;
    }
    const parsed: unknown = JSON.parse(data);
    if (!jsonValue(parsed)) throw new Error('Captured event is not JSON.');
    const safe = typeof parsed === 'string' && enums.has(parsed) ? parsed : clean(parsed, '$');
    return `event: message\ndata: ${canonicalizeJson({ source_sequence: window.start + index, captured: safe })}\n\n`;
  }).join('');
  return { fixture: output, manifest: { profile: 'trace-src-redaction-v1', origin: 'captured-derived-fixture', window, actions: [...counts.values()].sort((a, b) => `${a.path}:${a.action}` < `${b.path}:${b.action}` ? -1 : `${a.path}:${a.action}` > `${b.path}:${b.action}` ? 1 : 0) } };
}
