import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec3Screen2'>;

export const EmotionalSandbagsSec3Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec3Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📡</Text>
          </View>

          <Text style={styles.headline}>
            Step 1: Have a radar for unhappiness
          </Text>

          <Text style={styles.body}>
            When our partner is grumpy or withdrawn — especially when it isn't about us — it's often a sign they're carrying emotional weight.
          </Text>

          <View style={styles.emotionList}>
            <Text style={styles.body}>They might be:</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Overwhelmed</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Stressed</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Frustrated</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Disappointed</Text>
            </View>
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Simply noticing early sends a powerful message:
            </Text>
            <Text style={styles.quoteText}>
              "I see you. I care. I have your back."
            </Text>
          </View>
        </View>

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
    paddingVertical: Spacing.lg,
  },
  content: {
    gap: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 48,
  },
  headline: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  emotionList: {
    gap: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 12,
  },
  bullet: {
    fontSize: 17,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  bulletText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    flex: 1,
  },
  highlightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
    marginTop: 8,
  },
  highlightText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
