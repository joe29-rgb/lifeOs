/**
 * Life Path Simulator Constants
 * Job APIs, skill categories, industries, simulation parameters
 */

export const SKILL_CATEGORIES = {
  programming: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Swift'],
  frontend: ['React', 'Vue', 'Angular', 'Next.js', 'HTML', 'CSS', 'Tailwind'],
  backend: ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Rails'],
  database: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Elasticsearch'],
  cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform'],
  mobile: ['React Native', 'Flutter', 'iOS', 'Android', 'Expo'],
  ai_ml: ['Machine Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
  devops: ['CI/CD', 'Jenkins', 'GitHub Actions', 'Monitoring', 'Logging'],
  management: ['Team Leadership', 'Project Management', 'Agile', 'Scrum', 'Hiring'],
  design: ['UI/UX', 'Figma', 'Design Systems', 'User Research'],
} as const;

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'E-commerce',
  'Education',
  'Entertainment',
  'Government',
  'Consulting',
  'Startup',
  'Enterprise',
] as const;

export const SIMULATION_PARAMETERS = {
  projectionYears: 5,
  salaryGrowthRate: {
    low: 0.02,
    average: 0.05,
    high: 0.10,
    exceptional: 0.15,
  },
  satisfactionDecay: 0.95,
  stressImpactOnHealth: 0.7,
  relocationStrain: 0.6,
  learningVelocity: 1.2,
} as const;

export const REGRET_THRESHOLDS = {
  low: 0.2,
  medium: 0.4,
  high: 0.6,
  critical: 0.8,
} as const;

export const MATCH_SCORE_WEIGHTS = {
  skillMatch: 0.4,
  salaryMatch: 0.2,
  locationMatch: 0.15,
  workModeMatch: 0.1,
  priorityAlignment: 0.15,
} as const;

export const BARNEY_SIMULATOR_MESSAGES = {
  trajectory_good: [
    "🚀 Your career trajectory is legendary! Let's see if we can make it EPIC.",
    "💪 You're crushing it! But what if you could crush it HARDER?",
    "⚡ Solid path you're on. Let's explore some wild alternatives.",
  ],
  trajectory_stagnant: [
    "🤔 Your growth has plateaued. Time to shake things up?",
    "📈 You're coasting. Let's find opportunities that reignite the fire.",
    "💡 Stagnation detected. Your potential is way higher than this.",
  ],
  high_match: [
    "🎯 This job is a 90%+ match for your skills and priorities!",
    "🔥 Holy shit, this role was made for you!",
    "⚡ This opportunity aligns perfectly with what you value.",
  ],
  regret_warning: [
    "⚠️ Red flag: Similar decisions led to regret 80% of the time.",
    "🚨 Pattern alert: This matches your past regretted choices.",
    "💭 Sleep on this one. Your history says slow down.",
  ],
  skill_gap: [
    "📚 You're 2 skills away from a $30k raise. Let's close that gap.",
    "🎓 Upskilling path identified. 8 months to level up.",
    "💡 Market wants what you almost have. Time to learn.",
  ],
} as const;

export const JOB_API_ENDPOINTS = {
  adzuna: {
    base: 'https://api.adzuna.com/v1/api/jobs',
    countries: ['us', 'gb', 'ca', 'au'],
  },
  github: {
    base: 'https://jobs.github.com/positions.json',
  },
  usajobs: {
    base: 'https://data.usajobs.gov/api/search',
  },
} as const;

export const CAREER_MILESTONES = {
  promotion: {
    salaryIncrease: 0.15,
    satisfactionBoost: 1.5,
  },
  jobChange: {
    salaryIncrease: 0.20,
    satisfactionReset: 7.0,
    stressIncrease: 2.0,
  },
  skillMastery: {
    marketValueIncrease: 5000,
    satisfactionBoost: 0.5,
  },
  burnout: {
    satisfactionDrop: 3.0,
    healthImpact: -2.0,
  },
} as const;

export const PRIORITY_DEFAULTS = {
  workLifeBalance: 7,
  salary: 6,
  cuttingEdgeTech: 5,
  careerGrowth: 7,
  companyReputation: 5,
  teamCulture: 8,
  remoteFlexibility: 6,
  impactfulWork: 6,
} as const;

export const LEARNING_RESOURCES = {
  'System Design': {
    provider: 'Educative.io',
    duration: 60,
    cost: 79,
    url: 'https://www.educative.io/courses/grokking-the-system-design-interview',
  },
  'Machine Learning': {
    provider: 'Coursera',
    duration: 120,
    cost: 49,
    url: 'https://www.coursera.org/learn/machine-learning',
  },
  'Kubernetes': {
    provider: 'Linux Foundation',
    duration: 90,
    cost: 299,
    url: 'https://training.linuxfoundation.org/training/kubernetes-fundamentals/',
  },
  'React': {
    provider: 'Frontend Masters',
    duration: 30,
    cost: 39,
    url: 'https://frontendmasters.com/courses/complete-react-v7/',
  },
} as const;

export const SALARY_PERCENTILES = {
  junior: { p25: 60000, p50: 75000, p75: 90000 },
  mid: { p25: 90000, p50: 120000, p75: 150000 },
  senior: { p25: 130000, p50: 160000, p75: 200000 },
  staff: { p25: 170000, p50: 220000, p75: 280000 },
  principal: { p25: 220000, p50: 280000, p75: 350000 },
} as const;
