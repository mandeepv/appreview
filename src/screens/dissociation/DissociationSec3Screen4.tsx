import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec3Screen4'>;

export const DissociationSec3Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec3Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            3. Stimulate your senses
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.description}>
              Strong sensory input can interrupt dissociation quickly.
            </Text>

            <View style={styles.examplesCard}>
              <View style={styles.exampleItem}>
                <Text style={styles.exampleIcon}>🍬</Text>
                <Text style={styles.exampleText}>Chew gum</Text>
              </View>
              <View style={styles.exampleItem}>
                <Text style={styles.exampleIcon}>🌿</Text>
                <Text style={styles.exampleText}>Smell something strong (mint, citrus)</Text>
              </View>
              <View style={styles.exampleItem}>
                <Text style={styles.exampleIcon}>🔑</Text>
                <Text style={styles.exampleText}>Hold something textured (stone, key, fabric)</Text>
              </View>
            </View>

            <View style={styles.reminderBox}>
              <Text style={styles.reminderText}>
                You're not distracting yourself — you're grounding yourself.
              </Text>
            </View>
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
  contentSection: {
    gap: 20,
  },
  description: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  examplesCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 20,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exampleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  exampleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  reminderBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginTop: 4,
  },
  reminderText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
