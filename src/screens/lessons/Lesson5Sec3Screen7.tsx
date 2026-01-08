import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec3Screen7'>;

export const Lesson5Sec3Screen7: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec3Screen8');
  };

  return (
    <LessonContainer
      currentStep={7}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>💝</Text>
        </View>

        <Text style={styles.headline}>Bonding Through Emotions</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            By helping and encouraging others to name their emotions too, we can use our logical brain to help their logical brain calm down the other parts.
          </Text>
        </View>

        <View style={styles.keyBox}>
          <Text style={styles.keyText}>
            Naming emotions for others is the number one way to build a deep bond with our loved ones.
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
  highlightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: 20,
  },
  highlightText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  keyBox: {
    backgroundColor: '#FFE4ED',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  keyText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 27,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
