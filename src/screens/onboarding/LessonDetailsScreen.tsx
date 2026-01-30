import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Colors } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LessonDetails'>;

export const LessonDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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
    { week: 'Week 1', title: "Understanding Your Child's Emotions", icon: '❤️' },
    { week: 'Week 2', title: 'Building Strong Communication', icon: '💬' },
    { week: 'Week 3', title: 'Setting Healthy Boundaries', icon: '🎯' },
  ];

  return (
    <OnboardingContainer
      currentStep={17}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Your Day 1 Lesson</Text>
          <Text style={styles.subtitle}>is ready</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightTime}>{getLessonTime()}</Text>
              <Text style={styles.highlightLabel}>daily</Text>
            </View>

            <Text style={styles.sectionTitle}>Coming up next</Text>

            <View style={styles.lessonsContainer}>
              {sampleLessons.map((lesson, index) => (
                <View key={index} style={styles.lessonCard}>
                  <Text style={styles.lessonIcon}>{lesson.icon}</Text>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonWeek}>{lesson.week}</Text>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.footerText}>100+ lessons personalized for your family</Text>
          </ScrollView>
        </View>

        {/* Fixed Button at Bottom */}
        <View style={[styles.fixedButtonContainer, { paddingBottom: insets.bottom || 20 }]}>
          <Button title="Start Learning" onPress={handleContinue} />
        </View>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 32,
    lineHeight: 42,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  highlightCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 24,
    padding: 32,
    marginBottom: 40,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  highlightTime: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  highlightLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
  },
  lessonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonWeek: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
