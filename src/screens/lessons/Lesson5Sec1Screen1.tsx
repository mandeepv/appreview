import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec1Screen1'>;

export const Lesson5Sec1Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec1Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>SECTION 1 OF 4</Text>
        <Text style={styles.headline}>Why Naming Emotions Matters</Text>

        <Text style={styles.body}>
          Researchers have shown that labeling emotions is a vital skill towards helping your child avoid cortisol and increase oxytocin.
        </Text>

        <Text style={styles.bodyEmphasized}>Why?</Text>

        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Cortisol and oxytocin are caused by your child's emotions.</Text>
          <Text style={styles.bullet}>• If you don't really understand your child's underlying emotions, it is hard to effectively help him/her.</Text>
        </View>

        <Text style={styles.body}>
          In this lesson you are going to learn how to determine your own underlying emotions so you can eventually help your child with his/hers.
        </Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Next →"
          onPress={handleNext}
          variant="gradient"
        />
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  label: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 24,
    lineHeight: 36,
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: 20,
  },
  bodyEmphasized: {
    fontSize: 19,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  bulletList: {
    gap: 12,
    marginBottom: 20,
  },
  bullet: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
