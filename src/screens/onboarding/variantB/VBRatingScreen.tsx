import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen } from '../../../components/onboarding';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { Colors, Spacing, Typography, BorderRadius } from '../../../constants/theme';
import { VB } from './variantBContent';

// ACT 3 — the RATING beat, fired at peak excitement (right after the commitment
// affirmation). Per the growth playbook this is the single biggest ASO lever:
// most users won't pay, but they'll leave a review, and reviews compound into
// organic installs.
//
// STUBBED NATIVE PROMPT: expo-store-review is NOT installed, so the "Rate"
// button currently just advances (and logs intent). Wiring the real
// StoreReview.requestReview() is a tracked follow-up (OPS_STATE) — adding a
// native dep for a stubbed screen would force an unnecessary rebuild now.
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
  const advance = (action: 'rate' | 'later') => {
    trackOnboardingStepCompleted(VB.Rating, action);
    // TODO(follow-up): if action === 'rate', call StoreReview.requestReview()
    // once expo-store-review is added. For now both paths advance.
    navigation.navigate('VBReminders');
  };

  return (
    <StatementScreen
      screenName={VB.Rating}
      title="Help another parent find this."
      body="Kinderwell was built with 100,000+ parents. A quick rating helps the next overwhelmed parent find it too."
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
    </StatementScreen>
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
