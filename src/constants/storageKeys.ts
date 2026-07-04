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

  // Per-lesson section-completion progress. Keyed per device, not per
  // user — so they survive account deletion. See the comment in
  // authService.deleteAccount for rationale.
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
