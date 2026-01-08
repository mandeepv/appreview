import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/serveReturnProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec3Screen5'>;

export const ServeReturnSec3Screen5: React.FC<Props> = ({ navigation }) => {
  const [reflection, setReflection] = useState('');

  const handleFinish = async () => {
    await markSectionComplete('3');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            Think About It
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Who in your life serves to you most often? How do you typically return those serves? Where could you be more responsive?
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={reflection}
                onChangeText={setReflection}
                placeholder="Your reflections (optional)"
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.closingBox}>
              <Text style={styles.closingText}>
                Great work. You're building awareness of serve and return—one of the most powerful patterns in human connection.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Finish"
            onPress={handleFinish}
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
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    fontSize: 16,
    fontWeight: Typography.weights.regular,
    color: Colors.textPrimary,
    lineHeight: 24,
    minHeight: 120,
  },
  closingBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  closingText: {
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
