import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NameAge'>;

export const NameAgeScreen: React.FC<Props> = ({ navigation }) => {
  const { name: storedName, age: storedAge, updateNameAndAge } = useOnboardingStore();
  const [name, setName] = useState(storedName);
  const [age, setAge] = useState<number>(storedAge || 30);
  const [nameFocused, setNameFocused] = useState(false);

  const handleContinue = () => {
    if (name.trim() && age > 0) {
      updateNameAndAge(name.trim(), age);
      navigation.navigate('ChildrenCount');
    }
  };

  const incrementAge = () => setAge(prev => Math.min(100, prev + 1));
  const decrementAge = () => setAge(prev => Math.max(18, prev - 1));

  const isValid = name.trim().length > 0 && age > 0;

  return (
    <OnboardingContainer
      title="Let’s personalize this for you"
      currentStep={2}
      onBack={() => navigation.goBack()}
      scrollable={false}
      centerTitle={true}
    >
      <View style={styles.container}>
        <View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={[styles.input, nameFocused && styles.inputFocused]}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              autoFocus
              returnKeyType="done"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Age</Text>
            <View style={styles.ageSelectorContainer}>
              <View style={styles.ageSelector}>
                <TouchableOpacity
                  style={[styles.ageButton, styles.ageButtonMinus]}
                  onPress={decrementAge}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ageButtonTextMinus}>-</Text>
                </TouchableOpacity>
                <View style={styles.ageDisplay}>
                  <Text style={styles.ageText}>{age}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.ageButton, styles.ageButtonPlus]}
                  onPress={incrementAge}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ageButtonTextPlus}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.microcopy}>
            We’ll use this to tailor examples and tone — nothing else.
          </Text>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!isValid}
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#111827',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#EC4899',
    backgroundColor: 'white',
    shadowColor: '#EC4899',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ageSelectorContainer: {
    alignItems: 'center',
  },
  ageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 100,
    padding: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageButtonMinus: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ageButtonPlus: {
    backgroundColor: '#EC4899', // Pink color
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ageButtonTextMinus: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '500',
    lineHeight: 28,
  },
  ageButtonTextPlus: {
    fontSize: 24,
    color: 'white',
    fontWeight: '500',
    lineHeight: 28,
  },
  ageDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  microcopy: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
});
