/**
 * Decision Intelligence - Type Definitions
 */

export type DecisionStatus = 'pending' | 'made' | 'reviewed';
export type DecisionCategory = 'career' | 'relationship' | 'financial' | 'health' | 'lifestyle' | 'other';
export type EmotionType = 'excited' | 'anxious' | 'confident' | 'uncertain' | 'hopeful' | 'worried';
export type OutcomeSatisfaction = 1 | 2 | 3 | 4 | 5;

export interface DecisionChoice {
  id: string;
  description: string;
  pros: string[];
  cons: string[];
  excitement: number; // 1-5
  concerns: string[];
}

export interface Decision {
  id: string;
  userId: string;
  title: string;
  description: string;
  choices: DecisionChoice[];
  selectedChoiceId?: string;
  confidence: number; // 1-5
  emotions: EmotionType[];
  consultedPeople: string[]; // Person IDs
  category: DecisionCategory;
  status: DecisionStatus;
  createdAt: Date;
  decidedAt?: Date;
  reviewScheduledFor?: Date;
  voiceTranscript?: string;
  detectedFromAudio: boolean;
}

export interface DecisionOutcome {
  id: string;
  decisionId: string;
  userId: string;
  satisfaction: OutcomeSatisfaction;
  whatWentRight: string[];
  whatWentWrong: string[];
  adviceToPastSelf: string;
  wouldChooseSameAgain: boolean;
  reviewedAt: Date;
}

export interface DecisionPattern {
  id: string;
  userId: string;
  patternType: 'time_of_day' | 'category' | 'emotion' | 'consultation' | 'confidence';
  description: string;
  successRate: number;
  sampleSize: number;
  insight: string;
  createdAt: Date;
}

export interface DecisionAdvice {
  id: string;
  decisionId: string;
  sourceDecisionId: string; // Similar past decision
  advice: string;
  pastOutcome: string;
  relevanceScore: number;
  createdAt: Date;
}

export interface DecisionDetectionConfig {
  phrases: string[];
  confidenceThreshold: number;
  autoPopup: boolean;
}

export interface DecisionStats {
  totalDecisions: number;
  reviewedDecisions: number;
  averageSatisfaction: number;
  bestCategory: DecisionCategory;
  worstCategory: DecisionCategory;
  bestTimeOfDay: number;
  worstTimeOfDay: number;
  highestSuccessRate: number;
  patternsIdentified: number;
}
