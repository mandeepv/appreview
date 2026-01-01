import React from 'react';
import Svg, { Path, Circle, Rect, G, Ellipse } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface IllustrationProps {
  width?: number;
  height?: number;
}

// Welcome/Splash illustration - Parent and child
export const WelcomeIllustration: React.FC<IllustrationProps> = ({
  width = 200,
  height = 200
}) => (
  <Svg width={width} height={height} viewBox="0 0 200 200" fill="none">
    {/* Background circle */}
    <Circle cx="100" cy="100" r="95" fill={Colors.primaryBg} />

    {/* Parent figure */}
    <Circle cx="85" cy="70" r="20" fill={Colors.primary} />
    <Ellipse cx="85" cy="115" rx="25" ry="35" fill={Colors.primary} />

    {/* Child figure */}
    <Circle cx="115" cy="85" r="15" fill={Colors.primaryLight} />
    <Ellipse cx="115" cy="120" rx="18" ry="28" fill={Colors.primaryLight} />

    {/* Heart accent */}
    <Path
      d="M 100 130 C 90 120, 75 120, 75 130 C 75 140, 100 155, 100 155 C 100 155, 125 140, 125 130 C 125 120, 110 120, 100 130 Z"
      fill={Colors.error}
    />
  </Svg>
);

// Education/Learning illustration - Book with sparkles
export const EducationIllustration: React.FC<IllustrationProps> = ({
  width = 192,
  height = 192
}) => (
  <Svg width={width} height={height} viewBox="0 0 192 192" fill="none">
    {/* Background */}
    <Rect width="192" height="192" rx="24" fill={Colors.primaryBg} />

    {/* Book */}
    <Rect x="56" y="66" width="80" height="60" rx="4" fill={Colors.surface} stroke={Colors.primary} strokeWidth="3" />
    <Path d="M 96 66 L 96 126" stroke={Colors.primary} strokeWidth="2" />

    {/* Pages */}
    <Path d="M 70 80 L 86 80" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" />
    <Path d="M 70 90 L 86 90" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" />
    <Path d="M 70 100 L 86 100" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" />

    <Path d="M 106 80 L 122 80" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" />
    <Path d="M 106 90 L 122 90" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" />
    <Path d="M 106 100 L 122 100" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" />

    {/* Sparkles */}
    <Path d="M 40 50 L 42 54 L 46 56 L 42 58 L 40 62 L 38 58 L 34 56 L 38 54 Z" fill={Colors.warning} />
    <Path d="M 150 45 L 152 49 L 156 51 L 152 53 L 150 57 L 148 53 L 144 51 L 148 49 Z" fill={Colors.warning} />
    <Path d="M 155 130 L 157 134 L 161 136 L 157 138 L 155 142 L 153 138 L 149 136 L 153 134 Z" fill={Colors.warning} />
  </Svg>
);

// Notification/Bell illustration
export const NotificationIllustration: React.FC<IllustrationProps> = ({
  width = 128,
  height = 128
}) => (
  <Svg width={width} height={height} viewBox="0 0 128 128" fill="none">
    {/* Background circle */}
    <Circle cx="64" cy="64" r="64" fill={Colors.primaryBg} />

    {/* Bell */}
    <Path
      d="M 64 30 C 55 30, 50 35, 50 45 L 50 60 C 50 60, 45 70, 40 75 L 88 75 C 83 70, 78 60, 78 60 L 78 45 C 78 35, 73 30, 64 30 Z"
      fill={Colors.primary}
    />

    {/* Bell clapper */}
    <Circle cx="64" cy="75" r="3" fill={Colors.primaryDark} />

    {/* Bell bottom */}
    <Path
      d="M 58 78 C 58 82, 60 85, 64 85 C 68 85, 70 82, 70 78"
      stroke={Colors.primary}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />

    {/* Notification dot */}
    <Circle cx="80" cy="35" r="8" fill={Colors.error} />
  </Svg>
);

// Success/Celebration illustration
export const SuccessIllustration: React.FC<IllustrationProps> = ({
  width = 160,
  height = 160
}) => (
  <Svg width={width} height={height} viewBox="0 0 160 160" fill="none">
    {/* Background */}
    <Circle cx="80" cy="80" r="75" fill={Colors.successBg} />

    {/* Checkmark circle */}
    <Circle cx="80" cy="80" r="50" fill={Colors.success} />

    {/* Checkmark */}
    <Path
      d="M 60 80 L 72 92 L 100 64"
      stroke={Colors.surface}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Confetti */}
    <Circle cx="30" cy="30" r="4" fill={Colors.warning} />
    <Circle cx="130" cy="35" r="4" fill={Colors.primary} />
    <Circle cx="140" cy="90" r="4" fill={Colors.info} />
    <Circle cx="25" cy="120" r="4" fill={Colors.error} />
    <Rect x="35" y="140" width="8" height="8" fill={Colors.primary} transform="rotate(20 35 140)" />
    <Rect x="120" y="130" width="8" height="8" fill={Colors.warning} transform="rotate(-15 120 130)" />
  </Svg>
);

// Loading/Progress illustration
export const LoadingIllustration: React.FC<IllustrationProps> = ({
  width = 120,
  height = 120
}) => (
  <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
    {/* Background */}
    <Circle cx="60" cy="60" r="55" fill={Colors.primaryBg} />

    {/* Progress circle track */}
    <Circle
      cx="60"
      cy="60"
      r="45"
      stroke={Colors.border}
      strokeWidth="8"
      fill="none"
    />

    {/* Progress circle fill */}
    <Circle
      cx="60"
      cy="60"
      r="45"
      stroke={Colors.primary}
      strokeWidth="8"
      fill="none"
      strokeDasharray="283"
      strokeDashoffset="70"
      strokeLinecap="round"
      transform="rotate(-90 60 60)"
    />

    {/* Center icon - hourglass */}
    <Path
      d="M 50 40 L 70 40 L 65 50 L 70 60 L 50 60 L 55 50 Z"
      fill={Colors.primary}
    />
  </Svg>
);

// Partner/Together illustration - Two figures
export const PartnerIllustration: React.FC<IllustrationProps> = ({
  width = 150,
  height = 150
}) => (
  <Svg width={width} height={height} viewBox="0 0 150 150" fill="none">
    {/* Background */}
    <Circle cx="75" cy="75" r="70" fill={Colors.primaryBg} />

    {/* Figure 1 */}
    <Circle cx="60" cy="60" r="15" fill={Colors.primary} />
    <Ellipse cx="60" cy="95" rx="18" ry="25" fill={Colors.primary} />

    {/* Figure 2 */}
    <Circle cx="90" cy="60" r="15" fill={Colors.primaryLight} />
    <Ellipse cx="90" cy="95" rx="18" ry="25" fill={Colors.primaryLight} />

    {/* Connection line/hands */}
    <Path
      d="M 65 75 L 85 75"
      stroke={Colors.primaryDark}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </Svg>
);
