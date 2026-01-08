import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec5Screen7'>;

export const CommunicationMistakesSec5Screen7: React.FC<Props> = ({ navigation }) => {
  const handleComplete = async () => {
    await markSectionComplete('5');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={7}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            Today you learned:
          </Text>

          <View style={styles.contentSection}>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Arguing facts doesn't calm emotions
                </Text>
              </View>

              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Feelings don't need justification to be valid
                </Text>
              </View>

              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Acknowledgment comes before solutions
                </Text>
              </View>
            </View>

            <View style={styles.reflectionCard}>
              <Text style={styles.reflectionLabel}>Reflection question:</Text>
              <Text style={styles.reflectionText}>
                Can you notice the next time you're tempted to explain why someone shouldn't feel the way they do?
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Complete"
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  contentSection: {
    gap: 28,
  },
  bulletList: {
    gap: 20,
    paddingHorizontal: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginRight: 16,
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  reflectionCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginTop: 8,
  },
  reflectionLabel: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  reflectionText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
