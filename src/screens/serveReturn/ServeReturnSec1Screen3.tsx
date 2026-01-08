import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec1Screen3'>;

export const ServeReturnSec1Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('ServeReturnSec1Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            Think of a Tennis Match
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Imagine a tennis match instead of a conversation.
            </Text>

            <View style={styles.metaphorCard}>
              <View style={styles.metaphorItem}>
                <Text style={styles.metaphorIcon}>🎾</Text>
                <View style={styles.metaphorContent}>
                  <Text style={styles.metaphorTitle}>A serve is an emotional cue</Text>
                </View>
              </View>

              <View style={styles.metaphorItem}>
                <Text style={styles.metaphorIcon}>🏓</Text>
                <View style={styles.metaphorContent}>
                  <Text style={styles.metaphorTitle}>A return is an attentive response</Text>
                </View>
              </View>

              <View style={styles.metaphorItem}>
                <Text style={styles.metaphorIcon}>🔄</Text>
                <View style={styles.metaphorContent}>
                  <Text style={styles.metaphorTitle}>The rally continues</Text>
                </View>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                When returns happen consistently, connection grows.
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
    marginBottom: 32,
    lineHeight: 34,
  },
  contentSection: {
    gap: 24,
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  metaphorCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 20,
  },
  metaphorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaphorIcon: {
    fontSize: 32,
  },
  metaphorContent: {
    flex: 1,
  },
  metaphorTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  insightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  insightText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
