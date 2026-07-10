import type { LessonHubMeta } from './LessonHubScreen';

// SPEC-13 R3 — per-hub display metadata, extracted verbatim from the 9
// hand-built hub screens so the generic LessonHubScreen reproduces each hub.
export const HUB_META: Record<string, LessonHubMeta> = {
  sprinklers: {
    emoji: '💧',
    label: 'FOUNDATION',
    description:
      'This lesson will teach you how to build deep bonds with loved ones by recognizing "sprinklers".',
    sections: [
      { icon: 'heart-outline', description: 'Introduction to the concept of bonding' },
      { icon: 'close-circle-outline', description: 'Common mistakes to avoid' },
      {
        icon: 'checkmark-circle-outline',
        description: 'Effective strategies for supporting upset loved ones',
      },
      { icon: 'list-outline', description: 'Key takeaways and principles' },
      { icon: 'bookmark-outline', description: 'Lesson recap and integration' },
    ],
    bottomInfo: {
      icon: 'water-outline',
      text: 'Learn to recognize and respond to "sprinklers" for deeper connections',
    },
  },
  emotionalSandbags: {
    emoji: '🛡️',
    label: 'SKILL',
    description:
      'Now that we know the importance of labeling emotions, how do we use this knowledge to help our relationships?',
    sections: [
      {
        icon: 'information-circle-outline',
        description: 'Overview of the emotional sandbags concept',
      },
      { icon: 'help-circle-outline', description: 'Definition and explanation' },
      { icon: 'hand-left-outline', description: 'Practical techniques and strategies' },
      { icon: 'refresh-outline', description: 'Recap of key concepts' },
      { icon: 'fitness-outline', description: 'Application and practice exercises' },
      { icon: 'bookmark-outline', description: 'Final integration and takeaways' },
    ],
    bottomInfo: {
      icon: 'shield-checkmark-outline',
      text: 'Learn practical techniques to support emotional well-being',
    },
  },
  communicationMistakes: {
    emoji: '⚠️',
    label: 'SKILL',
    description:
      'This lesson will give you examples of how NOT to build a deep bond with your loved one.',
    sections: [
      {
        icon: 'moon-outline',
        description: 'A real-life scenario to explore communication dynamics',
      },
      { icon: 'shield-outline', description: 'Understanding how this damages relationships' },
      { icon: 'scale-outline', description: 'Why balanced perspective can backfire' },
      { icon: 'trending-down-outline', description: 'Common mistakes that escalate situations' },
      { icon: 'contract-outline', description: 'The emotional impact of minimization' },
      { icon: 'alert-outline', description: 'Words that damage emotional connections' },
      { icon: 'eye-off-outline', description: 'Subtle ways we dismiss feelings' },
      { icon: 'people-outline', description: 'Why comparisons hurt instead of help' },
      { icon: 'chatbubbles-outline', description: 'Language patterns to avoid' },
      { icon: 'help-circle-outline', description: 'An unexpected communication mistake' },
      { icon: 'construct-outline', description: 'Why rushing to fix can damage bonds' },
      { icon: 'close-circle-outline', description: 'Cumulative errors in the scenario' },
      { icon: 'checkmark-circle-outline', description: 'Learning the proper approach' },
    ],
    bottomInfo: {
      icon: 'school-outline',
      text: 'Learn from common mistakes to build stronger connections',
    },
  },
  dissociation: {
    emoji: '🌫️',
    label: 'FOUNDATION',
    description:
      'This lesson will train you in an important concept called dissociation. This frequently happens with our loved ones.',
    sections: [
      { icon: 'help-circle-outline', description: 'Understanding this important concept' },
      { icon: 'eye-outline', description: 'Strategies to stay present and connected' },
      { icon: 'shield-outline', description: 'Additional techniques for staying grounded' },
      { icon: 'book-outline', description: 'Recap and practical application' },
    ],
    bottomInfo: {
      icon: 'pulse-outline',
      text: 'Learn to recognize and respond to dissociation in yourself and others',
    },
  },
  serveReturn: {
    emoji: '🔄',
    label: 'SKILL',
    description:
      'This lesson will teach you a simple communication technique that improves well-being.',
    sections: [
      { icon: 'chatbubble-outline', description: 'Understanding the back-and-forth of connection' },
      { icon: 'heart-outline', description: 'How responsiveness shapes relationships' },
      { icon: 'people-outline', description: 'Applying it beyond early childhood' },
      { icon: 'eye-outline', description: 'Pattern recognition in everyday moments' },
      { icon: 'heart-outline', description: 'Understanding the deeper impact' },
      { icon: 'clipboard-outline', description: 'Applying what you learned' },
    ],
    bottomInfo: {
      icon: 'sync-outline',
      text: 'Master a simple yet powerful technique for better communication',
    },
  },
  recordingDeepBondMoments: {
    emoji: '📸',
    label: 'WELLNESS',
    description: 'This lesson will change the way you think about recording memories.',
    sections: [
      { icon: 'camera-outline', description: 'Rethinking how we capture meaningful moments' },
    ],
    bottomInfo: {
      icon: 'images-outline',
      text: 'Learn what moments to capture and how they shape lasting memories',
    },
  },
  namingEmotions: {
    emoji: '📝',
    label: 'SKILL',
    description:
      'In this exercise you will recall past situations, name your emotions during that situation and explain the reasons you might have felt that way. Think of specific events, not general time periods of life.',
    sections: [
      { icon: 'happy-outline', description: 'Reflect on a time when you felt happy' },
      { icon: 'sad-outline', description: 'Reflect on a time when you felt sad' },
      { icon: 'flame-outline', description: 'Reflect on a time when you felt angry' },
      { icon: 'alert-circle-outline', description: 'Reflect on a difficult situation you experienced' },
    ],
    bottomInfo: {
      icon: 'pencil-outline',
      text: 'Each exercise takes about 5-10 minutes for thoughtful reflection',
    },
  },
  labelingEmotions: {
    emoji: '🏷️',
    label: 'FOUNDATION',
    description:
      'This lesson will teach you why it is important to learn to label emotions and how to do it.',
    sections: [
      {
        icon: 'help-circle-outline',
        description: 'Understand the science behind naming what we feel',
      },
      { icon: 'flash-outline', description: 'How language shapes our emotional experience' },
      {
        icon: 'list-outline',
        description: 'Practical techniques for identifying and naming feelings',
      },
      { icon: 'checkmark-circle-outline', description: 'From knowledge to practice in daily parenting' },
    ],
    bottomInfo: {
      icon: 'time-outline',
      text: 'Each module takes about 5 minutes to complete',
    },
  },
  helpingProcessEmotions: {
    emoji: '🤲',
    label: 'SKILL',
    description: 'How should we help our upset loved ones?',
    sections: [
      {
        icon: 'information-circle-outline',
        description: 'Understanding how to support upset loved ones',
      },
      { icon: 'moon-outline', description: 'A practical example of effective emotional support' },
    ],
    bottomInfo: {
      icon: 'heart-outline',
      text: 'Master the art of being present for those you love',
    },
  },
};
