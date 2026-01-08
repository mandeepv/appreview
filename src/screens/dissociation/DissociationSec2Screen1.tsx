import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec2Screen1'>;

export const DissociationSec2Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec2Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            How do we not dissociate?
          </Text>

          <View style={styles.contentCard}>
            <Text style={styles.bodyText}>
              Dissociating — or avoiding — feels helpful in the moment,{'\n'}
              but it usually makes things worse.
            </Text>

            <Text style={styles.bodyText}>
              Avoidance makes us feel helpless,{'\n'}
              even though situations are almost never as hopeless as they seem.
            </Text>

            <Text style={styles.bodyText}>
              When something feels overwhelming, the healthier response is not to push it away —{'\n'}
              but to say:
            </Text>

            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>
                "This is a hard problem.{'\n'}
                I can't think about it right now,{'\n'}
                but I can come back to it once I've calmed down."
              </Text>
            </View>

            <Text style={styles.bodyText}>
              When our logical brain regains control,{'\n'}
              we are usually able to face the problem{'\n'}
              and find solutions.
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  contentCard: {
    gap: 20,
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  quoteBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginVertical: 8,
  },
  quoteText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
