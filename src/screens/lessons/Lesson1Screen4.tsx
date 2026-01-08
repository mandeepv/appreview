import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1Screen4'>;

export const Lesson1Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson1Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={15}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            Then Science Started Asking Different Questions
          </Text>

          <Text style={styles.subhead}>Instead of asking:</Text>
          <Text style={styles.quote}>"How do we control children?"</Text>

          <Text style={styles.subhead}>Researchers began asking:</Text>
          <Text style={styles.quote}>"How do children's brains actually develop?"</Text>

          <Text style={styles.body}>
            Advances in:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Brain imaging</Text>
            <Text style={styles.bullet}>• Stress physiology</Text>
            <Text style={styles.bullet}>• Attachment research</Text>
          </View>

          <Text style={styles.body}>
            revealed something crucial.
          </Text>

          <Text style={styles.body}>
            Children's brains are still under construction — especially the parts responsible for impulse control, emotional regulation, and reasoning.
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Next →"
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
    gap: 16,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  subhead: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  quote: {
    fontSize: 19,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  bulletList: {
    gap: 12,
    paddingHorizontal: 12,
  },
  bullet: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'left',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
