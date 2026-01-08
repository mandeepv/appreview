import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec4Screen7'>;

export const EmotionalSandbagsSec4Screen7: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec4Screen8');
  };

  return (
    <LessonContainer
      currentStep={7}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✨</Text>
          </View>

          <View style={styles.quoteCard}>
            <View style={styles.quoteMark}>
              <Text style={styles.quoteMarkText}>"</Text>
            </View>
            <Text style={styles.quoteText}>
              Once you become practiced at this, you may be stunned by the results.
            </Text>
          </View>

          <View style={styles.supportingBox}>
            <Text style={styles.supportingText}>
              This is the #1 way science has shown we can improve relationships.
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Finish Review"
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
    marginBottom: 8,
  },
  icon: {
    fontSize: 56,
  },
  quoteCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.xl,
    padding: 32,
    paddingTop: 24,
    position: 'relative',
    width: '100%',
  },
  quoteMark: {
    position: 'absolute',
    top: -8,
    left: 24,
  },
  quoteMarkText: {
    fontSize: 72,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    opacity: 0.3,
    lineHeight: 72,
  },
  quoteText: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 30,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  supportingBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
    width: '100%',
  },
  supportingText: {
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
