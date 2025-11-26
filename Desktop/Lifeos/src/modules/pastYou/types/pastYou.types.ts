/**
 * Past You Types
 * Type definitions for AI-powered self-reflection
 */

export interface Memory {
  id: string;
  source: 'decision' | 'crisis' | 'health' | 'relationship' | 'briefing' | 'career';
  timestamp: Date;
  content: string;
  context: string;
  emotion?: string;
  outcome?: string;
  keywords: string[];
  impact: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'past_you';
  content: string;
  timestamp: Date;
  sourceMemories?: Memory[];
}

export interface Conversation {
  id: string;
  startedAt: Date;
  messages: ConversationMessage[];
  topic?: string;
}

export interface Pattern {
  id: string;
  category: 'decision' | 'relationship' | 'mental_health' | 'career';
  title: string;
  description: string;
  occurrences: number;
  successRate?: number;
  examples: Memory[];
  isPositive: boolean;
}

export interface Wisdom {
  id: string;
  quote: string;
  context: string;
  timestamp: Date;
  source: Memory;
  timesUsed: number;
  impactScore: number;
  category: string;
}

export interface FutureLetter {
  id: string;
  content: string;
  writtenAt: Date;
  deliverAt: Date;
  delivered: boolean;
  topic?: string;
}

export interface SearchResult {
  memory: Memory;
  relevance: number;
  reason: string;
}

export interface PastYouStats {
  totalConversations: number;
  totalMemories: number;
  mostAskedTopic: string;
  topicCounts: Record<string, number>;
  confidenceChange: number;
  regretRate: number;
  selfAwarenessScore: number;
}

export interface TopicPrompt {
  id: string;
  category: string;
  icon: string;
  title: string;
  examples: string[];
}
