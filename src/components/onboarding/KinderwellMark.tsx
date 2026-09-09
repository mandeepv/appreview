/**
 * The Kinderwell mark, traced from the Claude Design canvas (screens 10 and 11).
 *
 * A figure with a raised arm — a dot for the head, a stroke to the body, and
 * two short strokes for the reach. Drawn rather than shipped as a PNG so it
 * takes the surface's colour: cream on the forestDeep splash, forest on cream.
 */

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export function KinderwellMark({
  size = 46,
  color = '#2f6b4a',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={7.2} cy={6.85} r={2.35} fill={color} />
      <Path d="M7.7 13.4L13.6 7.3" stroke={color} strokeWidth={4.7} strokeLinecap="round" />
      <Path d="M14.1 11.6h3" stroke={color} strokeWidth={4.7} strokeLinecap="round" />
      <Path d="M12 14.1v2.7" stroke={color} strokeWidth={4.7} strokeLinecap="round" />
    </Svg>
  );
}
