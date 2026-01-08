import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'HelpingProcessEmotionsSec2Screen1'>;

export const HelpingProcessEmotionsSec2Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('HelpingProcessEmotionsSec2Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentSection}>
            <View style={styles.dialogueCard}>
              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Dad:</Text>
                <Text style={styles.dialogue}>Hey, babe. What's going on?</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Daughter:</Text>
                <Text style={styles.dialogue}>Paige is having a sleepover and she invited everyone… except me.</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Dad:</Text>
                <Text style={styles.dialogue}>That's really surprising. It seemed like you two were getting along so well last week.</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Daughter:</Text>
                <Text style={styles.dialogue}>Yeah. She's just been really distant lately.</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Dad:</Text>
                <Text style={styles.dialogue}>Does that make you worried she might keep pulling away?</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Daughter:</Text>
                <Text style={styles.dialogue}>Yeah. I don't want to lose her… or my other friends.</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Dad:</Text>
                <Text style={styles.dialogue}>That sounds really frustrating.</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Daughter:</Text>
                <Text style={styles.dialogue}>It is. And it's embarrassing. Everyone's going to see the pictures.</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Dad:</Text>
                <Text style={styles.dialogue}>I hate that feeling of being embarrassed. I'm really sorry you're going through that.</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Dad:</Text>
                <Text style={styles.dialogue}>Let me know if there's anything I can do to help.</Text>
              </View>
            </View>

            <View style={styles.helperBox}>
              <Text style={styles.helperText}>
                Notice what Dad isn't doing.
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
  helperBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  helperText: {
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
