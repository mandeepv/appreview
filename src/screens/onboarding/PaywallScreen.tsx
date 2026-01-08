import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Paywall'>;

export const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setSelectedPlan } = useOnboardingStore();
  const [selectedPlan, setLocalSelectedPlan] = useState<'free-trial' | 'monthly'>('free-trial');

  const handleSubscribe = () => {
    setSelectedPlan(selectedPlan);
    // Navigate to Premium Unlocked screen after successful payment
    navigation.navigate('PremiumUnlocked');
  };

  const handleRestore = () => {
    Alert.alert('Restore', 'Restore purchases (placeholder)');
  };

  return (
    <OnboardingContainer
      showBackButton={false}
      scrollable={false}
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>

          <Text style={styles.restoreText}>Restore</Text>
          <Text style={styles.title}>Choose Your Plan</Text>

          <View style={styles.illustration}>
            <Text style={styles.illustrationEmoji}>👩‍👧</Text>
          </View>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text key={star} style={styles.star}>⭐</Text>
            ))}
          </View>

          <Text style={styles.review}>
            "A Ladies best friend. Awesome and quite accurate! 🔥🔥🔥"
          </Text>
          <Text style={styles.reviewer}>— S3.Humeray</Text>
        </View>

        <TouchableOpacity
          onPress={() => setLocalSelectedPlan('free-trial')}
          style={[
            styles.planCard,
            selectedPlan === 'free-trial' ? styles.planCardSelected : styles.planCardUnselected,
          ]}
        >
          <View style={styles.planContent}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>7-Day Free Trial</Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>SAVE 59%</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>Then $49.99/year (only $4.3/month)</Text>
          </View>
          <View style={[
            styles.radio,
            selectedPlan === 'free-trial' ? styles.radioSelected : styles.radioUnselected,
          ]}>
            {selectedPlan === 'free-trial' && <Text style={styles.radioCheck}>✓</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setLocalSelectedPlan('monthly')}
          style={[
            styles.planCard,
            selectedPlan === 'monthly' ? styles.planCardSelected : styles.planCardUnselected,
          ]}
        >
          <View style={styles.planContent}>
            <Text style={styles.planTitle}>1 month</Text>
            <Text style={styles.planPrice}>$9.99</Text>
          </View>
          <View style={[
            styles.radio,
            selectedPlan === 'monthly' ? styles.radioSelected : styles.radioUnselected,
          ]}>
            {selectedPlan === 'monthly' && <Text style={styles.radioCheck}>✓</Text>}
          </View>
        </TouchableOpacity>
        </ScrollView>

        {/* Fixed Button at Bottom */}
        <View style={[styles.fixedButtonContainer, { paddingBottom: insets.bottom || 20 }]}>
          <Button title="Try Free and Subscribe" onPress={handleSubscribe} />

          <Text style={styles.noPayment}>No payment now</Text>

          <Text style={styles.terms}>
            Subscribe and cancel anytime. Auto-renews at the end of the current period.
          </Text>

          <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 280, // Add padding to prevent content from being hidden behind button
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#6B7280',
  },
  restoreText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  illustration: {
    width: 160,
    height: 160,
    backgroundColor: '#FDF2F8',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 20,
  },
  review: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  reviewer: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 32,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  planCardSelected: {
    backgroundColor: '#FDF2F8',
    borderColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  planCardUnselected: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
  },
  planContent: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  saveBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 14,
    color: '#4B5563',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: '#EC4899',
  },
  radioUnselected: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioCheck: {
    color: 'white',
    fontSize: 12,
  },
  noPayment: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  restoreButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  restoreButtonText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#EC4899',
  },
});
