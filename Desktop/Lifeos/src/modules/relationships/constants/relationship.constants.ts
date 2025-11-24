/**
 * Relationship Guardian - Constants
 */

export const RELATIONSHIP_TYPES = {
  family: { label: 'Family', icon: '👨‍👩‍👧‍👦', color: '#FF6B6B' },
  friend: { label: 'Friend', icon: '👥', color: '#4ECDC4' },
  romantic: { label: 'Romantic', icon: '💕', color: '#FF1744' },
  professional: { label: 'Professional', icon: '💼', color: '#536DFE' },
  other: { label: 'Other', icon: '🤝', color: '#78909C' },
};

export const CONTACT_TYPES = {
  call: { label: 'Call', icon: '📞', color: '#4CAF50' },
  text: { label: 'Text', icon: '💬', color: '#2196F3' },
  in_person: { label: 'In Person', icon: '🤝', color: '#FF9800' },
  video: { label: 'Video', icon: '📹', color: '#9C27B0' },
  email: { label: 'Email', icon: '📧', color: '#607D8B' },
};

export const WEATHER_STATUS = {
  sunny: {
    label: 'Sunny',
    emoji: '☀️',
    color: '#FFC107',
    description: 'Everything\'s great!',
  },
  partly_cloudy: {
    label: 'Partly Cloudy',
    emoji: '⛅',
    color: '#FF9800',
    description: 'Could use a check-in',
  },
  cloudy: {
    label: 'Cloudy',
    emoji: '☁️',
    color: '#9E9E9E',
    description: 'It\'s been a while',
  },
  storm_warning: {
    label: 'Storm Warning',
    emoji: '⛈️',
    color: '#F44336',
    description: 'Urgent: Reach out now!',
  },
};

export const DRIFT_THRESHOLDS = {
  frequency: {
    minor: 1.5, // 1.5x expected frequency
    moderate: 2.0,
    severe: 3.0,
  },
  sentiment: {
    minor: 0.2, // 20% drop
    moderate: 0.4,
    severe: 0.6,
  },
};

export const DEFAULT_CONTACT_FREQUENCY_DAYS = {
  family: 7,
  friend: 14,
  romantic: 2,
  professional: 30,
  other: 21,
};

export const QUICK_TEXT_TEMPLATES = [
  'Hey! Been thinking about you. How are you doing?',
  'Miss you! Let\'s catch up soon.',
  'Hope you\'re having an amazing day! 💙',
  'Just wanted to say hi and see how you\'re doing.',
  'It\'s been too long! Coffee this week?',
];

export const BARNEY_RELATIONSHIP_MESSAGES = {
  drift_detected: [
    'Suit up! Time to reconnect with someone awesome.',
    'Your friendship playbook says it\'s time to reach out.',
    'Legendary people don\'t let legendary friendships fade!',
  ],
  contact_made: [
    'High five! 🖐️ That\'s how you maintain awesome relationships.',
    'You just made someone\'s day. That\'s legendary!',
    'Friendship level: AWESOME. Keep it up!',
  ],
  milestone: [
    'Look at you! {days} days of staying connected. That\'s commitment!',
    'This relationship is going in the hall of fame!',
    'You\'re crushing the friendship game!',
  ],
};

export const SENTIMENT_KEYWORDS = {
  positive: [
    'love', 'great', 'awesome', 'happy', 'excited', 'amazing', 'wonderful',
    'fantastic', 'perfect', 'excellent', 'best', 'fun', 'enjoy', 'laugh',
  ],
  negative: [
    'hate', 'bad', 'terrible', 'awful', 'angry', 'sad', 'upset', 'frustrated',
    'annoyed', 'disappointed', 'hurt', 'worried', 'stressed', 'fight',
  ],
};

export const TOP_PEOPLE_LIMIT = 5;
export const BASELINE_CALCULATION_MIN_CONTACTS = 5;
export const WEATHER_UPDATE_INTERVAL_HOURS = 6;
