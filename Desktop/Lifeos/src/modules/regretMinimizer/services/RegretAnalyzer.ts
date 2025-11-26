/**
 * Regret Analyzer
 * Analyzes past regrets and identifies patterns
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Regret, RegretAnalysis, RegretPattern } from '../types/regretMinimizer.types';

export class RegretAnalyzer {
  private readonly REGRETS_KEY = '@decision_regrets';

  public async getRegrets(): Promise<Regret[]> {
    const data = await AsyncStorage.getItem(this.REGRETS_KEY);
    if (!data) return [];

    const regrets: Regret[] = JSON.parse(data);
    return regrets.map((r) => ({
      ...r,
      date: new Date(r.date),
    }));
  }

  public async addRegret(regret: Omit<Regret, 'id'>): Promise<void> {
    const regrets = await this.getRegrets();
    const newRegret: Regret = {
      ...regret,
      id: `regret_${Date.now()}`,
    };
    regrets.push(newRegret);
    await AsyncStorage.setItem(this.REGRETS_KEY, JSON.stringify(regrets));
  }

  public async analyzeRegrets(): Promise<RegretAnalysis> {
    const regrets = await this.getRegrets();
    const decisions = await this.getAllDecisions();

    const totalDecisions = decisions.length;
    const totalRegrets = regrets.length;
    const regretRate = totalDecisions > 0 ? (totalRegrets / totalDecisions) * 100 : 0;

    const averageRegretIntensity =
      regrets.length > 0
        ? regrets.reduce((sum, r) => sum + r.regretIntensity, 0) / regrets.length
        : 0;

    const topRegretReasons = this.getTopReasons(regrets);
    const topLessons = this.getTopLessons(regrets);
    const patterns = this.identifyPatterns(regrets);

    return {
      totalDecisions,
      totalRegrets,
      regretRate,
      averageRegretIntensity,
      topRegretReasons,
      topLessons,
      patterns,
    };
  }

  private async getAllDecisions(): Promise<any[]> {
    const data = await AsyncStorage.getItem('@decisions');
    if (!data) return [];
    return JSON.parse(data);
  }

  private getTopReasons(regrets: Regret[]): string[] {
    const reasonCounts: Record<string, number> = {};

    for (const regret of regrets) {
      for (const reason of regret.regretReasons) {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      }
    }

    return Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason]) => reason);
  }

  private getTopLessons(regrets: Regret[]): string[] {
    const lessonCounts: Record<string, number> = {};

    for (const regret of regrets) {
      for (const lesson of regret.lessons) {
        lessonCounts[lesson] = (lessonCounts[lesson] || 0) + 1;
      }
    }

    return Object.entries(lessonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lesson]) => lesson);
  }

  private identifyPatterns(regrets: Regret[]): RegretPattern[] {
    const patterns: RegretPattern[] = [];

    const rushingPattern = this.findRushingPattern(regrets);
    if (rushingPattern) patterns.push(rushingPattern);

    const gutIgnoredPattern = this.findGutIgnoredPattern(regrets);
    if (gutIgnoredPattern) patterns.push(gutIgnoredPattern);

    const moneyMotivatedPattern = this.findMoneyMotivatedPattern(regrets);
    if (moneyMotivatedPattern) patterns.push(moneyMotivatedPattern);

    return patterns;
  }

  private findRushingPattern(regrets: Regret[]): RegretPattern | null {
    const rushingRegrets = regrets.filter((r) =>
      r.regretReasons.some((reason) => reason.toLowerCase().includes('rush'))
    );

    if (rushingRegrets.length < 2) return null;

    return {
      pattern: 'Rushing decisions',
      occurrences: rushingRegrets.length,
      regretRate: (rushingRegrets.length / regrets.length) * 100,
      examples: rushingRegrets.slice(0, 3).map((r) => r.decision),
      category: 'decision_making',
    };
  }

  private findGutIgnoredPattern(regrets: Regret[]): RegretPattern | null {
    const gutIgnoredRegrets = regrets.filter((r) =>
      r.regretReasons.some((reason) => reason.toLowerCase().includes('gut') || reason.toLowerCase().includes('ignored'))
    );

    if (gutIgnoredRegrets.length < 2) return null;

    return {
      pattern: 'Ignoring gut feeling',
      occurrences: gutIgnoredRegrets.length,
      regretRate: (gutIgnoredRegrets.length / regrets.length) * 100,
      examples: gutIgnoredRegrets.slice(0, 3).map((r) => r.decision),
      category: 'intuition',
    };
  }

  private findMoneyMotivatedPattern(regrets: Regret[]): RegretPattern | null {
    const moneyRegrets = regrets.filter((r) =>
      r.regretReasons.some((reason) => 
        reason.toLowerCase().includes('money') || 
        reason.toLowerCase().includes('salary') ||
        reason.toLowerCase().includes('pay')
      )
    );

    if (moneyRegrets.length < 2) return null;

    return {
      pattern: 'Money as primary motivator',
      occurrences: moneyRegrets.length,
      regretRate: (moneyRegrets.length / regrets.length) * 100,
      examples: moneyRegrets.slice(0, 3).map((r) => r.decision),
      category: 'values',
    };
  }

  public async getGutCheckAccuracy(): Promise<{ trusted: number; ignored: number; trustAccuracy: number; ignoreRegretRate: number }> {
    const regrets = await this.getRegrets();
    const decisions = await this.getAllDecisions();

    const gutTrusted = decisions.filter((d: any) => d.gutCheck?.trusted);
    const gutIgnored = decisions.filter((d: any) => d.gutCheck?.ignored);

    const trustedRegrets = regrets.filter((r) => 
      gutTrusted.some((d: any) => d.id === r.decisionId)
    );

    const ignoredRegrets = regrets.filter((r) =>
      gutIgnored.some((d: any) => d.id === r.decisionId)
    );

    return {
      trusted: gutTrusted.length,
      ignored: gutIgnored.length,
      trustAccuracy: gutTrusted.length > 0 ? ((gutTrusted.length - trustedRegrets.length) / gutTrusted.length) * 100 : 0,
      ignoreRegretRate: gutIgnored.length > 0 ? (ignoredRegrets.length / gutIgnored.length) * 100 : 0,
    };
  }
}
