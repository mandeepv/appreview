import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec4Screen3'>;

export const EmotionalSandbagsSec4Screen3: React.FC<Props> = ({ navigation }) => {
  const [expandedSteps, setExpandedSteps] = useState<{ [key: number]: boolean }>({
    1: false,
    2: true,
    3: false,
    4: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation for speech bubble
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleStep = (step: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec4Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
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

          {/* Step 2 - Ask */}
          <TouchableOpacity
            style={[styles.accordion, expandedSteps[2] && styles.accordionExpanded]}
            onPress={() => toggleStep(2)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionHeader}>
              <Text style={styles.accordionTitle}>Step 2: Ask</Text>
              <Ionicons
                name={expandedSteps[2] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textPrimary}
              />
            </View>

            {expandedSteps[2] && (
              <View style={styles.accordionContent}>
                <Text style={styles.primaryText}>
                  Ask what's going on while showing concern.
                </Text>

                <Animated.View style={[styles.speechBubble, { opacity: fadeAnim }]}>
                  <Text style={styles.speechBubbleText}>
                    "You seem down.{'\n'}
                    Are you okay?{'\n'}
                    Want to talk about it?"
                  </Text>
                  <View style={styles.speechBubbleArrow} />
                </Animated.View>

                <View style={styles.supportingBox}>
                  <Text style={styles.supportingText}>
                    Simply asking — without fixing or minimizing — tells them they matter.
                  </Text>
                </View>
              </View>
            )}
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
  primaryText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  speechBubble: {
    backgroundColor: '#E3F2FF',
    borderRadius: BorderRadius.lg,
    padding: 20,
    position: 'relative',
    marginTop: 8,
  },
  speechBubbleText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: '#1976D2',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  speechBubbleArrow: {
    position: 'absolute',
    bottom: -8,
    left: 30,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E3F2FF',
  },
  supportingBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.md,
    padding: 16,
  },
  supportingText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
