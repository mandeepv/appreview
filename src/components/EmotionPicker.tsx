import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Colors, Typography, BorderRadius, Shadows } from '../constants/theme';

interface EmotionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emotion: string) => void;
  excludeBroad?: boolean;
}

const EMOTIONS = {
  upset: {
    title: 'UPSET EMOTIONS',
    color: '#3B82F6', // Blue
    backgroundColor: '#EFF6FF',
    emotions: [
      'Pressured', 'Scared', 'Defensive', 'Worried', 'Worthless', 'Stupid',
      'Disrespected', 'Excluded', 'Threatened', 'Nervous', 'Misunderstood',
      'Depressed', 'Lonely', 'Abandoned', 'Unimportant', 'Hopeless',
      'Guilty', 'Ashamed', 'Disappointed', 'Embarrassed', 'Ugly', 'Small'
    ]
  },
  angry: {
    title: 'ANGRY EMOTIONS',
    color: '#EF4444', // Red
    backgroundColor: '#FEF2F2',
    emotions: [
      'Angry', 'Let down', 'Humiliated', 'Betrayed', 'Jealous',
      'Frustrated', 'Annoyed', 'Disgust', 'Contempt'
    ]
  },
  stressed: {
    title: 'STRESSED / LOW-ENERGY EMOTIONS',
    color: '#10B981', // Green
    backgroundColor: '#F0FDF4',
    emotions: ['Bored', 'Stressed', 'Tired', 'Overwhelmed']
  },
  confusion: {
    title: 'CONFUSION / SOCIAL PAIN',
    color: '#8B5CF6', // Purple
    backgroundColor: '#F5F3FF',
    emotions: ['Surprised', 'Confused', 'Bullied', 'Down', 'Unloved']
  },
  happy: {
    title: 'HAPPY EMOTIONS',
    color: '#F59E0B', // Amber/Yellow
    backgroundColor: '#FFFBEB',
    emotions: [
      'Curious', 'Confident', 'Courageous', 'Loving', 'Inspired', 'Brave',
      'Joy', 'Powerful', 'Excited', 'Creative', 'Amazed', 'Accepting',
      'Daring', 'Satisfied', 'Amused', 'Anticipating', 'Respectful', 'Proud',
      'Respected', 'Peaceful', 'Optimistic', 'Playful', 'Thankful', 'Smart',
      'Wanted', 'Romantic', 'Thoughtful', 'Generous', 'Relieved',
      'Appreciated', 'Honored', 'Helpful', 'Moved', 'Content'
    ]
  }
};

const BROAD_EMOTIONS = ['Happy', 'Sad', 'Mad', 'Bad'];

export const EmotionPicker: React.FC<EmotionPickerProps> = ({
  visible,
  onClose,
  onSelect,
  excludeBroad = true
}) => {
  const handleSelect = (emotion: string) => {
    onSelect(emotion);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>Choose an Emotion</Text>
            <Text style={styles.subtitle}>
              Choose the emotion that fits best, not perfectly.
            </Text>
          </View>

          {/* Don't Use Warning */}
          {excludeBroad && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>DON'T USE (TOO BROAD)</Text>
              <View style={styles.broadEmotions}>
                {BROAD_EMOTIONS.map((emotion, index) => (
                  <View key={index} style={styles.broadChip}>
                    <Text style={styles.broadChipText}>{emotion}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Emotion Categories */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(EMOTIONS).map(([key, category]) => (
              <View key={key} style={styles.category}>
                <Text style={[styles.categoryTitle, { color: category.color }]}>
                  {category.title}
                </Text>
                <View style={styles.emotionsGrid}>
                  {category.emotions.map((emotion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.emotionChip,
                        {
                          backgroundColor: category.backgroundColor,
                          borderColor: category.color
                        }
                      ]}
                      onPress={() => handleSelect(emotion)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.emotionText, { color: category.color }]}>
                        {emotion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    ...Shadows['2xl'],
    flexDirection: 'column',
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
  },
  warningBox: {
    margin: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#FFF4E6',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: '#D97706',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  broadEmotions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  broadChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  broadChipText: {
    fontSize: 13,
    fontWeight: Typography.weights.semibold,
    color: '#D97706',
  },
  scrollView: {
    flex: 1,
  },
  category: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  emotionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  emotionText: {
    fontSize: 14,
    fontWeight: Typography.weights.semibold,
  },
  bottomPadding: {
    height: 20,
  },
});
