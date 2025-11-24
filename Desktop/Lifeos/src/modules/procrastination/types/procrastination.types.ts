/**
 * Procrastination Module - Type Definitions
 * Mobile-optimized types for the legendary productivity system
 */

export type InterventionLevel = 'gentle' | 'firm' | 'epic';

export type ProcrastinationTrigger = 
  | 'voice_detection'
  | 'idle_time'
  | 'distraction_app'
  | 'biometric_low_energy'
  | 'task_overdue'
  | 'pattern_match'
  | 'manual';

export type InterventionResponse = 
  | 'started_task'
  | 'delayed_5min'
  | 'broke_down_task'
  | 'enabled_focus_mode'
  | 'called_support'
  | 'dismissed'
  | 'ignored';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

export type FocusModeStatus = 'inactive' | 'active' | 'break';

export interface ProcrastinationPattern {
  id: string;
  userId: string;
  triggerType: ProcrastinationTrigger;
  timeOfDay: number; // Hour (0-23)
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  location?: string;
  distractionApp?: string;
  frequency: number; // How many times this pattern occurred
  successfulIntervention?: InterventionLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedMinutes?: number;
  dueDate?: Date;
  status: TaskStatus;
  subtasks?: Subtask[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface ProcrastinationEvent {
  id: string;
  userId: string;
  taskId?: string;
  trigger: ProcrastinationTrigger;
  detectedAt: Date;
  interventionLevel: InterventionLevel;
  interventionMessage: string;
  userResponse?: InterventionResponse;
  respondedAt?: Date;
  wasSuccessful: boolean;
  metadata?: {
    idleMinutes?: number;
    distractionApp?: string;
    voicePhrase?: string;
    biometricData?: BiometricData;
  };
}

export interface BiometricData {
  heartRateVariability?: number;
  movementMinutes?: number;
  energyLevel?: 'low' | 'medium' | 'high';
  lastActivityTime?: Date;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  startedAt: Date;
  endedAt?: Date;
  targetMinutes: number;
  actualMinutes?: number;
  completed: boolean;
  distractionsBlocked: number;
  pomodoroCount: number;
  rewardEarned?: string;
}

export interface InterventionConfig {
  level: InterventionLevel;
  message: string;
  actions: InterventionAction[];
  hapticPattern?: 'light' | 'medium' | 'heavy';
  soundEffect?: string;
  barneyMode: boolean; // Legendary motivational style
}

export interface InterventionAction {
  id: string;
  label: string;
  type: InterventionResponse;
  primary?: boolean;
}

export interface UserProcrastinationProfile {
  userId: string;
  totalEvents: number;
  successfulInterventions: number;
  preferredInterventionLevel: InterventionLevel;
  mostEffectiveIntervention: InterventionLevel;
  commonTriggers: ProcrastinationTrigger[];
  peakProcrastinationHours: number[];
  currentStreak: number; // Days without procrastination
  longestStreak: number;
  totalFocusMinutes: number;
  averageTaskCompletionTime: number;
  updatedAt: Date;
}

export interface Affirmation {
  id: string;
  text: string;
  style: 'barney' | 'motivational' | 'gentle' | 'epic';
  category: 'start' | 'progress' | 'completion' | 'struggle';
  personalizable: boolean;
}

export interface DistractionApp {
  packageName: string;
  displayName: string;
  category: 'social' | 'entertainment' | 'games' | 'news' | 'other';
  blocked: boolean;
}

export interface PomodoroConfig {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  notificationEnabled: boolean;
  hapticEnabled: boolean;
}

export interface RewardConfig {
  type: 'confetti' | 'affirmation' | 'unlock' | 'streak' | 'achievement';
  title: string;
  message: string;
  icon?: string;
  unlockApps?: string[];
}
