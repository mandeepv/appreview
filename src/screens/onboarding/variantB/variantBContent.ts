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

export const MOOD_OPTIONS: Option<string>[] = [
  { value: 'calm', label: 'Mostly calm' },
  { value: 'manageable', label: 'Manageable, with rough patches' },
  { value: 'stretched', label: 'Stretched thin' },
  { value: 'chaotic', label: 'Honestly, chaotic' },
  { value: 'overwhelmed', label: 'Overwhelmed most days' },
];

export const CHALLENGE_OPTIONS: Option<string>[] = [
  { value: 'tantrums', label: 'Meltdowns & tantrums' },
  { value: 'listening', label: 'Getting them to listen' },
  { value: 'screens', label: 'Screen-time battles' },
  { value: 'sleep', label: 'Sleep & bedtime' },
  { value: 'defiance', label: 'Defiance & power struggles' },
  { value: 'anxiety', label: 'Big worries or anxiety' },
  { value: 'siblings', label: 'Sibling conflict' },
  { value: 'bond', label: 'Feeling disconnected from them' },
];

export const WHEN_HARDEST_OPTIONS: Option<string>[] = [
  { value: 'lose_patience', label: 'I lose my patience' },
  { value: 'give_in', label: 'I give in to stop the meltdown' },
  { value: 'dont_know', label: "I freeze — I don't know what to say" },
  { value: 'yell', label: 'I raise my voice, then feel awful' },
  { value: 'guilt', label: 'I feel guilty long after' },
  { value: 'okay', label: "I'm actually handling it okay" },
];

export const GOAL_OPTIONS: Option<string>[] = [
  { value: 'calm_mornings', label: 'Calmer mornings' },
  { value: 'fewer_meltdowns', label: 'Fewer meltdowns' },
  { value: 'closer_bond', label: 'A closer bond with my child' },
  { value: 'more_patience', label: 'More patience in hard moments' },
  { value: 'confidence', label: "Confidence I'm doing it right" },
  { value: 'consistency', label: 'A partner & I on the same page' },
];

export const COMMIT_OPTIONS: Option<string>[] = [
  { value: 'extremely', label: 'Extremely committed' },
  { value: 'very', label: 'Very committed' },
  { value: 'somewhat', label: 'Somewhat committed' },
  { value: 'exploring', label: 'Just exploring for now' },
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
