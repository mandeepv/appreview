import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Text, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { QuestionScreen, ContinueButton } from '../../components/onboarding';
import { Heading2, BodyText } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Animation, Typography } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Educational'>;

// SPEC-17: info/educational page (DECISION 4 — kept as a full-width Continue
// page in the same shell; whether it becomes swipeable cards or merges away is a
// separate content call). Adopts the shell + footer grammar; explicit Continue.
export const EducationalScreen: React.FC<Props> = ({ navigation }) => {
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
      text: 'Content informed by leading child development research',
    },
    {
      image: require('../../../assets/onboarding/quick_effective_illo.jpg'),
      title: 'Quick & effective',
      text: 'Just 5-10 minutes a day to see real progress',
    },
    {
      image: require('../../../assets/onboarding/personalized_illo.jpg'),
      title: 'Personalized for you',
      text: "Tailored to your child's age and your parenting goals",
    },
  ];

  return (
    <QuestionScreen
      screenName="Educational"
      onBack={() => navigation.goBack()}
      footer={<ContinueButton onPress={handleContinue} />}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationPlaceholder}>
            <Image
              source={require('../../../assets/onboarding/kinderwell_approach_illo.jpg')}
              style={styles.mainIllustration}
              resizeMode="cover"
            />
          </View>
        </View>

        <Heading2 center style={styles.mainTitle}>
          The Kinderwell Approach
        </Heading2>

        <BodyText center style={styles.subtitle}>
          Science-backed parenting wisdom, made simple and actionable for your everyday life.
        </BodyText>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Image source={feature.image} style={styles.featureImage} resizeMode="cover" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </QuestionScreen>
  );
};

const styles = StyleSheet.create({
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
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
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
});
