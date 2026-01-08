import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec6Screen4'>;

export const EmotionalSandbagsSec6Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec6Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💪</Text>
          </View>

          <Text style={styles.header}>
            What really makes the difference
          </Text>

          <View style={styles.bodyContainer}>
            <Text style={styles.introText}>
              When you help unload emotional sandbags instead of fixing the problem:
            </Text>

            <View style={styles.benefitsBox}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>✓</Text>
                <Text style={styles.benefitText}>Your loved one feels relieved</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>✓</Text>
                <Text style={styles.benefitText}>They feel understood</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>✓</Text>
                <Text style={styles.benefitText}>They feel closer to you</Text>
              </View>
            </View>

            <View style={styles.outcomeBox}>
              <Text style={styles.outcomeText}>
                Over time, this creates stronger, safer, more resilient relationships.
              </Text>
            </View>
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
  introText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  benefitsBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitBullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#4CAF50',
  },
  benefitText: {
    flex: 1,
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  outcomeBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  outcomeText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: '#2E7D32',
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
