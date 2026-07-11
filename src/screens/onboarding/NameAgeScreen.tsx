import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { QuestionScreen, ContinueButton } from '../../components/onboarding';
import { FormInput } from '../../components/FormInput';
import { CounterSelector } from '../../components/CounterSelector';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Spacing, Animation as AnimationConfig } from '../../constants/theme';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NameAge'>;

// SPEC-17: free-input screen — keeps an EXPLICIT Continue (auto-advance is for
// single-select only). Adopts the shell's spacing/footer grammar. Same values,
// analytics step, screenName.
export const NameAgeScreen: React.FC<Props> = ({ navigation }) => {
  const { name: storedName, age: storedAge, updateNameAndAge } = useOnboardingStore();
  const [name, setName] = useState(storedName);
  const [age, setAge] = useState<number>(storedAge || 30);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: AnimationConfig.duration.slow,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = () => {
    if (age > 0) {
      const finalName = name.trim() || 'Parent';
      updateNameAndAge(finalName, age);
      trackOnboardingStepCompleted('NameAge', { age, has_name: name.trim().length > 0 });
      navigation.navigate('ChildrenCount');
    }
  };

  const incrementAge = () => setAge((prev) => Math.min(100, prev + 1));
  const decrementAge = () => setAge((prev) => Math.max(18, prev - 1));

  const hasName = name.trim().length > 0;

  return (
    <QuestionScreen
      screenName="NameAge"
      title="Let's personalize this for you"
      subtitle="So examples feel relevant to your life"
      onBack={() => navigation.goBack()}
      footer={<ContinueButton onPress={handleContinue} />}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <FormInput
          label="Your Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          characterLimit={50}
          showCharacterCount={false}
          success={hasName}
        />

        <CounterSelector
          label="Your Age"
          value={age}
          onIncrement={incrementAge}
          onDecrement={decrementAge}
          min={18}
          max={100}
        />
      </Animated.View>
    </QuestionScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: Spacing['2xl'],
    paddingTop: Spacing.lg,
  },
});
