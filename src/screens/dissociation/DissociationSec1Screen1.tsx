import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec1Screen1'>;

export const DissociationSec1Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec1Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Text style={styles.emoji}>🌾</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.headline}>
            Your brain has a hidden escape button
          </Text>

          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>
              Your brain has a fascinating trick to get you out of uncomfortable situations.
            </Text>

            <Text style={styles.bodyText}>
              It usually happens at least once a week — and most of the time,{'\n'}
              you don't even realize it happened.
            </Text>

            <View style={styles.microcopyContainer}>
              <Text style={styles.microcopy}>
                Sometimes this protects us.{'\n'}
                Other times, it quietly hurts our relationships.
              </Text>
            </View>
          </View>
        </View>

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
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F3ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 80,
  },
  content: {
    flex: 1,
    gap: 24,
    paddingHorizontal: 4,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  bodyCard: {
    gap: 20,
  },
  bodyText: {
    fontSize: 18,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  microcopyContainer: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginTop: 8,
  },
  microcopy: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
