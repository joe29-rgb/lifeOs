/**
 * Daily Briefing Types
 * Complete type definitions for bedtime briefing system
 */

export interface DailySummary {
  userId: string;
  date: Date;
  mood: { average: number; trend: string };
  movement: { steps: number; workouts: number };
  sleep: { duration: number; quality: number };
  meals: { logged: number; energyStable: boolean };
  conversations: { count: number; sentiment: string };
  tasks: { completed: number; procrastinated: number };
  decisions: { logged: number };
  relationships: { status: string };
}

export interface HighlightItem {
  emoji: string;
  text: string;
  type: 'win' | 'achievement' | 'milestone';
}

export interface PatternInsight {
  title: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  actionable: boolean;
  suggestion?: string;
}

export interface TomorrowForecast {
  date: Date;
  energyPrediction: number;
  schedule: ScheduleItem[];
  challenges: ChallengeItem[];
  priorities: string[];
}

export interface ScheduleItem {
  time: string;
  event: string;
  notes?: string;
  stressLevel?: 'low' | 'medium' | 'high';
}

export interface ChallengeItem {
  description: string;
  likelihood: number;
  suggestion: string;
}

export interface PastAdvice {
  date: Date;
  situation: string;
  advice: string;
  outcome?: string;
  relevance: number;
}

export interface RoutineRecommendation {
  windDownTime: string;
  screenOffTime: string;
  lightsOutTime: string;
  sleepGoal: number;
  wakeTime: string;
  predictedEnergy: number;
  reasoning: string[];
}

export interface BriefingSection {
  id: string;
  title: string;
  emoji: string;
  content: DailySummary | HighlightItem[] | PatternInsight[] | TomorrowForecast | PastAdvice[] | RoutineRecommendation;
  order: number;
}

export interface DailyBriefing {
  id: string;
  userId: string;
  date: Date;
  generatedAt: Date;
  sections: {
    summary: DailySummary;
    highlights: HighlightItem[];
    patterns: PatternInsight[];
    forecast: TomorrowForecast;
    pastAdvice: PastAdvice[];
    routine: RoutineRecommendation;
  };
  read: boolean;
  exported: boolean;
}

export interface BriefingPreferences {
  userId: string;
  bedtime: string;
  briefingTime: string;
  enableVoice: boolean;
  enableNotifications: boolean;
  includeSections: string[];
  tone: 'motivational' | 'neutral' | 'analytical';
}

export interface WeeklyTrend {
  metric: string;
  currentWeek: number;
  lastWeek: number;
  change: number;
  trend: 'improving' | 'stable' | 'declining';
}
