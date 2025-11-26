/**
 * Relationship ROI Types
 * Type definitions for relationship value tracking
 */

export interface ROIScore {
  personId: string;
  personName: string;
  overall: number;
  joy: number;
  energyImpact: number;
  supportBalance: number;
  growthImpact: number;
  reliability: number;
  category: 'high' | 'good' | 'medium' | 'low' | 'negative';
  timestamp: Date;
}

export interface EnergyImpact {
  personId: string;
  personName: string;
  impact: number;
  moodChange: number;
  interactions: number;
  avoidanceCount: number;
  pattern: 'energizer' | 'neutral' | 'drainer';
  evidence: string[];
}

export interface SupportBalance {
  personId: string;
  personName: string;
  given: number;
  received: number;
  ratio: number;
  status: 'reciprocal' | 'give_more' | 'receive_more' | 'imbalanced';
  history: SupportEvent[];
}

export interface SupportEvent {
  id: string;
  personId: string;
  type: 'given' | 'received';
  category: 'emotional' | 'practical' | 'advice' | 'time';
  description: string;
  timestamp: Date;
}

export interface GrowthImpact {
  personId: string;
  personName: string;
  score: number;
  inspires: boolean;
  challenges: boolean;
  newPerspectives: boolean;
  holdsBack: boolean;
  evidence: string[];
}

export interface ReliabilityScore {
  personId: string;
  personName: string;
  score: number;
  showUpRate: number;
  responseTime: number;
  cancelRate: number;
  followThrough: number;
}

export interface InvestmentRecommendation {
  personId: string;
  personName: string;
  currentROI: number;
  action: 'increase' | 'maintain' | 'decrease';
  currentHours: number;
  suggestedHours: number;
  reasoning: string[];
  potentialImpact: number;
}

export interface RelationshipTrend {
  personId: string;
  personName: string;
  roiHistory: { date: Date; roi: number }[];
  joyHistory: { date: Date; joy: number }[];
  energyHistory: { date: Date; energy: number }[];
  trend: 'improving' | 'stable' | 'declining';
  insight: string;
}

export interface PortfolioHealth {
  overallScore: number;
  highROICount: number;
  mediumROICount: number;
  lowROICount: number;
  energyBalance: number;
  supportBalance: number;
  joyAverage: number;
  strengths: string[];
  concerns: string[];
  improvements: { action: string; impact: number }[];
}

export interface GratitudePrompt {
  id: string;
  personId: string;
  personName: string;
  reason: string;
  recentMoments: string[];
  suggestedMessage: string;
  timestamp: Date;
}

export interface EnergyVampire {
  personId: string;
  personName: string;
  severity: 'mild' | 'moderate' | 'severe';
  joyScore: number;
  energyImpact: number;
  moodDrop: number;
  avoidanceCount: number;
  supportRatio: number;
  evidence: string[];
  options: VampireOption[];
}

export interface VampireOption {
  type: 'boundaries' | 'conversation' | 'distance' | 'exit';
  title: string;
  actions: string[];
  description: string;
}

export interface TimeAllocation {
  personId: string;
  personName: string;
  currentHours: number;
  suggestedHours: number;
  change: number;
  roi: number;
}
