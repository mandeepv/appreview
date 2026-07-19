import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { CalculatingView } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { Colors } from '../../../constants/theme';
import { VB } from './variantBContent';

// ACT 3 — the fake "Analyzing your answers… 41%" beat. Reuses the PlanTheater
// ring via CalculatingView (pure theater — no gate/paywall/network). When the
// ~3.5s climb finishes it advances to the snapshot reveal. No back button: the
// beat is a one-way transition (going back mid-calculate would be odd), and the
// resume seam still records it as last-screen so a kill/resume lands sanely.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBCalculating'>;

export const VBCalculatingScreen: React.FC<Props> = ({ navigation }) => {
  const { saveState, setLastScreen } = useOnboardingStore();

  // Same auto-save-on-blur seam the shell screens use (kept manual here since
  // this screen doesn't render QuestionScreen/StatementScreen).
  useFocusEffect(
    useCallback(() => {
      return () => {
        saveState();
        setLastScreen(VB.Calculating);
      };
    }, [saveState, setLastScreen])
  );

  const handleDone = () => {
    trackOnboardingStepCompleted(VB.Calculating, 'complete');
    // replace, not navigate: the calculate beat shouldn't be back-reachable.
    navigation.replace('VBSnapshot');
  };

  return (
    <SafeAreaView style={styles.container}>
      <CalculatingView
        logoSource={require('../../../../assets/icon.png')}
        onDone={handleDone}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
});
