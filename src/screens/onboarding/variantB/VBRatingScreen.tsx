import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StoryScreen } from '../../../components/onboarding';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { Colors, Spacing, Typography, BorderRadius } from '../../../constants/theme';
import { VB } from './variantBContent';

// ACT 3 — the RATING beat, fired at peak excitement (right after the commitment
// affirmation). Per the growth playbook this is the single biggest ASO lever:
// most users won't pay, but they'll leave a review, and reviews compound into
// organic installs.
//
// NATIVE PROMPT WIRED (2026-07-21): "Rate Kinderwell" calls the real StoreReview
// prompt. Three hard rules baked in below:
//   1. Navigation NEVER hard-depends on the prompt. iOS decides whether the
//      SKStore review sheet actually appears (rate-limited ~3×/yr, silently
//      no-ops otherwise) and gives us NO callback either way, so we can never
//      wait on a real "did they rate?" signal — none exists by Apple's design.
//   2. Timing fix (2026-07-24): when the prompt IS available we hold this screen
//      for a short beat (RATING_SHEET_DWELL_MS) BEFORE navigating, so the sheet
//      animates in over the RATING screen, not over the next one. When it's not
//      available we navigate immediately (no pointless pause). Either way the
//      user always advances — never stuck.
//   3. Guarded by isAvailableAsync() and wrapped so a review-API failure can
//      never block the flow (same trust model as safeCapture/reportError).
//
// ⚠︎ The "100,000+ parents" claim and the testimonials are placeholder-but-hard-
// hitting — they MUST be real/attributable before the flag ramps (App Review
// risk). See the copy doc's checklist.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBRating'>;

const TESTIMONIALS = [
  { quote: 'The tantrum lesson changed our mornings in a week.', who: 'Sarah, mom of 2' },
  { quote: 'I finally feel like I know what to do.', who: 'James, dad of 3' },
];

export const VBRatingScreen: React.FC<Props> = ({ navigation }) => {
  // How long to keep the rating screen up after firing the native prompt, so the
  // OS review sheet has time to animate in OVER this screen rather than over the
  // NEXT one. This is purely a VISUAL sync: Apple gives us NO callback for the
  // sheet appearing/being tapped/being suppressed (by design — it's rate-limited
  // to ~3×/yr and resolves the same either way), so we can't wait on a real
  // signal. A fixed beat is the correct pattern given that black box.
  const RATING_SHEET_DWELL_MS = 1200;

  const go = () => navigation.navigate('VBReminders');

  const advance = async (action: 'rate' | 'later') => {
    trackOnboardingStepCompleted(VB.Rating, action);

    if (action !== 'rate') {
      go();
      return;
    }

    // "Rate" path. Only delay when the prompt can actually appear — if review
    // isn't available (old iOS / simulator), navigate immediately so there's no
    // pointless pause. When it IS available, fire it and hold this screen briefly
    // so the sheet lands here, then advance regardless (never stuck: Apple may
    // still suppress it and we get no signal).
    let available = false;
    try {
      available = await StoreReview.isAvailableAsync();
      if (available) {
        // Do NOT await requestReview relative to navigation — the timer below is
        // what governs when we move on. The catch keeps a review-API failure
        // from breaking the flow (same trust model as safeCapture/reportError).
        StoreReview.requestReview().catch((e) => {
          if (__DEV__) console.warn('[VBRating] requestReview failed:', e);
        });
      }
    } catch (e) {
      if (__DEV__) console.warn('[VBRating] isAvailableAsync failed:', e);
    }

    if (available) {
      setTimeout(go, RATING_SHEET_DWELL_MS);
    } else {
      go();
    }
  };

  return (
    <StoryScreen
      screenName={VB.Rating}
      iconName="star-outline"
      title="Help the next parent find this."
      body={[
        'Kinderwell was built with ',
        { text: 'over 100,000 parents', hl: true },
        '. A quick rating is how the next one, up at 2am and out of ideas, finds it too.',
      ]}
      onBack={() => navigation.goBack()}
      ctaTitle="Rate Kinderwell"
      onContinue={() => advance('rate')}
      secondaryTitle="Maybe later"
      onSecondary={() => advance('later')}
    >
      <View style={styles.testimonials}>
        {TESTIMONIALS.map((t) => (
          <View key={t.who} style={styles.card}>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.quote}>“{t.quote}”</Text>
            <Text style={styles.who}>{t.who}</Text>
          </View>
        ))}
      </View>
    </StoryScreen>
  );
};

const styles = StyleSheet.create({
  testimonials: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  stars: {
    fontSize: Typography.sizes.base,
    color: Colors.successDark,
    marginBottom: Spacing.xs,
  },
  quote: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },
  who: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
});
