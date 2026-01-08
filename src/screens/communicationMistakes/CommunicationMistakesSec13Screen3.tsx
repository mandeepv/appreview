import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec13Screen3'>;

export const CommunicationMistakesSec13Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec13Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            Why "look on the bright side" hurts
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Even when it's meant kindly, looking for positives too early can feel like:
            </Text>

            <View style={styles.messageCard}>
              <View style={styles.messageItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.messageText}>Dismissing pain</Text>
              </View>
              <View style={styles.messageItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.messageText}>Avoiding discomfort</Text>
              </View>
              <View style={styles.messageItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.messageText}>Suggesting someone should feel differently</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightLabel}>The upset person hears:</Text>
              <Text style={styles.insightText}>
                "Your feelings aren't acceptable yet."
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
  messageCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#D97706',
    marginRight: 12,
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  insightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: 8,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textAlign: 'center',
  },
  insightText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
