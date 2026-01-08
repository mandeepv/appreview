import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/emotionalSandbagsProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec3Screen10'>;

export const EmotionalSandbagsSec3Screen10: React.FC<Props> = ({ navigation }) => {
  const handleComplete = async () => {
    await markSectionComplete('3');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={10}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✅</Text>
          </View>

          <Text style={styles.headline}>
            How to help unload emotional sandbags
          </Text>

          <View style={styles.summaryBox}>
            <View style={styles.checklistItem}>
              <Text style={styles.checkMark}>✅</Text>
              <Text style={styles.checklistText}>Have a radar for unhappiness</Text>
            </View>
            <View style={styles.checklistItem}>
              <Text style={styles.checkMark}>✅</Text>
              <Text style={styles.checklistText}>Gently show concern</Text>
            </View>
            <View style={styles.checklistItem}>
              <Text style={styles.checkMark}>✅</Text>
              <Text style={styles.checklistText}>Put yourself in their shoes</Text>
            </View>
            <View style={styles.checklistItem}>
              <Text style={styles.checkMark}>✅</Text>
              <Text style={styles.checklistText}>Help them name at least three emotions</Text>
            </View>
          </View>

          <Text style={styles.body}>
            With practice, this skill can transform your relationships.
          </Text>

          <Text style={styles.body}>
            Many people are stunned by how powerful this feels — for their loved ones and for themselves.
          </Text>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Science shows this is one of the fastest ways to build deep, lasting bonds.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Complete"
            onPress={handleComplete}
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
    gap: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 48,
  },
  headline: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkMark: {
    fontSize: 18,
    color: Colors.primary,
  },
  checklistText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
    flex: 1,
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  highlightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  highlightText: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
