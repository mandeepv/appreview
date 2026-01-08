import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/dissociationProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec3Screen9'>;

export const DissociationSec3Screen9: React.FC<Props> = ({ navigation }) => {
  const handleComplete = async () => {
    await markSectionComplete('3');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={9}
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
            Key takeaway
          </Text>

          <View style={styles.contentSection}>
            <View style={styles.highlightBox}>
              <Text style={styles.highlightText}>
                Dissociation isn't a failure.{'\n'}
                It's a signal.
              </Text>
            </View>

            <Text style={styles.bodyText}>
              When you notice it and name it, you create space for better choices — for yourself and for the people you care about.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Complete"
            onPress={handleComplete}
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
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  contentSection: {
    gap: 28,
  },
  highlightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 28,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  highlightText: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 32,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
