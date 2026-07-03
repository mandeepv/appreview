import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface VariantBPlaceholderProps {
  screenName: string;
  onContinue: () => void;
  onBack?: () => void;
  ctaLabel?: string;
}

/**
 * Placeholder used by all Variant B screens until real content is authored.
 * Visibly labeled so during testing you can tell you're in variant B.
 * Bright teal background is intentional — makes it easy to distinguish from
 * the pink control flow at a glance.
 */
export const VariantBPlaceholder: React.FC<VariantBPlaceholderProps> = ({
  screenName,
  onContinue,
  onBack,
  ctaLabel = 'Continue',
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.tag}>VARIANT B</Text>
          <Text style={styles.title}>{screenName}</Text>
          <Text style={styles.body}>
            Placeholder screen. Real content coming later.
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
            <Text style={styles.primaryButtonText}>{ctaLabel}</Text>
          </TouchableOpacity>

          {onBack && (
            <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E7C86',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    marginTop: 48,
  },
  tag: {
    fontSize: 12,
    letterSpacing: 3,
    color: '#B4F0F5',
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: '#DFF7F9',
    lineHeight: 22,
  },
  buttons: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0E7C86',
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    color: '#B4F0F5',
    textDecorationLine: 'underline',
  },
});
