/**
 * Relationship Guardian - Type Definitions
 */

export type RelationshipType = 'family' | 'friend' | 'romantic' | 'professional' | 'other';
export type ContactType = 'call' | 'text' | 'in_person' | 'video' | 'email';
export type SentimentType = 'positive' | 'neutral' | 'negative';
export type WeatherStatus = 'sunny' | 'partly_cloudy' | 'cloudy' | 'storm_warning';

export interface Person {
  id: string;
  userId: string;
  name: string;
  relationshipType: RelationshipType;
  phoneNumber?: string;
  email?: string;
  photoUri?: string;
  birthday?: Date;
  anniversaryDate?: Date;
  notes: string;
  isTopPerson: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactEvent {
  id: string;
  personId: string;
  userId: string;
  type: ContactType;
  sentiment: SentimentType;
  duration?: number; // minutes
  notes?: string;
  location?: string;
  photoUris?: string[];
  occurredAt: Date;
  createdAt: Date;
}

export interface RelationshipBaseline {
  personId: string;
  averageContactFrequencyDays: number;
  preferredContactTypes: ContactType[];
  averageSentiment: number; // -1 to 1
  peakContactDays: number[]; // Day of week 0-6
  lastCalculatedAt: Date;
}

export interface RelationshipDrift {
  id: string;
  personId: string;
  userId: string;
  driftType: 'frequency' | 'sentiment' | 'both';
  severity: 'minor' | 'moderate' | 'severe';
  daysSinceLastContact: number;
  expectedContactDays: number;
  currentSentimentTrend: SentimentType;
  baselineSentiment: SentimentType;
  detectedAt: Date;
  resolvedAt?: Date;
}

export interface RelationshipWeather {
  personId: string;
  status: WeatherStatus;
  temperature: number; // 0-100
  forecast: string;
  actionSuggestions: string[];
  lastUpdated: Date;
}

export interface RelationshipInsight {
  id: string;
  personId: string;
  userId: string;
  insightType: 'best_pattern' | 'conflict_pattern' | 'milestone' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  createdAt: Date;
}

export interface RelationshipTimeline {
  personId: string;
  events: ContactEvent[];
  peaks: Date[];
  lows: Date[];
  conflicts: Date[];
  makeups: Date[];
  milestones: Array<{
    date: Date;
    description: string;
  }>;
}

export interface RelationshipStats {
  personId: string;
  totalContacts: number;
  averageFrequencyDays: number;
  longestGap: number;
  currentStreak: number;
  bestWeek: Date;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  preferredContactType: ContactType;
}

export interface QuickAction {
  id: string;
  type: 'call' | 'text' | 'schedule' | 'view_memory';
  label: string;
  personId: string;
  prefilledMessage?: string;
}
