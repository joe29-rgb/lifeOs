/**
 * Future Self Types
 * Type definitions for 5-year life projection and scenario simulation
 */

export interface FutureProjection {
  userId: string;
  projectionDate: Date; // 5 years from now
  currentScore: number; // Current life score
  projectedScore: number; // Projected life score
  trajectory: 'improving' | 'stable' | 'declining';
  pillars: {
    career: PillarProjection;
    health: PillarProjection;
    relationships: PillarProjection;
    mentalHealth: PillarProjection;
  };
  warnings: Warning[];
  opportunities: Opportunity[];
}

export interface PillarProjection {
  pillarName: string;
  currentScore: number;
  projectedScore: number;
  trend: 'improving' | 'stable' | 'declining';
  details: string[];
  keyMetrics: Record<string, { current: number | string; projected: number | string }>;
}

export interface Warning {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  pillar: string;
  title: string;
  description: string;
  consequence: string;
  preventionSteps: string[];
}

export interface Opportunity {
  id: string;
  pillar: string;
  title: string;
  description: string;
  potentialImpact: number; // +X points to life score
  steps: string[];
}

export interface LifeScenario {
  id: string;
  name: string;
  description: string;
  projectedScore: number;
  pillars: {
    career: number;
    health: number;
    relationships: number;
    mentalHealth: number;
  };
  pros: string[];
  cons: string[];
  recommendation: string;
}

export interface YearlyMilestone {
  year: number;
  date: Date;
  lifeScore: number;
  trajectory: 'improving' | 'stable' | 'declining';
  keyEvents: string[];
  pillarScores: {
    career: number;
    health: number;
    relationships: number;
    mentalHealth: number;
  };
}

export interface FutureTimeline {
  userId: string;
  startDate: Date;
  endDate: Date;
  milestones: YearlyMilestone[];
  overallTrajectory: 'improving' | 'stable' | 'declining';
  finalScore: number;
}
