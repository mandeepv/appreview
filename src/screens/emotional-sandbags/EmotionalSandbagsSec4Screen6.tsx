import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec4Screen6'>;

export const EmotionalSandbagsSec4Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec4Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headline}>
            The 4-step process at a glance
          </Text>

          <View style={styles.checklistContainer}>
            <View style={styles.checklistItem}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>1</Text>
              </View>
              <View style={styles.checklistContent}>
                <Text style={styles.checklistTitle}>Radar</Text>
                <Text style={styles.checklistDescription}>
                  Notice unhappiness early
                </Text>
              </View>
            </View>

            <View style={styles.connector} />

            <View style={styles.checklistItem}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>2</Text>
              </View>
              <View style={styles.checklistContent}>
                <Text style={styles.checklistTitle}>Ask</Text>
                <Text style={styles.checklistDescription}>
                  Show concern and invite sharing
                </Text>
              </View>
            </View>

            <View style={styles.connector} />

            <View style={styles.checklistItem}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>3</Text>
              </View>
              <View style={styles.checklistContent}>
                <Text style={styles.checklistTitle}>Imagine & Feel</Text>
                <Text style={styles.checklistDescription}>
                  Put yourself in their shoes
                </Text>
              </View>
            </View>

            <View style={styles.connector} />

            <View style={styles.checklistItem}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>4</Text>
              </View>
              <View style={styles.checklistContent}>
                <Text style={styles.checklistTitle}>Label</Text>
                <Text style={styles.checklistDescription}>
                  Name emotions with compassion
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.reminderBox}>
            <Text style={styles.reminderText}>
              Your responsibility isn't to fix — it's to help unload emotional sandbags.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
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
    gap: 24,
  },
  headline: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 32,
    textAlign: 'center',
  },
  checklistContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 0,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
  },
  checklistContent: {
    flex: 1,
    paddingTop: 4,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  checklistDescription: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 19,
    marginVertical: 4,
  },
  reminderBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  reminderText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
