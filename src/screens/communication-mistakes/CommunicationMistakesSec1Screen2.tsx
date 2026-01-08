import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec1Screen2'>;

export const CommunicationMistakesSec1Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec1Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.header}>
            The situation
          </Text>

          <View style={styles.dialogueBox}>
            <Text style={styles.sigh}>(Sighs)</Text>

            <Text style={styles.dialogue}>
              "Paige didn't invite me to the sleepover.
            </Text>
            <Text style={styles.dialogue}>
              All the girls were invited…
            </Text>
            <Text style={styles.dialogue}>
              And she didn't even sit by me at lunch."
            </Text>
          </View>

          <Text style={styles.helperText}>
            Imagine this is your child coming to you after school.
          </Text>
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
    gap: 28,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  dialogueBox: {
    backgroundColor: '#E3F2FF',
    borderRadius: BorderRadius.xl,
    padding: 24,
    paddingTop: 20,
    width: '100%',
    gap: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  sigh: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  dialogue: {
    fontSize: 18,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  helperText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 12,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
