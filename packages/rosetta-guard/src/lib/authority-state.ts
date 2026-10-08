import { closeSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { Ajv } from 'ajv';
import { buildTile, createEvaluation, verifyTileIntegrity, type ObservationPayload, type TileEnvelope } from '@entif-ai/rosetta-core';
import {
  AUTHORITY_ENVELOPE_SCHEMA, authorityScopeContains, isProfileTimestamp, parseAuthorityEnvelope, validateAuthorityDelegation,
  type AuthorityEnvelope, type AuthorityPolicyBinding, type AuthorityScope
} from '@entif-ai/rosetta-schemas';
import { evaluateEffectiveAuthority, type CurrentAuthoritySource, type EffectiveAuthorityDecision, type EffectiveAuthorityRequest } from './effective-authority.js';

/** Local reference facts. This operating API is not a model-facing grant interface. */
export interface AuthorityFact extends Pick<AuthorityEnvelope, 'scope' | 'policy' | 'contextConstraints' | 'validity'> {
  ref: string; parentRef: string | null; subjectRef: string;
  requiredActorEvidenceRefs: string[];
  delegation: Pick<AuthorityEnvelope['delegation'], 'ceiling' | 'furtherDelegation' | 'depthRemaining'>;
}
export type AuthorityStateEvent =
  | { id: string; type: 'policy'; policy: AuthorityPolicyBinding }
  | { id: string; type: 'fact'; fact: AuthorityFact }
  | { id: string; type: 'invalidity'; ref: string; state: 'revoked' | 'invalid' | 'superseded'; evidenceRef: string };
export interface AuthorityStateObservation extends ObservationPayload {
  authorityState: { revision: number; event: AuthorityStateEvent };
}
export interface AuthorityAppendResult {
  revision: number; frontierRef: string; observation: TileEnvelope<AuthorityStateObservation>;
}
export interface AuthorityActorResolver {
  resolve(subjectRef: string, refs: string[], now: string): { ok: boolean; evidenceRefs: string[]; reasonCodes: string[] };
}
export interface CurrentAuthorityQuery {
  authorityRefs: string[]; subjectRef: string; now: string; minimumRevision?: number;
  scope?: AuthorityScope; policy?: AuthorityPolicyBinding; expectedFrontierRef?: string;
}
type EvaluatorState = Pick<EffectiveAuthorityRequest, 'policy' | 'sourceFrontierRef' | 'currentEnvelopes' | 'sources' | 'requiredActorEvidenceRefs' | 'actorEvidenceRefs'>;
export type CurrentAuthorityResolution =
  | { ok: true; revision: number; frontierRef: string; envelope: AuthorityEnvelope; currentEnvelopes: AuthorityEnvelope[]; sources: CurrentAuthoritySource[]; evaluatorState: EvaluatorState }
  | { ok: false; revision: number; frontierRef: string; reasonCodes: string[] };
export interface AuthorityInspection {
  revision: number; frontierRef: string; policy: AuthorityPolicyBinding | null; facts: AuthorityFact[];
}
export interface CurrentAuthorityOperation extends Pick<EffectiveAuthorityRequest, 'operation' | 'effect' | 'target' | 'context' | 'providerCapabilities' | 'ceilings' | 'gates' | 'intentRefs'> {
  query: CurrentAuthorityQuery;
  submittedEnvelope?: unknown;
}

const ref = { type: 'string', minLength: 1, maxLength: 2048, pattern: '\\S' };
const refs = { type: 'array', maxItems: 256, uniqueItems: true, items: ref };
const object = (properties: Record<string, object>) => ({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });
const shape = (path: string) => ({ $ref: `${AUTHORITY_ENVELOPE_SCHEMA.$id}#/properties/${path}` });
const factSchema = object({ ref, parentRef: { anyOf: [ref, { type: 'null' }] }, subjectRef: ref, requiredActorEvidenceRefs: refs,
  scope: shape('scope'), policy: shape('policy'), contextConstraints: shape('contextConstraints'), validity: shape('validity'),
  delegation: object({ ceiling: shape('scope'), furtherDelegation: { type: 'boolean' }, depthRemaining: { type: 'integer', minimum: 0, maximum: 256 } }) });
const ajv = new Ajv({ ownProperties: true }); ajv.addFormat('date-time', isProfileTimestamp); ajv.addSchema(AUTHORITY_ENVELOPE_SCHEMA);
const validEvent = ajv.compile<AuthorityStateEvent>({ oneOf: [
  object({ id: ref, type: { const: 'fact' }, fact: factSchema }),
  object({ id: ref, type: { const: 'policy' }, policy: shape('policy') }),
  object({ id: ref, type: { const: 'invalidity' }, ref, state: { enum: ['revoked', 'invalid', 'superseded'] }, evidenceRef: ref })
] });
const validQuery = ajv.compile<CurrentAuthorityQuery>({ type: 'object', additionalProperties: false, required: ['authorityRefs', 'subjectRef', 'now'], properties: {
  authorityRefs: refs, subjectRef: ref, now: { type: 'string', format: 'date-time' }, minimumRevision: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER }, scope: shape('scope'), policy: shape('policy'), expectedFrontierRef: ref
} });
const bounded = (value: unknown) => Buffer.byteLength(JSON.stringify(value)) <= 262_144;
const same = isDeepStrictEqual;
const EMPTY_FRONTIER = 'urn:rosetta:authz-state:empty';
export function parseAuthorityStateEvent(input: unknown): AuthorityStateEvent {
  if (!validEvent(input) || !bounded(input)) throw new Error('UNINTERPRETABLE_AUTHORITY_EVENT');
  return structuredClone(input);
}

function envelopeFor(fact: AuthorityFact, chain: AuthorityFact[], frontierRef: string, now: string): AuthorityEnvelope {
  return parseAuthorityEnvelope({
    envelopeRef: fact.ref, profile: { id: 'authz.authority_envelope.v1', version: '1.0.0' },
    authoritySources: chain.map(value => ({ kind: value.parentRef === null ? 'authority-root' : 'authority-delegation', ref: value.ref })),
    actorEvidenceRefs: [...new Set(chain.flatMap(value => value.requiredActorEvidenceRefs))],
    scope: fact.scope, policy: fact.policy, contextConstraints: fact.contextConstraints, validity: fact.validity,
    delegation: { ...fact.delegation, parentEnvelopeRef: fact.parentRef, lineageRefs: chain.slice(0, -1).map(value => value.ref) },
    provenance: { compiledAt: now, compilerRef: 'urn:rosetta:authz:local-compiler:v1', sourceFrontierRef: frontierRef, sourceRefs: chain.map(value => value.ref) }, integrityRefs: [], receiptRefs: []
  });
}

/** Handler-time adapter: callers provide intent and trusted gate/capability inputs, never source snapshots. */
export function authorizeCurrentOperation(state: LocalAuthorityState, input: CurrentAuthorityOperation): {
  revision: number; frontierRef: string; evaluation: TileEnvelope<EffectiveAuthorityDecision>
} {
  const resolution = state.resolve(input.query);
  if (resolution.ok) return {
    revision: resolution.revision, frontierRef: resolution.frontierRef,
    evaluation: evaluateEffectiveAuthority({ ...resolution.evaluatorState, envelope: input.submittedEnvelope ?? resolution.envelope,
      operation: input.operation, effect: input.effect, target: input.target, now: input.query.now, context: input.context,
      providerCapabilities: input.providerCapabilities, ceilings: input.ceilings, gates: input.gates, intentRefs: input.intentRefs })
  };
  const core = createEvaluation('Current authority resolution refused execution', 'deny');
  const evaluation = buildTile<EffectiveAuthorityDecision>('rosetta.evaluation', {
    ...core.payload, verdict: 'deny', effect: 'deny', reasonCodes: resolution.reasonCodes, authorityEnvelopeRef: null,
    request: null, evaluatedAt: input.query.now, policy: null, sourceRefs: [], evidenceRefs: [resolution.frontierRef], intentRefs: input.intentRefs,
    authorityRole: 'decision-evidence'
  });
  return { revision: resolution.revision, frontierRef: resolution.frontierRef, evaluation };
}
function lineage(facts: Map<string, AuthorityFact>, leaf: AuthorityFact): AuthorityFact[] {
  const chain: AuthorityFact[] = []; let current: AuthorityFact | undefined = leaf;
  while (current) {
    if (chain.length >= 256 || chain.some(value => value.ref === current?.ref)) throw new Error('INVALID_AUTHORITY_LINEAGE');
    chain.unshift(current);
    if (current.parentRef === null) return chain;
    current = facts.get(current.parentRef);
  }
  throw new Error('INVALID_AUTHORITY_LINEAGE');
}
function transition(view: AuthorityInspection, event: AuthorityStateEvent): void {
  if (event.type === 'policy') { view.policy = structuredClone(event.policy); return; }
  const facts = new Map(view.facts.map(fact => [fact.ref, fact]));
  if (event.type === 'fact') {
    if (facts.has(event.fact.ref)) throw new Error('AMBIGUOUS_AUTHORITY');
    const fact = structuredClone(event.fact); facts.set(fact.ref, fact);
    const chain = lineage(facts, fact);
    const child = envelopeFor(fact, chain, view.frontierRef, fact.validity.notBefore);
    if (chain.length > 1) {
      const parent = envelopeFor(chain[chain.length - 2], chain.slice(0, -1), view.frontierRef, fact.validity.notBefore);
      if (!validateAuthorityDelegation(child, parent).ok) throw new Error('AUTHORITY_AMPLIFICATION');
    }
    if (!view.policy || !same(fact.policy, view.policy)) throw new Error('POLICY_FRONTIER_MISMATCH');
    view.facts.push(fact); return;
  }
  const fact = facts.get(event.ref); if (!fact) throw new Error('AUTHORITY_SOURCE_NOT_FOUND');
  // Invalidity is append-only. Later records can add evidence, never erase a revoke.
  fact.validity.state = event.state;
  const field = event.state === 'revoked' ? 'revocationRefs' : event.state === 'invalid' ? 'invalidityRefs' : 'supersededByRefs';
  if (!fact.validity[field].includes(event.evidenceRef)) fact.validity[field].push(event.evidenceRef);
}

/** Append-only local reference implementation. Exclusive revision files fence local writers.
 * No global/distributed linearizability claim; no execution API accepts historical inspection.
 * #1761 owns governed mutation admission above these trusted raw storage mechanics.
 */
export class LocalAuthorityState {
  constructor(private readonly directory: string, private readonly actors?: AuthorityActorResolver) { mkdirSync(directory, { recursive: true }); }

  private history(): TileEnvelope<AuthorityStateObservation>[] {
    const files = readdirSync(this.directory).filter(name => /^\d{10}\.json$/.test(name)).sort();
    if (files.length > 10_000) throw new Error('AUTHORITY_HISTORY_BOUND_EXCEEDED');
    let previous: string | undefined;
    return files.map((file, i) => {
      try {
        const bytes = readFileSync(join(this.directory, file)); if (bytes.length > 262_144) throw new Error();
        const tile = JSON.parse(bytes.toString('utf8')) as TileEnvelope<AuthorityStateObservation>;
        if (file !== `${String(i + 1).padStart(10, '0')}.json` || tile.kind !== 'rosetta.observation' || !verifyTileIntegrity(tile).ok ||
          tile.payload.source !== 'urn:rosetta:authz-state' || tile.payload.authorityState.revision !== i + 1 ||
          !validEvent(tile.payload.authorityState.event) || !same(tile.parents, previous ? [previous] : [])) throw new Error();
        previous = tile.cid; return tile;
      } catch { throw new Error('AUTHORITY_HISTORY_INVALID'); }
    });
  }
  private materialize(history: TileEnvelope<AuthorityStateObservation>[]): AuthorityInspection {
    const view: AuthorityInspection = { revision: 0, frontierRef: EMPTY_FRONTIER, policy: null, facts: [] };
    const identities = new Set<string>();
    for (const tile of history) {
      const event = tile.payload.authorityState.event;
      if (identities.has(event.id)) throw new Error('AMBIGUOUS_AUTHORITY_MUTATION'); identities.add(event.id);
      transition(view, event); view.revision = tile.payload.authorityState.revision; view.frontierRef = tile.cid;
    }
    return view;
  }
  inspect(revision?: number): AuthorityInspection {
    const history = this.history(); const at = revision ?? history.length;
    if (!Number.isSafeInteger(at) || at < 0 || at > history.length) throw new Error('STALE_AUTHORITY_REVISION');
    return this.materialize(history.slice(0, at));
  }
  findMutation(id: string): AuthorityAppendResult | null {
    const tile = this.history().find(value => value.payload.authorityState.event.id === id);
    return tile ? { revision: tile.payload.authorityState.revision, frontierRef: tile.cid, observation: tile } : null;
  }
  observations() { return structuredClone(this.history()); }
  /** Validate a proposed transition against live state without admitting or persisting it. */
  previewAppend(input: unknown, expectedRevision: number): void {
    const event = parseAuthorityStateEvent(input); const history = this.history(); const view = this.materialize(history);
    const prior = history.find(tile => tile.payload.authorityState.event.id === event.id);
    if (prior) { if (!same(prior.payload.authorityState.event, event)) throw new Error('AUTHORITY_MUTATION_ID_CONFLICT'); return; }
    if (expectedRevision !== view.revision) throw new Error('AUTHORITY_REVISION_CONFLICT');
    transition(view, event);
  }
  append(input: unknown, expectedRevision: number): AuthorityAppendResult {
    if (!validEvent(input) || !bounded(input)) throw new Error('UNINTERPRETABLE_AUTHORITY_EVENT');
    const event = structuredClone(input); const history = this.history(); const view = this.materialize(history);
    const prior = history.find(tile => tile.payload.authorityState.event.id === event.id);
    if (prior) {
      if (!same(prior.payload.authorityState.event, event)) throw new Error('AUTHORITY_MUTATION_ID_CONFLICT');
      return { revision: prior.payload.authorityState.revision, frontierRef: prior.cid, observation: prior };
    }
    if (expectedRevision !== view.revision) throw new Error('AUTHORITY_REVISION_CONFLICT');
    transition(view, event);
    const revision = history.length + 1;
    const observation = buildTile<AuthorityStateObservation>('rosetta.observation', {
      observationId: event.id, source: 'urn:rosetta:authz-state', signal: `Authority state revision ${revision}`,
      authorityState: { revision, event }
    }, { parents: history.length ? [history[history.length - 1].cid] : [] });
    const bytes = JSON.stringify(observation) + '\n'; const file = join(this.directory, `${String(revision).padStart(10, '0')}.json`);
    let fd: number;
    try { fd = openSync(file, 'wx', 0o600); } catch { throw new Error('AUTHORITY_REVISION_CONFLICT'); }
    try { writeFileSync(fd, bytes); fsyncSync(fd); } finally { closeSync(fd); }
    const dirFd = openSync(this.directory, 'r'); try { fsyncSync(dirFd); } finally { closeSync(dirFd); }
    if (readFileSync(file, 'utf8') !== bytes) throw new Error('AUTHORITY_ACKNOWLEDGEMENT_UNKNOWN');
    return { revision, frontierRef: observation.cid, observation };
  }
  resolve(input: unknown): CurrentAuthorityResolution {
    const view = this.inspect();
    const deny = (...reasonCodes: string[]): CurrentAuthorityResolution => ({ ok: false, revision: view.revision, frontierRef: view.frontierRef, reasonCodes });
    if (!validQuery(input) || !bounded(input)) return deny('UNINTERPRETABLE_AUTHORITY_QUERY');
    const query = input;
    if ((query.minimumRevision ?? 0) > view.revision) return deny('STALE_AUTHORITY_REVISION');
    if (query.expectedFrontierRef && query.expectedFrontierRef !== view.frontierRef) return deny('SOURCE_FRONTIER_MISMATCH');
    if (query.authorityRefs.length !== 1) return deny(query.authorityRefs.length ? 'UNSUPPORTED_AUTHORITY_COMPOSITION' : 'AUTHORITY_SOURCE_NOT_FOUND');
    const facts = new Map(view.facts.map(fact => [fact.ref, fact])); const leaf = facts.get(query.authorityRefs[0]);
    if (!leaf) return deny('AUTHORITY_SOURCE_NOT_FOUND');
    if (leaf.subjectRef !== query.subjectRef) return deny('ACTOR_SUBJECT_MISMATCH');
    let chain: AuthorityFact[]; try { chain = lineage(facts, leaf); } catch { return deny('INVALID_AUTHORITY_LINEAGE'); }
    for (const fact of chain) {
      if (fact.validity.revocationRefs.length || fact.validity.state === 'revoked') return deny('AUTHORITY_REVOKED');
      if (fact.validity.invalidityRefs.length || fact.validity.supersededByRefs.length || fact.validity.state !== 'valid') return deny('AUTHORITY_INVALID');
      if (Date.parse(query.now) < Date.parse(fact.validity.notBefore)) return deny('AUTHORITY_NOT_YET_VALID');
      if (Date.parse(query.now) >= Date.parse(fact.validity.expiresAt)) return deny('AUTHORITY_EXPIRED');
      if (!same(fact.policy, view.policy) || (query.policy && !same(query.policy, view.policy))) return deny('POLICY_FRONTIER_MISMATCH');
    }
    const scope = query.scope ?? leaf.scope;
    if (scope.target.resourceRef !== leaf.scope.target.resourceRef) return deny('TARGET_MISMATCH');
    if (!authorityScopeContains(leaf.scope, scope)) return deny('AUTHORITY_AMPLIFICATION');
    const requiredActorEvidenceRefs = [...new Set(chain.flatMap(fact => fact.requiredActorEvidenceRefs))];
    const actors = requiredActorEvidenceRefs.length ? this.actors?.resolve(query.subjectRef, requiredActorEvidenceRefs, query.now) : { ok: true, evidenceRefs: [], reasonCodes: [] };
    if (!actors) return deny('ACTOR_EVIDENCE_UNRESOLVED'); if (!actors.ok) return deny(...actors.reasonCodes);
    const currentEnvelopes = chain.map((fact, i) => envelopeFor(fact, chain.slice(0, i + 1), view.frontierRef, query.now));
    const envelope = structuredClone(currentEnvelopes[currentEnvelopes.length - 1]); envelope.scope = scope;
    envelope.delegation.ceiling = { ...scope, operations: scope.operations.filter(value => leaf.delegation.ceiling.operations.includes(value)), effects: scope.effects.filter(value => leaf.delegation.ceiling.effects.includes(value)) };
    // If the requested scope cannot carry a nonempty delegation ceiling, refuse it.
    if (!envelope.delegation.ceiling.operations.length || !envelope.delegation.ceiling.effects.length) return deny('EMPTY_EFFECTIVE_SCOPE');
    const sources: CurrentAuthoritySource[] = chain.map((fact, i) => ({ source: currentEnvelopes[i].authoritySources[i], scope: fact.scope, policy: fact.policy, validity: fact.validity, contextConstraints: fact.contextConstraints, sourceFrontierRef: view.frontierRef, evidenceRefs: [view.frontierRef] }));
    const evaluatorState: EvaluatorState = { policy: leaf.policy, sourceFrontierRef: view.frontierRef, currentEnvelopes, sources, requiredActorEvidenceRefs, actorEvidenceRefs: actors.evidenceRefs };
    return { ok: true, revision: view.revision, frontierRef: view.frontierRef, envelope: parseAuthorityEnvelope(envelope), currentEnvelopes, sources, evaluatorState };
  }
}
