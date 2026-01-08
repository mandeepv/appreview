import React, { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { EducationIllustration } from '../../components/illustrations';
import { Heading3, BodyText } from '../../components/Typography';
import { IconCircle } from '../../components/IconCircle';
import { Colors, Spacing, BorderRadius, Animation } from '../../constants/theme';

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
    navigation.navigate('ParentingReality');
  };

  const features = [
    { icon: '📖', text: 'Evidence-based lessons from 80+ parenting experts' },
    { icon: '⏱️', text: 'As little as 5 minutes a day to become a better parent' },
    { icon: '🎯', text: 'Personalized to your family\'s unique needs' },
  ];

  return (
    <OnboardingContainer
      currentStep={8}
      onBack={() => navigation.goBack()}
      scrollable={false}
    >
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.illustrationContainer}>
              <EducationIllustration width={192} height={192} />
            </View>

            <View style={styles.card}>
              <Heading3 center style={styles.cardTitle}>
                The Kinderwell Approach
              </Heading3>

              <BodyText style={styles.cardText}>
                Kinderwell takes the best of all parenting styles and with{' '}
                <BodyText style={styles.bold}>80+ experts</BodyText> onboard, our daily lessons have been
                developed to help you be the best version of your parent self.
              </BodyText>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <IconCircle icon="✨" size="sm" backgroundColor={Colors.primary} iconColor={Colors.surface} style={styles.dividerIcon} />
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.features}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <IconCircle
                      icon={feature.icon}
                      size="sm"
                      backgroundColor={Colors.surface}
                      iconSize={20}
                    />
                    <BodyText style={styles.featureText}>{feature.text}</BodyText>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Fixed Button at Bottom */}
        <View style={[styles.fixedButtonContainer, { paddingBottom: insets.bottom || 20 }]}>
          <Button title="Continue" onPress={handleContinue} variant="gradient" />
        </View>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Spacing['2xl'],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to prevent content from being hidden behind button
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 16,
  },
  content: {
    flex: 1,
  },
  illustrationContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  card: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  cardTitle: {
    marginBottom: Spacing.lg,
  },
  cardText: {
    marginBottom: Spacing.lg,
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.primaryAccent,
    borderRadius: BorderRadius.full,
  },
  dividerIcon: {
    marginHorizontal: Spacing.md,
  },
  features: {
    marginTop: Spacing['2xl'],
    gap: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
});
