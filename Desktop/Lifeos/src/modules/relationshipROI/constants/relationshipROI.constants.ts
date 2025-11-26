/**
 * Relationship ROI Constants
 * ROI thresholds, weight factors, recommendations
 */

export const ROI_WEIGHTS = {
  joy: 0.30,
  energyImpact: 0.25,
  supportBalance: 0.20,
  growthImpact: 0.15,
  reliability: 0.10,
} as const;

export const ROI_THRESHOLDS = {
  high: 80,
  good: 60,
  medium: 40,
  low: 20,
} as const;

export const ENERGY_THRESHOLDS = {
  energizer: 20,
  neutral: -10,
  drainer: -20,
} as const;

export const SUPPORT_THRESHOLDS = {
  reciprocal: { min: 0.8, max: 1.2 },
  give_more: { min: 1.2, max: 2.0 },
  receive_more: { min: 0.5, max: 0.8 },
  imbalanced: { min: 0, max: 0.5 },
} as const;

export const VAMPIRE_THRESHOLDS = {
  mild: { joy: 6, energy: -15, avoidance: 2 },
  moderate: { joy: 5, energy: -25, avoidance: 3 },
  severe: { joy: 4, energy: -35, avoidance: 4 },
} as const;

export const INVESTMENT_ACTIONS = {
  increase: {
    title: 'INCREASE Investment',
    icon: '⬆️',
    minROI: 70,
    multiplier: 1.5,
  },
  maintain: {
    title: 'MAINTAIN Investment',
    icon: '➡️',
    minROI: 40,
    multiplier: 1.0,
  },
  decrease: {
    title: 'DECREASE Investment',
    icon: '⬇️',
    minROI: 0,
    multiplier: 0.5,
  },
} as const;

export const VAMPIRE_OPTIONS = {
  boundaries: {
    title: 'Set Boundaries',
    actions: [
      'Limit calls to 15 minutes',
      'Don\'t pick up after 8pm',
      'Reduce frequency to monthly',
      'Only meet in group settings',
    ],
    description: 'Protect your energy without ending the relationship',
  },
  conversation: {
    title: 'Address the Issue',
    actions: [
      'Have honest conversation',
      'Suggest group hangouts (less drain)',
      'Express your needs clearly',
      'Set expectations together',
    ],
    description: 'Try to improve the relationship dynamic',
  },
  distance: {
    title: 'Distance Gradually',
    actions: [
      'Reduce contact frequency',
      'Be "busy" more often',
      'Don\'t initiate contact',
      'Don\'t feel guilty',
    ],
    description: 'Slowly reduce investment without confrontation',
  },
  exit: {
    title: 'Exit Relationship',
    actions: [
      'Only if truly toxic',
      'Your energy matters',
      'It\'s okay to let go',
      'Prioritize your wellbeing',
    ],
    description: 'End the relationship for your mental health',
  },
} as const;

export const GRATITUDE_TRIGGERS = {
  highROI: 80,
  consistentSupport: 3,
  recentHelp: 7,
  longTimeSinceAppreciation: 30,
} as const;

export const GRATITUDE_TEMPLATES = [
  'Hey {name}, I just wanted to say thanks for being such an amazing friend. Your support during {recent_moment} really meant a lot.',
  'I\'ve been thinking about how lucky I am to have you in my life. Thanks for always {quality}.',
  'Just wanted to let you know I appreciate you. {recent_moment} reminded me how much you mean to me.',
  'You\'re one of the best people I know. Thank you for {quality} and being there for me.',
] as const;

export const ROI_INSIGHTS = {
  high: {
    title: 'High ROI - Invest More!',
    description: 'This relationship consistently improves your mood, energy, and outlook. Protect and prioritize it.',
    recommendations: [
      'Prioritize weekly contact',
      'Schedule next hangout now',
      'Express gratitude occasionally',
      'Don\'t take this relationship for granted',
    ],
  },
  good: {
    title: 'Good ROI - Maintain',
    description: 'This is a healthy, positive relationship worth maintaining.',
    recommendations: [
      'Continue regular contact',
      'Maintain current investment level',
      'Appreciate the stability',
      'Look for growth opportunities',
    ],
  },
  medium: {
    title: 'Medium ROI - Evaluate',
    description: 'This relationship has mixed value. Consider boundaries or improvements.',
    recommendations: [
      'Set clearer boundaries',
      'Improve interaction quality',
      'Reduce frequency if draining',
      'Have honest conversation',
    ],
  },
  low: {
    title: 'Low ROI - Reconsider',
    description: 'This relationship may be draining more than it gives. Consider reducing investment.',
    recommendations: [
      'Reduce time investment',
      'Set firm boundaries',
      'Evaluate if worth continuing',
      'Don\'t feel guilty about distance',
    ],
  },
  negative: {
    title: 'Negative ROI - Distance',
    description: 'This relationship is actively harming your wellbeing. Consider ending it.',
    recommendations: [
      'Prioritize your mental health',
      'Create significant distance',
      'Consider ending relationship',
      'Seek support if needed',
    ],
  },
} as const;

export const PORTFOLIO_BENCHMARKS = {
  excellent: { score: 80, highROI: 3, energyBalance: 10, supportBalance: 0.9 },
  good: { score: 65, highROI: 2, energyBalance: 0, supportBalance: 0.8 },
  fair: { score: 50, highROI: 1, energyBalance: -10, supportBalance: 0.7 },
  poor: { score: 35, highROI: 0, energyBalance: -20, supportBalance: 0.6 },
} as const;

export const TREND_PATTERNS = {
  improving: {
    threshold: 5,
    message: 'Relationship strengthening',
    icon: '↑',
  },
  stable: {
    threshold: 5,
    message: 'Steady, reliable friendship',
    icon: '→',
  },
  declining: {
    threshold: -5,
    message: 'May need attention',
    icon: '↓',
  },
} as const;

export const INTERACTION_QUALITIES = [
  'being supportive',
  'making me laugh',
  'challenging me to grow',
  'listening without judgment',
  'celebrating my wins',
  'being there in tough times',
  'inspiring me',
  'being honest with me',
] as const;
