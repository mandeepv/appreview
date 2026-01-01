import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle } from 'react-native';

interface SelectableCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  variant?: 'default' | 'small' | 'text-only';
  icon?: string;
  style?: ViewStyle;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  title,
  subtitle,
  selected,
  onPress,
  variant = 'default',
  icon,
  style,
}) => {
  if (variant === 'text-only') {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.textOnly, style]}>
        <Text style={[styles.textOnlyLabel, selected && styles.textOnlyLabelSelected]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        variant === 'small' ? styles.cardSmall : styles.cardDefault,
        selected ? styles.cardSelected : styles.cardUnselected,
        style,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {icon && (
          <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            variant === 'small' && styles.titleSmall,
            selected ? styles.titleSelected : styles.titleUnselected,
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        {selected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  textOnly: {
    paddingVertical: 8,
  },
  textOnlyLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  textOnlyLabelSelected: {
    color: '#EC4899',
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDefault: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cardSmall: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardSelected: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
    shadowColor: '#EC4899',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardUnselected: {
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: 'white',
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  titleSelected: {
    color: '#DB2777',
  },
  titleUnselected: {
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
