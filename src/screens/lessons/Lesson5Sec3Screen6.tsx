import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec3Screen6'>;

export const Lesson5Sec3Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec3Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>💡</Text>
        </View>

        <Text style={styles.headline}>Key Insight</Text>

        <View style={styles.insightBox}>
          <Text style={styles.insightText}>
            The specific emotions of being overwhelmed, disappointed, and nervous were expressed as the surface emotion of sadness.
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.bodyEmphasized}>
          This works when we name our own emotions — and when we name emotions for others.
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
  insightBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    borderRadius: BorderRadius.md,
    padding: 20,
  },
  insightText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  bodyEmphasized: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 27,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
