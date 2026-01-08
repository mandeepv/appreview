import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec10Screen1'>;

export const CommunicationMistakesSec10Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec10Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={3}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            A well-intentioned fix
          </Text>

          <View style={styles.contentSection}>
            <View style={styles.scenarioCard}>
              <Text style={styles.scenarioText}>
                "I know Paige's dad.{'\n'}
                What if I text him and explain what happened?{'\n'}
                Then she can invite you, and it'll be fixed."
              </Text>
            </View>

            <View style={styles.responseCard}>
              <Text style={styles.responseLabel}>Response:</Text>
              <Text style={styles.responseText}>
                "No! That's so embarrassing.{'\n'}
                What are they going to think?{'\n'}
                I tell you everything."
              </Text>
            </View>

            <View style={styles.promptBox}>
              <Text style={styles.promptText}>
                What just went wrong here?
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
  scenarioCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  scenarioText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  responseCard: {
    backgroundColor: '#FFF4E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 8,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: '#E65100',
  },
  responseText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  promptBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  promptText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
