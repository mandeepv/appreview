// SPEC-09 Phase 1 — block template components.
//
// One renderer per block type from the schema. These reproduce the EXISTING
// hand-built look (no visual redesign) using the shared components
// (LessonContainer/Button/QuizQuestion) and theme tokens. The styles here are
// lifted from the real survey screens (Sprinklers + Emotional Sandbags) so the
// data-driven output is visually identical.
//
// Phase 1 deliverable only — not yet wired into the navigator (that's Phase 2
// pilot / Phase 3 mass conversion). No gate/paywall code is touched.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import type { Block, RichText, TextSpan } from '../schema';

// --- Rich text --------------------------------------------------------------
// Render a RichText (plain string OR array of spans) as a single <Text>, with
// emphasized spans styled the way the hand-built screens style `highlight`.
function renderRich(rich: RichText, baseStyle: object, emphasisStyle: object) {
  const spans: TextSpan[] =
    typeof rich === 'string'
      ? [{ text: rich, emphasis: 'plain' }]
      : rich;
  return (
    <Text style={baseStyle}>
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
}

export const BlockRenderer: React.FC<BlockProps> = ({ block }) => {
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

    case 'pill':
      return (
        <View style={styles.pillContainer}>
          <Text style={styles.pillText}>{block.text}</Text>
        </View>
      );

    case 'callout': {
      const bg =
        block.bg ??
        (block.variant === 'quote'
          ? '#FFE4ED'
          : block.variant === 'preview'
            ? '#F5F5F5'
            : '#F5F9FF');
      const accent = block.accentColor ?? Colors.primary;
      const isQuote = block.variant === 'quote';
      return (
        <View
          style={[
            styles.callout,
            { backgroundColor: bg },
            !isQuote && { borderLeftWidth: 4, borderLeftColor: accent },
            isQuote && Shadows.sm,
          ]}
        >
          {block.label && <Text style={styles.calloutLabel}>{block.label}</Text>}
          {block.lines.map((line, i) =>
            renderRich(
              line,
              [
                isQuote ? styles.quoteText : styles.calloutText,
                block.textColor ? { color: block.textColor } : null,
              ],
              styles.emphasis,
            ),
          )}
        </View>
      );
    }

    case 'cardList':
      return (
        <View style={styles.cardList}>
          {block.items.map((item, i) => (
            <View
              key={i}
              style={[
                styles.card,
                item.color ? { backgroundColor: item.color } : styles.cardDefault,
              ]}
            >
              <View style={styles.cardLeading}>
                {item.number !== undefined ? (
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberText}>{item.number}</Text>
                  </View>
                ) : item.icon ? (
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={Colors.primary}
                    />
                  </View>
                ) : null}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      );

    case 'quiz':
      // The quiz block is handled by the controller (it needs the onCorrect
      // advance callback), not rendered inline here. Returning null keeps this
      // switch exhaustive; LessonController renders <QuizQuestion> directly.
      return null;

    default: {
      // Exhaustiveness guard — a new block type without a renderer fails tsc.
      const _never: never = block;
      return _never;
    }
  }
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
  headingLg: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0,
  },
  body: {
    fontSize: 18,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  emphasis: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  eyebrow: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
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
  pillText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  callout: {
    padding: 24,
    borderRadius: 16,
    marginTop: 10,
    gap: 12,
  },
  calloutLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  calloutText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  quoteText: {
    fontSize: 20,
    fontWeight: Typography.weights.semibold,
    color: '#C2185B',
    lineHeight: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cardList: {
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...Shadows.sm,
  },
  cardDefault: {
    backgroundColor: Colors.surface,
  },
  cardLeading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
