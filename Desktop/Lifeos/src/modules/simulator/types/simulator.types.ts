/**
 * Life Path Simulator Types
 * Complete type definitions for career trajectory analysis and simulation
 */

export type CareerStage = 'early' | 'mid' | 'senior' | 'executive';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance';

export type WorkMode = 'onsite' | 'remote' | 'hybrid';

export interface Career {
  id: string;
  userId: string;
  currentJob: Job;
  jobHistory: Job[];
  skills: Skill[];
  careerStage: CareerStage;
  baselineSalary: number;
  satisfactionTrend: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  salary: number;
  location: string;
  workMode: WorkMode;
  type: JobType;
  startDate: Date;
  endDate?: Date;
  satisfaction?: number;
  stressLevel?: number;
  skills: string[];
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  category: string;
  yearsExperience: number;
  lastUsed: Date;
  inDemand: boolean;
  marketValue: number;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: { min: number; max: number };
  workMode: WorkMode;
  type: JobType;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  postedDate: Date;
  url: string;
  source: string;
  matchScore: number;
}

export interface Simulation {
  id: string;
  userId: string;
  name: string;
  description: string;
  baselineJob: Job;
  alternateJob: Job;
  projectionYears: number;
  createdAt: Date;
  results: SimulationResults;
}

export interface SimulationResults {
  baseline: PathProjection;
  alternate: PathProjection;
  comparison: ComparisonMetrics;
  recommendation: string;
  regretProbability: number;
  confidenceScore: number;
}

export interface PathProjection {
  salaryTrajectory: YearlyMetric[];
  satisfactionTrajectory: YearlyMetric[];
  skillDevelopment: string[];
  careerMilestones: Milestone[];
  healthImpact: HealthProjection;
  relationshipImpact: RelationshipProjection;
  workLifeBalance: number;
}

export interface YearlyMetric {
  year: number;
  value: number;
  confidence: number;
}

export interface Milestone {
  year: number;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface HealthProjection {
  sleepHours: number;
  stressLevel: number;
  exerciseFrequency: number;
  overallHealth: number;
  risks: string[];
}

export interface RelationshipProjection {
  socialImpact: number;
  relocationStrain: number;
  workScheduleImpact: number;
  overallRelationships: number;
  risks: string[];
}

export interface ComparisonMetrics {
  salaryDifference: number;
  satisfactionDifference: number;
  healthDifference: number;
  relationshipDifference: number;
  overallScore: number;
  winner: 'baseline' | 'alternate' | 'tie';
}

export interface SkillGap {
  skill: string;
  importance: 'critical' | 'important' | 'useful';
  marketDemand: number;
  learningPath: LearningStep[];
  estimatedTime: number;
  salaryImpact: number;
}

export interface LearningStep {
  title: string;
  description: string;
  duration: number;
  cost: number;
  provider?: string;
  url?: string;
}

export interface CareerTrajectory {
  userId: string;
  currentSalary: number;
  projectedSalary: YearlyMetric[];
  satisfactionTrend: 'improving' | 'stable' | 'declining';
  skillVelocity: number;
  marketPosition: number;
  opportunities: number;
}

export interface RegretPattern {
  decisionType: string;
  regretRate: number;
  commonFactors: string[];
  recommendations: string[];
  sampleSize: number;
}

export interface JobMatchCriteria {
  skills: string[];
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  workMode?: WorkMode;
  type?: JobType;
  keywords?: string[];
}

export interface CareerPriorities {
  userId: string;
  workLifeBalance: number;
  salary: number;
  cuttingEdgeTech: number;
  careerGrowth: number;
  companyReputation: number;
  teamCulture: number;
  remoteFlexibility: number;
  impactfulWork: number;
}

export interface OpportunityAlert {
  id: string;
  userId: string;
  opportunity: JobOpportunity;
  matchScore: number;
  priorityScore: number;
  insights: string[];
  createdAt: Date;
  dismissed: boolean;
}
