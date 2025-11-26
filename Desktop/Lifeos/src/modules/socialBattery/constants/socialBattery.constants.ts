/**
 * Social Battery Constants
 * Drain rates, recharge rates, thresholds, alerts
 */

export const DRAIN_RATES = {
  meeting_type: {
    '1on1': 0.15,
    group: 0.35,
    work: 0.25,
    family: 0.20,
    networking: 0.40,
  },
  duration: {
    30: 10,
    60: 20,
    120: 40,
    180: 60,
    240: 80,
  },
  person_type: {
    close: 0.8,
    acquaintance: 1.0,
    stranger: 1.3,
  },
  location: {
    familiar: 0.9,
    unfamiliar: 1.2,
  },
  energy_multiplier: {
    rested: 1.0,
    tired: 2.0,
  },
} as const;

export const RECHARGE_RATES = {
  activity_type: {
    relaxing: 30,
    productive: 15,
    hobby: 40,
    sleep: 25,
  },
  duration: {
    60: 20,
    120: 40,
    240: 80,
    480: 100,
  },
} as const;

export const BATTERY_THRESHOLDS = {
  full: 90,
  good: 60,
  medium: 40,
  low: 25,
  critical: 15,
} as const;

export const ISOLATION_THRESHOLDS = {
  days_alone: 5,
  canceled_plans: 3,
  mood_decline: 2,
} as const;

export const SOCIAL_TYPE_INDICATORS = {
  introvert: {
    recharge_speed: 'fast',
    group_drain_multiplier: 1.5,
    solo_preference: 0.7,
    optimal_solo_hours: 8,
  },
  extrovert: {
    recharge_speed: 'slow',
    group_drain_multiplier: 0.7,
    solo_preference: 0.3,
    optimal_solo_hours: 3,
  },
  ambivert: {
    recharge_speed: 'medium',
    group_drain_multiplier: 1.0,
    solo_preference: 0.5,
    optimal_solo_hours: 5,
  },
} as const;

export const CREDIT_VALUES = {
  earn: {
    quality_1on1_hour: 10,
    deep_conversation: 5,
    help_friend: 20,
    strengthen_relationship: 5,
  },
  spend: {
    group_event_small: 20,
    group_event_large: 30,
    work_conference: 50,
    obligation_social: 15,
    networking: 25,
  },
} as const;

export const DEPLETION_MESSAGES = {
  medium: {
    title: '⚠️ Social Battery: 50%',
    message: 'You\'ve been socially active for several days. Time to recharge is approaching.',
    recommendations: [
      'Decline social plans next 1-2 days',
      'Schedule solo time this evening',
      'Do restorative activity (reading, hobby)',
      'Get good sleep (recharges 2x better)',
    ],
  },
  high: {
    title: '🚨 Social Battery: Low (25%)',
    message: 'You\'re getting socially depleted. Take action soon.',
    recommendations: [
      'Avoid new social commitments today',
      'Schedule 2-4 hours alone time',
      'Cancel non-essential plans if needed',
      'Engage in solo hobby/activity',
    ],
  },
  critical: {
    title: '🚨 SOCIAL BATTERY: CRITICAL (15%)',
    message: 'You\'re socially depleted. Keep going and you\'ll feel irritable, anxious, and disconnected.',
    recommendations: [
      'DO NOT schedule new social events today',
      'Alone time: 4-6 hours minimum',
      'Sleep: 9+ hours if possible',
      'Solo hobby/activity required',
      'Cancel non-essential plans',
    ],
  },
} as const;

export const ISOLATION_MESSAGES = {
  warning: {
    title: '🚨 ISOLATION ALERT',
    message: 'You\'ve been mostly solo for 5+ days. This can impact your mental health.',
    signs: [
      'Haven\'t had meaningful conversation in days',
      'Canceled multiple social plans this week',
      'Mood may be declining',
      'Feeling lonely despite wanting alone time',
    ],
    recommendations: [
      'Schedule 1-2 social interactions this week',
      'Reach out to a close friend',
      'Consider if you\'re avoiding vs. recharging',
      'Monitor your mood and energy',
    ],
  },
} as const;

export const WEEKLY_PLAN_TEMPLATES = {
  introvert: [
    { day: 'Monday', type: 'mixed' as const, activities: ['Team lunch', 'Evening solo'] },
    { day: 'Tuesday', type: 'social' as const, activities: ['1:1 with friend'] },
    { day: 'Wednesday', type: 'solo' as const, activities: ['Work solo', 'Gym'] },
    { day: 'Thursday', type: 'solo' as const, activities: ['Recharge day'] },
    { day: 'Friday', type: 'mixed' as const, activities: ['Optional hangout if energy >60%'] },
    { day: 'Saturday', type: 'social' as const, activities: ['Group brunch (post-solo-day)'] },
    { day: 'Sunday', type: 'solo' as const, activities: ['Family OR solo (your choice)'] },
  ],
  extrovert: [
    { day: 'Monday', type: 'social' as const, activities: ['Team lunch', 'Evening plans'] },
    { day: 'Tuesday', type: 'social' as const, activities: ['Group activity'] },
    { day: 'Wednesday', type: 'mixed' as const, activities: ['Work meetings', 'Solo evening'] },
    { day: 'Thursday', type: 'social' as const, activities: ['Dinner with friends'] },
    { day: 'Friday', type: 'social' as const, activities: ['Happy hour'] },
    { day: 'Saturday', type: 'social' as const, activities: ['Group event'] },
    { day: 'Sunday', type: 'mixed' as const, activities: ['Brunch', 'Solo recharge'] },
  ],
  ambivert: [
    { day: 'Monday', type: 'mixed' as const, activities: ['Work meetings', 'Solo evening'] },
    { day: 'Tuesday', type: 'social' as const, activities: ['1:1 with friend'] },
    { day: 'Wednesday', type: 'solo' as const, activities: ['Solo work day'] },
    { day: 'Thursday', type: 'social' as const, activities: ['Small group dinner'] },
    { day: 'Friday', type: 'mixed' as const, activities: ['Work', 'Optional plans'] },
    { day: 'Saturday', type: 'social' as const, activities: ['Social activity'] },
    { day: 'Sunday', type: 'solo' as const, activities: ['Recharge day'] },
  ],
} as const;

export const CONNECTION_QUALITY_THRESHOLDS = {
  frequency: {
    excellent: 4,
    good: 2,
    okay: 1,
    poor: 0.5,
  },
  depth: {
    deep: 8,
    medium: 5,
    shallow: 3,
  },
  satisfaction: {
    high: 7,
    medium: 5,
    low: 3,
  },
} as const;
