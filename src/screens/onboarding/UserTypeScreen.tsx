import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { UserType } from '../../types/onboarding';
import { Colors } from '../../constants/theme';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'UserType'>;

const { width } = Dimensions.get('window');
const cardSize = (width - 48) * 0.48;

const Illustrations = {
  mother: require('../../../assets/onboarding/mother_illustration.png'),
  father: require('../../../assets/onboarding/father_illustration.png'),
  guardian: require('../../../assets/onboarding/guardian_illustration.png'),
};

export const UserTypeScreen: React.FC<Props> = ({ navigation }) => {
  const { userType, updateUserType } = useOnboardingStore();

  const handleContinue = () => {
    if (userType) {
      trackOnboardingStepCompleted('UserType', userType);
      navigation.navigate('NameAge');
    }
  };

  return (
    <OnboardingContainer
      title="Welcome to Kinderwell"
      subtitle="Who are you parenting as?"
      currentStep={1}
      showBackButton={false}
      scrollable={true}
      centerTitle={true}
      screenName="UserType"
    >
      <View style={styles.container}>
        <View>
          <Text style={styles.microcopy}>
            The next few questions help us personalize lessons for your family.{'\n'}
            All responses are stored securely and used only to customize your experience.
          </Text>

          {/* Mother and Father cards side by side */}
          <View style={styles.squareCardsRow}>
            <TouchableOpacity
              style={[
                styles.squareCard,
                userType === 'mother' && styles.squareCardSelected,
              ]}
              onPress={() => updateUserType('mother')}
              activeOpacity={0.7}
            >
              {userType === 'mother' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
              <View style={styles.iconCircle}>
                <Image source={Illustrations.mother} style={styles.illustrationSquare} resizeMode="contain" />
              </View>
              <Text style={styles.squareCardLabel}>Mother</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.squareCard,
                userType === 'father' && styles.squareCardSelected,
              ]}
              onPress={() => updateUserType('father')}
              activeOpacity={0.7}
            >
              {userType === 'father' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
              <View style={styles.iconCircle}>
                <Image source={Illustrations.father} style={styles.illustrationSquare} resizeMode="contain" />
              </View>
              <Text style={styles.squareCardLabel}>Father</Text>
            </TouchableOpacity>
          </View>

          {/* Other/Guardian card */}
          <TouchableOpacity
            style={[
              styles.horizontalCard,
              userType === 'other' && styles.horizontalCardSelected,
            ]}
            onPress={() => updateUserType('other')}
            activeOpacity={0.7}
          >
            {userType === 'other' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
            <View style={styles.iconCircleSmall}>
              <Image source={Illustrations.guardian} style={styles.illustrationHorizontal} resizeMode="contain" />
            </View>
            <View style={styles.horizontalCardText}>
              <Text style={styles.horizontalCardTitle}>Other / Guardian</Text>
              <Text style={styles.horizontalCardSubtitle}>
                Grandparent, caregiver, or guardian
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View>
          <Button
            title="Continue →"
            onPress={handleContinue}
            disabled={!userType}
          />
        </View>
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
  squareCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  squareCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  squareCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 48,
  },
  illustrationSquare: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  squareCardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  horizontalCard: {
    height: cardSize,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.border,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  horizontalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircleSmall: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconEmojiSmall: {
    fontSize: 28,
  },
  illustrationHorizontal: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  horizontalCardText: {
    flex: 1,
  },
  horizontalCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  horizontalCardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmarkText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  microcopy: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
});
