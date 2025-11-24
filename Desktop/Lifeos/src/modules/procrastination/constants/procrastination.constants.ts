/**
 * Procrastination Module - Constants
 * Configuration values for the legendary productivity system
 */

import { Affirmation, PomodoroConfig } from '../types/procrastination.types';

// Procrastination detection thresholds
export const IDLE_TIME_THRESHOLD_MINUTES = 15;
export const TASK_OVERDUE_CHECK_INTERVAL_MINUTES = 30;
export const PATTERN_MATCH_CONFIDENCE_THRESHOLD = 0.7;
export const LOW_ENERGY_HRV_THRESHOLD = 40; // ms
export const MOVEMENT_INACTIVITY_THRESHOLD_MINUTES = 120;

// Intervention escalation timing
export const GENTLE_NUDGE_DELAY_MINUTES = 5;
export const FIRM_NUDGE_DELAY_MINUTES = 10;
export const EPIC_INTERVENTION_DELAY_MINUTES = 20;

// Procrastination trigger phrases (voice detection)
export const PROCRASTINATION_PHRASES = [
  'maybe later',
  'just five more minutes',
  'i should get started soon',
  'i\'ll do it tomorrow',
  'not right now',
  'after this episode',
  'one more video',
  'let me check',
  'i\'m too tired',
  'i don\'t feel like it',
];

// Distraction app categories
export const DISTRACTION_APPS = {
  social: ['com.instagram.android', 'com.facebook.katana', 'com.twitter.android', 'com.snapchat.android', 'com.tiktok'],
  entertainment: ['com.google.android.youtube', 'com.netflix.mediaclient', 'com.spotify.music', 'com.hulu.plus'],
  games: ['com.king.candycrushsaga', 'com.supercell.clashofclans', 'com.roblox.client'],
  news: ['com.reddit.frontpage', 'flipboard.app', 'com.twitter.android'],
};

// Default Pomodoro configuration
export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: true,
  autoStartWork: false,
  notificationEnabled: true,
  hapticEnabled: true,
};

// Barney Stinson legendary affirmations
export const BARNEY_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'barney_start_1',
    text: 'Suit up! It\'s time to be LEGENDARY. This task doesn\'t stand a chance.',
    style: 'barney',
    category: 'start',
    personalizable: false,
  },
  {
    id: 'barney_start_2',
    text: 'You know what\'s awesome? Starting things. You know what\'s more awesome? YOU starting things.',
    style: 'barney',
    category: 'start',
    personalizable: false,
  },
  {
    id: 'barney_progress_1',
    text: 'You\'re crushing it! This is going in the playbook of awesomeness.',
    style: 'barney',
    category: 'progress',
    personalizable: false,
  },
  {
    id: 'barney_progress_2',
    text: 'High five! 🖐️ You\'re making future-you SO proud right now.',
    style: 'barney',
    category: 'progress',
    personalizable: false,
  },
  {
    id: 'barney_completion_1',
    text: 'LEGENDARY! That task just got Stinson\'d. You\'re basically a productivity superhero.',
    style: 'barney',
    category: 'completion',
    personalizable: false,
  },
  {
    id: 'barney_completion_2',
    text: 'Flawless victory! Time to celebrate—you\'ve earned it, champ.',
    style: 'barney',
    category: 'completion',
    personalizable: false,
  },
  {
    id: 'barney_struggle_1',
    text: 'I know it\'s tough, but you\'re tougher. Let\'s break this down and make it legendary.',
    style: 'barney',
    category: 'struggle',
    personalizable: false,
  },
  {
    id: 'barney_struggle_2',
    text: 'History tells me these delays always end with regret. Want help breaking this down? You know you\'ll thank yourself in 15 minutes.',
    style: 'barney',
    category: 'struggle',
    personalizable: false,
  },
];

// Motivational affirmations (less Barney, more supportive)
export const MOTIVATIONAL_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'motivational_start_1',
    text: 'You\'ve got this. Just one small step to get started.',
    style: 'motivational',
    category: 'start',
    personalizable: true,
  },
  {
    id: 'motivational_start_2',
    text: 'Starting is the hardest part. You\'re already halfway there by showing up.',
    style: 'motivational',
    category: 'start',
    personalizable: true,
  },
  {
    id: 'motivational_progress_1',
    text: 'Look at you go! Every minute counts.',
    style: 'motivational',
    category: 'progress',
    personalizable: true,
  },
  {
    id: 'motivational_completion_1',
    text: 'Amazing work! You did what you said you\'d do.',
    style: 'motivational',
    category: 'completion',
    personalizable: true,
  },
  {
    id: 'motivational_struggle_1',
    text: 'It\'s okay to struggle. Let\'s make this easier together.',
    style: 'motivational',
    category: 'struggle',
    personalizable: true,
  },
];

// Gentle affirmations
export const GENTLE_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'gentle_start_1',
    text: 'Ready when you are. No pressure, just progress.',
    style: 'gentle',
    category: 'start',
    personalizable: true,
  },
  {
    id: 'gentle_progress_1',
    text: 'Nice work. You\'re doing great.',
    style: 'gentle',
    category: 'progress',
    personalizable: true,
  },
  {
    id: 'gentle_completion_1',
    text: 'Well done! That\'s one more thing off your list.',
    style: 'gentle',
    category: 'completion',
    personalizable: true,
  },
];

// Epic affirmations (for major wins)
export const EPIC_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'epic_completion_1',
    text: '🎉 UNSTOPPABLE! You just conquered that task like a boss!',
    style: 'epic',
    category: 'completion',
    personalizable: false,
  },
  {
    id: 'epic_completion_2',
    text: '⚡ POWER MOVE! Future-you is doing a victory dance right now!',
    style: 'epic',
    category: 'completion',
    personalizable: false,
  },
];

// All affirmations combined
export const ALL_AFFIRMATIONS = [
  ...BARNEY_AFFIRMATIONS,
  ...MOTIVATIONAL_AFFIRMATIONS,
  ...GENTLE_AFFIRMATIONS,
  ...EPIC_AFFIRMATIONS,
];

// Intervention messages by level
export const INTERVENTION_MESSAGES = {
  gentle: [
    'You\'re awesome, but let\'s get this rolling. Suit up for productivity?',
    'Hey there! Ready to tackle this task? You\'ve got this.',
    'Just a friendly reminder—this task is waiting for you.',
  ],
  firm: [
    'History tells me these delays always end with regret. Want help breaking this down?',
    'You know you\'ll feel better once this is done. Let\'s make it happen.',
    'This task isn\'t going away. Let\'s crush it together.',
  ],
  epic: [
    'Let\'s make future-you proud. I\'ll block distractions, and if you want—call in the cavalry.',
    'Time for legendary action. Focus mode activated. You\'ve got this!',
    'This is it. No more delays. Let\'s show this task who\'s boss.',
  ],
};

// Reward messages
export const REWARD_MESSAGES = {
  confetti: 'Flawless Victory! 🎉',
  affirmation: 'You did it! That\'s legendary!',
  unlock: 'Task complete! Entertainment mode unlocked.',
  streak: 'Streak extended! You\'re on fire! 🔥',
  achievement: 'Achievement Unlocked!',
};

// Focus mode notification channel
export const FOCUS_MODE_CHANNEL_ID = 'timeline_focus_mode';
export const FOCUS_MODE_CHANNEL_NAME = 'Focus Mode';
export const FOCUS_MODE_NOTIFICATION_ID = 1001;

// Intervention notification channel
export const INTERVENTION_CHANNEL_ID = 'timeline_interventions';
export const INTERVENTION_CHANNEL_NAME = 'Procrastination Interventions';
