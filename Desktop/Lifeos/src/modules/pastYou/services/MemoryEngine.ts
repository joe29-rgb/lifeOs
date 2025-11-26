/**
 * Memory Engine
 * Aggregates all historical data and indexes by topic/emotion/context
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Memory } from '../types/pastYou.types';

export class MemoryEngine {
  private readonly MEMORIES_KEY = '@past_you_memories';

  public async aggregateAllMemories(): Promise<Memory[]> {
    const memories: Memory[] = [];

    const decisions = await this.getDecisionMemories();
    const crisis = await this.getCrisisMemories();
    const health = await this.getHealthMemories();
    const relationships = await this.getRelationshipMemories();
    const briefing = await this.getBriefingMemories();

    memories.push(...decisions, ...crisis, ...health, ...relationships, ...briefing);

    await this.saveMemories(memories);
    return memories;
  }

  private async getDecisionMemories(): Promise<Memory[]> {
    const data = await AsyncStorage.getItem('@decisions');
    if (!data) return [];

    const decisions = JSON.parse(data);
    return decisions.map((d: any) => ({
      id: `decision_${d.id}`,
      source: 'decision' as const,
      timestamp: new Date(d.createdAt),
      content: d.reasoning || d.description,
      context: `Decision: ${d.title}`,
      emotion: d.confidence < 5 ? 'uncertain' : 'confident',
      outcome: d.outcome,
      keywords: this.extractKeywords(d.title + ' ' + d.reasoning),
      impact: d.outcome ? 8 : 5,
    }));
  }

  private async getCrisisMemories(): Promise<Memory[]> {
    const data = await AsyncStorage.getItem('@crisis_journal_entries');
    if (!data) return [];

    const entries = JSON.parse(data);
    return entries.map((e: any) => ({
      id: `crisis_${e.id}`,
      source: 'crisis' as const,
      timestamp: new Date(e.timestamp),
      content: e.description,
      context: `Crisis moment (intensity: ${e.intensity}/10)`,
      emotion: 'distressed',
      outcome: e.whatHelped.join(', '),
      keywords: this.extractKeywords(e.description),
      impact: 9,
    }));
  }

  private async getHealthMemories(): Promise<Memory[]> {
    const memories: Memory[] = [];

    const moodData = await AsyncStorage.getItem('@mental_health_moods');
    if (moodData) {
      const moods = JSON.parse(moodData);
      const withNotes = moods.filter((m: any) => m.note);
      
      memories.push(...withNotes.map((m: any) => ({
        id: `mood_${m.id}`,
        source: 'health' as const,
        timestamp: new Date(m.timestamp),
        content: m.note,
        context: `Mood: ${m.value}/10`,
        emotion: m.value < 4 ? 'low' : m.value > 7 ? 'good' : 'neutral',
        keywords: this.extractKeywords(m.note),
        impact: 6,
      })));
    }

    return memories;
  }

  private async getRelationshipMemories(): Promise<Memory[]> {
    const data = await AsyncStorage.getItem('@relationships_contacts');
    if (!data) return [];

    const contacts = JSON.parse(data);
    const withNotes = contacts.filter((c: any) => c.note);

    return withNotes.map((c: any) => ({
      id: `relationship_${c.id}`,
      source: 'relationship' as const,
      timestamp: new Date(c.timestamp),
      content: c.note,
      context: `Contact with ${c.personName}`,
      emotion: c.quality === 'positive' ? 'good' : c.quality === 'negative' ? 'difficult' : 'neutral',
      keywords: this.extractKeywords(c.note),
      impact: 7,
    }));
  }

  private async getBriefingMemories(): Promise<Memory[]> {
    const data = await AsyncStorage.getItem('@briefing_reflections');
    if (!data) return [];

    const reflections = JSON.parse(data);
    return reflections.map((r: any) => ({
      id: `briefing_${r.id}`,
      source: 'briefing' as const,
      timestamp: new Date(r.timestamp),
      content: r.reflection,
      context: 'Daily reflection',
      keywords: this.extractKeywords(r.reflection),
      impact: 6,
    }));
  }

  private extractKeywords(text: string): string[] {
    if (!text) return [];

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const stopWords = ['that', 'this', 'with', 'from', 'have', 'been', 'were', 'they', 'what', 'when', 'where'];
    return [...new Set(words.filter((w) => !stopWords.includes(w)))];
  }

  public async getMemories(): Promise<Memory[]> {
    const data = await AsyncStorage.getItem(this.MEMORIES_KEY);
    if (!data) return [];

    const memories: Memory[] = JSON.parse(data);
    return memories.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
  }

  private async saveMemories(memories: Memory[]): Promise<void> {
    await AsyncStorage.setItem(this.MEMORIES_KEY, JSON.stringify(memories));
  }

  public async getMemoriesBySource(source: Memory['source']): Promise<Memory[]> {
    const memories = await this.getMemories();
    return memories.filter((m) => m.source === source);
  }

  public async getMemoriesByTimeRange(startDate: Date, endDate: Date): Promise<Memory[]> {
    const memories = await this.getMemories();
    return memories.filter((m) => {
      const timestamp = new Date(m.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    });
  }

  public async getMemoriesByEmotion(emotion: string): Promise<Memory[]> {
    const memories = await this.getMemories();
    return memories.filter((m) => m.emotion === emotion);
  }
}
