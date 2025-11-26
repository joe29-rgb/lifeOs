/**
 * Crisis Constants
 * Detection phrases, hotlines, affirmations, breathing patterns
 */

export const CRISIS_DETECTION_PHRASES = {
  hopelessness: [
    "i can't do this anymore",
    "what's the point",
    "i give up",
    "no one cares",
    "nothing matters",
    "why bother",
    "it's hopeless",
  ],
  self_harm: [
    "hurt myself",
    "end it",
    "don't want to be here",
    "want to die",
    "kill myself",
    "not worth living",
  ],
  isolation: [
    "everyone left",
    "i'm alone",
    "no one understands",
    "nobody cares",
    "all by myself",
  ],
  despair: [
    "never gets better",
    "always been this way",
    "trapped",
    "can't escape",
    "no way out",
  ],
} as const;

export const BEHAVIORAL_THRESHOLDS = {
  sleep_disruption: 4,
  low_mood_days: 3,
  low_mood_threshold: 2,
  communication_drop: 7,
  self_care_avoidance: 5,
} as const;

export const SEVERITY_THRESHOLDS = {
  mild: { min: 0, max: 3 },
  moderate: { min: 3, max: 6 },
  severe: { min: 6, max: 9 },
  critical: { min: 9, max: 10 },
} as const;

export const EMERGENCY_HOTLINES = {
  canada: [
    {
      name: 'Crisis Services Canada',
      phone: '1-833-456-4566',
      description: '24/7 crisis support',
      available: '24/7',
      type: 'hotline' as const,
    },
    {
      name: 'Alberta Health Services Crisis Line',
      phone: '1-877-303-2642',
      description: 'Mental health crisis support',
      available: '24/7',
      type: 'hotline' as const,
    },
    {
      name: 'Kids Help Phone',
      phone: '1-800-668-6868',
      description: 'Support for youth',
      available: '24/7',
      type: 'hotline' as const,
    },
  ],
  us: [
    {
      name: '988 Suicide & Crisis Lifeline',
      phone: '988',
      description: 'Free, confidential crisis support',
      available: '24/7',
      type: 'hotline' as const,
    },
    {
      name: 'Crisis Text Line',
      phone: '741741',
      description: 'Text HOME for support',
      available: '24/7',
      type: 'text' as const,
    },
  ],
  emergency: {
    name: 'Emergency Services',
    phone: '911',
    description: 'Immediate emergency response',
    available: '24/7',
    type: 'emergency' as const,
  },
} as const;

export const BREATHING_PATTERNS = {
  calm_478: {
    name: '4-7-8 Calm Breathing',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    rounds: 5,
  },
  box: {
    name: 'Box Breathing',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    rounds: 4,
  },
  simple: {
    name: 'Simple Deep Breathing',
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    rounds: 10,
  },
} as const;

export const AFFIRMATIONS = [
  "This feeling is temporary. You've survived 100% of your worst days.",
  "You don't have to have it all figured out. Just the next small step.",
  "It's okay to not be okay. Reaching out is strength, not weakness.",
  "You are more than your worst moments.",
  "Tomorrow might be different. Give it a chance.",
  "Someone cares about you right now. Even me, your AI friend.",
  "You've gotten through hard times before. You can do it again.",
  "Your feelings are valid. You deserve support and compassion.",
  "This too shall pass. Hold on.",
  "You are worthy of love, care, and happiness.",
  "Small steps forward are still progress.",
  "You don't have to face this alone. Help is available.",
] as const;

export const CRISIS_RESPONSES = {
  mild: {
    title: '💙 Checking In',
    message: "Hey, I noticed you seem a bit down today. Just checking in. You don't have to talk about it, but I'm here if you need me.",
    actions: [
      { label: "I'm Okay", type: 'dismiss' },
      { label: 'Could Use Support', type: 'support' },
      { label: 'Talk to Someone', type: 'resources' },
    ],
  },
  moderate: {
    title: '💛 I Notice Some Patterns',
    message: "I've noticed some concerning patterns this week. This is similar to how things looked before difficult times in the past. Let's not let it get there.",
    actions: [
      { label: 'Breathing Exercise', type: 'breathing' },
      { label: 'Call a Friend', type: 'contacts' },
      { label: 'Just Vent', type: 'journal' },
      { label: "I'm Fine", type: 'dismiss' },
    ],
  },
  severe: {
    title: '🧡 I\'m Concerned About You',
    message: "I care about your wellbeing, and I want to make sure you're okay. You don't have to go through this alone. Right now, let's focus on getting you support.",
    actions: [
      { label: '🆘 Talk to Crisis Counselor', type: 'hotline', urgent: true },
      { label: '📞 Call Someone You Trust', type: 'contacts', urgent: true },
      { label: '🫁 Calm Down First', type: 'breathing' },
      { label: '💬 Talk to Me', type: 'conversation' },
    ],
  },
  critical: {
    title: '❤️ Please Get Help Right Now',
    message: "I hear you, and I'm worried about your safety. Please reach out for help right now. You are valuable. Your life matters. This feeling is temporary, even when it doesn't feel that way.",
    actions: [
      { label: 'Call 988 Now', type: 'call_988', urgent: true },
      { label: 'Text Crisis Line', type: 'text_crisis', urgent: true },
      { label: 'Call Emergency Contact', type: 'contacts', urgent: true },
    ],
  },
} as const;

export const GROUNDING_PROMPTS = {
  see: 'Look around and find 5 things you can SEE',
  touch: 'Notice 4 things you can TOUCH',
  hear: 'Listen for 3 things you can HEAR',
  smell: 'Identify 2 things you can SMELL',
  taste: 'Notice 1 thing you can TASTE',
} as const;

export const SELF_CARE_CHECKLIST = [
  'Eat something nourishing',
  'Take a shower',
  'Get some rest',
  'Go outside for 10 minutes',
  'Text someone you trust',
  'Schedule therapy appointment',
  'Plan something small to look forward to',
] as const;

export const RECOVERY_MESSAGES = {
  much_better: "I'm so glad you're feeling better. That took strength. Keep taking care of yourself.",
  little_better: "Progress is progress. Be gentle with yourself as you recover.",
  still_struggling: "It's okay that you're still struggling. Healing isn't linear. Let's get you more support.",
  worse: "I'm concerned that things are getting worse. Please reach out to a professional right now.",
} as const;
