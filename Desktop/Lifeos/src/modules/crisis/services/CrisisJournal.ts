/**
 * Crisis Journal
 * Private logging and pattern tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CrisisJournalEntry } from '../types/crisis.types';

export class CrisisJournal {
  private readonly JOURNAL_KEY = '@crisis_journal_entries';

  public async addEntry(entry: Omit<CrisisJournalEntry, 'id' | 'timestamp'>): Promise<void> {
    const entries = await this.getEntries();
    const newEntry: CrisisJournalEntry = {
      ...entry,
      id: `entry_${Date.now()}`,
      timestamp: new Date(),
    };
    entries.push(newEntry);
    await AsyncStorage.setItem(this.JOURNAL_KEY, JSON.stringify(entries));
  }

  public async getEntries(): Promise<CrisisJournalEntry[]> {
    const data = await AsyncStorage.getItem(this.JOURNAL_KEY);
    if (!data) return [];
    
    const entries: CrisisJournalEntry[] = JSON.parse(data);
    return entries.map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
  }

  public async markResolved(id: string): Promise<void> {
    const entries = await this.getEntries();
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      entry.resolved = true;
      await AsyncStorage.setItem(this.JOURNAL_KEY, JSON.stringify(entries));
    }
  }

  public async getPatternAnalysis(): Promise<{
    frequency: number;
    commonTriggers: string[];
    whatHelps: string[];
    averageIntensity: number;
  }> {
    const entries = await this.getEntries();
    const last30Days = entries.filter((e) => {
      const daysSince = (Date.now() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });

    const frequency = last30Days.length;
    const averageIntensity = last30Days.length > 0
      ? last30Days.reduce((sum, e) => sum + e.intensity, 0) / last30Days.length
      : 0;

    const triggerCounts: Record<string, number> = {};
    const helpCounts: Record<string, number> = {};

    for (const entry of last30Days) {
      for (const help of entry.whatHelped) {
        helpCounts[help] = (helpCounts[help] || 0) + 1;
      }
    }

    const commonTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger]) => trigger);

    const whatHelps = Object.entries(helpCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([help]) => help);

    return {
      frequency,
      commonTriggers,
      whatHelps,
      averageIntensity,
    };
  }
}
