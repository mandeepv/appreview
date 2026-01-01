import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

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
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 50,
  },
});
