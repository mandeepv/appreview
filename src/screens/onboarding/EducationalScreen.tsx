/**
 * Screen 19 in the design canvas — the payoff screen.
 *
 * No progress rail: this screen asks nothing, and moving the count on a screen
 * that takes no answer makes the flow feel longer than it is.
 *
 * Two things drive the layout.
 *
 * PERSONALISATION LEADS. It sits directly after eight questions, so proving we
 * read them is the strongest move available — and the proof is the parent's
 * own answers rendered as chips ("Age 4 · Tantrums"), not a sentence claiming
 * we listened. Chips fall back to a generic-but-true line when the store is
 * empty (cold launch, resumed session, cleared local state).
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
import { useOnboardingStore } from '../../store/onboardingStore';
import { ImprovementGoal } from '../../types/onboarding';
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

/** Short chip labels — the long option copy would not fit inline. */
const GOAL_CHIPS: Record<ImprovementGoal, string> = {
  'behavior-issues': 'Behavior',
  'closer-relationship': 'Closeness',
  'less-fighting': 'Less fighting',
  'improved-parenting-skills': 'Parenting skills',
  'quality-time': 'Quality time',
  'character-traits': 'Character',
  tantrums: 'Tantrums',
};

export const EducationalScreen: React.FC<Props> = ({ navigation }) => {
  const { children, improvementGoals } = useOnboardingStore();

  // The chips ARE the proof that we read the answers, so they are built from
  // the store rather than described. Age bands render as the band's lower
  // bound ("Age 4"), which is what a parent recognises as their own answer.
  const chips = React.useMemo(() => {
    const out: string[] = [];

    const bands = Array.from(
      new Set((children ?? []).map((c) => c.ageRange).filter(Boolean)),
    ) as string[];
    bands.slice(0, 2).forEach((band) => {
      out.push(band === '18+' ? 'Age 18+' : `Age ${band.split('-')[0]}`);
    });

    (improvementGoals ?? []).slice(0, 2).forEach((goal) => {
      const label = GOAL_CHIPS[goal];
      if (label) out.push(label);
    });

    return out;
  }, [children, improvementGoals]);

  const rows = [
    {
      Mark: ChildMark,
      title: 'Made for *your* family',
      // Falls back to a claim that is still true when we have no answers.
      body:
        chips.length > 0
          ? 'You told us about your family. Every lesson starts there.'
          : "Your kids' ages, your biggest struggle right now. Not the same course everyone gets.",
      chips: chips.length > 0 ? chips : null,
    },
    {
      Mark: TimerMark,
      title: 'Five minutes, *one* thing to try',
      body: "Read it at bedtime, try it tomorrow. Miss a day and there's nothing to catch up on.",
      chips: null,
    },
    {
      Mark: ClipboardMark,
      title: 'Written by child *psychologists*',
      body: 'Every lesson is reviewed and cites its research. Nothing here came off a forum at 2am.',
      chips: null,
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
        {rows.map(({ Mark, title, body, chips: rowChips }, i) => (
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
              {rowChips ? (
                <View style={styles.chips}>
                  {rowChips.map((chip) => (
                    <View key={chip} style={styles.chip}>
                      <Text style={styles.chipText}>{chip}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: oForest(0.12),
  },
  chipText: { fontFamily: F.sansSemi, fontSize: T.meta, color: C.forestDeep },
});
