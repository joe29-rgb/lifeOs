/**
 * Intelligence Engine
 * Generates insights from patterns and calculates life intelligence score
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Insight, Pattern, PillarHealth, LifeIntelligence, WeekForecast } from '../types/integration.types';
import { PILLAR_WEIGHTS, SCORE_THRESHOLDS } from '../constants/integration.constants';
import { PatternMiner } from './PatternMiner';
import { DataHub } from './DataHub';

export class IntelligenceEngine {
  private readonly INSIGHTS_KEY = '@integration_insights';
  private patternMiner: PatternMiner;
  private dataHub: DataHub;

  constructor() {
    this.patternMiner = new PatternMiner();
    this.dataHub = new DataHub();
  }

  public async generateLifeIntelligence(): Promise<LifeIntelligence> {
    const pillarHealth = await this.calculatePillarHealth();
    const overallScore = this.calculateOverallScore(pillarHealth);
    const weeklyChange = await this.calculateWeeklyChange(overallScore);
    const insights = await this.generateInsights();
    const topInsight = insights.length > 0 ? insights[0] : null;
    const weekForecast = await this.generateWeekForecast(pillarHealth);

    return {
      overallScore,
      weeklyChange,
      topInsight,
      pillarHealth,
      smartActions: [],
      weekForecast,
      updatedAt: new Date(),
    };
  }

  private async calculatePillarHealth(): Promise<PillarHealth[]> {
    const pillars: PillarHealth[] = [];

    const healthStats = await this.dataHub.getAggregateStats('health', 'mood', 7);
    pillars.push({
      pillar: 'health',
      score: healthStats.avg,
      trend: healthStats.trend > 0.5 ? 'improving' : healthStats.trend < -0.5 ? 'declining' : 'stable',
      status: this.getStatus(healthStats.avg),
      message: this.getHealthMessage(healthStats.avg, healthStats.trend),
    });

    const procrastStats = await this.dataHub.getAggregateStats('procrastination', 'avoidance_rate', 7);
    const procrastScore = Math.max(0, 10 - procrastStats.avg);
    pillars.push({
      pillar: 'procrastination',
      score: procrastScore,
      trend: procrastStats.trend < -0.5 ? 'improving' : procrastStats.trend > 0.5 ? 'declining' : 'stable',
      status: this.getStatus(procrastScore),
      message: this.getProcrastMessage(procrastScore, procrastStats.trend),
    });

    const decisionStats = await this.dataHub.getAggregateStats('decisions', 'decision_quality', 7);
    pillars.push({
      pillar: 'decisions',
      score: decisionStats.avg,
      trend: decisionStats.trend > 0.5 ? 'improving' : decisionStats.trend < -0.5 ? 'declining' : 'stable',
      status: this.getStatus(decisionStats.avg),
      message: this.getDecisionMessage(decisionStats.avg, decisionStats.trend),
    });

    pillars.push({
      pillar: 'relationships',
      score: 8.0,
      trend: 'stable',
      status: 'excellent',
      message: 'All relationships healthy',
    });

    pillars.push({
      pillar: 'simulator',
      score: 7.2,
      trend: 'improving',
      status: 'good',
      message: 'On good career trajectory',
    });

    return pillars;
  }

  private getStatus(score: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (score >= SCORE_THRESHOLDS.excellent) return 'excellent';
    if (score >= SCORE_THRESHOLDS.good) return 'good';
    if (score >= SCORE_THRESHOLDS.warning) return 'warning';
    return 'critical';
  }

  private getHealthMessage(score: number, trend: number): string {
    if (score >= 8 && trend > 0) return 'Excellent health streak!';
    if (score >= 8) return 'Maintaining great health';
    if (score >= 7) return 'Good health overall';
    if (trend < 0) return 'Health declining - take action';
    return 'Health needs attention';
  }

  private getProcrastMessage(score: number, trend: number): string {
    if (score >= 8) return 'Low procrastination - crushing it!';
    if (score >= 7) return 'Managing tasks well';
    if (trend < 0) return 'Procrastination increasing';
    return 'High avoidance detected';
  }

  private getDecisionMessage(score: number, trend: number): string {
    if (score >= 8) return 'Making excellent decisions';
    if (score >= 7) return 'Good decision quality';
    if (trend < 0) return 'Decision quality declining';
    return 'Decisions need more thought';
  }

  private calculateOverallScore(pillarHealth: PillarHealth[]): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const health of pillarHealth) {
      const weight = PILLAR_WEIGHTS[health.pillar];
      weightedSum += health.score * weight;
      totalWeight += weight;
    }

    return parseFloat((weightedSum / totalWeight).toFixed(1));
  }

  private async calculateWeeklyChange(currentScore: number): Promise<number> {
    const lastWeekData = await AsyncStorage.getItem('@last_week_score');
    if (!lastWeekData) {
      await AsyncStorage.setItem('@last_week_score', currentScore.toString());
      return 0;
    }

    const lastWeekScore = parseFloat(lastWeekData);
    const change = currentScore - lastWeekScore;
    await AsyncStorage.setItem('@last_week_score', currentScore.toString());
    
    return parseFloat(change.toFixed(1));
  }

  private async generateInsights(): Promise<Insight[]> {
    const patterns = await this.patternMiner.getPatterns();
    const insights: Insight[] = [];

    for (const pattern of patterns.slice(0, 5)) {
      const insight: Insight = {
        id: `insight_${pattern.id}`,
        pattern,
        message: pattern.description,
        impact: pattern.correlation > 0.7 ? 'positive' : pattern.correlation < 0.3 ? 'negative' : 'neutral',
        actionable: true,
        actions: this.generateActions(pattern),
        score: pattern.correlation * pattern.occurrences,
        createdAt: new Date(),
        dismissed: false,
      };
      insights.push(insight);
    }

    insights.sort((a, b) => b.score - a.score);
    await AsyncStorage.setItem(this.INSIGHTS_KEY, JSON.stringify(insights));
    
    return insights;
  }

  private generateActions(pattern: Pattern): string[] {
    const actions: string[] = [];

    if (pattern.eventA.includes('sleep') && pattern.eventB.includes('procrastination')) {
      actions.push('Set sleep goal: 7+ hours');
      actions.push('Track sleep-productivity correlation');
    } else if (pattern.eventA.includes('exercise') && pattern.eventB.includes('mood')) {
      actions.push('Maintain exercise streak');
      actions.push('Exercise when feeling low');
    } else if (pattern.eventA.includes('stress') && pattern.eventB.includes('communication')) {
      actions.push('Schedule relationship check-ins during stress');
      actions.push('Set stress alerts');
    } else {
      actions.push(`Monitor ${pattern.eventA} in ${pattern.pillarA}`);
      actions.push(`Track impact on ${pattern.eventB} in ${pattern.pillarB}`);
    }

    return actions;
  }

  private async generateWeekForecast(pillarHealth: PillarHealth[]): Promise<WeekForecast> {
    const healthPillar = pillarHealth.find((p) => p.pillar === 'health');
    const procrastPillar = pillarHealth.find((p) => p.pillar === 'procrastination');

    const energy = healthPillar ? healthPillar.score : 7;
    const productivity = procrastPillar && procrastPillar.score >= 7 ? 'high' : procrastPillar && procrastPillar.score >= 5 ? 'medium' : 'low';
    const mood = healthPillar ? healthPillar.score : 7;

    const risks: string[] = [];
    const opportunities: string[] = [];

    if (energy < 6) risks.push('Low energy - burnout risk');
    if (productivity === 'low') risks.push('High procrastination');
    
    if (energy >= 8) opportunities.push('High energy - tackle big tasks');
    if (mood >= 8) opportunities.push('Great mood - make important decisions');

    return {
      energy,
      productivity,
      mood,
      career: 'stable',
      risks,
      opportunities,
    };
  }

  public async getInsights(): Promise<Insight[]> {
    const data = await AsyncStorage.getItem(this.INSIGHTS_KEY);
    if (!data) return [];
    
    const insights: Insight[] = JSON.parse(data);
    return insights.map((i) => ({
      ...i,
      createdAt: new Date(i.createdAt),
      pattern: {
        ...i.pattern,
        createdAt: new Date(i.pattern.createdAt),
        lastSeen: new Date(i.pattern.lastSeen),
      },
    }));
  }
}
