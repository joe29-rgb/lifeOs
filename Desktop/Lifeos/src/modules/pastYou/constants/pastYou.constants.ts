/**
 * Past You Constants
 * Common prompts, response templates, pattern categories
 */

export const TOPIC_PROMPTS = [
  {
    id: 'career',
    category: 'Career Decisions',
    icon: '🚀',
    title: 'Career Decisions',
    examples: [
      'Should I take this new job?',
      'How did past career changes work out?',
      'What did I learn from job transitions?',
    ],
  },
  {
    id: 'relationships',
    category: 'Relationships',
    icon: '❤️',
    title: 'Relationships',
    examples: [
      'How do I handle this conflict?',
      'What did I learn from past relationship struggles?',
      'How did I rebuild trust before?',
    ],
  },
  {
    id: 'mental_health',
    category: 'Mental Health',
    icon: '🧠',
    title: 'Mental Health',
    examples: [
      'How did I get through rough patches before?',
      'What coping strategies actually worked?',
      'What helped when I felt overwhelmed?',
    ],
  },
  {
    id: 'life_decisions',
    category: 'Life Decisions',
    icon: '💭',
    title: 'Life Decisions',
    examples: [
      'What did I learn from past big decisions?',
      'Do I have a pattern of regretting certain choices?',
      'How did similar decisions turn out?',
    ],
  },
  {
    id: 'personal_growth',
    category: 'Personal Growth',
    icon: '🌱',
    title: 'Personal Growth',
    examples: [
      'What lessons have I learned?',
      'How have I changed over time?',
      'What am I better at now than before?',
    ],
  },
] as const;

export const KEYWORD_SYNONYMS: Record<string, string[]> = {
  stressed: ['overwhelmed', 'anxious', 'pressure', 'tense', 'worried'],
  happy: ['joyful', 'content', 'satisfied', 'pleased', 'excited'],
  sad: ['depressed', 'down', 'low', 'unhappy', 'blue'],
  job: ['career', 'work', 'position', 'role', 'employment'],
  relationship: ['partner', 'friend', 'family', 'connection', 'bond'],
  decision: ['choice', 'option', 'path', 'direction', 'move'],
  change: ['transition', 'shift', 'transformation', 'evolution'],
  fear: ['scared', 'afraid', 'nervous', 'worried', 'anxious'],
};

export const RESPONSE_TEMPLATES = {
  greeting: [
    "Hey, it's you from {date}.",
    "Past You here, from {date}.",
    "Remember me? You from {date}.",
  ],
  similar_situation: [
    "I was in a similar spot when {context}.",
    "This reminds me of when {context}.",
    "I faced something like this when {context}.",
  ],
  learned_lesson: [
    "Here's what I learned:",
    "What I figured out:",
    "The lesson I took away:",
  ],
  encouragement: [
    "You've got this. You always figure it out.",
    "Remember, you've survived 100% of your worst days.",
    "This is hard, but you're stronger than you think.",
  ],
} as const;

export const PATTERN_CATEGORIES = {
  decision: {
    title: 'Decision Patterns',
    icon: '💭',
    patterns: [
      'Better choices after sleeping on it',
      'Rush when anxious',
      'Trust gut on people',
      'Overthink small decisions',
    ],
  },
  relationship: {
    title: 'Relationship Patterns',
    icon: '❤️',
    patterns: [
      'Avoid conflict until it explodes',
      'Loyal to a fault',
      'Direct communication improves things',
      'Need alone time to recharge',
    ],
  },
  mental_health: {
    title: 'Mental Health Patterns',
    icon: '🧠',
    patterns: [
      'Isolate when stressed',
      'Exercise improves mood',
      'Talking helps more than journaling',
      'Sleep deprivation amplifies problems',
    ],
  },
  career: {
    title: 'Career Patterns',
    icon: '🚀',
    patterns: [
      'Thrive with autonomy',
      'Underestimate abilities',
      'Learning new skills excites',
      'Need meaningful work',
    ],
  },
} as const;

export const WISDOM_CATEGORIES = [
  'Decision Making',
  'Relationships',
  'Mental Health',
  'Career',
  'Personal Growth',
  'Self-Care',
  'Communication',
  'Boundaries',
] as const;

export const RECURRING_LESSONS = [
  {
    lesson: 'Sleep makes everything better',
    category: 'Self-Care',
    icon: '😴',
  },
  {
    lesson: 'You regret things you DON\'T do',
    category: 'Decision Making',
    icon: '💭',
  },
  {
    lesson: 'Ask for help earlier',
    category: 'Personal Growth',
    icon: '🤝',
  },
  {
    lesson: 'Fear isn\'t a stop sign, it\'s just information',
    category: 'Decision Making',
    icon: '🎯',
  },
  {
    lesson: 'Direct communication always improves things',
    category: 'Relationships',
    icon: '💬',
  },
] as const;

export const EMOTIONAL_SUPPORT_RESPONSES = {
  overwhelmed: {
    acknowledgment: "I know this feeling. I've been here before.",
    reminder: "You've survived 100% of your worst days.",
    suggestions: [
      'Break tasks into tiny pieces',
      'Ask someone for help',
      'Take a break - it\'s not giving up',
      'Focus on just the next small step',
    ],
  },
  failure: {
    acknowledgment: "Feeling like you're failing is painful. I get it.",
    reminder: "Failure isn't falling down. It's refusing to get back up.",
    suggestions: [
      'List what you HAVE accomplished',
      'Talk to someone who believes in you',
      'Remember past comebacks',
      'Be gentle with yourself',
    ],
  },
  stuck: {
    acknowledgment: "Being stuck is frustrating. I've felt this too.",
    reminder: "You always find a way forward. Always.",
    suggestions: [
      'Change your environment',
      'Talk it out with someone',
      'Try the opposite of what you\'ve been doing',
      'Give it one more day',
    ],
  },
} as const;

export const FUTURE_LETTER_DURATIONS = [
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
] as const;

export const SEARCH_WEIGHTS = {
  keyword_exact: 10,
  keyword_synonym: 5,
  emotion_match: 7,
  context_match: 8,
  recency_boost: 3,
  impact_boost: 5,
} as const;
