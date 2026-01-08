import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = NativeStackScreenProps<LessonStackParamList, 'NamingEmotionsSub3Screen3'>;

export const NamingEmotionsSub3Screen3: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    navigation.navigate('NamingEmotionsSub3Screen4');
  };

  return (
    <LessonContainer
      progress="3/6"
      label="MAD SITUATION"
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headline}>
            At the surface, this felt like…
          </Text>

          <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>MAD</Text>
            </View>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.message}>
              Anger feels powerful.
            </Text>
            <Text style={styles.message}>
              But it's usually covering up emotions we don't want to feel — like helplessness, betrayal, or disappointment.
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
    backgroundColor: '#FEF2F2',
    borderWidth: 3,
    borderColor: '#EF4444',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  chipText: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: '#DC2626',
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
