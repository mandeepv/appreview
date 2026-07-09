// SPEC-09 Phase 2 — block template components (extended for the Sprinklers
// pilot). One renderer per block type from the schema. These reproduce the
// EXISTING hand-built look (no visual redesign) using the shared components
// and theme tokens; styles are lifted from the real survey/pilot screens so
// the data-driven output is visually identical.
//
// Stateful blocks (interactiveQuiz) manage their own reveal state here, since
// that state is local to the block. The screen-advance is handled by the
// controller via the onAdvanceReady callback.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmotionPicker } from '../../components/EmotionPicker';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import type { Block, RichText, TextSpan } from '../schema';

// --- Rich text --------------------------------------------------------------
function renderRich(
  rich: RichText,
  baseStyle: object | object[],
  emphasisStyle: object,
  key?: React.Key,
) {
  const spans: TextSpan[] =
    typeof rich === 'string' ? [{ text: rich, emphasis: 'plain' }] : rich;
  return (
    <Text key={key} style={baseStyle}>
      {spans.map((s, i) => (
        <Text key={i} style={s.emphasis === 'emphasis' ? emphasisStyle : undefined}>
          {s.text}
        </Text>
      ))}
    </Text>
  );
}

interface BlockProps {
  block: Block;
  // interactiveQuiz signals the controller that Next may be shown (after an
  // answer is revealed). Non-interactive blocks ignore this.
  onInteractiveAnswered?: () => void;
  // Input blocks (textInput, emotionPicker) report whether their required
  // field is currently satisfied. The controller keeps Next disabled until
  // every input block on the screen reports satisfied. Passive blocks ignore
  // this. `blockKey` distinguishes multiple inputs on one screen.
  onInputValidityChange?: (blockKey: string, satisfied: boolean) => void;
  blockKey?: string;
}

export const BlockRenderer: React.FC<BlockProps> = ({
  block,
  onInteractiveAnswered,
  onInputValidityChange,
  blockKey = '0',
}) => {
  switch (block.type) {
    case 'heading':
      return (
        <Text style={[styles.heading, block.size === 'lg' && styles.headingLg]}>
          {block.text}
        </Text>
      );

    case 'paragraph':
      return renderRich(block.text, styles.body, styles.emphasis);

    case 'eyebrow':
      return <Text style={styles.eyebrow}>{block.text}</Text>;

    case 'footer':
      return <Text style={styles.footer}>{block.text}</Text>;

    case 'heroEmoji':
      return (
        <View style={[styles.heroCircle, block.bg ? { backgroundColor: block.bg } : null]}>
          {block.icon ? (
            <Ionicons
              name={block.icon as keyof typeof Ionicons.glyphMap}
              size={40}
              color={block.iconColor ?? Colors.primary}
            />
          ) : (
            <Text style={styles.heroEmoji}>{block.emoji ?? ''}</Text>
          )}
        </View>
      );

    case 'pill':
      return (
        <View style={styles.pillContainer}>
          <Text style={styles.pillText}>{block.text}</Text>
        </View>
      );

    case 'callout':
      return <CalloutView block={block} />;

    case 'cardList':
      return <CardListView block={block} />;

    case 'interactiveQuiz':
      return <InteractiveQuizView block={block} onAnswered={onInteractiveAnswered} />;

    case 'textInput':
      return (
        <TextInputView
          block={block}
          onValidity={(ok) => onInputValidityChange?.(blockKey, ok)}
        />
      );

    case 'emotionPicker':
      return (
        <EmotionPickerView
          block={block}
          onValidity={(ok) => onInputValidityChange?.(blockKey, ok)}
        />
      );

    case 'quiz':
      // The QuizQuestion-component quiz is rendered by the controller (needs the
      // onCorrect advance). Returning null keeps this switch exhaustive.
      return null;

    case 'multiSelectQuiz':
      // Same as `quiz`: rendered by the controller via QuizQuestionMultiSelect
      // (needs the onCorrect advance). Null keeps the switch exhaustive.
      return null;

    default: {
      const _never: never = block;
      return _never;
    }
  }
};

// --- callout ----------------------------------------------------------------
const CalloutView: React.FC<{ block: Extract<Block, { type: 'callout' }> }> = ({ block }) => {
  const defaults: Record<string, { bg: string; accent?: string; center: boolean; leftAccent: boolean }> = {
    quote: { bg: '#FFE4ED', center: true, leftAccent: false },
    summary: { bg: '#F5F9FF', accent: Colors.primary, center: false, leftAccent: true },
    preview: { bg: '#F5F5F5', accent: Colors.primary, center: false, leftAccent: true },
    insight: { bg: '#E8F5E9', center: true, leftAccent: false },
    highlight: { bg: Colors.surface, center: true, leftAccent: false },
  };
  const d = defaults[block.variant];
  const bg = block.bg ?? d.bg;
  const leftAccent = block.leftAccent ?? d.leftAccent;
  const accent = block.accentColor ?? d.accent ?? Colors.primary;
  const center = block.center ?? d.center;
  const isQuote = block.variant === 'quote';

  return (
    <View
      style={[
        styles.callout,
        { backgroundColor: bg },
        leftAccent && { borderLeftWidth: 4, borderLeftColor: accent },
        (isQuote || block.variant === 'insight' || block.variant === 'highlight') && Shadows.sm,
      ]}
    >
      {block.label && (
        <Text style={[styles.calloutLabel, block.labelColor ? { color: block.labelColor } : null]}>
          {block.label}
        </Text>
      )}
      {block.lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && block.dividers && <View style={styles.divider} />}
          {renderRich(
            line,
            [
              isQuote ? styles.quoteText : styles.calloutText,
              center ? styles.centerText : null,
              block.textColor ? { color: block.textColor } : null,
            ],
            styles.emphasis,
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

// --- cardList ---------------------------------------------------------------
const CardListView: React.FC<{ block: Extract<Block, { type: 'cardList' }> }> = ({ block }) => {
  const isChips = block.layout === 'chips';
  return (
    <View style={isChips ? styles.chipRow : styles.cardStack}>
      {block.items.map((item, i) => {
        const cardStyle =
          block.cardStyle === 'chip'
            ? styles.chip
            : block.cardStyle === 'bordered'
              ? styles.cardBordered
              : block.cardStyle === 'plain'
                ? styles.cardPlain
                : styles.cardSurface;
        return (
          <View
            key={i}
            style={[
              cardStyle,
              item.color ? { backgroundColor: item.color } : null,
              item.borderColor ? { borderColor: item.borderColor, borderWidth: 1 } : null,
            ]}
          >
            {item.number !== undefined ? (
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{item.number}</Text>
              </View>
            ) : item.icon ? (
              item.iconKind === 'emoji' ? (
                <Text style={styles.cardEmoji}>{item.icon}</Text>
              ) : (
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={item.iconColor ?? Colors.primary}
                  style={styles.cardIcon}
                />
              )
            ) : null}
            <Text
              style={[
                block.cardStyle === 'chip' ? styles.chipText : styles.cardText,
                item.textColor ? { color: item.textColor } : null,
              ]}
            >
              {item.title}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// --- interactiveQuiz --------------------------------------------------------
const InteractiveQuizView: React.FC<{
  block: Extract<Block, { type: 'interactiveQuiz' }>;
  onAnswered?: () => void;
}> = ({ block, onAnswered }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const press = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    onAnswered?.();
  };

  const selectedCorrect = selected !== null ? block.options[selected].isCorrect : false;

  return (
    <View style={styles.iqContainer}>
      <Text style={styles.question}>{block.question}</Text>
      <View style={styles.optionsContainer}>
        {block.options.map((opt, i) => {
          let bg: string = Colors.surface;
          let border: string = Colors.border;
          if (revealed) {
            if (opt.isCorrect) {
              bg = '#E8F5E9';
              border = '#4CAF50';
            } else if (selected === i) {
              bg = '#FFEBEE';
              border = '#EF5350';
            }
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => press(i)}
              activeOpacity={0.7}
              disabled={revealed}
            >
              <Text style={styles.optionText}>{opt.text}</Text>
              {revealed && opt.isCorrect && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              )}
              {revealed && selected === i && !opt.isCorrect && (
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {revealed && (
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackHeader}>
            <Ionicons
              name={selectedCorrect ? 'checkmark-circle' : 'information-circle'}
              size={24}
              color={selectedCorrect ? Colors.success : Colors.primary}
            />
            <Text style={styles.feedbackTitle}>{selectedCorrect ? 'Correct' : 'Not quite'}</Text>
          </View>
          <Text style={styles.feedbackText}>{block.correctFeedback}</Text>
        </View>
      )}
    </View>
  );
};

// --- textInput --------------------------------------------------------------
// A multiline reflective-journaling field. Ephemeral: the text is held in
// local state and never persisted (matches the hand-built screens). Reports
// validity so the controller can gate Next when `required`.
const TextInputView: React.FC<{
  block: Extract<Block, { type: 'textInput' }>;
  onValidity: (satisfied: boolean) => void;
}> = ({ block, onValidity }) => {
  const [value, setValue] = useState('');
  const satisfied = !block.required || value.trim().length > 0;
  useEffect(() => {
    onValidity(satisfied);
    // Report on mount and whenever satisfaction flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satisfied]);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputHeadline}>{block.headline}</Text>
      {block.helper && <Text style={styles.inputHelper}>{block.helper}</Text>}
      <TextInput
        style={[styles.textInput, { minHeight: block.minHeight }]}
        placeholder={block.placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={setValue}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
};

// --- emotionPicker ----------------------------------------------------------
// Picker button → shared EmotionPicker modal; conditional "Why did you feel
// {emotion}?" field revealed after selection. Next gated on emotion chosen AND
// why non-blank. Reuses the global EmotionPicker component verbatim.
const EmotionPickerView: React.FC<{
  block: Extract<Block, { type: 'emotionPicker' }>;
  onValidity: (satisfied: boolean) => void;
}> = ({ block, onValidity }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState('');
  const [why, setWhy] = useState('');
  const satisfied = selected.length > 0 && why.trim().length > 0;
  useEffect(() => {
    onValidity(satisfied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satisfied]);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputHeadline}>{block.headline}</Text>
      {block.helper && <Text style={styles.inputHelper}>{block.helper}</Text>}

      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.pickerButtonText, selected ? styles.pickerButtonTextSelected : null]}>
          {selected || block.buttonPlaceholder}
        </Text>
        <Text style={styles.pickerButtonIcon}>▼</Text>
      </TouchableOpacity>

      {selected ? (
        <View style={styles.whyContainer}>
          <Text style={styles.whyLabel}>
            {block.whyLabel.replace('{emotion}', selected.toLowerCase())}
          </Text>
          <TextInput
            style={[styles.textInput, { minHeight: 100 }]}
            placeholder={block.whyPlaceholder}
            placeholderTextColor={Colors.textMuted}
            value={why}
            onChangeText={setWhy}
            multiline
            textAlignVertical="top"
          />
        </View>
      ) : null}

      <EmotionPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={setSelected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  headingLg: { fontSize: 22, lineHeight: 30, letterSpacing: 0 },
  body: {
    fontSize: 18,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  emphasis: { color: Colors.primary, fontWeight: Typography.weights.bold },
  eyebrow: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  footer: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  centerText: { textAlign: 'center' },
  heroCircle: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  heroEmoji: { fontSize: 50 },
  pillContainer: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: { fontSize: 14, color: Colors.textSecondary, fontWeight: Typography.weights.medium },
  callout: { padding: 24, borderRadius: 16, marginTop: 10, gap: 12 },
  calloutLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  calloutText: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },
  quoteText: {
    fontSize: 20,
    fontWeight: Typography.weights.semibold,
    color: '#C2185B',
    lineHeight: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  cardStack: { gap: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  cardSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    ...Shadows.sm,
  },
  cardBordered: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  cardPlain: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  chipText: { fontSize: 15, fontWeight: Typography.weights.medium, color: Colors.textPrimary },
  cardIcon: {},
  cardEmoji: { fontSize: 20 },
  cardText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: { fontSize: 14, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  // interactiveQuiz
  iqContainer: { gap: 24 },
  question: {
    fontSize: 22,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  optionsContainer: { gap: 12 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  feedbackContainer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  feedbackTitle: { fontSize: 18, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  feedbackText: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },
  // textInput / emotionPicker (styles lifted verbatim from the hand-built
  // Naming-our-Emotions screens so the data-driven render is identical).
  inputGroup: { gap: 16, width: '100%' },
  inputHeadline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  inputHelper: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 22,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: 16,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  pickerButtonTextSelected: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
  pickerButtonIcon: { fontSize: 12, color: Colors.textMuted },
  whyContainer: { gap: 12, marginTop: 4 },
  whyLabel: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
});
