import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec4Screen4'>;

export const EmotionalSandbagsSec4Screen4: React.FC<Props> = ({ navigation }) => {
  const [expandedSteps, setExpandedSteps] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: true,
    4: false,
  });

  const toggleStep = (step: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec4Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Step 1 - Preview */}
          <TouchableOpacity
            style={styles.accordion}
            onPress={() => toggleStep(1)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionHeader}>
              <Text style={[styles.accordionTitle, styles.mutedTitle]}>Step 1: Radar</Text>
              <Ionicons
                name={expandedSteps[1] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textTertiary}
              />
            </View>
          </TouchableOpacity>

          {/* Step 2 - Preview */}
          <TouchableOpacity
            style={styles.accordion}
            onPress={() => toggleStep(2)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionHeader}>
              <Text style={[styles.accordionTitle, styles.mutedTitle]}>Step 2: Ask</Text>
              <Ionicons
                name={expandedSteps[2] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textTertiary}
              />
            </View>
          </TouchableOpacity>

          {/* Step 3 - Imagine & Feel */}
          <TouchableOpacity
            style={[styles.accordion, expandedSteps[3] && styles.accordionExpanded]}
            onPress={() => toggleStep(3)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionHeader}>
              <Text style={styles.accordionTitle}>Step 3: Imagine & Feel</Text>
              <Ionicons
                name={expandedSteps[3] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textPrimary}
              />
            </View>

            {expandedSteps[3] && (
              <View style={styles.accordionContent}>
                <View style={styles.illustrationContainer}>
                  <Text style={styles.illustration}>💭🤔</Text>
                </View>

                <Text style={styles.primaryText}>
                  Imagine you are in their shoes and feel their emotions.
                </Text>

                <View style={styles.thoughtBubble}>
                  <Text style={styles.thoughtBubbleText}>
                    Take a moment to picture what they experienced.
                  </Text>
                  <Text style={styles.thoughtBubbleText}>
                    Let yourself feel the embarrassment, frustration, or disappointment.
                  </Text>
                </View>

                <Text style={styles.helperText}>
                  It's okay if this takes a few minutes.
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Step 4 - Preview */}
          <TouchableOpacity
            style={styles.accordion}
            onPress={() => toggleStep(4)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionHeader}>
              <Text style={[styles.accordionTitle, styles.mutedTitle]}>Step 4: Label</Text>
              <Ionicons
                name={expandedSteps[4] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textTertiary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Next"
            onPress={handleNext}
            variant="gradient"
          />
        </View>
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  content: {
    gap: 12,
  },
  accordion: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accordionExpanded: {
    borderColor: Colors.primary,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  mutedTitle: {
    color: Colors.textTertiary,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  illustration: {
    fontSize: 48,
  },
  primaryText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  thoughtBubble: {
    backgroundColor: '#F3E5F5',
    borderRadius: BorderRadius.lg,
    padding: 18,
    gap: 12,
    borderWidth: 2,
    borderColor: '#9C27B0',
    borderStyle: 'dashed',
  },
  thoughtBubbleText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: '#6A1B9A',
    lineHeight: 22,
  },
  helperText: {
    fontSize: 14,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
