import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec4Screen1'>;

export const Lesson5Sec4Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec4Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>SECTION 4 OF 4</Text>
        <Text style={styles.headline}>Practice Makes This a Skill</Text>

        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>🎯</Text>
        </View>

        <Text style={styles.bodyQuestion}>
          But how do I become good at naming emotions?
        </Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Next →"
          onPress={handleNext}
          variant="gradient"
        />
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 32,
    lineHeight: 36,
    textAlign: 'center',
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
  },
  bodyQuestion: {
    fontSize: 20,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
