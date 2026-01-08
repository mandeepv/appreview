import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec2Screen2'>;

export const CommunicationMistakesSec2Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec2Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.header}>
            The Situation
          </Text>

          <View style={styles.storyCard}>
            <Text style={styles.storyText}>
              A daughter comes home upset.
            </Text>

            <Text style={styles.storyText}>
              She wasn't invited to a sleepover.
              Her friend didn't sit with her at lunch.
            </Text>

            <Text style={styles.storyText}>
              She tells her dad what happened—hoping to feel understood.
            </Text>

            <Text style={[styles.storyText, styles.emphasis]}>
              What happens next is a very common mistake.
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="See the conversation"
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
  },
  spacer: {
    flex: 1,
  },
  content: {
    gap: 28,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  storyCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 28,
    gap: 20,
    width: '100%',
  },
  storyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  emphasis: {
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginTop: 8,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
