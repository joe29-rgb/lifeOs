/**
 * Smart Alarm Constants
 * Sleep cycle parameters and wake quality thresholds
 */

export const SLEEP_CYCLE = {
  standardLength: 90, // minutes
  minLength: 80,
  maxLength: 100,
  phaseDurations: {
    light: 30, // minutes
    deep: 40,
    rem: 20,
  },
} as const;

export const WAKE_WINDOWS = {
  optimal: 30, // ±30 minutes flexibility
  minimum: 15,
  maximum: 45,
} as const;

export const SLEEP_PHASES = {
  light: {
    name: 'Light Sleep',
    wakeQuality: 8,
    grogginess: 2,
    description: 'Easy to wake, minimal grogginess',
  },
  deep: {
    name: 'Deep Sleep',
    wakeQuality: 3,
    grogginess: 9,
    description: 'Very difficult to wake, high grogginess',
  },
  rem: {
    name: 'REM Sleep',
    wakeQuality: 5,
    grogginess: 6,
    description: 'Moderate difficulty, some grogginess',
  },
} as const;

export const QUALITY_THRESHOLDS = {
  excellent: 8,
  good: 6,
  fair: 4,
  poor: 2,
} as const;

export const RECOMMENDED_SLEEP = {
  minimum: 6, // hours
  optimal: 8,
  maximum: 10,
} as const;

export const ALARM_MESSAGES = {
  lightSleep: 'Perfect timing! You\'re in light sleep.',
  deepSleep: 'Waking you early to avoid deep sleep.',
  remSleep: 'Waking you during REM for better alertness.',
  cycleComplete: 'All sleep cycles complete!',
  cycleIncomplete: 'Waking at best available time.',
} as const;
