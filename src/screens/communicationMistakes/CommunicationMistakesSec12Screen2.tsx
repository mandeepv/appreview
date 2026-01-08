import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec12Screen2'>;

export const CommunicationMistakesSec12Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec12Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            When helping turns into another mistake
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              When Dad couldn't fix the problem, he tried to improve her feelings instead.
            </Text>

            <Text style={styles.bodyText}>
              This is a very common instinct—especially with people we love.
            </Text>

            <Text style={styles.bodyText}>
              But trying to make someone feel better before they've processed their emotions often backfires.
            </Text>
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
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
