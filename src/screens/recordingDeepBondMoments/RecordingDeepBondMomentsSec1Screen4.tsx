import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'RecordingDeepBondMomentsSec1Screen4'>;

export const RecordingDeepBondMomentsSec1Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('RecordingDeepBondMomentsSec1Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
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
            Why this matters later in life
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              When children grow up — especially during difficult years —{'\n'}
              these reminders become emotional anchors.
            </Text>

            <View style={styles.benefitsCard}>
              <Text style={styles.cardTitle}>They help:</Text>

              <View style={styles.benefitItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.benefitText}>Reduce stress during setbacks</Text>
              </View>

              <View style={styles.benefitItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.benefitText}>Reinforce identity and belonging</Text>
              </View>

              <View style={styles.benefitItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.benefitText}>Heal faster from hurt or rejection</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Seeing proof of past closeness reminds them:
              </Text>
              <Text style={styles.quoteText}>
                "I was loved. I mattered. I was safe."
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
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  benefitsCard: {
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
  benefitItem: {
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
  benefitText: {
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
    gap: 12,
  },
  insightText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
