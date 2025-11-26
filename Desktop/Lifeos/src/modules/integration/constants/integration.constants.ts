/**
 * Integration Layer Constants
 * Correlation thresholds, confidence levels, insight templates
 */

export const CORRELATION_THRESHOLDS = {
  weak: 0.3,
  moderate: 0.5,
  strong: 0.7,
  very_strong: 0.85,
} as const;

export const CONFIDENCE_LEVELS = {
  low: { min: 0, max: 0.5, occurrences: 3 },
  medium: { min: 0.5, max: 0.7, occurrences: 5 },
  high: { min: 0.7, max: 0.85, occurrences: 8 },
  very_high: { min: 0.85, max: 1.0, occurrences: 12 },
} as const;

export const PATTERN_TIME_WINDOW = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export const MIN_OCCURRENCES = 5;

export const INSIGHT_TEMPLATES = {
  sleep_procrastination: {
    pattern: 'sleep_low_procrastination_high',
    message: (correlation: number) =>
      `Poor sleep → ${correlation.toFixed(1)}× higher procrastination rate`,
    actions: ['Set sleep goal: 7+ hours', 'Track sleep-productivity correlation'],
  },
  sleep_decisions: {
    pattern: 'sleep_high_decisions_good',
    message: (correlation: number) =>
      `Sleep 7+ hours → ${correlation.toFixed(1)}× better decision quality`,
    actions: ['Prioritize sleep before big decisions', 'Track decision outcomes vs sleep'],
  },
  exercise_mood: {
    pattern: 'exercise_mood_high',
    message: (correlation: number) =>
      `Workout days → ${correlation.toFixed(1)}× better mood`,
    actions: ['Maintain exercise streak', 'Exercise when feeling low'],
  },
  stress_relationships: {
    pattern: 'stress_high_relationships_drift',
    message: (correlation: number) =>
      `High stress → ${correlation.toFixed(1)}× relationship communication drop`,
    actions: ['Schedule relationship check-ins during stress', 'Set stress alerts'],
  },
  career_health: {
    pattern: 'career_stress_health_decline',
    message: (correlation: number) =>
      `High-stress jobs → ${correlation.toFixed(1)}× health decline`,
    actions: ['Negotiate work-life balance', 'Monitor health metrics during job changes'],
  },
} as const;

export const PILLAR_WEIGHTS = {
  procrastination: 0.15,
  decisions: 0.20,
  relationships: 0.25,
  health: 0.25,
  simulator: 0.15,
} as const;

export const SCORE_THRESHOLDS = {
  excellent: 8.5,
  good: 7.0,
  warning: 5.5,
  critical: 4.0,
} as const;

export const RECOMMENDATION_PRIORITIES = {
  urgent_high_impact: 10,
  urgent_medium_impact: 8,
  important_high_impact: 7,
  important_medium_impact: 5,
  nice_to_have: 3,
} as const;

export const BARNEY_INTEGRATION_MESSAGES = {
  high_score: [
    "🔥 You're crushing life right now! All systems firing on all cylinders.",
    "💪 Legendary performance across the board. This is what peak looks like.",
    "⚡ Everything's aligned. Keep this momentum going!",
  ],
  improving: [
    "📈 Upward trajectory detected! You're building something special.",
    "🚀 Week-over-week gains. This is how you level up.",
    "💡 The patterns are working. Double down on what's working.",
  ],
  declining: [
    "⚠️ Slight dip detected. Let's course-correct before it becomes a pattern.",
    "🤔 Something's off. Check the insights - they'll tell you what needs attention.",
    "💭 Not your best week, but you've bounced back from worse. Time to rally.",
  ],
  burnout_risk: [
    "🚨 BURNOUT ALERT: Multiple red flags. Take action NOW.",
    "⛔ This pattern led to burnout last time. Break the cycle today.",
    "💔 Your body is screaming for rest. Listen to it.",
  ],
  goal_progress: [
    "🎯 Goal progress: {percent}%. You're {status}!",
    "📊 {completed}/{total} requirements done. {remaining} to go!",
    "⏰ {days} days left. {pace} pace to hit your target.",
  ],
} as const;

export const PREDICTION_ACCURACY_THRESHOLD = 0.7;

export const MEMORY_SEARCH_LIMIT = 10;

export const GOAL_TIMELINE_DAYS = {
  short: 30,
  medium: 90,
  long: 180,
  annual: 365,
} as const;

export const CROSS_PILLAR_PATTERNS = [
  { pillarA: 'health', pillarB: 'procrastination', eventA: 'sleep_low', eventB: 'procrastination_high' },
  { pillarA: 'health', pillarB: 'decisions', eventA: 'sleep_high', eventB: 'decision_good' },
  { pillarA: 'health', pillarB: 'decisions', eventA: 'mood_low', eventB: 'decision_regret' },
  { pillarA: 'health', pillarB: 'relationships', eventA: 'stress_high', eventB: 'communication_low' },
  { pillarA: 'simulator', pillarB: 'health', eventA: 'job_stress_high', eventB: 'health_decline' },
  { pillarA: 'simulator', pillarB: 'relationships', eventA: 'relocation', eventB: 'relationship_strain' },
  { pillarA: 'procrastination', pillarB: 'decisions', eventA: 'task_avoided', eventB: 'decision_rushed' },
  { pillarA: 'relationships', pillarB: 'decisions', eventA: 'conflict', eventB: 'decision_quality_low' },
] as const;

export const SMART_ACTION_TEMPLATES = {
  sleep_improvement: {
    title: 'Improve Sleep Quality',
    description: 'Your sleep impacts {affected_pillars}',
    actions: [
      'Set bedtime alarm for 10:30 PM',
      'No screens 30 min before bed',
      'Track sleep-performance correlation',
    ],
  },
  relationship_maintenance: {
    title: 'Relationship Check-In',
    description: 'Haven\'t connected with {person} in {days} days',
    actions: [
      'Schedule call this week',
      'Send quick message today',
      'Plan in-person meetup',
    ],
  },
  procrastination_intervention: {
    title: 'Break Procrastination Cycle',
    description: 'Avoiding {task} for {days} days',
    actions: [
      'Time-box 25 minutes today',
      'Break into smaller steps',
      'Reward yourself after completion',
    ],
  },
  career_opportunity: {
    title: 'Career Move Analysis',
    description: 'New opportunity could improve life score by {improvement}',
    actions: [
      'Run full simulation',
      'Check cross-pillar impacts',
      'Sleep on decision (literally - 7+ hrs)',
    ],
  },
} as const;
