/**
 * Health Intelligence Types
 * Complete type definitions for mental/physical health tracking
 */

export type MoodLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type EnergyLevel = 'energized' | 'normal' | 'sluggish' | 'exhausted';

export type SleepQuality = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type WorkoutType = 'cardio' | 'strength' | 'yoga' | 'sports' | 'walking' | 'other';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type HealthTrend = 'improving' | 'stable' | 'declining';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodLevel;
  emoji: string;
  notes?: string;
  timestamp: Date;
  triggers?: string[];
}

export interface MentalHealthBaseline {
  userId: string;
  averageMood: number;
  moodRange: { min: number; max: number };
  typicalTriggers: string[];
  supportNetwork: string[];
  calculatedAt: Date;
  sampleSize: number;
}

export interface MentalHealthAlert {
  id: string;
  userId: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  signals: string[];
  suggestions: string[];
  comparisonPeriod?: string;
  createdAt: Date;
  acknowledged: boolean;
}

export interface FoodEntry {
  id: string;
  userId: string;
  mealType: MealType;
  foods: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  energyAfter?: EnergyLevel;
  moodAfter?: MoodLevel;
  timestamp: Date;
  source: 'voice' | 'photo' | 'manual';
  photoUri?: string;
}

export interface MealPattern {
  id: string;
  userId: string;
  pattern: string;
  description: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  examples: string[];
  createdAt: Date;
}

export interface SleepEntry {
  id: string;
  userId: string;
  bedtime: Date;
  wakeTime: Date;
  duration: number;
  quality: SleepQuality;
  interruptions?: number;
  sleepStages?: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
  source: 'wearable' | 'manual';
  notes?: string;
}

export interface SleepPattern {
  id: string;
  userId: string;
  idealDuration: number;
  bestBedtime: string;
  worstBedtime: string;
  factors: {
    positive: string[];
    negative: string[];
  };
  createdAt: Date;
}

export interface ExerciseEntry {
  id: string;
  userId: string;
  type: WorkoutType;
  duration: number;
  intensity?: 'light' | 'moderate' | 'intense';
  steps?: number;
  calories?: number;
  heartRate?: { avg: number; max: number };
  timestamp: Date;
  source: 'wearable' | 'manual' | 'audio';
  notes?: string;
}

export interface ExerciseStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastWorkout: Date;
  missedWorkouts: number;
  totalWorkouts: number;
}

export interface HealthCorrelation {
  id: string;
  userId: string;
  factor1: string;
  factor2: string;
  correlation: number;
  description: string;
  confidence: number;
  sampleSize: number;
  examples: string[];
  createdAt: Date;
}

export interface EarlyWarningSignal {
  type: 'speech' | 'behavior' | 'biometric' | 'relationship';
  metric: string;
  currentValue: number;
  baselineValue: number;
  deviation: number;
  severity: AlertSeverity;
}

export interface HealthStats {
  userId: string;
  period: 'day' | 'week' | 'month';
  averageMood: number;
  averageSleep: number;
  totalWorkouts: number;
  totalSteps: number;
  mealsLogged: number;
  moodTrend: HealthTrend;
  sleepTrend: HealthTrend;
  activityTrend: HealthTrend;
}

export interface BiometricData {
  userId: string;
  timestamp: Date;
  heartRate?: number;
  hrv?: number;
  restingHeartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  oxygenSaturation?: number;
  temperature?: number;
  source: string;
}
