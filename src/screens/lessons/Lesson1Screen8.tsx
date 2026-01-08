import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1Screen8'>;

export const Lesson1Screen8: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson1Screen9');
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={15}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            This Is Not "Permissive Parenting"
          </Text>

          <Text style={styles.body}>
            Modern parenting does not mean:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• No rules</Text>
            <Text style={styles.bullet}>• No boundaries</Text>
            <Text style={styles.bullet}>• Letting children do whatever they want</Text>
          </View>

          <Text style={styles.bodyEmphasized}>
            Boundaries are essential.
          </Text>

          <Text style={styles.body}>
            The difference is how they are enforced:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletPositive}>• Calm instead of threatening</Text>
            <Text style={styles.bulletPositive}>• Consistent instead of reactive</Text>
            <Text style={styles.bulletPositive}>• Firm and emotionally safe</Text>
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
  bulletPositive: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    lineHeight: 26,
    textAlign: 'left',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
