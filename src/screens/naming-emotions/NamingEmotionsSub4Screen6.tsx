import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { markSubLessonComplete } from '../../utils/namingEmotionsProgress';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = NativeStackScreenProps<LessonStackParamList, 'NamingEmotionsSub4Screen6'>;

export const NamingEmotionsSub4Screen6: React.FC<Props> = ({ navigation }) => {
  const handleContinue = async () => {
    await markSubLessonComplete('4');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      progress="6/6"
      label="BAD SITUATION"
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headline}>
            You've just learned a skill you'll use with your child
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.body}>
              You just practiced naming emotions in four different situations — happy, sad, mad, and bad.
            </Text>

            <Text style={styles.body}>
              This is the exact process you'll soon help your child learn. By naming emotions together, you'll help them feel understood, reduce stress, and build emotional awareness for life.
            </Text>
          </View>
        </View>

        <Button
          title="Complete lesson"
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
  infoBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: Spacing.lg,
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
});
