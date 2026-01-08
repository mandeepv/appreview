import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = NativeStackScreenProps<LessonStackParamList, 'NamingEmotionsSub1Screen2'>;

export const NamingEmotionsSub1Screen2: React.FC<Props> = ({ navigation }) => {
  const [situation, setSituation] = useState('');

  const handleNext = () => {
    navigation.navigate('NamingEmotionsSub1Screen3');
  };

  return (
    <LessonContainer
      progress="2/6"
      label="HAPPY SITUATION"
      onBack={() => navigation.goBack()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.headline}>
            What happened?
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Describe the moment briefly. Where were you? Who was involved?"
            placeholderTextColor={Colors.textMuted}
            value={situation}
            onChangeText={setSituation}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <Button
          title="Next"
          onPress={handleNext}
          variant="gradient"
          disabled={situation.trim().length === 0}
        />
      </KeyboardAvoidingView>
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
    gap: Spacing.xl,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.5,
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
    minHeight: 140,
  },
});
