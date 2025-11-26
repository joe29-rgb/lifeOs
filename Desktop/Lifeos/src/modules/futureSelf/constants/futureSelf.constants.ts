/**
 * Future Self Constants
 * Projection parameters and scenario definitions
 */

export const PROJECTION_YEARS = 5;

export const TRAJECTORY_THRESHOLDS = {
  improving: 0.5, // +0.5 points per year
  declining: -0.5, // -0.5 points per year
} as const;

export const SCENARIO_TEMPLATES = {
  current_path: {
    name: 'Current Path',
    description: 'Continue with current habits and decisions',
    multipliers: {
      career: 1.0,
      health: 1.0,
      relationships: 1.0,
      mentalHealth: 1.0,
    },
  },
  high_stress_job: {
    name: 'Take High-Stress Job',
    description: 'Accept high-paying but demanding position',
    multipliers: {
      career: 1.3,
      health: 0.6,
      relationships: 0.4,
      mentalHealth: 0.5,
    },
  },
  prioritize_health: {
    name: 'Prioritize Health',
    description: 'Focus on fitness, sleep, and wellness',
    multipliers: {
      career: 0.9,
      health: 1.5,
      relationships: 1.2,
      mentalHealth: 1.3,
    },
  },
  ignore_relationships: {
    name: 'Ignore Relationships',
    description: 'Focus solely on career, neglect social life',
    multipliers: {
      career: 1.2,
      health: 0.9,
      relationships: 0.3,
      mentalHealth: 0.6,
    },
  },
} as const;

export const WARNING_TEMPLATES = {
  burnout: {
    severity: 'critical' as const,
    title: 'Burnout Risk',
    consequence: 'Career satisfaction → 4/10 (burnout), Health → Severe decline (sleep 5hrs)',
    preventionSteps: [
      'Set work-life boundaries',
      'Take regular breaks',
      'Prioritize sleep',
      'Delegate tasks',
    ],
  },
  isolation: {
    severity: 'high' as const,
    title: 'Social Isolation',
    consequence: 'Relationships → Damaged (isolation), Mental health → Decline',
    preventionSteps: [
      'Schedule regular social time',
      'Reach out to friends weekly',
      'Join social groups',
      'Maintain close relationships',
    ],
  },
  health_decline: {
    severity: 'high' as const,
    title: 'Health Deterioration',
    consequence: 'Overall → 4.8/10 (miserable), Energy → Low, Mood → Poor',
    preventionSteps: [
      'Exercise 3x per week',
      'Improve sleep schedule',
      'Eat healthier',
      'Regular health checkups',
    ],
  },
} as const;

export const OPPORTUNITY_TEMPLATES = {
  career_growth: {
    title: 'Career Advancement',
    potentialImpact: 1.5,
    steps: [
      'Pursue skill development',
      'Network with industry leaders',
      'Take on leadership roles',
      'Seek mentorship',
    ],
  },
  relationship_investment: {
    title: 'Deepen Relationships',
    potentialImpact: 2.0,
    steps: [
      'Weekly 1:1s with close friends',
      'Express gratitude regularly',
      'Be present and attentive',
      'Resolve conflicts quickly',
    ],
  },
  wellness_focus: {
    title: 'Optimize Health',
    potentialImpact: 1.8,
    steps: [
      'Establish exercise routine',
      'Prioritize 8hrs sleep',
      'Meal prep healthy food',
      'Practice stress management',
    ],
  },
} as const;

export const MILESTONE_EVENTS = {
  year1: [
    'Got promoted',
    'Health improved',
    'Maintained key relationships',
    'Developed new skills',
  ],
  year2: [
    'Stabilized career',
    'Exercise habit solid',
    'Expanded friend group',
    'Improved work-life balance',
  ],
  year3: [
    'Senior role achieved',
    'Mental health thriving',
    'Relationships deepened',
    'Financial stability',
  ],
  year4: [
    'Leadership opportunities',
    'Peak physical health',
    'Life satisfaction high',
    'Strong support network',
  ],
  year5: [
    'Thriving career',
    'Excellent health',
    'Relationships excellent',
    'Life goals achieved',
  ],
} as const;
