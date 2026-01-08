import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec1Screen2'>;

export const DissociationSec1Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec1Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            What is dissociation?
          </Text>

          <View style={styles.definitionCard}>
            <Text style={styles.definitionText}>
              Dissociation (also called avoidance) is what happens when
              something feels too overwhelming for your brain to process.
            </Text>
          </View>

          <View style={styles.supportingSection}>
            <Text style={styles.supportingText}>
              Instead of thinking through it,{'\n'}
              your brain briefly checks out.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>💭</Text>
                <Text style={styles.bulletText}>You suddenly go blank</Text>
              </View>

              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>🛑</Text>
                <Text style={styles.bulletText}>You stop thinking about the issue</Text>
              </View>

              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>↪️</Text>
                <Text style={styles.bulletText}>You mentally turn to something else</Text>
              </View>
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
    gap: 28,
    alignItems: 'center',
  },
  headline: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  definitionCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 28,
    width: '100%',
  },
  definitionText: {
    fontSize: 19,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 30,
    textAlign: 'center',
  },
  supportingSection: {
    gap: 24,
    width: '100%',
  },
  supportingText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  bulletList: {
    gap: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
  },
  bulletIcon: {
    fontSize: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
