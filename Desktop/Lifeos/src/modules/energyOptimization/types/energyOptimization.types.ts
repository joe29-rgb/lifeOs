/**
 * Energy Optimization Types
 * Type definitions for energy pattern tracking and task scheduling
 */

export interface EnergyPattern {
  hour: number;
  averageEnergy: number;
  level: 'peak' | 'high' | 'medium' | 'low';
  sampleSize: number;
}

export interface DailyEnergyProfile {
  peakHours: number[];
  highHours: number[];
  mediumHours: number[];
  lowHours: number[];
  pattern: 'morning_person' | 'night_owl' | 'balanced';
  secondWind: boolean;
  afternoonSlump: boolean;
}

export interface TaskOptimization {
  taskId: string;
  taskName: string;
  duration: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  currentSchedule?: Date;
  currentEnergyLevel?: number;
  recommendedSchedule: Date;
  recommendedEnergyLevel: number;
  productivityGain: number;
  reasoning: string[];
}

export interface SchedulingSuccess {
  totalTasks: number;
  tasksInPeakEnergy: number;
  tasksInHighEnergy: number;
  tasksInMediumEnergy: number;
  tasksInLowEnergy: number;
  successRate: number;
  estimatedProductivityGain: number;
}

export interface EnergyRecommendation {
  type: 'schedule' | 'avoid' | 'optimize';
  title: string;
  description: string;
  timeWindow: string;
  energyLevel: number;
  activities: string[];
}

export interface ProductivityPrediction {
  taskId: string;
  scheduledTime: Date;
  predictedEnergy: number;
  predictedFocus: number;
  predictedProductivity: number;
  confidence: number;
}
