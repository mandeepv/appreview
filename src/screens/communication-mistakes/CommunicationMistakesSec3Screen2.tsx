import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec3Screen2'>;

export const CommunicationMistakesSec3Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec3Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Here's what Dad says:
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.conversationContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dadBubble}>
            <Text style={styles.dadLabel}>Dad</Text>
            <Text style={styles.dadText}>
              "Maybe you need to see why she didn't invite you."
            </Text>
          </View>

          <View style={styles.dadBubble}>
            <Text style={styles.dadLabel}>Dad</Text>
            <Text style={styles.dadText}>
              "What's going on with her? Maybe there's something on her side."
            </Text>
          </View>

          <View style={styles.daughterBubble}>
            <Text style={styles.daughterLabel}>Daughter</Text>
            <Text style={styles.daughterText}>
              "So you want me to go ask her why she didn't invite me?"
            </Text>
          </View>

          <View style={styles.dadBubble}>
            <Text style={styles.dadLabel}>Dad</Text>
            <Text style={styles.dadText}>
              "Well… that might not be a bad idea."
            </Text>
          </View>

          <View style={styles.daughterBubble}>
            <Text style={styles.daughterLabel}>Daughter</Text>
            <Text style={styles.daughterText}>
              "That's a terrible idea."
            </Text>
          </View>
        </ScrollView>

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
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  conversationContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  dadBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.lg,
    padding: 16,
    maxWidth: '80%',
  },
  dadLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dadText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  daughterBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 16,
    maxWidth: '80%',
  },
  daughterLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  daughterText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
