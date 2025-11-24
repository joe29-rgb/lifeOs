/**
 * Drift Detector
 * Detects relationship drift based on contact frequency and sentiment
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RelationshipDrift, Person, ContactEvent, RelationshipBaseline } from '../types/relationship.types';
import { relationshipTracker } from './RelationshipTracker';
import { DRIFT_THRESHOLDS, DEFAULT_CONTACT_FREQUENCY_DAYS } from '../constants/relationship.constants';

export class DriftDetector {
  public async detectDrift(personId: string): Promise<RelationshipDrift | null> {
    const person = await relationshipTracker.getPerson(personId);
    if (!person) return null;

    const baseline = await this.getBaseline(personId);
    const daysSinceLastContact = await relationshipTracker.getDaysSinceLastContact(personId);
    const recentContacts = await this.getRecentContacts(personId, 5);

    const frequencyDrift = this.detectFrequencyDrift(daysSinceLastContact, baseline);
    const sentimentDrift = this.detectSentimentDrift(recentContacts, baseline);

    if (!frequencyDrift && !sentimentDrift) {
      return null;
    }

    const drift: RelationshipDrift = {
      id: `drift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      personId,
      userId: person.userId,
      driftType: frequencyDrift && sentimentDrift ? 'both' : frequencyDrift ? 'frequency' : 'sentiment',
      severity: this.calculateSeverity(frequencyDrift, sentimentDrift, daysSinceLastContact, baseline),
      daysSinceLastContact,
      expectedContactDays: baseline.averageContactFrequencyDays,
      currentSentimentTrend: this.getCurrentSentimentTrend(recentContacts),
      baselineSentiment: this.getBaselineSentiment(baseline.averageSentiment),
      detectedAt: new Date(),
    };

    await this.saveDrift(drift);
    return drift;
  }

  private detectFrequencyDrift(daysSinceLastContact: number, baseline: RelationshipBaseline): boolean {
    const expectedDays = baseline.averageContactFrequencyDays;
    const ratio = daysSinceLastContact / expectedDays;

    return ratio >= DRIFT_THRESHOLDS.frequency.minor;
  }

  private detectSentimentDrift(recentContacts: ContactEvent[], baseline: RelationshipBaseline): boolean {
    if (recentContacts.length < 2) return false;

    const recentSentiment = this.calculateAverageSentiment(recentContacts);
    const sentimentDrop = baseline.averageSentiment - recentSentiment;

    return sentimentDrop >= DRIFT_THRESHOLDS.sentiment.minor;
  }

  private calculateSeverity(
    frequencyDrift: boolean,
    sentimentDrift: boolean,
    daysSinceLastContact: number,
    baseline: RelationshipBaseline
  ): 'minor' | 'moderate' | 'severe' {
    const frequencyRatio = daysSinceLastContact / baseline.averageContactFrequencyDays;

    if (frequencyRatio >= DRIFT_THRESHOLDS.frequency.severe || (frequencyDrift && sentimentDrift)) {
      return 'severe';
    } else if (frequencyRatio >= DRIFT_THRESHOLDS.frequency.moderate) {
      return 'moderate';
    } else {
      return 'minor';
    }
  }

  private getCurrentSentimentTrend(contacts: ContactEvent[]): 'positive' | 'neutral' | 'negative' {
    if (contacts.length === 0) return 'neutral';

    const avgSentiment = this.calculateAverageSentiment(contacts);
    
    if (avgSentiment > 0.3) return 'positive';
    if (avgSentiment < -0.3) return 'negative';
    return 'neutral';
  }

  private getBaselineSentiment(avgSentiment: number): 'positive' | 'neutral' | 'negative' {
    if (avgSentiment > 0.3) return 'positive';
    if (avgSentiment < -0.3) return 'negative';
    return 'neutral';
  }

  private calculateAverageSentiment(contacts: ContactEvent[]): number {
    if (contacts.length === 0) return 0;

    const sentimentValues: number[] = contacts.map((c) => {
      if (c.sentiment === 'positive') return 1;
      if (c.sentiment === 'negative') return -1;
      return 0;
    });

    return sentimentValues.reduce((sum: number, val: number) => sum + val, 0) / sentimentValues.length;
  }

  private async getRecentContacts(personId: string, count: number): Promise<ContactEvent[]> {
    const contacts = await relationshipTracker.getContactsForPerson(personId);
    return contacts.slice(0, count);
  }

  public async getBaseline(personId: string): Promise<RelationshipBaseline> {
    try {
      const baselinesJson = await AsyncStorage.getItem('lifeos_relationship_baselines');
      if (baselinesJson) {
        const baselines: RelationshipBaseline[] = JSON.parse(baselinesJson);
        const existing = baselines.find((b) => b.personId === personId);
        if (existing) return existing;
      }
    } catch (error) {
      console.error('Error getting baseline:', error);
    }

    return await this.calculateBaseline(personId);
  }

  private async calculateBaseline(personId: string): Promise<RelationshipBaseline> {
    const person = await relationshipTracker.getPerson(personId);
    const contacts = await relationshipTracker.getContactsForPerson(personId);

    if (contacts.length < 5) {
      const defaultFrequency = person 
        ? DEFAULT_CONTACT_FREQUENCY_DAYS[person.relationshipType]
        : DEFAULT_CONTACT_FREQUENCY_DAYS.other;

      return {
        personId,
        averageContactFrequencyDays: defaultFrequency,
        preferredContactTypes: ['text'],
        averageSentiment: 0.5,
        peakContactDays: [],
        lastCalculatedAt: new Date(),
      };
    }

    const frequencies: number[] = [];
    for (let i = 1; i < contacts.length; i++) {
      const diff = new Date(contacts[i - 1].occurredAt).getTime() - new Date(contacts[i].occurredAt).getTime();
      frequencies.push(diff / (1000 * 60 * 60 * 24));
    }

    const avgFrequency = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length;

    const contactTypeCounts: Record<string, number> = {};
    contacts.forEach((c) => {
      contactTypeCounts[c.type] = (contactTypeCounts[c.type] || 0) + 1;
    });

    const preferredTypes = Object.entries(contactTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type as any);

    const avgSentiment = this.calculateAverageSentiment(contacts);

    const dayOfWeekCounts: Record<number, number> = {};
    contacts.forEach((c) => {
      const day = new Date(c.occurredAt).getDay();
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
    });

    const peakDays = Object.entries(dayOfWeekCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([day]) => parseInt(day));

    const baseline: RelationshipBaseline = {
      personId,
      averageContactFrequencyDays: Math.round(avgFrequency),
      preferredContactTypes: preferredTypes,
      averageSentiment: avgSentiment,
      peakContactDays: peakDays,
      lastCalculatedAt: new Date(),
    };

    await this.saveBaseline(baseline);
    return baseline;
  }

  private async saveBaseline(baseline: RelationshipBaseline): Promise<void> {
    try {
      const baselinesJson = await AsyncStorage.getItem('lifeos_relationship_baselines');
      const baselines: RelationshipBaseline[] = baselinesJson ? JSON.parse(baselinesJson) : [];

      const index = baselines.findIndex((b) => b.personId === baseline.personId);
      if (index >= 0) {
        baselines[index] = baseline;
      } else {
        baselines.push(baseline);
      }

      await AsyncStorage.setItem('lifeos_relationship_baselines', JSON.stringify(baselines));
    } catch (error) {
      console.error('Error saving baseline:', error);
    }
  }

  private async saveDrift(drift: RelationshipDrift): Promise<void> {
    try {
      const driftsJson = await AsyncStorage.getItem('lifeos_relationship_drifts');
      const drifts: RelationshipDrift[] = driftsJson ? JSON.parse(driftsJson) : [];

      drifts.push(drift);

      if (drifts.length > 100) {
        drifts.splice(0, drifts.length - 100);
      }

      await AsyncStorage.setItem('lifeos_relationship_drifts', JSON.stringify(drifts));
    } catch (error) {
      console.error('Error saving drift:', error);
    }
  }

  public async getActiveDrifts(): Promise<RelationshipDrift[]> {
    try {
      const driftsJson = await AsyncStorage.getItem('lifeos_relationship_drifts');
      if (!driftsJson) return [];

      const drifts: RelationshipDrift[] = JSON.parse(driftsJson);
      return drifts.filter((d) => !d.resolvedAt);
    } catch (error) {
      console.error('Error getting drifts:', error);
      return [];
    }
  }

  public async resolveDrift(driftId: string): Promise<void> {
    try {
      const driftsJson = await AsyncStorage.getItem('lifeos_relationship_drifts');
      if (!driftsJson) return;

      const drifts: RelationshipDrift[] = JSON.parse(driftsJson);
      const drift = drifts.find((d) => d.id === driftId);

      if (drift) {
        drift.resolvedAt = new Date();
        await AsyncStorage.setItem('lifeos_relationship_drifts', JSON.stringify(drifts));
      }
    } catch (error) {
      console.error('Error resolving drift:', error);
    }
  }
}

export const driftDetector = new DriftDetector();
