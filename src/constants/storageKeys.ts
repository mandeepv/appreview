// Central registry of every AsyncStorage key we use in the app.
//
// Historical bug shape this prevents: the same string literal was
// redeclared as a local `STORAGE_KEY` in ~7 different files (e.g.
// `@sprinklers_completed_sections` lived in 5 sprinkler screens plus
// the lesson-container screen plus the utility). A single typo — or
// well-meaning rename in only some files — bifurcates progress
// silently: the screen reading progress and the screen writing progress
// look at different keys, so completed sub-lessons vanish for that user.
//
// Rules:
// - Every AsyncStorage key must live here.
// - Never inline a string literal — import from here instead.
// - Onboarding key uses the `@kinderwell_` namespace; lesson-progress
//   keys use plain `@<lesson>_completed_...` (their history predates
//   the namespaced convention). We didn't rename to avoid orphaning
//   real user progress on upgrade.

export const STORAGE_KEYS = {
  // Onboarding funnel state — hydrated on app start, cleared on account
  // deletion, persists across signout/signin on the same device.
  ONBOARDING_STATE: '@kinderwell_onboarding_state',
  // Deepest onboarding screen the user has reached — used to resume
  // onboarding at the right step if the app is killed mid-flow.
  ONBOARDING_LAST_SCREEN: '@kinderwell_last_onboarding_screen',
  // Whether the user has already reached the auth screen; used to
  // skip re-showing intro screens on subsequent launches.
  ONBOARDING_HAS_REACHED_AUTH: '@kinderwell_has_reached_auth',

  // Sticky per-device onboarding A/B experiment assignment (SPEC-15).
  // Written once when the variant is first resolved and read on every
  // subsequent onboarding entry, so a server-side split change mid-flow
  // can never flip a user between variant A and variant B. The PostHog
  // flag ('onboarding-flow') is consulted ONLY when this key is absent.
  // Cleared alongside the rest of onboarding state (clearState) so a
  // fresh re-onboard after account deletion gets a fresh assignment.
  ONBOARDING_VARIANT: '@kinderwell_onboarding_variant',

  // Cached mirror of Superwall's last-reported subscription status.
  // Persisted across cold launches so LoadingScreen can skip the
  // paywall immediately for paying users instead of waiting for
  // Superwall's onSubscriptionStatusChange to fire. Overwritten as
  // soon as Superwall reports authoritative state. Cleared on
  // sign-out. See docs/PAYWALL_MODEL.md.
  IS_SUBSCRIBED: '@kinderwell_is_subscribed',

  // Per-lesson section-completion progress. Keyed per device, not per
  // user — so they survive account deletion. See the comment in
  // authService.deleteAccount for rationale.
  //
  // SPEC-18 R1: flow lessons 1–4 gain a completion key so sequential
  // locking has a signal (they had NONE before — flow lessons were
  // keyless and their completion was never recorded). These are NEW keys,
  // never shipped, so they use the current `@kinderwell_` namespace rather
  // than the legacy plain `@<lesson>_` prefix — no migration, nothing to
  // orphan (pre-v1.5.0 flow-lesson completions simply weren't stored, and
  // those users are legacy-cohort / never locked anyway — see unlockPolicy).
  LESSON1_COMPLETED_SECTIONS: '@kinderwell_lesson1_completed_sections',
  LESSON2_COMPLETED_SECTIONS: '@kinderwell_lesson2_completed_sections',
  LESSON3_COMPLETED_SECTIONS: '@kinderwell_lesson3_completed_sections',
  LESSON4_COMPLETED_SECTIONS: '@kinderwell_lesson4_completed_sections',
  LESSON5_COMPLETED_SECTIONS: '@lesson5_completed_sections',
  NAMING_EMOTIONS_COMPLETED_SUBLESSONS: '@naming_emotions_completed_sublessons',
  HELPING_PROCESS_EMOTIONS_COMPLETED_SECTIONS: '@helping_process_emotions_completed_sections',
  SERVE_RETURN_COMPLETED_SECTIONS: '@serve_return_completed_sections',
  SPRINKLERS_COMPLETED_SECTIONS: '@sprinklers_completed_sections',
  EMOTIONAL_SANDBAGS_COMPLETED_SECTIONS: '@emotional_sandbags_completed_sections',
  DISSOCIATION_COMPLETED_SECTIONS: '@dissociation_completed_sections',
  COMMUNICATION_MISTAKES_COMPLETED_SECTIONS: '@communication_mistakes_completed_sections',
  RECORDING_DEEP_BOND_MOMENTS_COMPLETED_SECTIONS: '@recording_deep_bond_moments_completed_sections',
} as const;

// The subset of keys that hold lesson progress. Used nowhere yet, but
// referenced by the "not cleared on account deletion" comment in
// authService — if we ever start clearing lesson progress on delete,
// this is the list to pass to AsyncStorage.multiRemove.
export const LESSON_PROGRESS_KEYS: readonly string[] = [
  STORAGE_KEYS.LESSON1_COMPLETED_SECTIONS,
  STORAGE_KEYS.LESSON2_COMPLETED_SECTIONS,
  STORAGE_KEYS.LESSON3_COMPLETED_SECTIONS,
  STORAGE_KEYS.LESSON4_COMPLETED_SECTIONS,
  STORAGE_KEYS.LESSON5_COMPLETED_SECTIONS,
  STORAGE_KEYS.NAMING_EMOTIONS_COMPLETED_SUBLESSONS,
  STORAGE_KEYS.HELPING_PROCESS_EMOTIONS_COMPLETED_SECTIONS,
  STORAGE_KEYS.SERVE_RETURN_COMPLETED_SECTIONS,
  STORAGE_KEYS.SPRINKLERS_COMPLETED_SECTIONS,
  STORAGE_KEYS.EMOTIONAL_SANDBAGS_COMPLETED_SECTIONS,
  STORAGE_KEYS.DISSOCIATION_COMPLETED_SECTIONS,
  STORAGE_KEYS.COMMUNICATION_MISTAKES_COMPLETED_SECTIONS,
  STORAGE_KEYS.RECORDING_DEEP_BOND_MOMENTS_COMPLETED_SECTIONS,
];
