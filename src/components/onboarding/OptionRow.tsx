/**
 * The option row — the single most-repeated element in onboarding.
 *
 * Four states, lifted from the "OPTION ROW · FOUR STATES" block in the Claude
 * Design canvas:
 *
 *   unselected  wash background, hairline indicator
 *   selected    forest background, cream text  (single-select: ring indicator)
 *   checked     forest background, cream text  (multi-select: checkbox + tick)
 *   disabled    no fill, hairline border, ink at 40%, optional trailing note
 *
 * The single/multi distinction is carried by the INDICATOR SHAPE, not by
 * colour: a circle means "one of these", a rounded square means "as many as
 * are true". The canvas is explicit that a parent should never have to guess
 * whether they can pick more than one, and colour alone would not tell them.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingRadius as R,
  OnboardingLayout as L,
  oInk,
  oCream,
} from '../../constants/theme';

function Tick() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={C.cream}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type Props = {
  label: string;
  /** Second line under the title — screen 17's rows are title + supporting line. */
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  /** 'single' draws a circle, 'multi' a rounded square. */
  mode?: 'single' | 'multi';
  /** Trailing text on a disabled row, e.g. "Not yet". */
  note?: string;
  /** Screen 18 sets its rows in serif — "held, not audited". */
  serif?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function OptionRow({
  label,
  description,
  selected = false,
  disabled = false,
  mode = 'single',
  note,
  serif = false,
  onPress,
  style,
}: Props) {
  const rowStyle: ViewStyle = disabled
    ? styles.rowDisabled
    : selected
      ? styles.rowSelected
      : styles.rowDefault;

  const labelColor = disabled ? oInk(0.4) : selected ? C.cream : oInk(0.84);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole={mode === 'multi' ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={description ? `${label}. ${description}` : label}
      style={({ pressed }) => [
        styles.row,
        rowStyle,
        pressed && !disabled ? { opacity: 0.9 } : null,
        style,
      ]}
    >
      <Indicator mode={mode} selected={selected} disabled={disabled} />

      <View style={styles.textCol}>
        <Text
          style={[
            serif ? styles.labelSerif : styles.label,
            selected && !serif ? styles.labelSelected : null,
            { color: labelColor },
          ]}
        >
          {label}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: selected ? oCream(0.82) : oInk(0.66) }]}>
            {description}
          </Text>
        ) : null}
      </View>

      {note ? <Text style={styles.note}>{note}</Text> : null}
    </Pressable>
  );
}

function Indicator({
  mode,
  selected,
  disabled,
}: {
  mode: 'single' | 'multi';
  selected: boolean;
  disabled: boolean;
}) {
  if (disabled) {
    return <View style={[styles.indicator, styles.indicatorCircle, styles.indicatorDisabled]} />;
  }

  if (mode === 'multi') {
    return selected ? (
      <View style={[styles.indicator, styles.indicatorSquare, styles.checkboxOn]}>
        <Tick />
      </View>
    ) : (
      <View style={[styles.indicator, styles.indicatorSquare, styles.checkboxOff]} />
    );
  }

  // Single-select: an unfilled ring is drawn as a thick cream border over the
  // forest row, which is what produces the "dot in a halo" read on device.
  return selected ? (
    <View style={[styles.indicator, styles.indicatorCircle, styles.radioOn]} />
  ) : (
    <View style={[styles.indicator, styles.indicatorCircle, styles.radioOff]} />
  );
}

const SIZE = L.checkbox;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: R.row,
    paddingVertical: 17,
    paddingHorizontal: 18,
  },
  rowDefault: { backgroundColor: C.wash },
  rowSelected: { backgroundColor: C.forest },
  rowDisabled: { borderWidth: 1.5, borderColor: oInk(0.14) },

  indicator: { width: SIZE, height: SIZE, flexShrink: 0 },
  indicatorCircle: { borderRadius: 999 },
  indicatorSquare: { borderRadius: 7 },
  indicatorDisabled: { borderWidth: 1.5, borderColor: oInk(0.16) },

  radioOff: { borderWidth: 1.5, borderColor: oInk(0.3) },
  radioOn: { borderWidth: 6.5, borderColor: C.cream, backgroundColor: C.forest },

  checkboxOff: { borderWidth: 1.5, borderColor: oInk(0.3) },
  checkboxOn: {
    backgroundColor: oCream(0.22),
    alignItems: 'center',
    justifyContent: 'center',
  },

  textCol: { flex: 1 },
  label: { fontFamily: F.sansMed, fontSize: T.ui },
  labelSelected: { fontFamily: F.sansSemi },
  labelSerif: { fontFamily: F.serif, fontSize: T.serifRow },
  description: { fontFamily: F.sans, fontSize: T.meta, lineHeight: T.meta * 1.45, marginTop: 3 },
  note: { fontFamily: F.sansMed, fontSize: T.meta, color: oInk(0.5), flexShrink: 0 },
});
