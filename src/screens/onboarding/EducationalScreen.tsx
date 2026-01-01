import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Educational'>;

export const EducationalScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    navigation.navigate('ParentingReality');
  };

  return (
    <OnboardingContainer
      currentStep={8}
      onBack={() => navigation.goBack()}
      scrollable={false}
    >
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <Text style={styles.illustrationEmoji}>🎓</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>The Mamalearn Approach</Text>

            <Text style={styles.cardText}>
              Mamalearn takes the best of all parenting styles and with{' '}
              <Text style={styles.bold}>80+ experts</Text> onboard, our daily lessons have been
              developed to help you be the best version of your parent self.
            </Text>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerIcon}>✨</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.features}>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>📖</Text>
                <Text style={styles.featureText}>
                  Evidence-based lessons from 80+ parenting experts
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>⏱️</Text>
                <Text style={styles.featureText}>
                  Just 5-20 minutes a day to become a better parent
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureText}>
                  Personalized to your family's unique needs
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <Button title="Continue" onPress={handleContinue} />
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
  scrollView: {
    flex: 1,
  },
  illustrationContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: 192,
    height: 192,
    backgroundColor: '#FCE7F3',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationEmoji: {
    fontSize: 72,
  },
  card: {
    backgroundColor: '#FDF2F8',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  dividerLine: {
    flex: 1,
    height: 4,
    backgroundColor: '#FBCFE8',
    borderRadius: 50,
  },
  dividerIcon: {
    color: '#EC4899',
    marginHorizontal: 12,
    fontWeight: '600',
  },
  features: {
    marginTop: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
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
