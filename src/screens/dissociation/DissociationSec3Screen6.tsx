import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec3Screen6'>;

export const DissociationSec3Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec3Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Text style={styles.emoji}>❄️</Text>
          </View>

          <Text style={styles.header}>
            5. Use cold sensation{'\n'}(when possible)
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.description}>
              Cold is a fast and effective grounding tool.
            </Text>

            <View style={styles.optionsCard}>
              <View style={styles.optionItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.optionText}>Hold ice cubes</Text>
              </View>
              <View style={styles.optionItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.optionText}>Splash cold water on your face</Text>
              </View>
              <View style={styles.optionItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.optionText}>Run cold water over your wrists</Text>
              </View>
            </View>

            <View style={styles.cautionBox}>
              <Text style={styles.cautionText}>
                Use only what feels safe and manageable for you.
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 64,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 34,
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
  optionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginRight: 12,
    marginTop: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  cautionBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginTop: 4,
  },
  cautionText: {
    fontSize: 14,
    fontWeight: Typography.weights.medium,
    color: '#856404',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
