import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec3Screen4'>;

export const EmotionalSandbagsSec3Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec3Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💙</Text>
          </View>

          <Text style={styles.headline}>
            Step 2: Show concern
          </Text>

          <Text style={styles.body}>
            Once you notice something is off, the next step is simple — but powerful.
          </Text>

          <Text style={styles.body}>
            Let them know:
          </Text>

          <View style={styles.checkList}>
            <View style={styles.checkItem}>
              <Text style={styles.checkMark}>✓</Text>
              <Text style={styles.checkText}>You noticed</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkMark}>✓</Text>
              <Text style={styles.checkText}>You care</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkMark}>✓</Text>
              <Text style={styles.checkText}>They matter to you</Text>
            </View>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>This can sound like:</Text>
            <Text style={styles.exampleText}>"You seem stressed today."</Text>
            <Text style={styles.exampleText}>"Rough day?"</Text>
            <Text style={styles.exampleText}>"Want to talk about what happened?"</Text>
          </View>

          <Text style={styles.footer}>
            This kind of concern feels empathetic, not intrusive.
          </Text>
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
  checkList: {
    gap: 12,
    paddingLeft: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkMark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  checkText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  exampleBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  footer: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
