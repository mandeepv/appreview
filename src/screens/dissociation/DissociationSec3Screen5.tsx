import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec3Screen5'>;

export const DissociationSec3Screen5: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec3Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            4. Run through your senses
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.description}>
              Pause and name what's happening right now.
            </Text>

            <View style={styles.promptsCard}>
              <View style={styles.promptItem}>
                <Text style={styles.promptIcon}>👁️</Text>
                <Text style={styles.promptText}>What can you see?</Text>
              </View>
              <View style={styles.promptItem}>
                <Text style={styles.promptIcon}>👂</Text>
                <Text style={styles.promptText}>What can you hear?</Text>
              </View>
              <View style={styles.promptItem}>
                <Text style={styles.promptIcon}>👃</Text>
                <Text style={styles.promptText}>What can you smell?</Text>
              </View>
              <View style={styles.promptItem}>
                <Text style={styles.promptIcon}>✋</Text>
                <Text style={styles.promptText}>What can you feel?</Text>
              </View>
            </View>

            <View style={styles.whyBox}>
              <Text style={styles.whyLabel}>Why this helps</Text>
              <Text style={styles.whyText}>
                This reconnects your brain directly to your surroundings.
              </Text>
            </View>
          </View>
        </ScrollView>

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
    marginBottom: 24,
  },
  contentSection: {
    gap: 20,
  },
  description: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  promptsCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  promptText: {
    flex: 1,
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  whyBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginTop: 4,
  },
  whyLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  whyText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
