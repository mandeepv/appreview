import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { SelectableCard } from '../../components/SelectableCard';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ImprovementGoal } from '../../types/onboarding';
import { Colors } from '../../constants/theme';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import { ImageSourcePropType } from 'react-native';

const GoalImages = {
  behavior: require('../../../assets/onboarding/behavior_issues_illo.jpg'),
  relationship: require('../../../assets/onboarding/relationship_illo.jpg'),
  fighting: require('../../../assets/onboarding/fighting_illo.jpg'),
  parenting: require('../../../assets/onboarding/parenting_skills_illo.jpg'),
  time: require('../../../assets/onboarding/quality_time_illo.jpg'),
  character: require('../../../assets/onboarding/character_traits_illo.jpg'),
  tantrums: require('../../../assets/onboarding/tantrums_illo.jpg'),
};

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ImprovementGoals'>;

export const ImprovementGoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { improvementGoals, toggleImprovementGoal } = useOnboardingStore();
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollHintOpacity = React.useRef(new Animated.Value(1)).current;

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y > 20 && showScrollHint) {
      // User has scrolled, hide the hint
      Animated.timing(scrollHintOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowScrollHint(false));
    }
  };

  const handleContinue = () => {
    trackOnboardingStepCompleted('ImprovementGoals', improvementGoals);
    navigation.navigate('Educational');
  };

  const goals: { value: ImprovementGoal; label: string; image: ImageSourcePropType }[] = [
    { value: 'behavior-issues', label: 'Behavior issues', image: GoalImages.behavior },
    { value: 'closer-relationship', label: 'Closer relationship', image: GoalImages.relationship },
    { value: 'less-fighting', label: 'Less fighting/tensions', image: GoalImages.fighting },
    { value: 'improved-parenting-skills', label: 'Improved parenting skills', image: GoalImages.parenting },
    { value: 'quality-time', label: 'More quality Time', image: GoalImages.time },
    { value: 'character-traits', label: 'Poor character traits', image: GoalImages.character },
    { value: 'tantrums', label: 'Tantrums/whining', image: GoalImages.tantrums },
  ];

  return (
    <OnboardingContainer
      screenName="ImprovementGoals"
      title="What feels hardest right now?"
      subtitle="Select all that apply"
      currentStep={6}
      onBack={() => navigation.goBack()}
      centerTitle={true}
      scrollable={true}
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.cardsContainer}>
            {goals.map((goal) => (
              <SelectableCard
                key={goal.value}
                title={goal.label}
                imageSource={goal.image}
                selected={improvementGoals.includes(goal.value)}
                onPress={() => toggleImprovementGoal(goal.value)}
              />
            ))}
          </View>

          {improvementGoals.length > 0 && (
            <Text style={styles.selectionCount}>
              {improvementGoals.length} {improvementGoals.length === 1 ? 'area' : 'areas'} selected
            </Text>
          )}
        </ScrollView>

        {/* Scroll hint indicator */}
        {showScrollHint && (
          <Animated.View style={[styles.scrollHint, { opacity: scrollHintOpacity }]}>
            <Text style={styles.scrollHintText}>↓ Scroll for more options</Text>
          </Animated.View>
        )}

        <View style={styles.bottomSection}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={improvementGoals.length === 0}
          />
        </View>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  cardsContainer: {
    paddingBottom: 8,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primaryBg,
    borderRadius: 100,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  scrollHint: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  scrollHintText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  bottomSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  microcopy: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 12,
  },
});
