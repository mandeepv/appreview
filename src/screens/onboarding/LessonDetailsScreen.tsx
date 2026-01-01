import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LessonDetails'>;

export const LessonDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const { learningGoal, improvementGoals } = useOnboardingStore();

  const handleContinue = () => {
    navigation.navigate('Paywall');
  };

  const getLessonTime = () => {
    switch (learningGoal) {
      case 'casual':
        return '5 minutes';
      case 'regular':
        return '10 minutes';
      case 'serious':
        return '15 minutes';
      case 'tireless':
        return '20 minutes';
      default:
        return '10 minutes';
    }
  };

  const sampleLessons = [
    { week: 'Week 1', title: "Understanding Your Child's Emotions", lessons: 7, icon: '❤️' },
    { week: 'Week 2', title: 'Building Strong Communication', lessons: 7, icon: '💬' },
    { week: 'Week 3', title: 'Setting Healthy Boundaries', lessons: 7, icon: '🎯' },
    { week: 'Week 4', title: 'Positive Discipline Techniques', lessons: 7, icon: '✨' },
  ];

  return (
    <OnboardingContainer
      currentStep={17}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Your Personalized Program</Text>
        <Text style={styles.subtitle}>{getLessonTime()} per day • Evidence-based lessons</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {improvementGoals.length > 0 && (
            <View style={styles.goalsCard}>
              <Text style={styles.goalsTitle}>Focused on your goals:</Text>
              <Text style={styles.goalsText}>
                {improvementGoals.slice(0, 3).join(' • ')}
                {improvementGoals.length > 3 && ` and ${improvementGoals.length - 3} more`}
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Your First Month</Text>

          {sampleLessons.map((lesson, index) => (
            <View key={index} style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonIcon}>{lesson.icon}</Text>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonWeek}>{lesson.week}</Text>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                </View>
              </View>
              <Text style={styles.lessonCount}>{lesson.lessons} daily lessons</Text>
            </View>
          ))}

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>100+ lessons</Text> tailored to your family's journey
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button title="Start My Journey" onPress={handleContinue} />
        </View>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  goalsCard: {
    backgroundColor: '#FDF2F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalsTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  goalsText: {
    fontSize: 14,
    color: '#374151',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  lessonCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonWeek: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  lessonCount: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 40,
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  bold: {
    fontWeight: '600',
  },
  buttonContainer: {
    paddingVertical: 16,
  },
});
