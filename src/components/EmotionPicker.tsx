/**
 * The emotion picker — a bottom sheet of specific feelings, used by the
 * journaling screens in "Naming our Emotions".
 *
 * RESTYLED 2026-09 onto the cream/forest system. Two behaviour-shaped changes
 * came with it:
 *
 *   - One palette. Each group used to have its own colour (blue, red, green,
 *     purple, amber). Colour-coding feelings says some are alarming — "angry"
 *     in red — which is the opposite of the lesson, whose whole point is that
 *     every feeling is information.
 *   - The "too broad" words are a sentence, not chips. They were drawn as
 *     buttons in an orange warning box and did nothing when tapped, which
 *     reads as broken. They are guidance, so they are now set as text.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  oInk,
} from '../constants/theme';

interface EmotionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emotion: string) => void;
  excludeBroad?: boolean;
}

const EMOTIONS = {
  upset: {
    title: 'Upset',
    emotions: [
      'Pressured', 'Scared', 'Defensive', 'Worried', 'Worthless', 'Stupid',
      'Disrespected', 'Excluded', 'Threatened', 'Nervous', 'Misunderstood',
      'Depressed', 'Lonely', 'Abandoned', 'Unimportant', 'Hopeless',
      'Guilty', 'Ashamed', 'Disappointed', 'Embarrassed', 'Ugly', 'Small'
    ]
  },
  angry: {
    title: 'Angry',
    emotions: [
      'Angry', 'Let down', 'Humiliated', 'Betrayed', 'Jealous',
      'Frustrated', 'Annoyed', 'Disgust', 'Contempt'
    ]
  },
  stressed: {
    title: 'Stressed or low',
    emotions: ['Bored', 'Stressed', 'Tired', 'Overwhelmed']
  },
  confusion: {
    title: 'Confused or hurt by others',
    emotions: ['Surprised', 'Confused', 'Bullied', 'Down', 'Unloved']
  },
  happy: {
    title: 'Happy',
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

const BROAD_EMOTIONS = ['happy', 'sad', 'mad', 'bad'];

export const EmotionPicker: React.FC<EmotionPickerProps> = ({
  visible,
  onClose,
  onSelect,
  excludeBroad = true,
}) => {
  const insets = useSafeAreaInsets();
  const handleSelect = (emotion: string) => {
    onSelect(emotion);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>Choose a feeling</Text>
            <Text style={styles.subtitle}>
              {excludeBroad
                ? `The one that fits best, not perfectly. Try to go a step deeper than ${BROAD_EMOTIONS.join(', ').replace(/, (?=[^,]*$)/, ' or ')}.`
                : 'The one that fits best, not perfectly.'}
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 8 }}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(EMOTIONS).map(([key, category]) => (
              <View key={key} style={styles.category}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <View style={styles.grid}>
                  {category.emotions.map((emotion) => (
                    <Pressable
                      key={emotion}
                      style={({ pressed }) => [styles.chip, pressed ? styles.chipPressed : null]}
                      onPress={() => handleSelect(emotion)}
                      accessibilityRole="button"
                    >
                      {({ pressed }) => (
                        <Text style={[styles.chipText, pressed ? { color: C.cream } : null]}>
                          {emotion}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: oInk(0.45) },
  sheet: {
    backgroundColor: C.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 26,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: oInk(0.1),
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: oInk(0.18),
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: {
    fontFamily: F.serif,
    fontSize: 25,
    lineHeight: 25 * 1.2,
    letterSpacing: -0.3,
    color: C.ink,
  },
  subtitle: {
    fontFamily: F.serif,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    color: oInk(0.64),
    marginTop: 6,
  },
  scroll: { flex: 1 },
  category: { paddingHorizontal: 26, paddingTop: 20 },
  categoryTitle: {
    fontFamily: F.sansSemi,
    fontSize: T.uiSm,
    color: oInk(0.7),
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: C.wash,
  },
  chipPressed: { backgroundColor: C.forest },
  chipText: { fontFamily: F.sansMed, fontSize: T.uiSm, color: oInk(0.86) },
});
