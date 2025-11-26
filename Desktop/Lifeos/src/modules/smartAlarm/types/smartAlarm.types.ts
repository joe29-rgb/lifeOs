/**
 * Smart Alarm Types
 * Type definitions for sleep cycle tracking and smart wake-up
 */

export interface SleepCycle {
  cycleNumber: number;
  startTime: Date;
  endTime: Date;
  phase: 'light' | 'deep' | 'rem';
  duration: number; // minutes
}

export interface SleepForecast {
  bedtime: Date;
  wakeTime: Date;
  totalDuration: number; // hours
  completeCycles: number;
  cycles: SleepCycle[];
  optimalWakeWindow: {
    start: Date;
    end: Date;
  };
  expectedQuality: number; // 0-10
  expectedGrogginess: number; // 0-10
}

export interface SmartAlarm {
  id: string;
  userId: string;
  standardWakeTime: Date;
  flexibilityMinutes: number; // ±30 minutes
  enabled: boolean;
  actualWakeTime?: Date;
  wakeQuality?: number; // 0-10
  grogginess?: number; // 0-10
  createdAt: Date;
}

export interface AlarmOptimization {
  alarmId: string;
  recommendedWakeTime: Date;
  inLightSleep: boolean;
  sleepCycleCompletion: number; // percentage
  expectedWakeQuality: number; // 0-10
  expectedGrogginess: number; // 0-10
  reasoning: string[];
  comparison: {
    traditional: {
      wakeQuality: number;
      grogginess: number;
    };
    smart: {
      wakeQuality: number;
      grogginess: number;
    };
    improvement: number; // percentage
  };
}

export interface SleepPattern {
  userId: string;
  averageBedtime: Date;
  averageWakeTime: Date;
  averageDuration: number; // hours
  cycleLength: number; // minutes (typically 90)
  lightSleepPercentage: number;
  deepSleepPercentage: number;
  remSleepPercentage: number;
}
