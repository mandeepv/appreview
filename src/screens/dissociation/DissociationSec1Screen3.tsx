import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec1Screen3'>;

export const DissociationSec1Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec1Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            What does dissociation feel like?
          </Text>

          <View style={styles.bodySection}>
            <Text style={styles.bodyText}>
              Dissociation happens instantly.
            </Text>

            <View style={styles.checklistCard}>
              <View style={styles.checklistItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.checklistText}>
                  "My mind just went blank"
                </Text>
              </View>

              <View style={styles.checklistItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.checklistText}>
                  "I don't know what to say"
                </Text>
              </View>

              <View style={styles.checklistItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.checklistText}>
                  "I don't see a solution"
                </Text>
              </View>

              <View style={styles.checklistItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.checklistText}>
                  "I just want to think about something else"
                </Text>
              </View>
            </View>

            <View style={styles.reassuranceBox}>
              <Text style={styles.reassuranceText}>
                This usually happens without conscious choice.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Next"
            onPress={handleNext}
            variant="gradient"
          />
        </View>
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  content: {
    gap: 24,
    alignItems: 'center',
  },
  headline: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  bodySection: {
    gap: 24,
    width: '100%',
  },
  bodyText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  checklistCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    lineHeight: 26,
  },
  checklistText: {
    flex: 1,
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  reassuranceBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  reassuranceText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
