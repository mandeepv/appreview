import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

/**
 * Renders a paragraph with certain fragments emphasised in the brand accent
 * colour + bold weight — the "you'll spend 2,372 hours" move that every
 * high-converting onboarding uses to make a number land emotionally.
 *
 * Usage: pass the body as an array of fragments. A plain string renders as
 * normal text; an object `{ text, hl: true }` renders in the accent colour.
 *
 *   <HighlightText style={styles.body} parts={[
 *     'Last year you spent ',
 *     { text: '1,200 hours', hl: true },
 *     ' refereeing meltdowns.',
 *   ]} />
 *
 * Keeping this declarative (an array, not embedded markup) means the copy
 * lives as data in variantBContent and the highlight decision travels with it.
 */
export type TextPart = string | { text: string; hl?: boolean };

interface HighlightTextProps {
  parts: TextPart[];
  /** Base text style (size/colour/lineHeight for the non-highlighted run). */
  style?: StyleProp<TextStyle>;
  /** Colour used for highlighted fragments. Defaults to the brand primary. */
  highlightColor?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  parts,
  style,
  highlightColor = Colors.primary,
}) => (
  <Text style={style}>
    {parts.map((part, i) => {
      if (typeof part === 'string') return <Text key={i}>{part}</Text>;
      return (
        <Text
          key={i}
          style={
            part.hl
              ? { color: highlightColor, fontWeight: Typography.weights.bold }
              : undefined
          }
        >
          {part.text}
        </Text>
      );
    })}
  </Text>
);
