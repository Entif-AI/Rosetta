import type { ObservationPayload } from '@entif-ai/rosetta-core';

export const PROMOTION_PROFILE = 'rrp.promotion-state.v1';
export const PROMOTION_STATES = ['pending-confirmation', 'active', 'promoted', 'cooled', 'quarantined', 'pending-revisit', 'superseded'] as const;
export type PromotionState = typeof PROMOTION_STATES[number];
export const PROMOTION_TRANSITIONS = {
  activate: ['cooled', 'pending-revisit'], confirm: ['pending-confirmation'],
  cool: ['active'], promote: ['active'], quarantine: ['active'],
  revisit: ['active', 'quarantined'], supersede: ['active', 'promoted']
} as const satisfies Record<string, readonly PromotionState[]>;
export type PromotionTransitionKind = keyof typeof PROMOTION_TRANSITIONS;
export const PROMOTION_RESULTS = {
  activate: 'active', confirm: 'active', cool: 'cooled', promote: 'promoted',
  quarantine: 'quarantined', revisit: 'pending-revisit', supersede: 'superseded'
} as const satisfies Record<PromotionTransitionKind, PromotionState>;

export type PromotionStateObservationPayload = ObservationPayload & {
  profile: typeof PROMOTION_PROFILE;
  subjectCid: string;
  state: PromotionState;
} & ({ transitionKind: 'genesis'; previousStateCid: null } |
  { transitionKind: PromotionTransitionKind; previousStateCid: string });

const isCid = (value: unknown): value is string => typeof value === 'string' && /^cidv1-sha256-[a-f0-9]{64}$/.test(value);

/** Profile validation is stricter than Core-only Observation validation. */
export function validatePromotionStatePayload(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['Promotion Profile payload must be an object.'];
  const errors: string[] = [];
  for (const field of ['observationId', 'signal', 'source']) {
    if (!(field in value) || typeof Reflect.get(value, field) !== 'string' || !Reflect.get(value, field).trim()) errors.push(`Promotion Profile requires ${field}.`);
  }
  if (!('profile' in value) || value.profile !== PROMOTION_PROFILE) errors.push('Undeclared promotion Profile.');
  if (!('subjectCid' in value) || !isCid(value.subjectCid)) errors.push('Promotion Profile requires subject CID.');
  if (!('state' in value) || !PROMOTION_STATES.some((state) => state === value.state)) errors.push('Invalid promotion state.');
  if (!('transitionKind' in value)) errors.push('Promotion Profile requires transition kind.');
  else if (value.transitionKind === 'genesis') {
    if (!('previousStateCid' in value) || value.previousStateCid !== null) errors.push('Genesis predecessor must be null.');
  } else if (typeof value.transitionKind !== 'string' || !Object.hasOwn(PROMOTION_TRANSITIONS, value.transitionKind)) errors.push('Invalid promotion transition kind.');
  else {
    if (!('previousStateCid' in value) || !isCid(value.previousStateCid)) errors.push('Transition requires exact predecessor CID.');
    if (!('state' in value) || Reflect.get(PROMOTION_RESULTS, value.transitionKind) !== value.state) errors.push('Transition result disagrees with state law.');
  }
  return errors;
}

export function isPromotionStatePayload(value: unknown): value is PromotionStateObservationPayload {
  return validatePromotionStatePayload(value).length === 0;
}
