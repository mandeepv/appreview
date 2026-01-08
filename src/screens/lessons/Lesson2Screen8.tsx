import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson2Screen8'>;

export const Lesson2Screen8: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson2Screen9');
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={16}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            The Happiness Illusion
          </Text>

          <Text style={styles.body}>
            Even though dopamine fades quickly, we keep believing:
          </Text>

          <Text style={styles.quote}>
            "If I had what they have, I'd be happier."
          </Text>

          <Text style={styles.body}>
            So people:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Envy others</Text>
            <Text style={styles.bullet}>• Chase upgrades</Text>
            <Text style={styles.bullet}>• Look for the next hit</Text>
          </View>

          <Text style={styles.bodyEmphasized}>
            But the brain always returns to baseline.
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
  quote: {
    fontSize: 19,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bodyEmphasized: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
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
