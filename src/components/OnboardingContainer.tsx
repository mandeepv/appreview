import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from './ProgressBar';

interface OnboardingContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  currentStep?: number;
  totalSteps?: number;
  showBackButton?: boolean;
  showSkipButton?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
  scrollable?: boolean;
  centerTitle?: boolean;
  backgroundColor?: string;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps = 20,
  showBackButton = true,
  showSkipButton = false,
  onBack,
  onSkip,
  scrollable = true,
  centerTitle = false,
  backgroundColor,
}) => {
  const Content = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? { contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: 'handled' as const }
    : {};

  const containerStyle = [
    styles.container,
    backgroundColor ? { backgroundColor } : null,
  ];

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.flex, backgroundColor ? { backgroundColor } : null]}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Back Button and Progress Bar on Same Line */}
          <View style={styles.topRow}>
            {/* Back Button or Spacer */}
            {showBackButton && onBack ? (
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <View style={styles.arrowContainer}>
                  <View style={styles.arrowHead} />
                  <View style={styles.arrowLine} />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.backButtonSpacer} />
            )}

            {/* Progress Bar - Centered */}
            {currentStep !== undefined && (
              <View style={styles.progressBarContainer}>
                <ProgressBar current={currentStep} total={totalSteps} />
              </View>
            )}

            {/* Right Spacer for Balance */}
            <View style={styles.rightSpacer}>
              {showSkipButton && onSkip && (
                <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <Content style={styles.content} {...contentProps}>
          {title && (
            <Text style={[styles.title, centerTitle && styles.textCenter]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, centerTitle && styles.textCenter]}>{subtitle}</Text>
          )}
          {children}
        </Content>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    width: 24,
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
    borderRightColor: '#111827',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  arrowLine: {
    width: 16,
    height: 2,
    backgroundColor: '#111827',
  },
  backButtonSpacer: {
    width: 40,
    height: 40,
  },
  progressBarContainer: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSpacer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  textCenter: {
    textAlign: 'center',
  },
});
