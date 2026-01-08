import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3Screen4'>;

export const Lesson3Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson3Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            Where High Cortisol Often Comes From
          </Text>

          <Text style={styles.body}>
            This may be uncomfortable to hear:
          </Text>

          <Text style={styles.bodyEmphasized}>
            High cortisol in children is most often caused unintentionally by parents.
          </Text>

          <Text style={styles.body}>
            Not through abuse — but through unpredictability.
          </Text>

          <Text style={styles.body}>
            Examples include:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Sudden anger</Text>
            <Text style={styles.bullet}>• Sarcasm or teasing</Text>
            <Text style={styles.bullet}>• Comparisons to other children</Text>
            <Text style={styles.bullet}>• Emotional withdrawal</Text>
          </View>
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
