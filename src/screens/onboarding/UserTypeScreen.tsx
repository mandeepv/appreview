import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { UserType } from '../../types/onboarding';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'UserType'>;

const { width } = Dimensions.get('window');
const cardSize = (width - 48) * 0.48;

export const UserTypeScreen: React.FC<Props> = ({ navigation }) => {
  const { userType, updateUserType } = useOnboardingStore();

  const handleContinue = () => {
    if (userType) {
      navigation.navigate('NameAge');
    }
  };

  return (
    <OnboardingContainer
      title="Welcome to Kinderwell"
      subtitle="Who are you parenting as?"
      currentStep={1}
      showBackButton={false}
      scrollable={false}
      centerTitle={true}
    >
      <View style={styles.container}>
        <View>
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
                <Text style={styles.iconEmoji}>👩‍👧</Text>
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
                <Text style={styles.iconEmoji}>👨‍👧</Text>
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
              <Text style={styles.iconEmojiSmall}>👤</Text>
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
          <Text style={styles.microcopy}>You can change this later</Text>
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
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
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
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
    shadowColor: '#EC4899',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 48,
  },
  squareCardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  horizontalCard: {
    height: cardSize,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
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
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
    shadowColor: '#EC4899',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircleSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconEmojiSmall: {
    fontSize: 28,
  },
  horizontalCardText: {
    flex: 1,
  },
  horizontalCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  horizontalCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  microcopy: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 12,
  },
});
