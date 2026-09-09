/**
 * The circular progress indicator on the plan-building takeover.
 *
 * An SVG ring rather than a bar: the build screen is the one moment the app
 * takes over and works, and a circle reads as "processing" where a bar reads
 * as "step N of M" — which is exactly the register the rest of the flow uses.
 *
 * Two arcs share one circle. The track is drawn full, the fill is the same
 * circle with a dash pattern sized to the percentage, rotated so it starts at
 * twelve o'clock instead of three.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  oCream,
} from '../../constants/theme';

export function ProgressRing({
  percent,
  size = 190,
  stroke = 10,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (clamped / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={oCream(0.16)}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          // Mint, not clay. Clay appears nowhere else in onboarding, so it
          // read as a colour arriving from outside the system. Mint is already
          // the palette's designated tint FOR green surfaces — it belongs
          // here, and it still separates cleanly from the forestDeep ground.
          stroke={C.mint}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          // Start the arc at the top; SVG circles begin at three o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.center} pointerEvents="none">
        <Text style={styles.percent}>{`${Math.round(clamped)}%`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  percent: {
    fontFamily: F.serifItalic,
    fontSize: 58,
    color: C.cream,
    letterSpacing: -1.5,
  },
});
