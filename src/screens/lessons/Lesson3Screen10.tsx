import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3Screen10'>;

export const Lesson3Screen10: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson3Screen11');
  };

  return (
    <LessonContainer
      currentStep={10}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.label}>IMPORTANT</Text>

          <Text style={styles.headline}>
            This Is Not About Blame
          </Text>

          <Text style={styles.body}>
            Most parents increase cortisol without knowing it.
          </Text>

          <Text style={styles.body}>
            Even calm, loving parents can do this unintentionally.
          </Text>

          <Text style={styles.bodyEmphasized}>
            The good news:{'\n'}
            Cortisol is highly responsive to changes in the environment.
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
  label: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
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
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
