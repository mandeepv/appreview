import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec5Screen8'>;

export const EmotionalSandbagsSec5Screen8: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec5Screen9');
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💙</Text>
          </View>

          <Text style={styles.reflectionText}>
            You take a moment to feel what your partner might be feeling.
          </Text>

          <View style={styles.empathyBox}>
            <Text style={styles.labelText}>You show empathy and say:</Text>
            <Text style={styles.quoteText}>
              "That sounds like a really rough day."
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Next"
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
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 56,
  },
  reflectionText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  empathyBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 12,
    width: '100%',
  },
  labelText: {
    fontSize: 15,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 18,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
