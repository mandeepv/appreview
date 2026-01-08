import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1Screen6'>;

export const Lesson1Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson1Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={15}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            Modern Parenting Science Reframed the Goal
          </Text>

          <Text style={styles.bodyEmphasized}>
            The goal is no longer control.
          </Text>

          <Text style={styles.bodyEmphasized}>
            The goal is skill-building.
          </Text>

          <Text style={styles.body}>
            Modern parenting focuses on helping children develop:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Emotional regulation</Text>
            <Text style={styles.bullet}>• Internal discipline</Text>
            <Text style={styles.bullet}>• Empathy</Text>
            <Text style={styles.bullet}>• Problem-solving</Text>
          </View>

          <Text style={styles.body}>
            These skills grow through co-regulation, not force.
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
    gap: 20,
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
