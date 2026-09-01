import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AnalyzingTheater, AnalyzingStage } from './AnalyzingTheater';
import { useReduceMotion } from './useReduceMotion';

/**
 * CalculatingView — the mid-onboarding "building your plan" beat (variant B,
 * screen VBCalculating). See docs/specs/variant-b-onboarding-copy.md.
 *
 * The winning onboardings (Cal AI / Noom / QUITTR) fake a short "analyzing" pass
 * before revealing a personalized result — manufactured effort makes the result
 * feel earned, which primes the paywall. This drives a fixed climb and renders
 * AnalyzingTheater (the VARIANT-B-ONLY warm, personalized visual — NOT the shared
 * PlanTheater the real pre-paywall LoadingScreen uses). The caller passes
 * `stages` built from the user's real answers so the beat feels personal.
 *
 * WE drive the progress here (pure theater, no gate/paywall/network). When the
 * climb reaches 100 we call `onDone`. Reduce Motion jumps to full and dwells
 * briefly so the beat is skipped rather than removed.
 */

// ~6s hold: long enough to feel like real analysis without dragging (owner call).
const CLIMB_MS = 6000;
const REDUCED_DWELL_MS = 700;
const TICK_MS = 40;
// Small pause on a full ring before advancing, so 100% is felt.
const HOLD_AT_FULL_MS = 500;

interface CalculatingViewProps {
  stages: AnalyzingStage[];
  title: string;
  subtitle: string;
  onDone: () => void;
}

export const CalculatingView: React.FC<CalculatingViewProps> = ({
  stages,
  title,
  subtitle,
  onDone,
}) => {
  const reduceMotion = useReduceMotion();
  const [progress, setProgress] = useState(0);
  // Guard: onDone must fire exactly once even if timers overlap on unmount races.
  const doneRef = useRef(false);

  const fireDone = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    if (reduceMotion) {
      const t = setTimeout(fireDone, REDUCED_DWELL_MS);
      return () => clearTimeout(t);
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      // Ease the climb (fast-in, slow-out) so it decelerates near 100 — reads as
      // "the last bit takes the most thought", which holds attention on the payoff.
      const t = Math.min(elapsed / CLIMB_MS, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      const pct = eased * 100;
      setProgress(pct);
      if (t >= 1) {
        clearInterval(interval);
        setTimeout(fireDone, HOLD_AT_FULL_MS);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  const displayProgress = reduceMotion ? 100 : progress;

  return (
    <View style={styles.wrap}>
      <AnalyzingTheater
        progress={displayProgress}
        reduceMotion={reduceMotion}
        stages={stages}
        title={title}
        subtitle={subtitle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
