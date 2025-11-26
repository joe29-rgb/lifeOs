/**
 * Social Battery Types
 * Type definitions for social energy tracking
 */

export type SocialType = 'introvert' | 'extrovert' | 'ambivert';

export interface BatteryLevel {
  current: number;
  timestamp: Date;
  status: 'full' | 'good' | 'medium' | 'low' | 'critical';
}

export interface SocialEvent {
  id: string;
  type: '1on1' | 'group' | 'work' | 'family' | 'networking';
  duration: number;
  person?: string;
  people?: string[];
  location: 'familiar' | 'unfamiliar';
  drainAmount: number;
  timestamp: Date;
  moodBefore?: number;
  moodAfter?: number;
}

export interface SoloEvent {
  id: string;
  type: 'relaxing' | 'productive' | 'hobby' | 'sleep';
  duration: number;
  rechargeAmount: number;
  timestamp: Date;
  activity?: string;
}

export interface DrainFactors {
  meetingType: '1on1' | 'group' | 'work';
  duration: number;
  energyLevel: 'rested' | 'tired';
  personType: 'close' | 'acquaintance' | 'stranger';
  location: 'familiar' | 'unfamiliar';
}

export interface RechargeFactors {
  duration: number;
  activityType: 'relaxing' | 'productive' | 'hobby' | 'sleep';
  quality: 'high' | 'medium' | 'low';
}

export interface WeeklyPattern {
  day: string;
  batteryLevel: number;
  socialEvents: number;
  soloHours: number;
  status: string;
}

export interface DepletionAlert {
  id: string;
  severity: 'medium' | 'high' | 'critical';
  level: number;
  message: string;
  recommendations: string[];
  timestamp: Date;
}

export interface IsolationAlert {
  id: string;
  daysAlone: number;
  moodTrend: 'declining' | 'stable' | 'improving';
  canceledPlans: number;
  message: string;
  recommendations: string[];
  timestamp: Date;
}

export interface SocialCredit {
  total: number;
  earned: number;
  spent: number;
  history: CreditTransaction[];
}

export interface CreditTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface SocialProfile {
  type: SocialType;
  confidence: number;
  evidence: string[];
  rechargeSpeed: 'fast' | 'medium' | 'slow';
  optimalSoloTime: number;
  preferredFormats: string[];
  energyImpactByPerson: Record<string, number>;
}

export interface ConnectionQuality {
  personId: string;
  personName: string;
  frequency: number;
  depth: number;
  satisfaction: number;
  healthImpact: number;
  recommendation: string;
}

export interface WeeklyPlan {
  days: DayPlan[];
  batteryProjection: number[];
  reasoning: string[];
}

export interface DayPlan {
  day: string;
  activities: string[];
  projectedBattery: number;
  type: 'social' | 'solo' | 'mixed';
}
