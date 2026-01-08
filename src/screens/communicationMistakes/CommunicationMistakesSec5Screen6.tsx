import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec5Screen6'>;

export const CommunicationMistakesSec5Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec5Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            Try this instead
          </Text>

          <View style={styles.contentSection}>
            <View style={styles.avoidCard}>
              <Text style={styles.cardLabel}>Instead of:</Text>
              <Text style={styles.avoidText}>"It's not that big of a deal."</Text>
            </View>

            <View style={styles.tryCard}>
              <Text style={styles.tryLabel}>Try:</Text>
              <View style={styles.phrasesList}>
                <Text style={styles.phraseText}>"I can see why that hurts."</Text>
                <Text style={styles.phraseText}>"That really mattered to you."</Text>
                <Text style={styles.phraseText}>"Tell me more about what you're feeling."</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Once someone feels understood,{'\n'}
                problem-solving becomes possible.
              </Text>
              <Text style={styles.insightText}>
                Before that — it usually isn't.
              </Text>
            </View>
          </View>
        </ScrollView>

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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 34,
  },
  contentSection: {
    gap: 24,
  },
  avoidCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  avoidText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tryCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  tryLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  phrasesList: {
    gap: 12,
  },
  phraseText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: 12,
    marginTop: 8,
  },
  insightText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
