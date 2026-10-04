import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
const size = (id, content) => Buffer.byteLength(canonicalTraceJson({ objectId: id, objectKind: 'message', stableFields: {}, content }));
const contentOfSize = (id, target) => 'x'.repeat(target - size(id, ''));
const shared = 'z'.repeat(254), cSize = size('C', shared);
const b = contentOfSize('B', 159);
const aSize = 995 - 159 - 2 * cSize, a = contentOfSize('A', aSize);
const eSize = 756 - aSize - cSize, e = contentOfSize('E', eSize);
const changedA = contentOfSize('A', aSize + 200 - (eSize + 1));
const f = contentOfSize('F', 139), x = contentOfSize('X', 198);
const contents = { A: a, B: b, C: shared, D: shared, E: e, F: f, X: x };
const groups = [['A','B','C','D'], ['A','B','C','D','E'], ['A','C','E'], ['A','C','E','F'], ['X'], ['A','B','C','E']];
const fixture = groups.map((ids, i) => {
  const value = { type: 'trace_snapshot', origin: 'generated-fixture', run_id: i === 4 ? 'reset-run' : 'original-run', window_id: 'generated-window', reset: i === 4,
    objects: ids.map(id => ({ id, kind: 'message', content: i === 1 && id === 'A' ? changedA : contents[id] })),
    emitted_ids: [0,4,5].includes(i) ? ids : i === 1 ? ['A','E'] : i === 2 ? ['C'] : ['F'], source_event_time: `2000-01-01T00:00:0${i}.000Z` };
  return `event: trace_snapshot\ndata: ${canonicalTraceJson(value)}\n\n`;
}).join('');
writeFileSync('packages/source-substrate/test-vectors/trace/generated-edges.sse', fixture);
