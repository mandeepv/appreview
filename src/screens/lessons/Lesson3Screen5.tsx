import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3Screen5'>;

export const Lesson3Screen5: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson3Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.label}>KEY INSIGHT</Text>

          <Text style={styles.headline}>
            It's Not the Event — It's the Anticipation
          </Text>

          <Text style={styles.body}>
            It's not the criticism itself that raises cortisol most.
          </Text>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              It's the fear that it could happen again.
            </Text>
          </View>

          <Text style={styles.body}>
            Even if nothing happens today, the child's nervous system stays on high alert.
          </Text>

          <Text style={styles.bodyEmphasized}>
            This is how cortisol stays elevated without you realizing it.
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
  highlightBox: {
    backgroundColor: Colors.primaryBg,
    padding: 20,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  highlightText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 28,
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
