import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { PlanTheater } from './PlanTheater';
import { useReduceMotion } from './useReduceMotion';

/**
 * CalculatingView — the mid-onboarding "Analyzing your answers… 41%" beat
 * (variant B, screen VBCalculating). See docs/specs/variant-b-onboarding-copy.md.
 *
 * The winning onboardings (QUITTR/Clear30/Prayer Lock) all fake a short
 * "calculating" pass before revealing a personalized result — manufactured
 * effort makes the result feel earned, which primes the paywall. We already
 * built PlanTheater (the SVG progress ring + staged checklist) for the real
 * pre-paywall LoadingScreen; this reuses it verbatim as PURE THEATER, the only
 * difference being that here WE drive the progress (a fixed ~3.5s climb) instead
 * of the gate. It owns no gate/paywall/network logic — when the climb reaches
 * 100 it calls `onDone` so the screen can advance to the snapshot.
 *
 * Reduce Motion: jump progress instantly and fire onDone after a short, fixed
 * dwell so the beat is skipped rather than removed.
 */

const CLIMB_MS = 3500;
const REDUCED_DWELL_MS = 600;
const TICK_MS = 50;

interface CalculatingViewProps {
  logoSource: number;
  onDone: () => void;
}

export const CalculatingView: React.FC<CalculatingViewProps> = ({ logoSource, onDone }) => {
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
      // No progress animation: the ring is rendered full via the derived value
      // below (no synchronous setState in the effect). Just dwell briefly, then
      // advance so the beat is skipped rather than removed.
      const t = setTimeout(fireDone, REDUCED_DWELL_MS);
      return () => clearTimeout(t);
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / CLIMB_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        // Small pause on a full ring before advancing, so 100% is felt.
        setTimeout(fireDone, 350);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  // Reduce Motion shows a full ring immediately (derived, not stored) so there's
  // no synchronous setState in the effect; otherwise the animated climb drives it.
  const displayProgress = reduceMotion ? 100 : progress;

  return (
    <View style={styles.wrap}>
      <PlanTheater progress={displayProgress} reduceMotion={reduceMotion} logoSource={logoSource} />
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
