import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec5Screen6'>;

export const EmotionalSandbagsSec5Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec5Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <Text style={styles.header}>
          Review this list of common emotions
        </Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Don't Use Section */}
          <View style={styles.categorySection}>
            <View style={[styles.categoryHeader, { backgroundColor: '#FFE5E5' }]}>
              <Text style={[styles.categoryTitle, { color: '#D32F2F' }]}>
                ❌ DON'T USE (Too Broad)
              </Text>
            </View>
            <View style={styles.emotionsContainer}>
              <Text style={styles.emotionText}>Happy · Mad · Sad · Bad</Text>
            </View>
          </View>

          {/* Upset Emotions */}
          <View style={styles.categorySection}>
            <View style={[styles.categoryHeader, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.categoryTitle, { color: '#1976D2' }]}>
                🔵 UPSET EMOTIONS
              </Text>
            </View>
            <View style={styles.emotionsContainer}>
              <Text style={styles.emotionText}>
                Pressured · Scared · Defensive · Worried · Worthless · Stupid · Disrespected · Excluded · Threatened · Nervous · Misunderstood · Depressed · Lonely · Abandoned · Unimportant · Hopeless · Guilty · Ashamed · Disappointed · Embarrassed · Ugly · Small
              </Text>
            </View>
          </View>

          {/* Angry Emotions */}
          <View style={styles.categorySection}>
            <View style={[styles.categoryHeader, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.categoryTitle, { color: '#C62828' }]}>
                🔴 ANGRY EMOTIONS
              </Text>
            </View>
            <View style={styles.emotionsContainer}>
              <Text style={styles.emotionText}>
                Angry · Let down · Humiliated · Betrayed · Jealous · Frustrated · Annoyed · Disgust · Contempt
              </Text>
            </View>
          </View>

          {/* Stressed / Low-Energy */}
          <View style={styles.categorySection}>
            <View style={[styles.categoryHeader, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.categoryTitle, { color: '#388E3C' }]}>
                🟢 STRESSED / LOW-ENERGY
              </Text>
            </View>
            <View style={styles.emotionsContainer}>
              <Text style={styles.emotionText}>
                Bored · Stressed · Tired · Overwhelmed
              </Text>
            </View>
          </View>

          {/* Confusion / Social Pain */}
          <View style={styles.categorySection}>
            <View style={[styles.categoryHeader, { backgroundColor: '#F3E5F5' }]}>
              <Text style={[styles.categoryTitle, { color: '#7B1FA2' }]}>
                🟣 CONFUSION / SOCIAL PAIN
              </Text>
            </View>
            <View style={styles.emotionsContainer}>
              <Text style={styles.emotionText}>
                Surprised · Confused · Bullied · Down · Unloved
              </Text>
            </View>
          </View>

          {/* Happy Emotions */}
          <View style={styles.categorySection}>
            <View style={[styles.categoryHeader, { backgroundColor: '#FFF9C4' }]}>
              <Text style={[styles.categoryTitle, { color: '#F57F17' }]}>
                🟡 HAPPY EMOTIONS (for contrast later)
              </Text>
            </View>
            <View style={styles.emotionsContainer}>
              <Text style={styles.emotionText}>
                Curious · Confident · Loving · Inspired · Relieved · Appreciated · Content · Peaceful · Proud · Thankful
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
    paddingBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 16,
  },
  categorySection: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  categoryHeader: {
    padding: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  emotionsContainer: {
    padding: 16,
  },
  emotionText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
