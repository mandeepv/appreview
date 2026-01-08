import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec1Screen1'>;

export const CommunicationMistakesSec1Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec1Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.header}>
            The Sleepover
          </Text>

          <View style={styles.textContainer}>
            <Text style={styles.paragraph}>
              In this lesson, you'll see a real-life moment where a well-meaning parent accidentally hurts the bond with their child.
            </Text>

            <Text style={styles.paragraph}>
              Although this is a parent–child example, the same communication mistakes happen in romantic relationships, friendships, and even at work.
            </Text>

            <Text style={styles.paragraph}>
              Pay close attention to what goes wrong — not what Dad intends, but how it lands.
            </Text>
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
    gap: 32,
  },
  header: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
  },
  textContainer: {
    gap: 24,
    paddingHorizontal: 8,
  },
  paragraph: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
