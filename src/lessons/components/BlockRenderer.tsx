// SPEC-09 block templates — one renderer per block type from the schema.
//
// RESTYLED 2026-09 onto the cream/forest system (see LessonShell for the why).
// The SPEC-09 brief was "reproduce the hand-built look byte for byte"; that
// look was the old teal palette, and the lesson player was the last surface
// still wearing it. Structure and behaviour are unchanged except where the
// comments below say otherwise.
//
// LEGACY COLOUR OVERRIDES ARE IGNORED. The content files carry ~280 one-off
// hex values (callout `bg`/`labelColor`/`textColor`/`accentColor`, card
// `color`, chip `borderColor`/`textColor`, hero `bg`/`iconColor`). They exist
// only because the conversion reproduced each hand-built screen's exact teal,
// pink and sky-blue. Honouring them would paint the old palette back over the
// new one, screen by screen. Variants carry the meaning now; the fields stay in
// the schema so existing content still parses, and can be deleted from the
// content files at leisure.
//
// Reading layout is LEFT-ALIGNED. The old screens centred every paragraph,
// which is fine for a two-line title and hard work for a five-line explanation
// read at the end of the day — the eye has to find a new left edge every line.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { EmotionPicker } from '../../components/EmotionPicker';
import { GradedQuestion } from './GradedQuestion';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingRadius as R,
  oInk,
  oCream,
} from '../../constants/theme';
import type { Block, RichText, TextSpan } from '../schema';

// --- Rich text --------------------------------------------------------------
// Emphasis is the design system's one signature move — an italic phrase — in
// forest, rather than the old bold teal.
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
  // Question blocks signal the controller that Continue may be enabled (after
  // the answer is revealed). Other blocks ignore this.
  onInteractiveAnswered?: () => void;
  // Multi-select questions hand their "check" action up to the screen, whose
  // pinned pill reads "Check answer" until it has been pressed.
  registerCheck?: (check: (() => void) | null, canCheck: boolean) => void;
  // Input blocks (textInput, emotionPicker) report whether their required
  // field is currently satisfied. The controller keeps Continue disabled until
  // every input block on the screen reports satisfied. `blockKey`
  // distinguishes multiple inputs on one screen.
  onInputValidityChange?: (blockKey: string, satisfied: boolean) => void;
  blockKey?: string;
  /**
   * False for every heading after a screen's first. Content uses `heading`
   * for two jobs — the screen's title, and a punchline sentence further down
   * ("This means punishment during emotional distress teaches very little —
   * except fear."). At title size the punchline competed with the title and
   * the screen had no top; set one step smaller it reads as the line the
   * paragraphs were building to.
   */
  isTitle?: boolean;
}

export const BlockRenderer: React.FC<BlockProps> = ({
  block,
  onInteractiveAnswered,
  registerCheck,
  onInputValidityChange,
  blockKey = '0',
  isTitle = true,
}) => {
  const answered = onInteractiveAnswered ?? noop;
  switch (block.type) {
    case 'heading':
      return (
        <Text
          style={!isTitle ? styles.statement : block.size === 'lg' ? styles.headingLg : styles.heading}
          accessibilityRole={isTitle ? 'header' : undefined}
        >
          {block.text}
        </Text>
      );

    case 'paragraph':
      return renderRich(block.text, styles.body, styles.emphasis);

    case 'eyebrow':
      return <Text style={styles.eyebrow}>{block.text.toUpperCase()}</Text>;

    case 'footer':
      return <Text style={styles.footer}>{block.text}</Text>;

    case 'heroEmoji':
      return (
        <View style={styles.hero}>
          {block.icon ? (
            <Ionicons
              name={block.icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={C.forest}
            />
          ) : (
            <Text style={styles.heroEmoji}>{block.emoji ?? ''}</Text>
          )}
        </View>
      );

    case 'pill':
      return (
        <View style={styles.pill}>
          <Text style={styles.pillText}>{block.text}</Text>
        </View>
      );

    case 'callout':
      return <CalloutView block={block} />;

    case 'cardList':
      return <CardListView block={block} />;

    case 'interactiveQuiz':
      return (
        <GradedQuestion
          mode="single"
          question={block.question}
          options={block.options.map((o) => ({ label: o.text, isCorrect: o.isCorrect }))}
          feedback={block.correctFeedback}
          onAnswered={answered}
        />
      );

    case 'quiz':
      return (
        <GradedQuestion
          mode="single"
          eyebrow={`QUESTION ${block.questionNumber} OF ${block.totalQuestions}`}
          question={block.question}
          options={block.options}
          feedback={block.feedback}
          onAnswered={answered}
        />
      );

    case 'multiSelectQuiz':
      return (
        <GradedQuestion
          mode="multi"
          eyebrow={`QUESTION ${block.questionNumber} OF ${block.totalQuestions}`}
          question={block.question}
          options={block.options}
          feedback={block.feedback}
          onAnswered={answered}
          registerCheck={registerCheck}
        />
      );

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

    default: {
      const _never: never = block;
      return _never;
    }
  }
};

function noop() {}

// --- callout ----------------------------------------------------------------
// Five variants, each with ONE job now that colour no longer varies per screen:
//   quote      someone's actual words — serif italic hung off a clay rule
//   summary    a wash panel for a recap or a pair of contrasting lines
//   preview    same panel; content uses it for "NEXT:" asides
//   insight    THE idea of the screen — a forest card. The old screens put
//              "Behavior is a signal, not a moral failure" in the smallest
//              type on the page; the most important sentence is now the
//              loudest object on it.
//   highlight  an outlined panel, for lists of lines with dividers
const CalloutView: React.FC<{ block: Extract<Block, { type: 'callout' }> }> = ({ block }) => {
  const v = block.variant;

  if (v === 'quote') {
    return (
      <View style={styles.quote}>
        {block.label ? <Text style={styles.calloutLabel}>{block.label.toUpperCase()}</Text> : null}
        {block.lines.map((line, i) =>
          renderRich(line, styles.quoteText, styles.quoteEmphasis, i),
        )}
      </View>
    );
  }

  const onForest = v === 'insight';
  return (
    <View
      style={[
        styles.callout,
        onForest ? styles.calloutInsight : v === 'highlight' ? styles.calloutOutline : styles.calloutWash,
      ]}
    >
      {block.label ? (
        <Text style={[styles.calloutLabel, onForest && { color: C.mint }]}>
          {block.label.toUpperCase()}
        </Text>
      ) : null}
      {block.lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && block.dividers ? (
            <View style={[styles.divider, onForest && { backgroundColor: oCream(0.2) }]} />
          ) : null}
          {renderRich(
            line,
            onForest ? styles.insightText : styles.calloutText,
            onForest ? styles.insightEmphasis : styles.emphasis,
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

// --- cardList ---------------------------------------------------------------
const CardListView: React.FC<{ block: Extract<Block, { type: 'cardList' }> }> = ({ block }) => {
  if (block.layout === 'chips' || block.cardStyle === 'chip') {
    return (
      <View style={styles.chipRow}>
        {block.items.map((item, i) => (
          <View key={i} style={styles.chip}>
            {/* Emoji chips keep their emoji. Ionicon chips drop the glyph: in
                practice it was a red alert-circle on "Tears" and "Tantrums",
                which framed a child's feelings as an error. */}
            {item.icon && item.iconKind === 'emoji' ? (
              <Text style={styles.chipEmoji}>{item.icon}</Text>
            ) : null}
            <Text style={styles.chipText}>{item.title}</Text>
          </View>
        ))}
      </View>
    );
  }

  // 'plain' is a reading list — the bullets under a paragraph. Everything
  // else is a stack of rows.
  const isList = block.cardStyle === 'plain';
  return (
    <View style={isList ? styles.list : styles.rows}>
      {block.items.map((item, i) => (
        <View key={i} style={isList ? styles.listItem : styles.rowItem}>
          <Leading item={item} isList={isList} />
          <View style={styles.itemText}>
            <Text style={isList ? styles.listTitle : styles.rowTitle}>{item.title}</Text>
            {/* Rendered at last. The schema always allowed a subtitle and the
                old renderer never drew it — so Emotional Sandbags' four steps
                showed "Radar / Ask / Imagine & Feel / Label" with the line
                explaining each one silently missing, and Sprinklers' timeline
                read "30 Years Ago / 20 Years Ago / Today" with no events. */}
            {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
};

function Leading({
  item,
  isList,
}: {
  item: Extract<Block, { type: 'cardList' }>['items'][number];
  isList: boolean;
}) {
  if (item.number !== undefined) {
    return (
      <View style={styles.numberDisc}>
        <Text style={styles.numberText}>{item.number}</Text>
      </View>
    );
  }
  if (item.icon) {
    return item.iconKind === 'emoji' ? (
      <Text style={styles.itemEmoji}>{item.icon}</Text>
    ) : (
      <Ionicons
        name={item.icon as keyof typeof Ionicons.glyphMap}
        size={20}
        color={C.forest}
        style={styles.itemIcon}
      />
    );
  }
  return isList ? <View style={styles.bullet} /> : null;
}

// --- textInput --------------------------------------------------------------
// A reflective-journaling field. EPHEMERAL: held in local state and never
// persisted, sent or logged (INVARIANTS: no free-text PII anywhere). The page
// now SAYS so — the old screens asked a parent to write about the last time
// they were angry at their child without a word about where that text went.
const PRIVATE_NOTE = 'Just for you. This isn’t saved or sent anywhere.';

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
      {/* Serve & Return's reflection field has an empty headline — the
          question is the screen's paragraph above it. */}
      {block.headline ? <Text style={styles.inputHeadline}>{block.headline}</Text> : null}
      {block.helper ? <Text style={styles.inputHelper}>{block.helper}</Text> : null}
      <TextInput
        style={[styles.textInput, { minHeight: block.minHeight }]}
        placeholder={block.placeholder}
        placeholderTextColor={oInk(0.4)}
        value={value}
        onChangeText={setValue}
        multiline
        textAlignVertical="top"
        accessibilityLabel={block.headline || block.placeholder}
      />
      <Text style={styles.privateNote}>{PRIVATE_NOTE}</Text>
    </View>
  );
};

// --- emotionPicker ----------------------------------------------------------
// Picker row → the shared EmotionPicker sheet; the "Why did you feel
// {emotion}?" field appears once an emotion is chosen. Continue is gated on
// both. Ephemeral, like textInput.
const EmotionPickerView: React.FC<{
  block: Extract<Block, { type: 'emotionPicker' }>;
  onValidity: (satisfied: boolean) => void;
}> = ({ block, onValidity }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState('');
  const [why, setWhy] = useState('');
  const satisfied = !block.required || (selected.length > 0 && why.trim().length > 0);
  useEffect(() => {
    onValidity(satisfied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satisfied]);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputHeadline}>{block.headline}</Text>
      {block.helper ? <Text style={styles.inputHelper}>{block.helper}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.pickerRow, pressed ? { opacity: 0.85 } : null]}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={selected ? `Emotion: ${selected}. Change` : block.buttonPlaceholder}
      >
        <Text style={selected ? styles.pickerValue : styles.pickerPlaceholder}>
          {selected || block.buttonPlaceholder}
        </Text>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 9l6 6 6-6"
            stroke={oInk(0.5)}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      {selected ? (
        <View style={styles.whyGroup}>
          <Text style={styles.whyLabel}>
            {block.whyLabel.replace('{emotion}', selected.toLowerCase())}
          </Text>
          <TextInput
            style={[styles.textInput, { minHeight: 100 }]}
            placeholder={block.whyPlaceholder}
            placeholderTextColor={oInk(0.4)}
            value={why}
            onChangeText={setWhy}
            multiline
            textAlignVertical="top"
          />
        </View>
      ) : null}
      <Text style={styles.privateNote}>{PRIVATE_NOTE}</Text>

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
    fontFamily: F.serif,
    fontSize: T.h1,
    lineHeight: T.h1 * 1.2,
    letterSpacing: -0.45,
    color: C.ink,
  },
  headingLg: {
    fontFamily: F.serif,
    fontSize: 25,
    lineHeight: 25 * 1.25,
    letterSpacing: -0.3,
    color: C.ink,
  },
  statement: {
    fontFamily: F.serif,
    fontSize: 22,
    lineHeight: 22 * 1.35,
    letterSpacing: -0.2,
    color: C.ink,
  },
  body: {
    fontFamily: F.serif,
    fontSize: 18,
    lineHeight: 18 * 1.6,
    color: oInk(0.84),
  },
  emphasis: { fontFamily: F.serifItalic, color: C.forest },
  eyebrow: {
    fontFamily: F.monoMed,
    fontSize: T.mono,
    letterSpacing: T.mono * 0.08,
    color: C.clayDeep,
  },
  footer: {
    fontFamily: F.serifItalic,
    fontSize: 17,
    lineHeight: 17 * 1.55,
    color: oInk(0.62),
  },

  hero: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: C.wash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 28 },

  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: oInk(0.16),
  },
  pillText: { fontFamily: F.sansMed, fontSize: 14, color: oInk(0.66) },

  // callouts
  quote: { borderLeftWidth: 2, borderLeftColor: C.clay, paddingLeft: 18, gap: 10 },
  quoteText: {
    fontFamily: F.serifItalic,
    fontSize: 22,
    lineHeight: 22 * 1.4,
    color: C.ink,
  },
  quoteEmphasis: { color: C.forest },
  callout: { borderRadius: R.callout, paddingVertical: 20, paddingHorizontal: 20, gap: 10 },
  calloutWash: { backgroundColor: C.wash },
  calloutOutline: { borderWidth: 1.5, borderColor: oInk(0.14) },
  calloutInsight: { backgroundColor: C.forest, paddingVertical: 24, paddingHorizontal: 22 },
  calloutLabel: {
    fontFamily: F.monoMed,
    fontSize: 11.5,
    letterSpacing: 11.5 * 0.08,
    color: C.clayDeep,
  },
  calloutText: {
    fontFamily: F.serif,
    fontSize: T.body,
    lineHeight: T.body * 1.55,
    color: oInk(0.84),
  },
  insightText: {
    fontFamily: F.serif,
    fontSize: 21,
    lineHeight: 21 * 1.4,
    color: C.cream,
  },
  insightEmphasis: { fontFamily: F.serifItalic, color: C.mint },
  divider: { height: 1, backgroundColor: oInk(0.12), marginVertical: 6 },

  // card lists
  rows: { gap: 10 },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.wash,
    borderRadius: R.row,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  rowTitle: { fontFamily: F.sansMed, fontSize: T.ui, lineHeight: T.ui * 1.35, color: oInk(0.86) },
  list: { gap: 14 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  listTitle: {
    fontFamily: F.serif,
    fontSize: 18,
    lineHeight: 18 * 1.5,
    color: oInk(0.84),
  },
  itemText: { flex: 1, gap: 3 },
  itemSubtitle: {
    fontFamily: F.serif,
    fontSize: 15.5,
    lineHeight: 15.5 * 1.5,
    color: oInk(0.62),
  },
  // Sits on the first line's x-height rather than centred on a wrapped item.
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: C.forest,
    marginTop: 11,
  },
  numberDisc: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: C.forest,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numberText: { fontFamily: F.sansSemi, fontSize: 14, color: C.cream },
  itemEmoji: { fontSize: 20, lineHeight: 26 },
  itemIcon: { marginTop: 1 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.wash,
    borderRadius: R.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipEmoji: { fontSize: 15 },
  chipText: { fontFamily: F.sansMed, fontSize: T.uiSm, color: oInk(0.84) },

  // journaling
  inputGroup: { gap: 12, width: '100%' },
  inputHeadline: {
    fontFamily: F.serif,
    fontSize: 25,
    lineHeight: 25 * 1.25,
    letterSpacing: -0.3,
    color: C.ink,
  },
  inputHelper: {
    fontFamily: F.serif,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    color: oInk(0.64),
  },
  textInput: {
    backgroundColor: C.cream,
    borderWidth: 1.5,
    borderColor: oInk(0.14),
    borderRadius: R.row,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: F.serif,
    fontSize: 18,
    lineHeight: 18 * 1.45,
    color: C.ink,
    marginTop: 6,
  },
  privateNote: { fontFamily: F.sans, fontSize: T.meta, color: oInk(0.5) },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.wash,
    borderRadius: R.row,
    paddingVertical: 17,
    paddingHorizontal: 18,
    marginTop: 6,
  },
  pickerPlaceholder: { fontFamily: F.sansMed, fontSize: T.ui, color: oInk(0.5) },
  pickerValue: { fontFamily: F.sansSemi, fontSize: T.ui, color: C.ink },
  whyGroup: { gap: 4, marginTop: 8 },
  whyLabel: { fontFamily: F.sansSemi, fontSize: T.uiSm, color: oInk(0.78) },
});
