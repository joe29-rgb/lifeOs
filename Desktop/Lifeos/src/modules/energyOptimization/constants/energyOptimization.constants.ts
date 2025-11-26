/**
 * Energy Optimization Constants
 * Thresholds, patterns, and recommendations
 */

export const ENERGY_THRESHOLDS = {
  peak: 8.0,
  high: 7.0,
  medium: 5.5,
  low: 4.0,
} as const;

export const TASK_ENERGY_REQUIREMENTS = {
  urgent: 8.0,
  high: 7.0,
  medium: 6.0,
  low: 4.0,
} as const;

export const PATTERN_INDICATORS = {
  morning_person: {
    peakStart: 6,
    peakEnd: 11,
    lowStart: 20,
    lowEnd: 23,
  },
  night_owl: {
    peakStart: 18,
    peakEnd: 23,
    lowStart: 6,
    lowEnd: 10,
  },
  balanced: {
    peakStart: 9,
    peakEnd: 17,
    lowStart: 0,
    lowEnd: 6,
  },
} as const;

export const ACTIVITY_RECOMMENDATIONS = {
  peak: {
    title: 'SCHEDULE HERE',
    activities: [
      'Hard/creative tasks',
      'Important decisions',
      'Complex problem-solving',
      'Strategic planning',
      'Learning new skills',
    ],
  },
  high: {
    title: 'GOOD TIME FOR',
    activities: [
      'Meetings and calls',
      'Collaborative work',
      'Exercise',
      'Project work',
      'Writing',
    ],
  },
  medium: {
    title: 'SUITABLE FOR',
    activities: [
      'Email responses',
      'Administrative tasks',
      'Light reading',
      'Routine work',
      'Planning',
    ],
  },
  low: {
    title: 'AVOID HERE',
    activities: [
      'Complex work',
      'Important calls',
      'Big decisions',
      'Creative tasks',
      'Learning',
    ],
  },
} as const;

export const PRODUCTIVITY_MULTIPLIERS = {
  peak: 1.4,
  high: 1.2,
  medium: 1.0,
  low: 0.7,
} as const;

export const SCHEDULING_RULES = {
  minSampleSize: 5,
  minDataDays: 7,
  maxRescheduleWindow: 7,
  preferredTaskGap: 30,
} as const;

export const ENERGY_INSIGHTS = {
  morning_person: 'Morning person + Evening dip',
  night_owl: 'Night owl + Morning struggle',
  balanced: 'Balanced energy throughout day',
  second_wind: 'Second wind in evening',
  afternoon_slump: 'Afternoon energy dip',
} as const;
