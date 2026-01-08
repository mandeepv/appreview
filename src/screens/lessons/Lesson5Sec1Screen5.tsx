import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec1Screen5'>;

export const Lesson5Sec1Screen5: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec1Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>🧠</Text>
        </View>

        <Text style={styles.headline}>The Science</Text>

        <Text style={styles.body}>
          When we give something such as a difficult emotion a name or a label, it allows our logical brain to help regulate and organize the primitive and emotional parts of our brain.
        </Text>

        <View style={styles.insightBox}>
          <Text style={styles.insightText}>
            When our feelings are swirling around us in an unorganized chaos, the logical brain can't help.
          </Text>
          <Text style={styles.insightText}>
            It can only help if it understands.
          </Text>
        </View>
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
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: 24,
  },
  insightBox: {
    backgroundColor: Colors.primaryBg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: 20,
    gap: 16,
  },
  insightText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
