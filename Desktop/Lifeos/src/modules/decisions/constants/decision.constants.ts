/**
 * Decision Intelligence - Constants
 */

export const DECISION_DETECTION_PHRASES = [
  'should i',
  'i\'m choosing between',
  'i can\'t decide',
  'what should i do',
  'i\'m torn between',
  'help me decide',
  'i\'m thinking about',
  'considering whether',
  'debating between',
  'not sure if i should',
];

export const DECISION_CATEGORIES = {
  career: { label: 'Career', icon: '💼', color: '#4CAF50' },
  relationship: { label: 'Relationship', icon: '❤️', color: '#E91E63' },
  financial: { label: 'Financial', icon: '💰', color: '#FFC107' },
  health: { label: 'Health', icon: '🏃', color: '#2196F3' },
  lifestyle: { label: 'Lifestyle', icon: '🌟', color: '#9C27B0' },
  other: { label: 'Other', icon: '📝', color: '#607D8B' },
};

export const EMOTION_OPTIONS = [
  { type: 'excited', label: 'Excited', emoji: '🤩' },
  { type: 'anxious', label: 'Anxious', emoji: '😰' },
  { type: 'confident', label: 'Confident', emoji: '💪' },
  { type: 'uncertain', label: 'Uncertain', emoji: '🤔' },
  { type: 'hopeful', label: 'Hopeful', emoji: '🌟' },
  { type: 'worried', label: 'Worried', emoji: '😟' },
];

export const CONFIDENCE_LABELS = {
  1: 'Very Unsure',
  2: 'Somewhat Unsure',
  3: 'Neutral',
  4: 'Pretty Confident',
  5: 'Totally Confident',
};

export const SATISFACTION_LABELS = {
  1: 'Big Regret',
  2: 'Some Regret',
  3: 'Neutral',
  4: 'Pretty Happy',
  5: 'Amazing Choice',
};

export const REVIEW_DELAY_MONTHS = 6;

export const BARNEY_DECISION_MESSAGES = {
  logged: [
    'Legendary! You\'re tracking your choices like a boss.',
    'This is going in the playbook of awesomeness!',
    'Future-you is already thanking you for this.',
  ],
  reviewed: [
    'Look how far you\'ve come! Even your bad calls are prepping you to be awesome.',
    'That\'s growth, baby! You\'re learning from every move.',
    'Suit up! You\'re becoming a decision-making machine!',
  ],
  advice: [
    'History tells me you\'ve been here before. Let\'s make it legendary this time.',
    'Past-you left some wisdom. Time to use it!',
    'You know what\'s awesome? Learning from yourself.',
  ],
};

export const PATTERN_INSIGHTS = {
  time_of_day: 'Your best decisions happen at {time}',
  category: 'You nail {category} choices {percent}% of the time',
  emotion: 'When you feel {emotion}, you usually make great calls',
  consultation: 'Talking to {person} leads to better outcomes',
  confidence: 'Your {confidence} decisions work out best',
};
