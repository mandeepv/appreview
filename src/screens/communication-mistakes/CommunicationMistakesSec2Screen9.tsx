import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec2Screen9'>;

export const CommunicationMistakesSec2Screen9: React.FC<Props> = ({ navigation }) => {
  const handleComplete = async () => {
    await markSectionComplete('2');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={9}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✨</Text>
          </View>

          <Text style={styles.header}>
            Key Takeaway
          </Text>

          <View style={styles.takeawayBox}>
            <Text style={styles.takeawayTitle}>
              When emotions are high, don't correct
            </Text>

            <View style={styles.listContainer}>
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Don't explain the other person's side
                </Text>
              </View>

              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Don't teach lessons too soon
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.emphasisText}>
              Your job first is to:{'\n'}
              Notice → Empathize → Validate
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Next lesson"
            onPress={handleComplete}
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
    gap: 28,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 64,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  takeawayBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 28,
    gap: 20,
    width: '100%',
  },
  takeawayTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
    paddingLeft: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
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
