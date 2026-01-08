import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'RecordingDeepBondMomentsSec1Screen5'>;

export const RecordingDeepBondMomentsSec1Screen5: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('RecordingDeepBondMomentsSec1Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
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
            What if you didn't record these moments?
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.reassuranceText}>
              That's okay.
            </Text>

            <View style={styles.alternativesCard}>
              <Text style={styles.cardTitle}>You can still:</Text>

              <View style={styles.alternativeItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.alternativeText}>Tell stories about those moments</Text>
              </View>

              <View style={styles.alternativeItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.alternativeText}>Share memories of closeness</Text>
              </View>

              <View style={styles.alternativeItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.alternativeText}>Reminisce together out loud</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Stories activate the same emotional systems as photos.
              </Text>
            </View>

            <View style={styles.closingBox}>
              <Text style={styles.closingText}>
                What matters is not perfection —{'\n'}
                it's reminding them of the bond.
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
    marginBottom: 32,
    lineHeight: 34,
  },
  contentSection: {
    gap: 24,
  },
  reassuranceText: {
    fontSize: 22,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textAlign: 'center',
  },
  alternativesCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  alternativeItem: {
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
  alternativeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  insightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  insightText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  closingBox: {
    backgroundColor: '#E3F2FF',
    borderRadius: BorderRadius.lg,
    padding: 24,
  },
  closingText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
