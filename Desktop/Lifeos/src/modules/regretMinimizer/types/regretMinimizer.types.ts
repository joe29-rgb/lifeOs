/**
 * Regret Minimizer Types
 * Type definitions for decision regret prevention
 */

export interface Regret {
  id: string;
  decisionId: string;
  decision: string;
  date: Date;
  confidence: number;
  outcome: 'regret' | 'satisfaction' | 'neutral';
  regretReasons: string[];
  lessons: string[];
  wouldDoAgain: boolean;
  regretIntensity: number;
  category: 'career' | 'relationship' | 'financial' | 'life' | 'health';
}

export interface RedFlag {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  basedOnRegret?: string;
  pattern: string;
}

export interface DecisionCheck {
  decisionId: string;
  redFlags: RedFlag[];
  similarDecisions: SimilarDecision[];
  regretProbability: number;
  riskScore: number;
  checklist: ChecklistItem[];
  gutCheck: GutCheck;
  recommendation: 'proceed' | 'caution' | 'delay' | 'decline';
}

export interface SimilarDecision {
  id: string;
  decision: string;
  date: Date;
  similarities: string[];
  outcome: 'regret' | 'satisfaction' | 'neutral';
  regretIntensity?: number;
  whatWentWrong?: string;
  whatWentRight?: string;
  matchScore: number;
}

export interface ChecklistItem {
  id: string;
  category: string;
  question: string;
  completed: boolean;
  importance: 'essential' | 'important' | 'recommended';
  basedOnRegret?: string;
}

export interface GutCheck {
  feeling: 'off' | 'excited' | 'scared_good' | 'scared_bad' | 'neutral';
  reason?: string;
  timestamp: Date;
  historicalAccuracy: number;
}

export interface RegretPattern {
  pattern: string;
  occurrences: number;
  regretRate: number;
  examples: string[];
  category: string;
}

export interface DelayRecommendation {
  shouldDelay: boolean;
  optimalDays: number;
  reason: string;
  deadline?: Date;
  canNegotiate: boolean;
}

export interface RiskFactors {
  rushing: boolean;
  moneyMotivated: boolean;
  ignoringGut: boolean;
  vagueAnswers: boolean;
  stressed: boolean;
  poorSleep: boolean;
}

export interface ProtectiveFactors {
  goodSleep: boolean;
  talkedToSomeone: boolean;
  didResearch: boolean;
  completedChecklist: boolean;
  trustedGut: boolean;
}

export interface RegretAnalysis {
  totalDecisions: number;
  totalRegrets: number;
  regretRate: number;
  averageRegretIntensity: number;
  topRegretReasons: string[];
  topLessons: string[];
  patterns: RegretPattern[];
}
