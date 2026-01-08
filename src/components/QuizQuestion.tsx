import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Shadows } from '../constants/theme';

interface QuizQuestionProps {
  question: string;
  options: Array<{ label: string; isCorrect: boolean }>;
  feedback: string;
  questionNumber: number;
  totalQuestions: number;
  onCorrect: () => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  options,
  feedback,
  questionNumber,
  totalQuestions,
  onCorrect,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionPress = (index: number) => {
    const correct = options[index].isCorrect;

    if (!correct) {
      // Wrong answer - show feedback but allow retry
      setSelectedIndex(index);
      setIsCorrect(false);
      setShowFeedback(true);

      // Reset after showing "Try again" message so they can try again
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedIndex(null);
      }, 800);
    } else {
      // Correct answer - lock in and show feedback
      setSelectedIndex(index);
      setIsCorrect(true);
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    onCorrect();
  };

  return (
    <View style={styles.container}>
      {/* Quiz Progress */}
      <Text style={styles.progressText}>
        Question {questionNumber} of {totalQuestions}
      </Text>

      {/* Question */}
      <Text style={styles.question}>{question}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const showCorrect = isSelected && isCorrect && showFeedback;
          const showWrong = isSelected && !isCorrect && showFeedback;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
              ]}
              onPress={() => handleOptionPress(index)}
              disabled={isCorrect && showFeedback}
              activeOpacity={0.7}
            >
              <View style={styles.optionLetter}>
                <Text style={[
                  styles.optionLetterText,
                  isSelected && styles.optionLetterTextSelected,
                ]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback */}
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          {isCorrect ? (
            <>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackIconCorrect}>✓</Text>
                <Text style={styles.feedbackTitleCorrect}>Correct!</Text>
              </View>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </>
          ) : (
            <>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackIconWrong}>✗</Text>
                <Text style={styles.feedbackTitleWrong}>Try again</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Next Button (only shows when correct) */}
      {isCorrect && showFeedback && (
        <View style={styles.nextButtonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  question: {
    fontSize: 22,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 32,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  optionCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.successBg,
  },
  optionWrong: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorBg,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
  },
  optionLetterTextSelected: {
    color: Colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  optionTextSelected: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
  feedbackContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: Colors.backgroundGray,
    borderRadius: BorderRadius.lg,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackIconCorrect: {
    fontSize: 24,
    marginRight: 8,
    color: Colors.success,
  },
  feedbackIconWrong: {
    fontSize: 24,
    marginRight: 8,
    color: Colors.error,
  },
  feedbackTitleCorrect: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
  },
  feedbackTitleWrong: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.error,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  nextButtonContainer: {
    marginTop: 24,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: 18,
    alignItems: 'center',
    ...Shadows.primaryStrong,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
    letterSpacing: 0.5,
  },
});
