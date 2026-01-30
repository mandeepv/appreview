import React, { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { Heading3, Heading2, BodyText } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Animation, Typography } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Educational'>;

export const EducationalScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animation.duration.slow,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate('PartnerInvolvement');
  };

  const features = [
    {
      image: require('../../../assets/onboarding/expert_backed_illo.jpg'),
      title: 'Expert-backed lessons',
      text: 'Learn from 50+ child psychologists and parenting specialists'
    },
    {
      image: require('../../../assets/onboarding/quick_effective_illo.jpg'),
      title: 'Quick & effective',
      text: 'Just 5-10 minutes a day to see real progress'
    },
    {
      image: require('../../../assets/onboarding/personalized_illo.jpg'),
      title: 'Personalized for you',
      text: 'Tailored to your child\'s age and your parenting goals'
    },
  ];

  return (
    <OnboardingContainer
      screenName="Educational"
      currentStep={8}
      onBack={() => navigation.goBack()}
      scrollable={false}
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Illustration Space */}
            <View style={styles.illustrationContainer}>
              <View style={styles.illustrationPlaceholder}>
                <Image
                  source={require('../../../assets/onboarding/kinderwell_approach_illo.jpg')}
                  style={styles.mainIllustration}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Main Heading */}
            <Heading2 center style={styles.mainTitle}>
              The Kinderwell Approach
            </Heading2>

            <BodyText center style={styles.subtitle}>
              Science-backed parenting wisdom, made simple and actionable for your everyday life.
            </BodyText>

            {/* Feature Cards */}
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Image
                      source={feature.image}
                      style={styles.featureImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Fixed Button at Bottom */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom || 20 }]}>
          <Button title="Continue" onPress={handleContinue} />
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
    paddingTop: Spacing.sm,
    paddingBottom: 10,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    // backgroundColor: Colors.primaryBg, // Removed bg color as image has it
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mainIllustration: {
    width: '100%',
    height: '100%',
  },
  mainTitle: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center', // Changed from flex-start to center vertically
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // backgroundColor: Colors.primaryBg, // Removed bg color
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  featureImage: {
    width: '100%',
    height: '100%',
  },
  featureContent: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureText: {
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.md,
  },
});
