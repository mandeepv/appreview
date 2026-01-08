import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'RecordingDeepBondMomentsSec1Screen3'>;

export const RecordingDeepBondMomentsSec1Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('RecordingDeepBondMomentsSec1Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            What are "deep bond moments"?
          </Text>

          <View style={styles.imageContainer}>
            <Text style={styles.imageEmoji}>🤗</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Deep bond moments are one-on-one moments of closeness, such as:
            </Text>

            <View style={styles.examplesCard}>
              <View style={styles.exampleItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.exampleText}>A parent giving a warm hug</Text>
              </View>

              <View style={styles.exampleItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.exampleText}>Siblings laughing together</Text>
              </View>

              <View style={styles.exampleItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.exampleText}>Quiet affection without posing</Text>
              </View>
            </View>

            <View style={styles.reasonsCard}>
              <Text style={styles.reasonsTitle}>These moments are powerful because:</Text>

              <View style={styles.reasonItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.reasonText}>Both people know they were part of the joy</Text>
              </View>

              <View style={styles.reasonItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.reasonText}>The connection is unmistakable</Text>
              </View>

              <View style={styles.reasonItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.reasonText}>The emotion feels real — not staged</Text>
              </View>
            </View>

            <View style={styles.contrastBox}>
              <Text style={styles.contrastText}>
                Group photos show what we did.{'\n'}
                <Text style={styles.contrastTextBold}>Deep bond moments show who we were to each other.</Text>
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
    lineHeight: 34,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE4ED',
    borderRadius: BorderRadius.lg,
    padding: 40,
    marginBottom: 32,
  },
  imageEmoji: {
    fontSize: 80,
  },
  contentSection: {
    gap: 20,
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  examplesCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    marginRight: 12,
    marginTop: 2,
  },
  exampleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  reasonsCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkmark: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginRight: 12,
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  contrastBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  contrastText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  contrastTextBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
