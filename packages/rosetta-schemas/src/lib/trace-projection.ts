import { Ajv } from 'ajv';
import { canonicalTraceJson, traceHash } from './trace-normalization.js';
export const TRACE_NODE_LABELS = ['SourceArtifact', 'NormalizedTrace', 'TraceRun', 'TraceWindow', 'TraceRecord', 'TraceObject', 'TraceSnapshot', 'TracePayload', 'TraceTransition'] as const;
export const TRACE_EDGE_TYPES = ['DERIVED_FROM', 'HAS_WINDOW', 'HAS_RECORD', 'MATERIALIZES', 'PARENT_REF', 'REQUEST_REF', 'RESULT_FOR', 'PAYLOAD_REF', 'CONTAINS', 'FROM', 'TO', 'ADDED', 'CHANGED', 'REMOVED', 'REPEATED', 'UNCHANGED'] as const;
export type TraceProperty = string | number | boolean;
export interface TraceGraphNode { label: typeof TRACE_NODE_LABELS[number]; id: string; properties: Record<string, TraceProperty> }
export interface TraceGraphEdge { type: typeof TRACE_EDGE_TYPES[number]; from: string; to: string; properties: Record<string, TraceProperty> }
export interface TraceProjection { profile: 'trace.projection.v1'; projectionId: string; normalizedDigest: string; sourceDigest: string; nodes: TraceGraphNode[]; edges: TraceGraphEdge[]; closureDigest: string }
const scalarMap = { type: 'object', additionalProperties: { type: ['string', 'number', 'boolean'] } };
const schema = { type: 'object', additionalProperties: false, required: ['profile', 'projectionId', 'normalizedDigest', 'sourceDigest', 'nodes', 'edges', 'closureDigest'], properties: {
  profile: { const: 'trace.projection.v1' }, projectionId: { type: 'string', minLength: 1 }, normalizedDigest: { type: 'string' }, sourceDigest: { type: 'string' }, closureDigest: { type: 'string' },
  nodes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['label', 'id', 'properties'], properties: { label: { enum: TRACE_NODE_LABELS }, id: { type: 'string' }, properties: scalarMap } } },
  edges: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['type', 'from', 'to', 'properties'], properties: { type: { enum: TRACE_EDGE_TYPES }, from: { type: 'string' }, to: { type: 'string' }, properties: scalarMap } } }
} };
export const TRACE_PROJECTION_SCHEMA = schema;
const validate = new Ajv({ strict: false }).compile<TraceProjection>(schema);
export function parseTraceProjection(value: unknown): TraceProjection {
  if (!validate(value)) throw new Error('Invalid trace projection shape.');
  const { closureDigest, ...body } = value;
  if (traceHash(canonicalTraceJson(body)) !== closureDigest) throw new Error('Graph closure digest mismatch.');
  const ids = new Set(value.nodes.map(n => n.id));
  if (ids.size !== value.nodes.length) throw new Error('Duplicate graph identity.');
  if ([...value.nodes, ...value.edges].some(n => n.properties.projectionId !== value.projectionId || n.properties.normalizedDigest !== value.normalizedDigest || n.properties.sourceDigest !== value.sourceDigest)) throw new Error('Missing graph provenance.');
  const edgeIds = value.edges.map(e => `${e.from}|${e.type}|${e.to}`);
  if (new Set(edgeIds).size !== edgeIds.length || value.edges.some(e => !ids.has(e.from) || !ids.has(e.to))) throw new Error('Invalid edge identity.');
  return value;
}
