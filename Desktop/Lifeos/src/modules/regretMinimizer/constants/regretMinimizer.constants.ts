/**
 * Regret Minimizer Constants
 * Red flag patterns, common regret reasons, essential questions
 */

export const RED_FLAG_PATTERNS = {
  career: [
    { pattern: 'high_salary_primary', description: 'Money is primary motivator', severity: 'high' as const },
    { pattern: 'vague_culture', description: 'Vague answers about culture', severity: 'high' as const },
    { pattern: 'long_hours_expected', description: 'Long hours expected/mentioned', severity: 'medium' as const },
    { pattern: 'fast_growing', description: 'Fast-growing company (potential chaos)', severity: 'medium' as const },
    { pattern: 'no_work_life_balance', description: 'No mention of work-life balance', severity: 'high' as const },
    { pattern: 'intense_leadership', description: 'Leadership seems intense/demanding', severity: 'high' as const },
  ],
  relationship: [
    { pattern: 'ignoring_red_flags', description: 'Ignoring concerning behaviors', severity: 'critical' as const },
    { pattern: 'rushing_commitment', description: 'Moving too fast', severity: 'high' as const },
    { pattern: 'different_values', description: 'Different core values', severity: 'high' as const },
    { pattern: 'friends_concerned', description: 'Friends/family have concerns', severity: 'medium' as const },
  ],
  financial: [
    { pattern: 'impulse_purchase', description: 'Impulse decision', severity: 'high' as const },
    { pattern: 'too_good_to_be_true', description: 'Deal seems too good to be true', severity: 'critical' as const },
    { pattern: 'pressure_to_decide', description: 'Pressure to decide quickly', severity: 'high' as const },
    { pattern: 'didnt_read_terms', description: 'Didn\'t read full terms/contract', severity: 'high' as const },
  ],
} as const;

export const COMMON_REGRET_REASONS = [
  'Prioritized money over happiness',
  'Ignored gut feeling',
  'Rushed the decision',
  'Didn\'t ask hard questions',
  'Ignored red flags',
  'Let others pressure me',
  'Made decision while stressed',
  'Didn\'t sleep on it',
  'Didn\'t talk to anyone about it',
  'Focused on short-term over long-term',
] as const;

export const ESSENTIAL_QUESTIONS = {
  career: [
    { question: 'Can I talk to 2-3 current employees privately?', importance: 'essential' as const },
    { question: 'What\'s the team turnover rate?', importance: 'essential' as const },
    { question: 'How do you handle work-life balance?', importance: 'essential' as const },
    { question: 'What does a typical work week look like?', importance: 'essential' as const },
    { question: 'Can you describe your management style?', importance: 'important' as const },
    { question: 'How do you handle disagreements?', importance: 'important' as const },
    { question: 'What are the on-call expectations?', importance: 'important' as const },
    { question: 'How often do people work weekends?', importance: 'important' as const },
    { question: 'What does success look like in first 6 months?', importance: 'recommended' as const },
    { question: 'Is remote work truly flexible?', importance: 'recommended' as const },
    { question: 'What\'s the PTO policy like in practice?', importance: 'recommended' as const },
    { question: 'How do you support mental health?', importance: 'recommended' as const },
  ],
  relationship: [
    { question: 'What are your long-term goals?', importance: 'essential' as const },
    { question: 'How do you handle conflict?', importance: 'essential' as const },
    { question: 'What are your core values?', importance: 'essential' as const },
    { question: 'What does commitment mean to you?', importance: 'important' as const },
    { question: 'How do you communicate when upset?', importance: 'important' as const },
    { question: 'What are your boundaries?', importance: 'important' as const },
  ],
  financial: [
    { question: 'What are the total costs (including hidden fees)?', importance: 'essential' as const },
    { question: 'What happens if I need to cancel/return?', importance: 'essential' as const },
    { question: 'Can I afford this without stress?', importance: 'essential' as const },
    { question: 'Will I still want this in 6 months?', importance: 'important' as const },
    { question: 'Have I compared alternatives?', importance: 'important' as const },
  ],
} as const;

export const GUT_CHECK_PROMPTS = {
  off: 'Something feels off',
  excited: 'I\'m genuinely excited',
  scared_good: 'I\'m scared but in a good way',
  scared_bad: 'I\'m scared and it feels wrong',
  neutral: 'I feel neutral/indifferent',
} as const;

export const DELAY_RECOMMENDATIONS = {
  low_risk: { days: 1, reason: 'Sleep on it for clarity' },
  medium_risk: { days: 3, reason: 'Give yourself time to see things clearly' },
  high_risk: { days: 5, reason: 'This needs careful consideration' },
  critical_risk: { days: 7, reason: 'Major decision requires thorough evaluation' },
} as const;

export const RISK_WEIGHTS = {
  rushing: 30,
  money_motivated: 20,
  vague_culture: 25,
  ignoring_gut: 15,
  stressed: 20,
  poor_sleep: 15,
  no_research: 10,
} as const;

export const PROTECTIVE_WEIGHTS = {
  good_sleep: -10,
  talked_to_someone: -5,
  did_research: -5,
  completed_checklist: -15,
  trusted_gut: -20,
} as const;

export const REGRET_THRESHOLDS = {
  low: 30,
  medium: 50,
  high: 70,
  critical: 85,
} as const;

export const SIMILARITY_KEYWORDS = {
  career: ['job', 'work', 'career', 'position', 'role', 'company', 'salary', 'promotion'],
  relationship: ['relationship', 'partner', 'dating', 'marriage', 'breakup', 'commitment'],
  financial: ['buy', 'purchase', 'invest', 'loan', 'money', 'spend', 'cost'],
  life: ['move', 'relocate', 'change', 'decision', 'choice'],
  health: ['health', 'doctor', 'treatment', 'medical', 'therapy'],
} as const;

export const LESSONS_LEARNED = [
  'Trust your gut - it\'s usually right',
  'Sleep on major decisions',
  'Ask the hard questions upfront',
  'Don\'t let money be the only factor',
  'Talk to people who know you well',
  'Red flags don\'t go away',
  'Culture > Compensation',
  'Your time is valuable',
  'Boundaries are essential',
  'Listen to your body\'s signals',
] as const;
