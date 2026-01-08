import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec1Screen2'>;

export const Lesson5Sec1Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec1Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>🚗</Text>
        </View>

        <Text style={styles.headline}>A Traffic Story</Text>

        <View style={styles.storyBox}>
          <Text style={styles.storyText}>
            It's a little after 3 p.m. and I'm stopped cold in traffic.{'\n'}
            I see red brake lights for miles — Highway 1.
          </Text>
        </View>

        <Text style={styles.body}>
          I mumbled to myself.{'\n'}
          I was running late and feeling frustrated.
        </Text>

        <Text style={styles.body}>
          I even caught myself thinking negative thoughts about other drivers who had to switch lanes in front of me, which is never a good sign about my emotional state.
        </Text>

        <View style={styles.thoughtBox}>
          <Text style={styles.thoughtText}>
            "It's not his fault.{'\n'}
            You were frustrated because you are stuck in traffic."
          </Text>
        </View>

        <Text style={styles.bodyEmphasized}>
          Oddly, I felt a lot better.
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
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  storyBox: {
    backgroundColor: Colors.primaryBg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 20,
  },
  storyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: 20,
  },
  thoughtBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 20,
  },
  thoughtText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: '#2E7D32',
    lineHeight: 26,
    textAlign: 'center',
  },
  bodyEmphasized: {
    fontSize: 19,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
