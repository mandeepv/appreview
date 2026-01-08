import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec3Screen6'>;

export const CommunicationMistakesSec3Screen6: React.FC<Props> = ({ navigation }) => {
  const handleComplete = async () => {
    await markSectionComplete('3');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎯</Text>
          </View>

          <Text style={styles.title}>
            The rule to remember
          </Text>

          <View style={styles.anchorCard}>
            <Text style={styles.mainText}>
              When emotions are high, your job is not fairness — it's safety.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.keyPhrase}>
              Perspective can wait.{'\n'}
              Connection cannot.
            </Text>

            <View style={styles.microTag}>
              <Text style={styles.microTagText}>
                You'll learn when perspective helps later in the course.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Next"
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
  },
  spacer: {
    flex: 1,
  },
  content: {
    gap: 28,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  anchorCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 28,
    gap: 20,
    width: '100%',
  },
  mainText: {
    fontSize: 19,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 30,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: Colors.primary,
    width: 60,
    alignSelf: 'center',
    opacity: 0.3,
  },
  keyPhrase: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 28,
    textAlign: 'center',
  },
  microTag: {
    backgroundColor: '#FFF4E6',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginTop: 8,
  },
  microTagText: {
    fontSize: 13,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
