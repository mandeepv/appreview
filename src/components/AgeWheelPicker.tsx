import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

interface AgeWheelPickerProps {
  value: number;
  onChange: (age: number) => void;
  min?: number;
  max?: number;
  label?: string;
  hapticFeedback?: boolean;
}

/**
 * Age selector — replaces the old +/- CounterSelector (17 taps to reach 35).
 * A native wheel picker: one flick lands the age.
 *
 * Styling reality (iOS UIPickerView): the wheel itself is a native control and
 * exposes almost nothing — the ONE lever is `itemStyle` (item font color / size
 * / weight). We cannot theme the selection band, the wheel background, or the
 * fade gradients. So we theme everything AROUND it: a cream/white surface card
 * with the same border + radius as the OptionList cards, a themed label, and
 * itemStyle set to the app's text token. The wheel reads as "in the design" via
 * its container even though the spinner is stock. Android's Picker is a dropdown
 * (not a wheel), styled via the same container.
 */
export const AgeWheelPicker: React.FC<AgeWheelPickerProps> = ({
  value,
  onChange,
  min = 18,
  max = 100,
  label,
  hapticFeedback = true,
}) => {
  // Build the age list once (18..100) — cheap, but memoized so we don't rebuild
  // an 83-item array on every render.
  const ages = useMemo(() => {
    const list: number[] = [];
    for (let a = min; a <= max; a += 1) list.push(a);
    return list;
  }, [min, max]);

  const handleChange = (next: number) => {
    // Light haptic on each detent — mirrors CounterSelector's feel so the
    // interaction doesn't feel less tactile than the stepper it replaces.
    if (hapticFeedback && next !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(next);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {/* Themed card wraps the stock wheel so it sits inside the design. */}
      <View style={styles.wheelCard}>
        <Picker
          selectedValue={value}
          onValueChange={(v) => handleChange(Number(v))}
          // itemStyle is the ONLY meaningful iOS styling hook — theme the text.
          itemStyle={styles.item}
          style={styles.picker}
        >
          {ages.map((age) => (
            <Picker.Item
              key={age}
              label={String(age)}
              value={age}
              color={Colors.textPrimary}
            />
          ))}
        </Picker>
        {/* A subtle selection band drawn OVER the wheel center so the chosen
            age reads in the app's primary tint — the native band can't be
            themed, so we overlay our own (non-interactive) hairline frame. */}
        <View pointerEvents="none" style={styles.selectionBand} />
      </View>
    </View>
  );
};

// The native iOS wheel row height is ~34pt; a 3-row window is a comfortable,
// conventional height. Kept in one place so the overlay band can be centered.
const WHEEL_HEIGHT = 180;
const ROW_HEIGHT = 34;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  wheelCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    height: WHEEL_HEIGHT,
  },
  picker: {
    // On iOS the Picker sizes to its itemStyle; give it the card height so it
    // centers. On Android it renders as a compact dropdown control.
    ...Platform.select({
      ios: { height: WHEEL_HEIGHT },
      android: { height: 56, marginHorizontal: Spacing.md },
    }),
  },
  item: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    // NOTE: on iOS only fontSize/color/fontFamily/fontWeight are honored here;
    // background/padding are ignored by UIPickerView.
  },
  // Overlaid selection frame — a themed hairline band centered on the wheel's
  // middle row. Non-interactive; purely visual so the chosen row reads as
  // "selected in the app's style" over the un-themable native band.
  selectionBand: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    height: ROW_HEIGHT + 8,
    top: (WHEEL_HEIGHT - (ROW_HEIGHT + 8)) / 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.primaryAccent,
    backgroundColor: 'transparent',
  },
});
