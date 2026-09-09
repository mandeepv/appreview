/**
 * Screen 19 in the design canvas — the payoff screen.
 *
 * No progress rail: this screen asks nothing, and moving the count on a screen
 * that takes no answer makes the flow feel longer than it is.
 *
 * PERSONALISATION LEADS. It sits directly after eight questions, so paying
 * that off first is the strongest move available; it used to be third.
 *
 * An earlier pass echoed the parent's actual answers back as chips ("Age 4 ·
 * Tantrums"), read live from the store. Cut on review — the age we hold is a
 * band, not a year, so the chips were approximating an answer back at the
 * person who gave it, which is worse than not repeating it at all.
 *
 * CLAIMS STAY INSIDE WHAT THE PRODUCT DOES. The lessons carry no references,
 * so nothing here says they cite research. No proof number either: OPS_STATE
 * treats unverifiable proof claims as an App Review risk, and there is no
 * verified figure to use.
 *
 * WEIGHT. An earlier pass stacked three filled cards and the CTA fell below
 * the fold on a small phone. Rows are now icon + text separated by hairlines,
 * so three claims read as a list rather than a wall. Icons stay; the 01/02/03
 * numerals went — together they were two decorations competing in one corner.
 *
 * Rows fade in ~220ms apart so the three claims arrive as a sequence rather
 * than a block. Motion is skipped under Reduce Motion.
 *
 * The button stays "Continue". "See my plan" / "Start my first lesson" would
 * both be promises this screen cannot keep — three more questions and the
 * sign-up sit between here and the plan.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen, RichHeadline } from '../../components/onboarding/OnboardingScreen';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  oInk,
  oForest,
} from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Educational'>;

/** A child silhouette — this is about their kids specifically. */
function ChildMark() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={7} r={3.4} stroke={C.forest} strokeWidth={2} />
      <Path
        d="M5.5 20.5a6.5 6.5 0 0113 0"
        stroke={C.forest}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** A timer — five minutes. */
function TimerMark() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={7.6} stroke={C.forest} strokeWidth={2} />
      <Path
        d="M12 9.4V13l2.6 1.7M9.4 3.4h5.2"
        stroke={C.forest}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A clipboard — reviewed, cited work. */
function ClipboardMark() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={4.5} width={14} height={16} rx={2.4} stroke={C.forest} strokeWidth={2} />
      <Path
        d="M9.2 4.5V3.4h5.6v1.1M9.4 11h5.2M9.4 15h3.4"
        stroke={C.forest}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const EducationalScreen: React.FC<Props> = ({ navigation }) => {
  const rows = [
    {
      Mark: ChildMark,
      title: 'Personalized for *your* family',
      body: "Your kids' ages, your biggest struggle right now. Not the same course everyone gets.",
    },
    {
      Mark: TimerMark,
      title: 'One lesson, *5 minutes* a day',
      body: "Read it at bedtime, try it tomorrow. Miss a day and there's nothing to catch up on.",
    },
    {
      Mark: ClipboardMark,
      title: 'Written by child *psychologists*',
      // Deliberately no citation claim: the lessons do not carry references,
      // so "cites its research" would be a promise the product does not keep.
      body: 'Grounded in child development, written in plain language.',
    },
  ];

  // One Animated.Value per row, staggered so the claims arrive as a sequence.
  const anims = useRef(rows.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        // Respect the setting: show everything at once, no motion.
        anims.forEach((a) => a.setValue(1));
        return;
      }
      Animated.stagger(
        220,
        anims.map((a) =>
          Animated.timing(a, { toValue: 1, duration: 320, useNativeDriver: true }),
        ),
      ).start();
    });
    return () => {
      cancelled = true;
    };
  }, [anims]);

  const handleContinue = () => {
    trackOnboardingStepCompleted('Educational', {});
    navigation.navigate('PartnerInvolvement');
  };

  return (
    <OnboardingScreen
      headline="Parenting advice you'll *actually* use."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      scrollable
    >
      <View>
        {rows.map(({ Mark, title, body }, i) => (
          <Animated.View
            key={title}
            style={[
              styles.row,
              i < rows.length - 1 ? styles.rowRule : null,
              {
                opacity: anims[i],
                transform: [
                  {
                    translateY: anims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.markDisc}>
              <Mark />
            </View>
            <View style={styles.rowText}>
              <RichHeadline style={styles.rowTitle}>{title}</RichHeadline>
              <Text style={styles.rowBody}>{body}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 15, paddingVertical: 18 },
  rowRule: { borderBottomWidth: 1, borderBottomColor: oInk(0.09) },
  markDisc: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: oForest(0.4),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: F.serif, fontSize: 21, lineHeight: 21 * 1.3, color: C.ink },
  rowBody: {
    fontFamily: F.serif,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    color: oInk(0.76),
    marginTop: 5,
  },
});
