import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec13Screen1'>;

export const CommunicationMistakesSec13Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec13Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeader}>
            Section 13 of 13
          </Text>

          <Text style={styles.header}>
            Looking on the bright side
          </Text>

          <View style={styles.contentSection}>
            <View style={styles.dialogueCard}>
              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Dad:</Text>
                <Text style={styles.dialogue}>
                  "Listen, I know this is a real bummer. But if you look on the bright side, you've had horse lessons, volleyball, homework… and now you have an open night."
                </Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Daughter:</Text>
                <Text style={styles.dialogue}>
                  "It's not fair that I'm alone!"
                </Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Dad:</Text>
                <Text style={styles.dialogue}>
                  "You can just relax."
                </Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Daughter:</Text>
                <Text style={styles.dialogue}>
                  "I don't want to relax. It's not fun when I'm alone."
                </Text>
              </View>
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
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
  dialogueCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  dialogueItem: {
    gap: 6,
  },
  speaker: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  dialogue: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
