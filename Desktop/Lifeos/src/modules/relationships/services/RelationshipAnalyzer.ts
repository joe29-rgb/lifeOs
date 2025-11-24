/**
 * Relationship Analyzer
 * Analyzes relationship patterns and generates insights
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RelationshipInsight, RelationshipStats, RelationshipTimeline, ContactEvent } from '../types/relationship.types';
import { relationshipTracker } from './RelationshipTracker';

export class RelationshipAnalyzer {
  public async generateInsights(personId: string): Promise<RelationshipInsight[]> {
    const contacts = await relationshipTracker.getContactsForPerson(personId);
    if (contacts.length < 3) return [];

    const insights: RelationshipInsight[] = [];

    const bestPattern = await this.findBestPattern(personId, contacts);
    if (bestPattern) insights.push(bestPattern);

    const conflictPattern = await this.findConflictPattern(personId, contacts);
    if (conflictPattern) insights.push(conflictPattern);

    await this.saveInsights(insights);
    return insights;
  }

  private async findBestPattern(personId: string, contacts: ContactEvent[]): Promise<RelationshipInsight | null> {
    const positiveContacts = contacts.filter((c) => c.sentiment === 'positive');
    if (positiveContacts.length < 3) return null;

    const dayOfWeekCounts: Record<number, number> = {};
    positiveContacts.forEach((c) => {
      const day = new Date(c.occurredAt).getDay();
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
    });

    const bestDay = Object.entries(dayOfWeekCounts)
      .sort((a, b) => b[1] - a[1])[0];

    if (!bestDay) return null;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[parseInt(bestDay[0])];

    const person = await relationshipTracker.getPerson(personId);
    const personName = person?.name || 'this person';

    return {
      id: `insight_best_${personId}`,
      personId,
      userId: person?.userId || 'anonymous',
      insightType: 'best_pattern',
      title: 'Best Connection Pattern',
      description: `Your best weeks with ${personName} were when you connected on ${dayName}s`,
      actionable: true,
      createdAt: new Date(),
    };
  }

  private async findConflictPattern(personId: string, contacts: ContactEvent[]): Promise<RelationshipInsight | null> {
    const negativeContacts = contacts.filter((c) => c.sentiment === 'negative');
    if (negativeContacts.length < 2) return null;

    const person = await relationshipTracker.getPerson(personId);
    const personName = person?.name || 'this person';

    return {
      id: `insight_conflict_${personId}`,
      personId,
      userId: person?.userId || 'anonymous',
      insightType: 'conflict_pattern',
      title: 'Conflict Detected',
      description: `You've had ${negativeContacts.length} difficult interactions with ${personName} recently`,
      actionable: true,
      createdAt: new Date(),
    };
  }

  public async getStats(personId: string): Promise<RelationshipStats> {
    const contacts = await relationshipTracker.getContactsForPerson(personId);

    if (contacts.length === 0) {
      return {
        personId,
        totalContacts: 0,
        averageFrequencyDays: 0,
        longestGap: 0,
        currentStreak: 0,
        bestWeek: new Date(),
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
        preferredContactType: 'text',
      };
    }

    const frequencies: number[] = [];
    for (let i = 1; i < contacts.length; i++) {
      const diff = new Date(contacts[i - 1].occurredAt).getTime() - new Date(contacts[i].occurredAt).getTime();
      frequencies.push(diff / (1000 * 60 * 60 * 24));
    }

    const avgFrequency = frequencies.length > 0 
      ? frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length 
      : 0;

    const longestGap = frequencies.length > 0 ? Math.max(...frequencies) : 0;

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    contacts.forEach((c) => {
      sentimentCounts[c.sentiment] += 1;
    });

    const contactTypeCounts: Record<string, number> = {};
    contacts.forEach((c) => {
      contactTypeCounts[c.type] = (contactTypeCounts[c.type] || 0) + 1;
    });

    const preferredType = Object.entries(contactTypeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'text';

    const currentStreak = await this.calculateCurrentStreak(contacts);

    const bestWeek = this.findBestWeek(contacts);

    return {
      personId,
      totalContacts: contacts.length,
      averageFrequencyDays: Math.round(avgFrequency),
      longestGap: Math.round(longestGap),
      currentStreak,
      bestWeek,
      sentimentDistribution: sentimentCounts,
      preferredContactType: preferredType as any,
    };
  }

  private async calculateCurrentStreak(contacts: ContactEvent[]): Promise<number> {
    if (contacts.length === 0) return 0;

    let streak = 1;
    const now = new Date();
    const lastContact = new Date(contacts[0].occurredAt);
    const daysSinceLastContact = (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastContact > 14) return 0;

    for (let i = 1; i < contacts.length; i++) {
      const diff = new Date(contacts[i - 1].occurredAt).getTime() - new Date(contacts[i].occurredAt).getTime();
      const days = diff / (1000 * 60 * 60 * 24);

      if (days <= 14) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }

  private findBestWeek(contacts: ContactEvent[]): Date {
    if (contacts.length === 0) return new Date();

    const positiveContacts = contacts.filter((c) => c.sentiment === 'positive');
    if (positiveContacts.length === 0) return new Date(contacts[0].occurredAt);

    return new Date(positiveContacts[0].occurredAt);
  }

  public async getTimeline(personId: string): Promise<RelationshipTimeline> {
    const contacts = await relationshipTracker.getContactsForPerson(personId);

    const peaks = contacts
      .filter((c) => c.sentiment === 'positive')
      .slice(0, 5)
      .map((c) => new Date(c.occurredAt));

    const lows = contacts
      .filter((c) => c.sentiment === 'negative')
      .slice(0, 3)
      .map((c) => new Date(c.occurredAt));

    return {
      personId,
      events: contacts,
      peaks,
      lows,
      conflicts: lows,
      makeups: [],
      milestones: [],
    };
  }

  private async saveInsights(insights: RelationshipInsight[]): Promise<void> {
    try {
      const insightsJson = await AsyncStorage.getItem('lifeos_relationship_insights');
      const allInsights: RelationshipInsight[] = insightsJson ? JSON.parse(insightsJson) : [];

      insights.forEach((insight) => {
        const index = allInsights.findIndex((i) => i.id === insight.id);
        if (index >= 0) {
          allInsights[index] = insight;
        } else {
          allInsights.push(insight);
        }
      });

      await AsyncStorage.setItem('lifeos_relationship_insights', JSON.stringify(allInsights));
    } catch (error) {
      console.error('Error saving insights:', error);
    }
  }

  public async getInsightsForPerson(personId: string): Promise<RelationshipInsight[]> {
    try {
      const insightsJson = await AsyncStorage.getItem('lifeos_relationship_insights');
      if (!insightsJson) return [];

      const insights: RelationshipInsight[] = JSON.parse(insightsJson);
      return insights.filter((i) => i.personId === personId);
    } catch (error) {
      console.error('Error getting insights:', error);
      return [];
    }
  }
}

export const relationshipAnalyzer = new RelationshipAnalyzer();
