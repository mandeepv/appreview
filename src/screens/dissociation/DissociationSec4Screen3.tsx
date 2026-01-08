import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/dissociationProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec4Screen3'>;

export const DissociationSec4Screen3: React.FC<Props> = ({ navigation }) => {
  const handleComplete = async () => {
    await markSectionComplete('4');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={3}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            That's enough for today
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Awareness alone creates change.
            </Text>

            <Text style={styles.bodyText}>
              Every time you notice dissociation,{'\n'}
              you give yourself more choice —{'\n'}
              and more compassion.
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
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 48,
  },
  contentSection: {
    gap: 40,
  },
  bodyText: {
    fontSize: 18,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
