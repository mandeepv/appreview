import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { EmotionPicker } from '../../components/EmotionPicker';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = NativeStackScreenProps<LessonStackParamList, 'NamingEmotionsSub3Screen5'>;

export const NamingEmotionsSub3Screen5: React.FC<Props> = ({ navigation }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [why, setWhy] = useState('');

  const handleSelectEmotion = (emotion: string) => {
    setSelectedEmotion(emotion);
  };

  const handleNext = () => {
    navigation.navigate('NamingEmotionsSub3Screen6');
  };

  // Allow continuing even if no emotion selected (it's optional)
  const canContinue = !selectedEmotion || (selectedEmotion && why.trim().length > 0);

  return (
    <LessonContainer
      progress="5/6"
      label="MAD SITUATION"
      onBack={() => navigation.goBack()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.headline}>
            Was there another emotion present?
          </Text>

          <Text style={styles.helperText}>
            (optional)
          </Text>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pickerButtonText, selectedEmotion && styles.pickerButtonTextSelected]}>
              {selectedEmotion || 'Select an emotion (optional)'}
            </Text>
            <Text style={styles.pickerButtonIcon}>▼</Text>
          </TouchableOpacity>

          {selectedEmotion && (
            <View style={styles.whyContainer}>
              <Text style={styles.whyLabel}>
                Why did you feel {selectedEmotion.toLowerCase()}?
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Share why you felt this way..."
                placeholderTextColor={Colors.textMuted}
                value={why}
                onChangeText={setWhy}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}
        </View>

        <Button
          title="Next"
          onPress={handleNext}
          variant="gradient"
          disabled={!canContinue}
        />
      </KeyboardAvoidingView>

      <EmotionPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelectEmotion}
      />
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing['2xl'],
  },
  content: {
    gap: Spacing.lg,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  helperText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 22,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  pickerButtonTextSelected: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
  pickerButtonIcon: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  whyContainer: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  whyLabel: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: 16,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    minHeight: 100,
  },
});
