/**
 * Variant B onboarding — single source of copy + answer→label maps.
 *
 * All variant-B option labels live here so (a) screens stay thin declarations,
 * and (b) the "mirror" beats (VBReady recap chips, VBSnapshot card) can turn the
 * user's stored answer KEYS back into human-readable text without duplicating
 * strings. Persisted/analytics values are always the KEYS (left side) — never
 * these labels, never free text (PII rule). See
 * docs/specs/variant-b-onboarding-copy.md.
 *
 * ⚠︎ Proof numbers in the screen copy are PLACEHOLDER-but-hard-hitting and must
 * be confirmed defensible before the flag ramps > 0% (see the doc's checklist).
 */

import type { Option } from '../../../components/onboarding';

// --- Screen names (kept as a const so nav/flows/tests share one spelling) ---
export const VB = {
  Welcome: 'VBWelcome',
  Intro: 'VBIntro',
  Name: 'VBName',
  Role: 'VBRole',
  Kids: 'VBKids',
  Mood: 'VBMood',
  Challenges: 'VBChallenges',
  WhenHardest: 'VBWhenHardest',
  Mirror: 'VBMirror',
  Goals: 'VBGoals',
  Ready: 'VBReady',
  Calculating: 'VBCalculating',
  Snapshot: 'VBSnapshot',
  HowItWorks: 'VBHowItWorks',
  Benefit: 'VBBenefit',
  Commit: 'VBCommit',
  AllIn: 'VBAllIn',
  Rating: 'VBRating',
  Reminders: 'VBReminders',
} as const;

// --- Option sets (value = persisted key, label = shown text) ----------------

// Each option carries an Ionicons `icon` — the graceful media fallback that
// renders as a tinted chip NOW, so no card is ever bare text or a broken image.
// When bespoke illustrations land (docs/specs/variant-b-illustration-style.md),
// add `imageSource` per option and it takes over automatically; the icon stays
// as the a11y/name anchor. Chosen glyphs are calm/neutral line icons, never
// emoji (emoji-as-icon reads cheap against the "calm growth" system).
export const MOOD_OPTIONS: Option<string>[] = [
  { value: 'calm', label: 'Mostly calm', icon: 'sunny-outline' },
  { value: 'manageable', label: 'Okay, with rough patches', icon: 'partly-sunny-outline' },
  { value: 'stretched', label: 'Stretched thin', icon: 'contract-outline' },
  { value: 'chaotic', label: 'Honestly, chaotic', icon: 'shuffle-outline' },
  { value: 'overwhelmed', label: 'Underwater most days', icon: 'rainy-outline' },
];

// Real illustrations (from the variant-A `_illo.jpg` set) wired where a genuine
// conceptual match exists; the rest fall back to their Ionicons chip. Once a
// unified art set is generated (docs/specs/variant-b-illustration-style.md),
// swap these imageSources for the on-canon versions.
export const CHALLENGE_OPTIONS: Option<string>[] = [
  {
    value: 'tantrums',
    label: 'Meltdowns and tantrums',
    icon: 'flame-outline',
    imageSource: require('../../../../assets/onboarding/tantrums_illo.jpg'),
  },
  { value: 'listening', label: 'Getting them to listen', icon: 'ear-outline' },
  { value: 'screens', label: 'Screen-time battles', icon: 'phone-portrait-outline' },
  { value: 'sleep', label: 'Sleep and bedtime', icon: 'moon-outline' },
  {
    value: 'defiance',
    label: 'Defiance and power struggles',
    icon: 'hand-left-outline',
    imageSource: require('../../../../assets/onboarding/behavior_issues_illo.jpg'),
  },
  { value: 'anxiety', label: 'Big worries or anxiety', icon: 'cloud-outline' },
  {
    value: 'siblings',
    label: 'Sibling fighting',
    icon: 'people-outline',
    imageSource: require('../../../../assets/onboarding/fighting_illo.jpg'),
  },
  {
    value: 'bond',
    label: 'Feeling disconnected from them',
    icon: 'heart-dislike-outline',
    imageSource: require('../../../../assets/onboarding/relationship_illo.jpg'),
  },
];

export const WHEN_HARDEST_OPTIONS: Option<string>[] = [
  { value: 'lose_patience', label: 'I lose my patience', icon: 'flash-outline' },
  { value: 'give_in', label: 'I give in just to stop it', icon: 'flag-outline' },
  { value: 'dont_know', label: "I freeze and don't know what to say", icon: 'snow-outline' },
  { value: 'yell', label: 'I raise my voice, then feel awful', icon: 'megaphone-outline' },
  { value: 'guilt', label: 'I feel guilty long after', icon: 'sad-outline' },
  { value: 'okay', label: "I'm actually handling it okay", icon: 'thumbs-up-outline' },
];

export const GOAL_OPTIONS: Option<string>[] = [
  { value: 'calm_mornings', label: 'Calmer mornings', icon: 'cafe-outline' },
  { value: 'fewer_meltdowns', label: 'Fewer meltdowns', icon: 'leaf-outline' },
  { value: 'closer_bond', label: 'A closer bond with my kid', icon: 'heart-outline' },
  { value: 'more_patience', label: 'More patience when it counts', icon: 'flower-outline' },
  { value: 'confidence', label: "Feeling like I've got this", icon: 'ribbon-outline' },
  { value: 'consistency', label: 'My partner and I on the same page', icon: 'people-circle-outline' },
];

export const COMMIT_OPTIONS: Option<string>[] = [
  { value: 'extremely', label: 'All in', icon: 'flame-outline' },
  { value: 'very', label: 'Very committed', icon: 'checkmark-circle-outline' },
  { value: 'somewhat', label: 'Somewhat committed', icon: 'ellipse-outline' },
  { value: 'exploring', label: 'Just looking for now', icon: 'eye-outline' },
];

// Short chip/snapshot forms — punchier than the full option labels above.
const CHALLENGE_SHORT: Record<string, string> = {
  tantrums: 'tantrums',
  listening: 'listening',
  screens: 'screen time',
  sleep: 'sleep',
  defiance: 'defiance',
  anxiety: 'anxiety',
  siblings: 'sibling conflict',
  bond: 'connection',
};

const GOAL_SHORT: Record<string, string> = {
  calm_mornings: 'calmer mornings',
  fewer_meltdowns: 'fewer meltdowns',
  closer_bond: 'a closer bond',
  more_patience: 'more patience',
  confidence: 'confidence',
  consistency: 'a united front',
};

/** Human-readable, comma-joined challenge summary (top N keys). */
export function challengeSummary(keys: string[], max = 2): string {
  const named = keys.map((k) => CHALLENGE_SHORT[k]).filter(Boolean).slice(0, max);
  return named.length ? named.join(', ') : 'your family';
}

/** Human-readable primary goal (first selected). */
export function goalSummary(keys: string[]): string {
  const first = keys.find((k) => GOAL_SHORT[k]);
  return first ? GOAL_SHORT[first] : 'a calmer home';
}

/** "2 kids · ages 4 & 7"-style family summary from the store's children array. */
export function familySummary(childrenCount: number | null, ages: string[]): string {
  const count = childrenCount ?? 0;
  const kids = count === 1 ? '1 kid' : `${count} kids`;
  if (ages.length === 0) return kids;
  const agePart = ages.length === 1 ? ages[0] : ages.join(' & ');
  return `${kids} · ${agePart}`;
}
