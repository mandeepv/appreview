import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, style }) => {
  const percentage = (current / total) * 100;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.fill, { width: `${percentage}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 50,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 50,
  },
});
