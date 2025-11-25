/**
 * Health Intelligence Constants
 * Detection phrases, thresholds, and motivational messages
 */

export const MOOD_EMOJIS = {
  1: '😢',
  2: '😞',
  3: '😕',
  4: '🙁',
  5: '😐',
  6: '🙂',
  7: '😊',
  8: '😄',
  9: '😁',
  10: '🤩',
} as const;

export const ENERGY_EMOJIS = {
  energized: '⚡',
  normal: '👍',
  sluggish: '😴',
  exhausted: '💤',
} as const;

export const WORKOUT_EMOJIS = {
  cardio: '🏃',
  strength: '💪',
  yoga: '🧘',
  sports: '⚽',
  walking: '🚶',
  other: '🏋️',
} as const;

export const MENTAL_HEALTH_PHRASES = {
  negative: [
    "i can't do this",
    "i'm worthless",
    "nobody cares",
    "what's the point",
    "i give up",
    "i hate myself",
    "everything sucks",
    "i'm a failure",
  ],
  isolation: [
    "canceled plans",
    "staying home",
    "don't want to see anyone",
    "too tired to go out",
    "avoiding people",
  ],
  stress: [
    "so stressed",
    "can't handle this",
    "overwhelmed",
    "too much pressure",
    "breaking down",
  ],
} as const;

export const HEALTH_THRESHOLDS = {
  mood: {
    baseline_deviation: 1.5,
    critical_low: 4,
    warning_streak: 3,
  },
  sleep: {
    minimum_hours: 6,
    ideal_hours: 7.5,
    poor_quality: 5,
    warning_nights: 3,
  },
  exercise: {
    weekly_minimum: 3,
    streak_milestone: 7,
    missed_warning: 3,
  },
  hrv: {
    drop_threshold: 0.15,
  },
  heart_rate: {
    elevation_threshold: 0.10,
  },
} as const;

export const BARNEY_HEALTH_MESSAGES = {
  workout_complete: [
    "💪 Hell yeah! That's what I'm talking about!",
    "🔥 You crushed it! Your body is thanking you right now.",
    "⚡ Beast mode activated! You NEVER regret a workout.",
    "🎯 Another one in the books! Consistency is your superpower.",
  ],
  workout_skipped: [
    "🏋️ Gym time! Remember: You ALWAYS feel better after.",
    "💪 Quick 15 minutes beats zero. Something is better than nothing.",
    "🎯 You've NEVER regretted a workout. But you've regretted skipping 83% of the time.",
  ],
  sleep_good: [
    "😴 7+ hours! Your brain is thanking you.",
    "🌙 Quality sleep = quality decisions. You're setting yourself up to win.",
    "⚡ Well-rested you is unstoppable. Keep this up!",
  ],
  sleep_poor: [
    "🛏️ Sleep Emergency! Let's get you back on track tonight.",
    "😴 Your body needs recovery. Tonight: early bedtime, no excuses.",
    "🌙 5 nights of poor sleep. Time for the Sleep Rescue Protocol.",
  ],
  mood_improving: [
    "📈 Mood trending up! Whatever you're doing, keep it up.",
    "😊 You're on an upswing! Your patterns show this momentum building.",
    "🎯 +1.8 points this week. You're doing the work and it shows.",
  ],
  mood_declining: [
    "⚠️ Pattern Alert: Similar to rough periods in the past.",
    "🤝 Your support network is there. Reach out before it gets harder.",
    "💭 Early intervention works. Let's catch this before it spirals.",
  ],
  food_energy: [
    "🍽️ Heavy lunch = 2pm crash. You know this pattern.",
    "⚡ Protein breakfast = stable energy. Your data proves it.",
    "🎯 Late dinner = poor sleep 9/10 times. Plan accordingly.",
  ],
  streak_milestone: [
    "🔥 6-day streak! Longest this year!",
    "💪 23 days! You're building something legendary.",
    "⚡ Consistency unlocked! This is who you are now.",
  ],
} as const;

export const FOOD_CATEGORIES = {
  protein: ['chicken', 'beef', 'fish', 'eggs', 'tofu', 'protein shake'],
  carbs: ['rice', 'pasta', 'bread', 'potato', 'oats'],
  vegetables: ['broccoli', 'spinach', 'carrots', 'salad', 'greens'],
  fruits: ['apple', 'banana', 'berries', 'orange'],
  dairy: ['milk', 'cheese', 'yogurt'],
  snacks: ['chips', 'cookies', 'candy', 'chocolate'],
  beverages: ['coffee', 'tea', 'soda', 'juice', 'water'],
} as const;

export const MEAL_TIMING_WINDOWS = {
  breakfast: { start: 6, end: 10 },
  lunch: { start: 11, end: 14 },
  dinner: { start: 17, end: 21 },
  snack: { start: 0, end: 24 },
} as const;

export const SLEEP_STAGE_LABELS = {
  deep: 'Deep Sleep',
  light: 'Light Sleep',
  rem: 'REM Sleep',
  awake: 'Awake',
} as const;

export const ALERT_PRIORITIES = {
  critical: {
    color: '#F44336',
    icon: '🚨',
    sound: true,
  },
  warning: {
    color: '#FF9800',
    icon: '⚠️',
    sound: false,
  },
  info: {
    color: '#2196F3',
    icon: 'ℹ️',
    sound: false,
  },
} as const;

export const CORRELATION_THRESHOLDS = {
  strong: 0.7,
  moderate: 0.5,
  weak: 0.3,
  minimum_samples: 10,
} as const;
