import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = NativeStackScreenProps<LessonStackParamList, 'NamingEmotionsSub4Screen3'>;

export const NamingEmotionsSub4Screen3: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    navigation.navigate('NamingEmotionsSub4Screen4');
  };

  return (
    <LessonContainer
      progress="3/6"
      label="BAD SITUATION"
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headline}>
            At the surface, this felt like…
          </Text>

          <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>BAD</Text>
            </View>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.message}>
              When you're not sure what you feel, your brain defaults to "bad."
            </Text>
            <Text style={styles.message}>
              But there's always something underneath.
            </Text>
          </View>
        </View>

        <Button
          title="Let's explore"
          onPress={handleContinue}
          variant="gradient"
        />
      </View>
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
  chipContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#6B7280',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  chipText: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: '#4B5563',
    letterSpacing: 1,
  },
  messageBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: Spacing.md,
  },
  message: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});
