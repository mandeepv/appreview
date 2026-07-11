import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * SPEC-17 — shared "Reduce Motion" hook for the onboarding UX system.
 *
 * Mirrors the LoadingScreen detection (SPEC-16 R3): read the OS setting once at
 * mount and subscribe to live changes. When true, the system's within-screen
 * motion (option entrance stagger, Continue reveal, auto-advance delay) degrades
 * to opacity/no-delay so the flow stays fully usable for motion-sensitive users.
 *
 * Defaults to `false` (animate normally) if the query rejects.
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => { if (mounted) setReduceMotion(enabled); })
      .catch(() => { /* default false — animate normally */ });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; sub.remove(); };
  }, []);

  return reduceMotion;
}
