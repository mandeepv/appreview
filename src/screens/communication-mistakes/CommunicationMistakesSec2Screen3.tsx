import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec2Screen3'>;

export const CommunicationMistakesSec2Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec2Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            What Dad Says
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
              She didn't sit by you at lunch today?
            </Text>
          </View>

          <View style={styles.daughterBubble}>
            <Text style={styles.daughterLabel}>Daughter</Text>
            <Text style={styles.daughterText}>
              No.
            </Text>
          </View>

          <View style={styles.dadBubble}>
            <Text style={styles.dadLabel}>Dad</Text>
            <Text style={styles.dadText}>
              And she didn't invite you to sleep over?
            </Text>
          </View>

          <View style={styles.daughterBubble}>
            <Text style={styles.daughterLabel}>Daughter</Text>
            <Text style={styles.daughterText}>
              Yeah.
            </Text>
          </View>

          <View style={styles.dadBubble}>
            <Text style={styles.dadLabel}>Dad</Text>
            <Text style={styles.dadText}>
              I didn't want to bring this up…{'\n'}
              but when I saw you together last week,{'\n'}
              you seemed kind of rude.{'\n'}
              You were on your phone the whole time.
            </Text>
            <Text style={[styles.dadText, styles.emphasis]}>
              {'\n'}Maybe that's why she doesn't want to hang out.
            </Text>
          </View>

          <View style={styles.daughterBubble}>
            <Text style={styles.daughterLabel}>Daughter</Text>
            <Text style={styles.daughterText}>
              I was on my phone looking up homework definitions.{'\n'}
              That's why she came over.{'\n'}
              We weren't supposed to just talk.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Reflect"
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
  emphasis: {
    fontWeight: Typography.weights.semibold,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
