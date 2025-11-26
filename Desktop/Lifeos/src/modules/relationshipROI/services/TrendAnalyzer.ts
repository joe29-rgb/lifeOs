/**
 * Trend Analyzer
 * Tracks relationship evolution
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RelationshipTrend, ROIScore } from '../types/relationshipROI.types';
import { TREND_PATTERNS } from '../constants/relationshipROI.constants';

export class TrendAnalyzer {
  private readonly TREND_KEY = '@relationship_trends';

  public async trackROI(personId: string, personName: string, roi: number, joy: number, energy: number): Promise<void> {
    const trends = await this.getAllTrends();
    const existing = trends.find((t) => t.personId === personId);

    const now = new Date();

    if (existing) {
      existing.roiHistory.push({ date: now, roi });
      existing.joyHistory.push({ date: now, joy });
      existing.energyHistory.push({ date: now, energy });

      if (existing.roiHistory.length > 12) {
        existing.roiHistory = existing.roiHistory.slice(-12);
        existing.joyHistory = existing.joyHistory.slice(-12);
        existing.energyHistory = existing.energyHistory.slice(-12);
      }

      existing.trend = this.calculateTrend(existing.roiHistory);
      existing.insight = this.generateInsight(existing.trend, existing.roiHistory);
    } else {
      const newTrend: RelationshipTrend = {
        personId,
        personName,
        roiHistory: [{ date: now, roi }],
        joyHistory: [{ date: now, joy }],
        energyHistory: [{ date: now, energy }],
        trend: 'stable',
        insight: 'Not enough data yet',
      };
      trends.push(newTrend);
    }

    await AsyncStorage.setItem(this.TREND_KEY, JSON.stringify(trends));
  }

  private calculateTrend(history: { date: Date; roi: number }[]): 'improving' | 'stable' | 'declining' {
    if (history.length < 2) return 'stable';

    const recent = history.slice(-3);
    const older = history.slice(0, Math.min(3, history.length - 3));

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, h) => sum + h.roi, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.roi, 0) / older.length;

    const change = recentAvg - olderAvg;

    if (change >= TREND_PATTERNS.improving.threshold) return 'improving';
    if (change <= TREND_PATTERNS.declining.threshold) return 'declining';
    return 'stable';
  }

  private generateInsight(trend: 'improving' | 'stable' | 'declining', history: { date: Date; roi: number }[]): string {
    if (history.length < 2) return 'Not enough data yet';

    const pattern = TREND_PATTERNS[trend];
    return pattern.message;
  }

  public async getTrend(personId: string): Promise<RelationshipTrend | null> {
    const trends = await this.getAllTrends();
    return trends.find((t) => t.personId === personId) || null;
  }

  public async getAllTrends(): Promise<RelationshipTrend[]> {
    const data = await AsyncStorage.getItem(this.TREND_KEY);
    if (!data) return [];

    const trends: RelationshipTrend[] = JSON.parse(data);
    return trends.map((t) => ({
      ...t,
      roiHistory: t.roiHistory.map((h) => ({ ...h, date: new Date(h.date) })),
      joyHistory: t.joyHistory.map((h) => ({ ...h, date: new Date(h.date) })),
      energyHistory: t.energyHistory.map((h) => ({ ...h, date: new Date(h.date) })),
    }));
  }

  public async getImprovingRelationships(): Promise<RelationshipTrend[]> {
    const trends = await this.getAllTrends();
    return trends.filter((t) => t.trend === 'improving');
  }

  public async getDecliningRelationships(): Promise<RelationshipTrend[]> {
    const trends = await this.getAllTrends();
    return trends.filter((t) => t.trend === 'declining');
  }

  public async getROIChange(personId: string, months: number = 6): Promise<number> {
    const trend = await this.getTrend(personId);
    if (!trend || trend.roiHistory.length < 2) return 0;

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const relevantHistory = trend.roiHistory.filter((h) => new Date(h.date) > cutoff);

    if (relevantHistory.length < 2) return 0;

    const oldest = relevantHistory[0].roi;
    const newest = relevantHistory[relevantHistory.length - 1].roi;

    return newest - oldest;
  }

  public async generateTrendSummary(): Promise<{
    improving: number;
    stable: number;
    declining: number;
    totalTracked: number;
  }> {
    const trends = await this.getAllTrends();

    return {
      improving: trends.filter((t) => t.trend === 'improving').length,
      stable: trends.filter((t) => t.trend === 'stable').length,
      declining: trends.filter((t) => t.trend === 'declining').length,
      totalTracked: trends.length,
    };
  }
}
