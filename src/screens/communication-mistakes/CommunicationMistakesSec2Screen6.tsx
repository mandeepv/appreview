import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec2Screen6'>;

export const CommunicationMistakesSec2Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec2Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚡</Text>
          </View>

          <Text style={styles.header}>
            This Is Called: Siding With the Enemy
          </Text>

          <View style={styles.textContainer}>
            <Text style={styles.intro}>
              "Siding with the enemy" happens when we:
            </Text>

            <View style={styles.listContainer}>
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Point out how our loved one may be wrong
                </Text>
              </View>

              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Defend the other person's behavior
                </Text>
              </View>

              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Try to teach a lesson before emotions are processed
                </Text>
              </View>
            </View>

            <View style={styles.emphasisBox}>
              <Text style={styles.emphasisText}>
                Even when facts are true, the bond weakens.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Test your understanding"
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
  header: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  textContainer: {
    gap: 20,
    width: '100%',
  },
  intro: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  listContainer: {
    gap: 16,
    paddingHorizontal: 24,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 26,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  emphasisBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginTop: 8,
  },
  emphasisText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
