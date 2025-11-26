/**
 * Integration Layer Types
 * Cross-pillar patterns, insights, recommendations, predictions, goals
 */

export type PillarType = 'procrastination' | 'decisions' | 'relationships' | 'health' | 'simulator';

export type PatternType = 'causal' | 'correlational' | 'predictive';

export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface DataPoint {
  id: string;
  pillar: PillarType;
  timestamp: Date;
  type: string;
  value: number;
  metadata: Record<string, unknown>;
}

export interface Pattern {
  id: string;
  type: PatternType;
  pillarA: PillarType;
  pillarB: PillarType;
  eventA: string;
  eventB: string;
  correlation: number;
  occurrences: number;
  confidence: ConfidenceLevel;
  strength: number;
  description: string;
  createdAt: Date;
  lastSeen: Date;
  userFeedback?: 'helpful' | 'not_helpful';
}

export interface Insight {
  id: string;
  pattern: Pattern;
  message: string;
  impact: 'positive' | 'negative' | 'neutral';
  actionable: boolean;
  actions?: string[];
  score: number;
  createdAt: Date;
  dismissed: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  pillars: PillarType[];
  priority: number;
  impact: number;
  urgency: number;
  effort: number;
  confidence: number;
  actions: Action[];
  reasoning: string;
  createdAt: Date;
  completed: boolean;
}

export interface Action {
  id: string;
  title: string;
  pillar: PillarType;
  description: string;
  completed: boolean;
  dueDate?: Date;
}

export interface Prediction {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'annual';
  pillar: PillarType;
  metric: string;
  predictedValue: number;
  confidence: number;
  reasoning: string;
  validUntil: Date;
  createdAt: Date;
  actualValue?: number;
  accuracy?: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  timeline: number;
  targetDate: Date;
  requirements: GoalRequirement[];
  currentScore: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface GoalRequirement {
  id: string;
  pillar: PillarType;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  actions: string[];
}

export interface PillarHealth {
  pillar: PillarType;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  message: string;
}

export interface LifeIntelligence {
  overallScore: number;
  weeklyChange: number;
  topInsight: Insight | null;
  pillarHealth: PillarHealth[];
  smartActions: Recommendation[];
  weekForecast: WeekForecast;
  updatedAt: Date;
}

export interface WeekForecast {
  energy: number;
  productivity: 'low' | 'medium' | 'high';
  mood: number;
  career: 'declining' | 'stable' | 'improving';
  risks: string[];
  opportunities: string[];
}

export interface MemoryQuery {
  query: string;
  pillars?: PillarType[];
  dateRange?: { start: Date; end: Date };
  limit?: number;
}

export interface MemoryResult {
  id: string;
  pillar: PillarType;
  timestamp: Date;
  type: string;
  content: string;
  relevance: number;
  context: Record<string, unknown>;
}

export interface CorrelationData {
  pillarA: PillarType;
  pillarB: PillarType;
  eventsA: DataPoint[];
  eventsB: DataPoint[];
  timeWindow: number;
}

export interface InsightTemplate {
  pattern: string;
  message: (a: string, b: string, strength: number) => string;
  actions: (a: string, b: string) => string[];
}
