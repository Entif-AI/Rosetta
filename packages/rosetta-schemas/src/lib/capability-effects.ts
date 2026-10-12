/** Shared #1037 mechanical effect vocabulary; an effect class never grants authority. */
export const CAPABILITY_EFFECT_CLASSES = ['pure-transform', 'source-read', 'local-write', 'external-write', 'payment'] as const;
export type CapabilityEffectClass = (typeof CAPABILITY_EFFECT_CLASSES)[number];
