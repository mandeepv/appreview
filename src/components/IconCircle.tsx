import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, IconSizes, Spacing } from '../constants/theme';

interface IconCircleProps {
  icon: string; // Emoji or text
  size?: keyof typeof IconSizes;
  backgroundColor?: string;
  iconColor?: string;
  iconSize?: number;
  style?: ViewStyle;
}

export const IconCircle: React.FC<IconCircleProps> = ({
  icon,
  size = 'md',
  backgroundColor = Colors.primaryTint,
  iconColor = Colors.textPrimary,
  iconSize,
  style,
}) => {
  const containerSize = IconSizes[size];
  const defaultIconSize = containerSize * 0.5; // Icon is 50% of container

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.icon,
          {
            fontSize: iconSize || defaultIconSize,
            color: iconColor,
          },
        ]}
      >
        {icon}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});

export default IconCircle;
