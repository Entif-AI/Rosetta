import { mkdirSync, writeFileSync } from 'node:fs';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
import { normalizeTrace } from '../../packages/ingress-refinery/dist/index.js';

const events = [
  [1, 'Avery manages Project Cedar beginning January 1, 2000.'],
  [3, 'Blair replaces Avery as manager of Project Cedar beginning January 3, 2000.'],
  [2, 'Historical event delivered late: Avery still managed Project Cedar on January 2, 2000.'],
  [4, 'Correction: retract the January 3 claim that Blair manages Project Cedar. The current manager is unknown.'],
  [5, 'Two people named Avery have unresolved identity. A disputed assignment claims an end on January 1 and a start on January 5, 2000. Preserve the contradiction.'],
];
const raw = events.map(([day, content], index) => {
  const body = {
    type: 'trace_snapshot', origin: 'generated-fixture', run_id: 'temporal-evolution',
    window_id: 'temporal-evolution-window', reset: false,
    source_event_time: `2000-01-0${day}T00:00:00.000Z`,
    objects: [{ id: `episode-${index}`, kind: 'message', content }],
    emitted_ids: [`episode-${index}`],
  };
  return `event: trace_snapshot\ndata: ${canonicalTraceJson(body)}\n\n`;
}).join('');
const normalized = normalizeTrace(raw, {
  sourceFixtureRef: 'temporal-evolution', recordedAt: '2000-01-06T00:01:00.000Z',
  observedAt: '2000-01-06T00:00:30.000Z',
});
mkdirSync('tools/trace-temporal/fixtures', { recursive: true });
writeFileSync('tools/trace-temporal/fixtures/temporal-evolution.sse', raw);
writeFileSync('tools/trace-temporal/fixtures/temporal-evolution.normalized.json', canonicalTraceJson(normalized) + '\n');
