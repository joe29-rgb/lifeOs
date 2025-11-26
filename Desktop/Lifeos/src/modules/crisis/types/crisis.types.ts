/**
 * Crisis Types
 * Type definitions for mental health emergency support
 */

export type CrisisSeverity = 'mild' | 'moderate' | 'severe' | 'critical';

export interface CrisisSignal {
  id: string;
  type: 'voice' | 'behavioral' | 'cross_pillar';
  source: string;
  severity: CrisisSeverity;
  indicators: string[];
  timestamp: Date;
  confidence: number;
}

export interface CrisisDetection {
  severity: CrisisSeverity;
  signals: CrisisSignal[];
  riskScore: number;
  detectedAt: Date;
  triggers: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  description?: string;
  autoNotify: boolean;
  priority: number;
}

export interface CopingTool {
  id: string;
  type: 'breathing' | 'grounding' | 'affirmation' | 'conversation';
  name: string;
  description: string;
  duration: number;
  instructions: string[];
}

export interface BreathingPattern {
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  rounds: number;
}

export interface CrisisJournalEntry {
  id: string;
  timestamp: Date;
  intensity: number;
  description: string;
  whatHelped: string[];
  needsNow: string[];
  resolved: boolean;
}

export interface CrisisResponse {
  severity: CrisisSeverity;
  message: string;
  actions: CrisisAction[];
  resources: EmergencyResource[];
  copingTools: CopingTool[];
}

export interface CrisisAction {
  id: string;
  label: string;
  type: 'call' | 'text' | 'navigate' | 'tool';
  target: string;
  urgent: boolean;
}

export interface EmergencyResource {
  name: string;
  phone: string;
  description: string;
  available: string;
  type: 'hotline' | 'emergency' | 'text' | 'professional';
}

export interface RecoveryCheckIn {
  id: string;
  crisisId: string;
  timestamp: Date;
  feeling: 'much_better' | 'little_better' | 'still_struggling' | 'worse';
  selfCareCompleted: string[];
  needsFollowUp: boolean;
}
