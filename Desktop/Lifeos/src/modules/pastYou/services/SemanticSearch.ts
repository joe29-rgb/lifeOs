/**
 * Semantic Search
 * Finds relevant past entries based on query
 */

import { Memory, SearchResult } from '../types/pastYou.types';
import { KEYWORD_SYNONYMS, SEARCH_WEIGHTS } from '../constants/pastYou.constants';
import { MemoryEngine } from './MemoryEngine';

export class SemanticSearch {
  private memoryEngine: MemoryEngine;

  constructor() {
    this.memoryEngine = new MemoryEngine();
  }

  public async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    const memories = await this.memoryEngine.getMemories();
    const queryKeywords = this.extractQueryKeywords(query);
    const queryEmotion = this.detectEmotion(query);

    const results: SearchResult[] = memories.map((memory) => {
      const relevance = this.calculateRelevance(memory, queryKeywords, queryEmotion);
      const reason = this.generateReason(memory, queryKeywords, queryEmotion);
      return { memory, relevance, reason };
    });

    return results
      .filter((r) => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  private extractQueryKeywords(query: string): string[] {
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const expanded: string[] = [...words];
    for (const word of words) {
      if (KEYWORD_SYNONYMS[word]) {
        expanded.push(...KEYWORD_SYNONYMS[word]);
      }
    }

    return [...new Set(expanded)];
  }

  private detectEmotion(query: string): string | null {
    const lowerQuery = query.toLowerCase();

    const emotionKeywords: Record<string, string[]> = {
      stressed: ['stressed', 'overwhelmed', 'anxious', 'pressure'],
      happy: ['happy', 'excited', 'joyful', 'great'],
      sad: ['sad', 'depressed', 'down', 'unhappy'],
      uncertain: ['unsure', 'confused', 'uncertain', 'doubt'],
      confident: ['confident', 'sure', 'certain', 'ready'],
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some((kw) => lowerQuery.includes(kw))) {
        return emotion;
      }
    }

    return null;
  }

  private calculateRelevance(
    memory: Memory,
    queryKeywords: string[],
    queryEmotion: string | null
  ): number {
    let score = 0;

    for (const keyword of queryKeywords) {
      if (memory.keywords.includes(keyword)) {
        score += SEARCH_WEIGHTS.keyword_exact;
      }

      const contentLower = memory.content.toLowerCase();
      if (contentLower.includes(keyword)) {
        score += SEARCH_WEIGHTS.keyword_synonym;
      }
    }

    if (queryEmotion && memory.emotion === queryEmotion) {
      score += SEARCH_WEIGHTS.emotion_match;
    }

    const daysSince = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 90) {
      score += SEARCH_WEIGHTS.recency_boost;
    }

    score += memory.impact * SEARCH_WEIGHTS.impact_boost * 0.1;

    return score;
  }

  private generateReason(
    memory: Memory,
    queryKeywords: string[],
    queryEmotion: string | null
  ): string {
    const reasons: string[] = [];

    const matchingKeywords = queryKeywords.filter((kw) =>
      memory.keywords.includes(kw) || memory.content.toLowerCase().includes(kw)
    );

    if (matchingKeywords.length > 0) {
      reasons.push(`Similar topic: ${matchingKeywords.slice(0, 2).join(', ')}`);
    }

    if (queryEmotion && memory.emotion === queryEmotion) {
      reasons.push(`Similar emotional state`);
    }

    if (memory.outcome) {
      reasons.push(`Has outcome/resolution`);
    }

    return reasons.join(' • ') || 'Related experience';
  }

  public async searchByTopic(topic: string): Promise<SearchResult[]> {
    const topicQueries: Record<string, string> = {
      career: 'job work career position role employment decision change',
      relationships: 'relationship partner friend family conflict communication',
      mental_health: 'stress anxiety depression mood overwhelmed coping',
      life_decisions: 'decision choice option path direction move change',
      personal_growth: 'learn growth change improve better skill',
    };

    const query = topicQueries[topic] || topic;
    return this.search(query, 10);
  }
}
