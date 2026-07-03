import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, ImageSourcePropType, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { SelectableCard } from '../../components/SelectableCard';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { EmotionalChallenge } from '../../types/onboarding';
import { Colors } from '../../constants/theme';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'EmotionalChallenges'>;

export const EmotionalChallengesScreen: React.FC<Props> = ({ navigation }) => {
  const { emotionalChallenges, toggleEmotionalChallenge } = useOnboardingStore();
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
    trackOnboardingStepCompleted('EmotionalChallenges', { challenges: emotionalChallenges, skipped: false });
    navigation.navigate('Auth');
  };

  const handleSkip = () => {
    trackOnboardingStepCompleted('EmotionalChallenges', { challenges: [], skipped: true });
    navigation.navigate('Auth');
  };

  const challenges: { value: EmotionalChallenge; label: string; icon?: string; image?: ImageSourcePropType }[] = [
    {
      value: 'overwhelmed',
      label: 'Feeling overwhelmed',
      image: require('../../../assets/onboarding/emotional_overwhelmed.png')
    },
    {
      value: 'anxious',
      label: 'Feeling anxious',
      image: require('../../../assets/onboarding/emotional_anxious.png')
    },
    {
      value: 'burned-out',
      label: 'Feeling burned out',
      image: require('../../../assets/onboarding/emotional_burned_out.png')
    },
    {
      value: 'emotionally-distant',
      label: 'Feeling emotionally distant',
      image: require('../../../assets/onboarding/emotional_distant.png')
    },
    {
      value: 'okay',
      label: "I’m doing okay right now",
      image: require('../../../assets/onboarding/emotional_okay.png')
    },
  ];

  const handleChallengeToggle = (challenge: EmotionalChallenge) => {
    if (challenge === 'okay') {
      if (emotionalChallenges.includes('okay')) {
        toggleEmotionalChallenge('okay');
      } else {
        emotionalChallenges.forEach(c => toggleEmotionalChallenge(c));
        toggleEmotionalChallenge('okay');
      }
    } else {
      if (emotionalChallenges.includes('okay')) {
        toggleEmotionalChallenge('okay');
      }
      toggleEmotionalChallenge(challenge);
    }
  };

  return (
    <OnboardingContainer
      screenName="EmotionalChallenges"
      title="How have you been feeling lately?"
      subtitle="Stored securely to personalize your lessons."
      currentStep={14}
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
            {challenges.map((challenge) => (
              <SelectableCard
                key={challenge.value}
                title={challenge.label}
                icon={challenge.icon}
                imageSource={challenge.image}
                selected={emotionalChallenges.includes(challenge.value)}
                onPress={() => handleChallengeToggle(challenge.value)}
              />
            ))}
          </View>

          {emotionalChallenges.length > 0 && (
            <Text style={styles.selectionCount}>
              {emotionalChallenges.length} {emotionalChallenges.length === 1 ? 'feeling' : 'feelings'} selected
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
            disabled={emotionalChallenges.length === 0}
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
  reassurance: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
});
