import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants/theme';

interface LessonContainerProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  progress?: string; // Alternative format like "1/6"
  label?: string; // Optional label like "HAPPY SITUATION"
  onBack?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LessonContainer: React.FC<LessonContainerProps> = ({
  children,
  currentStep,
  totalSteps,
  progress: progressString,
  label,
  onBack,
}) => {
  // Calculate progress percentage
  let progressPercent = 0;
  let progressDisplay = '';

  if (progressString) {
    // Parse progress from string format "1/6"
    const [current, total] = progressString.split('/').map(Number);
    progressPercent = (current / total) * 100;
    progressDisplay = progressString;
  } else if (currentStep !== undefined && totalSteps !== undefined) {
    // Use legacy props
    progressPercent = (currentStep / totalSteps) * 100;
    progressDisplay = `${currentStep}/${totalSteps}`;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar with Progress */}
      <View style={styles.topBar}>
        {/* Back Arrow - Subtle */}
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <View style={styles.arrowContainer}>
              <View style={styles.arrowHead} />
              <View style={styles.arrowLine} />
            </View>
          </TouchableOpacity>
        )}

        {/* Label (if provided) */}
        {label && (
          <Text style={styles.label}>{label}</Text>
        )}

        {/* Progress Indicator */}
        <View style={[styles.progressContainer, label && styles.progressContainerWithLabel]}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressDisplay}</Text>
        </View>
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  arrowContainer: {
    width: 20,
    height: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 6,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderRightColor: Colors.textMuted,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  arrowLine: {
    width: 14,
    height: 2,
    backgroundColor: Colors.textMuted,
  },
  label: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressContainerWithLabel: {
    flex: 0,
    minWidth: 100,
  },
  progressBackground: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    minWidth: 40,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    minHeight: SCREEN_HEIGHT - 120, // Account for top bar and safe area
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
});
