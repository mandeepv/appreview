import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Shadows } from '../constants/theme';

interface QuizQuestionMultiSelectProps {
  question: string;
  options: Array<{ label: string; isCorrect: boolean }>;
  feedback: string;
  questionNumber: number;
  totalQuestions: number;
  onCorrect: () => void;
}

export const QuizQuestionMultiSelect: React.FC<QuizQuestionMultiSelectProps> = ({
  question,
  options,
  feedback,
  questionNumber,
  totalQuestions,
  onCorrect,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionPress = (index: number) => {
    if (showFeedback) return; // Don't allow changes after checking

    if (selectedIndices.includes(index)) {
      // Deselect
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      // Select
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleCheckAnswer = () => {
    // Check if all correct options are selected and no incorrect ones
    const correctIndices = options
      .map((opt, idx) => (opt.isCorrect ? idx : -1))
      .filter(idx => idx !== -1);

    const selectedCorrectly =
      selectedIndices.length === correctIndices.length &&
      selectedIndices.every(idx => correctIndices.includes(idx));

    if (selectedCorrectly) {
      setIsCorrect(true);
      setShowFeedback(true);
    } else {
      // Wrong answer - show feedback briefly then reset
      setIsCorrect(false);
      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedIndices([]);
      }, 800);
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
      <Text style={styles.instruction}>(Check all that apply)</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedIndices.includes(index);
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
              disabled={showFeedback}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected,
                showCorrect && styles.checkboxCorrect,
                showWrong && styles.checkboxWrong,
              ]}>
                {isSelected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
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

      {/* Check Answer Button (shows when at least one option selected and no feedback) */}
      {!showFeedback && selectedIndices.length > 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.checkButton} onPress={handleCheckAnswer}>
            <Text style={styles.checkButtonText}>Check Answer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Next Button (only shows when correct) */}
      {isCorrect && showFeedback && (
        <View style={styles.buttonContainer}>
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
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  instruction: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
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
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  checkboxWrong: {
    borderColor: Colors.error,
    backgroundColor: Colors.error,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
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
  buttonContainer: {
    marginTop: 24,
  },
  checkButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: 18,
    alignItems: 'center',
    ...Shadows.primaryStrong,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: 18,
    alignItems: 'center',
    ...Shadows.primaryStrong,
  },
  checkButtonText: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
    letterSpacing: 0.5,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
    letterSpacing: 0.5,
  },
});
