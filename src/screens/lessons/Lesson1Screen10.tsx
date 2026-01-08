import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1Screen10'>;

export const Lesson1Screen10: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson1Screen11');
  };

  return (
    <LessonContainer
      currentStep={10}
      totalSteps={15}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            If This Feels New or Uncomfortable
          </Text>

          <Text style={styles.bodyEmphasized}>
            That doesn't mean you've been doing it wrong.
          </Text>

          <Text style={styles.body}>
            It means:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bullet}>
              • You were using tools based on outdated understanding
            </Text>
            <Text style={styles.bullet}>
              • You're now learning more effective ones
            </Text>
          </View>

          <Text style={styles.bodyHighlight}>
            Growth begins with better information — not self-blame.
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
    gap: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  bodyEmphasized: {
    fontSize: 19,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 28,
    textAlign: 'center',
  },
  bodyHighlight: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    lineHeight: 28,
    textAlign: 'center',
  },
  bulletList: {
    gap: 16,
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
