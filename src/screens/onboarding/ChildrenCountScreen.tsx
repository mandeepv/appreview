import React from 'react';
import { LayoutAnimation, Platform, UIManager, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChildAgeRange, ChildGender } from '../../types/onboarding';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenCount'>;

const AGE_RANGES: { label: string; value: ChildAgeRange }[] = [
  { label: '0–1', value: '0-1' },
  { label: '2–4', value: '2-4' },
  { label: '5–7', value: '5-7' },
  { label: '8–12', value: '8-12' },
  { label: 'Teen', value: 'teen' },
];

const GENDER_OPTIONS: { label: string; value: ChildGender }[] = [
  { label: 'Girl', value: 'girl' },
  { label: 'Boy', value: 'boy' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export const ChildrenCountScreen: React.FC<Props> = ({ navigation }) => {
  const {
    childrenCount,
    updateChildrenCount,
    children,
    updateChildAgeRange,
    updateChildGender
  } = useOnboardingStore();

  const [selectedAges, setSelectedAges] = React.useState<Set<ChildAgeRange>>(new Set());
  const [showPersonalization, setShowPersonalization] = React.useState(false);

  // Initialize selected ages from store if returning
  React.useEffect(() => {
    if (childrenCount) {
      const existingAges = new Set<ChildAgeRange>();
      children.forEach(child => {
        if (child.ageRange) existingAges.add(child.ageRange);
      });
      if (existingAges.size > 0) setSelectedAges(existingAges);
    }
  }, []);

  const animate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const incrementCount = () => {
    animate();
    updateChildrenCount((childrenCount || 0) + 1);
  };

  const decrementCount = () => {
    const current = childrenCount || 0;
    if (current > 0) {
      animate();
      updateChildrenCount(current - 1);
    }
  };

  const toggleAge = (age: ChildAgeRange) => {
    const newAges = new Set(selectedAges);
    if (newAges.has(age)) {
      newAges.delete(age);
    } else {
      newAges.add(age);
    }
    setSelectedAges(newAges);
  };

  const togglePersonalization = () => {
    animate();
    setShowPersonalization(!showPersonalization);
  };

  const handleContinue = () => {
    const count = childrenCount || 1;
    const ages = Array.from(selectedAges);

    for (let i = 0; i < count; i++) {
      // Assign ages cyclically if count > ages selected
      if (ages.length > 0) {
        const ageToAssign = ages[i % ages.length];
        updateChildAgeRange(i, ageToAssign);
      }
    }
    navigation.navigate('ImprovementGoals');
  };

  const hasChildren = (childrenCount || 0) > 0;
  const hasAges = selectedAges.size > 0;
  const canContinue = hasChildren && hasAges;

  return (
    <OnboardingContainer
      title="Let’s personalize this for your child(ren)"
      currentStep={3}
      onBack={() => navigation.goBack()}
      centerTitle={true}
    >
      <View style={styles.container}>
        <View style={styles.scrollContainer}>
          {/* Count Section - Always Visible */}
          <View style={styles.section}>
            <Text style={styles.label}>How many children do you have?</Text>
            <View style={styles.selectorContainer}>
              <View style={styles.selector}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonMinus]}
                  onPress={decrementCount}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonTextMinus}>-</Text>
                </TouchableOpacity>
                <View style={styles.display}>
                  <Text style={styles.displayText}>{childrenCount || 0}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPlus]}
                  onPress={incrementCount}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonTextPlus}>+</Text>
                </TouchableOpacity>
              </View>
              {childrenCount === 0 && (
                <TouchableOpacity onPress={incrementCount} style={styles.expectingContainer}>
                  <Text style={styles.expectingText}>Expecting or caregiving for a child?</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Age Section - Revealed if children > 0 */}
          {hasChildren && (
            <View style={styles.section}>
              <Text style={styles.label}>How old are they? (Select all that apply)</Text>
              <View style={styles.ageGrid}>
                {AGE_RANGES.map((range) => (
                  <TouchableOpacity
                    key={range.value}
                    style={[
                      styles.ageOption,
                      selectedAges.has(range.value) && styles.ageOptionSelected
                    ]}
                    onPress={() => toggleAge(range.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.ageOptionText,
                      selectedAges.has(range.value) && styles.ageOptionTextSelected
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Personalization Trigger */}
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.expandButton}
                onPress={togglePersonalization}
                activeOpacity={0.7}
              >
                <Text style={styles.expandText}>Additional info (Optional)</Text>
                <Text style={styles.expandIcon}>{showPersonalization ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Gender Section - Optional Expand */}
              {showPersonalization && (
                <View style={styles.personalizationSection}>
                  <Text style={styles.subLabel}>Gender selection</Text>
                  {Array.from({ length: childrenCount || 1 }).map((_, index) => (
                    <View key={index} style={styles.childRow}>
                      <Text style={styles.childLabel}>Child {index + 1}</Text>
                      <View style={styles.genderRow}>
                        {GENDER_OPTIONS.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.genderButton,
                              children[index]?.gender === option.value && styles.genderButtonSelected,
                              option.value === 'prefer-not-to-say' && styles.genderButtonWide
                            ]}
                            onPress={() => updateChildGender(index, option.value)}
                          >
                            <Text style={[
                              styles.genderText,
                              children[index]?.gender === option.value && styles.genderTextSelected
                            ]}>
                              {option.label === 'Prefer not to say' ? 'N/A' : option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <Text style={styles.microcopy}>
            You can always update this later.
          </Text>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  ageOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  ageOptionSelected: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
  },
  ageOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  ageOptionTextSelected: {
    color: '#EC4899',
    fontWeight: '600',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  expandText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginRight: 6,
  },
  expandIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  personalizationSection: {
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  childLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  genderButtonWide: {
    paddingHorizontal: 8,
  },
  genderButtonSelected: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
  },
  genderText: {
    fontSize: 13,
    color: '#4B5563',
  },
  genderTextSelected: {
    color: '#EC4899',
    fontWeight: '600',
  },
  microcopy: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 'auto',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectorContainer: {
    alignItems: 'center',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 100,
    padding: 8,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignSelf: 'center',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMinus: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonPlus: {
    backgroundColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonTextMinus: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '500',
    lineHeight: 28,
  },
  buttonTextPlus: {
    fontSize: 24,
    color: 'white',
    fontWeight: '500',
    lineHeight: 28,
  },
  display: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  expectingContainer: {
    marginTop: 16,
    paddingVertical: 8,
  },
  expectingText: {
    fontSize: 16,
    color: '#EC4899',
    textAlign: 'center',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
