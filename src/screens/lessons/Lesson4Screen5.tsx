import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4Screen5'>;

export const Lesson4Screen5: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson4Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            Why Humans Are Wired This Way
          </Text>

          <View style={styles.memoryBox}>
            <Text style={styles.memoryText}>
              Early humans lived in tribes.
            </Text>

            <Text style={styles.memoryText}>
              Those who deeply cared about:
            </Text>

            <View style={styles.bulletList}>
              <Text style={styles.memoryBullet}>• Belonging</Text>
              <Text style={styles.memoryBullet}>• Being valued</Text>
              <Text style={styles.memoryBullet}>• Staying connected</Text>
            </View>

            <Text style={styles.memoryText}>
              were more likely to survive and pass on their genes.
            </Text>
          </View>

          <Text style={styles.bodyEmphasized}>
            We are descendants of people who needed connection to survive.
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Next →"
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
    gap: 20,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  memoryBox: {
    backgroundColor: Colors.successBg,
    padding: 20,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    gap: 16,
  },
  memoryText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
  },
  bulletList: {
    gap: 8,
    paddingLeft: 12,
  },
  memoryBullet: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    lineHeight: 24,
  },
  bodyEmphasized: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
