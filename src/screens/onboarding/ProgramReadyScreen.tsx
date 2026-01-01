import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ProgramReady'>;

export const ProgramReadyScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    navigation.navigate('LessonPreview');
  };

  return (
    <OnboardingContainer
      currentStep={16}
      showBackButton={false}
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎯</Text>
          </View>

          <Text style={styles.title}>Your program is ready!</Text>

          <Text style={styles.description}>
            We've crafted a personalized plan just for you based on your family's unique needs
          </Text>

          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>
                Tailored to your children's ages
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>
                Focused on your improvement goals
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>
                Matched to your experience level
              </Text>
            </View>
          </View>
        </View>

        <Button title="See My Program" onPress={handleContinue} />
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    backgroundColor: '#EC4899',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    fontSize: 72,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  features: {
    marginTop: 32,
    backgroundColor: '#FDF2F8',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    color: '#374151',
  },
});
