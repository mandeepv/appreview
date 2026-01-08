import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec6Screen3'>;

export const EmotionalSandbagsSec6Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec6Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚠️</Text>
          </View>

          <Text style={styles.header}>
            A temptation to resist
          </Text>

          <View style={styles.bodyContainer}>
            <Text style={styles.bodyText}>
              When someone you love is struggling, it's natural to want to fix the problem.
            </Text>

            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>But solving the problem too early often:</Text>
              <View style={styles.warningList}>
                <Text style={styles.warningItem}>• Shuts emotions down</Text>
                <Text style={styles.warningItem}>• Makes people feel unheard</Text>
                <Text style={styles.warningItem}>• Misses the chance to build a deeper bond</Text>
              </View>
            </View>

            <Text style={styles.microCopy}>
              Fixing feels helpful — but it's rarely what's needed first.
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

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
  },
  spacer: {
    flex: 1,
  },
  content: {
    gap: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 4,
  },
  icon: {
    fontSize: 56,
  },
  header: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  bodyContainer: {
    gap: 20,
    width: '100%',
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: '#E65100',
    textAlign: 'center',
    marginBottom: 4,
  },
  warningList: {
    gap: 8,
  },
  warningItem: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: '#E65100',
    lineHeight: 24,
  },
  microCopy: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
