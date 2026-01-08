import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec4Screen5'>;

export const EmotionalSandbagsSec4Screen5: React.FC<Props> = ({ navigation }) => {
  const [expandedSteps, setExpandedSteps] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false,
    4: true,
  });

  const toggleStep = (step: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec4Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
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

          {/* Step 3 - Preview */}
          <TouchableOpacity
            style={styles.accordion}
            onPress={() => toggleStep(3)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionHeader}>
              <Text style={[styles.accordionTitle, styles.mutedTitle]}>Step 3: Imagine & Feel</Text>
              <Ionicons
                name={expandedSteps[3] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textTertiary}
              />
            </View>
          </TouchableOpacity>

          {/* Step 4 - Label */}
          <TouchableOpacity
            style={[styles.accordion, expandedSteps[4] && styles.accordionExpanded]}
            onPress={() => toggleStep(4)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionHeader}>
              <Text style={styles.accordionTitle}>Step 4: Label</Text>
              <Ionicons
                name={expandedSteps[4] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textPrimary}
              />
            </View>

            {expandedSteps[4] && (
              <View style={styles.accordionContent}>
                <View style={styles.illustrationContainer}>
                  <Text style={styles.illustration}>🫂</Text>
                </View>

                <Text style={styles.primaryText}>
                  Help label their emotions — and avoid common traps.
                </Text>

                <View style={styles.exampleBubble}>
                  <Text style={styles.exampleText}>
                    "Are you feeling frustrated that your coworker was so rude?"
                  </Text>
                </View>

                <View style={styles.supportingBox}>
                  <Text style={styles.supportingText}>
                    Try to name at least three emotions and why they might be feeling them.
                  </Text>
                </View>

                <View style={styles.reminderBox}>
                  <Text style={styles.reminderText}>
                    Avoid minimizing, fixing, or problem-solving here.
                  </Text>
                </View>
              </View>
            )}
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
  exampleBubble: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 16,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  supportingBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.md,
    padding: 16,
  },
  supportingText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: '#2E7D32',
    lineHeight: 22,
  },
  reminderBox: {
    borderRadius: BorderRadius.md,
    padding: 12,
    backgroundColor: '#FFF3E0',
  },
  reminderText: {
    fontSize: 14,
    fontWeight: Typography.weights.medium,
    color: '#E65100',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
