import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec3Screen7'>;

export const DissociationSec3Screen7: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec3Screen8');
  };

  return (
    <LessonContainer
      currentStep={7}
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
            You're not alone
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Dissociation is extremely common — and rarely talked about.
            </Text>

            <Text style={styles.bodyText}>
              Many people experience it regularly without knowing what it is.{'\n'}
              Noticing it is already a huge step forward.
            </Text>

            <Text style={styles.bodyText}>
              If it happens again, don't panic.{'\n'}
              Just gently bring yourself back.
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
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
  },
  contentSection: {
    gap: 32,
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
