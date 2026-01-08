import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec2Screen8'>;

export const CommunicationMistakesSec2Screen8: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec2Screen9');
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💬</Text>
          </View>

          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "The proper office of a friend is to side with you when you are wrong.{'\n\n'}
              Nearly anybody will side with you when you are right."
            </Text>
            <Text style={styles.attribution}>
              — Mark Twain
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
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
    gap: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 56,
  },
  quoteCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 32,
    gap: 24,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  quoteText: {
    fontSize: 19,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 30,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  attribution: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
