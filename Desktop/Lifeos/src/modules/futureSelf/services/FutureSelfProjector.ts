/**
 * Future Self Projector
 * Projects 5-year trajectory from current data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FutureProjection,
  PillarProjection,
  Warning,
  Opportunity,
} from '../types/futureSelf.types';
import {
  PROJECTION_YEARS,
  TRAJECTORY_THRESHOLDS,
  WARNING_TEMPLATES,
  OPPORTUNITY_TEMPLATES,
} from '../constants/futureSelf.constants';

export class FutureSelfProjector {
  private readonly PROJECTION_KEY = '@future_projection';

  public async generateProjection(
    userId: string,
    currentPillarScores: {
      career: number;
      health: number;
      relationships: number;
      mentalHealth: number;
    }
  ): Promise<FutureProjection> {
    const currentScore = this.calculateOverallScore(currentPillarScores);
    
    const careerProjection = this.projectPillar('Career', currentPillarScores.career, 0.18);
    const healthProjection = this.projectPillar('Health', currentPillarScores.health, 0.08);
    const relationshipsProjection = this.projectPillar('Relationships', currentPillarScores.relationships, 0.16);
    const mentalHealthProjection = this.projectPillar('Mental Health', currentPillarScores.mentalHealth, 0.20);

    const projectedScore = this.calculateOverallScore({
      career: careerProjection.projectedScore,
      health: healthProjection.projectedScore,
      relationships: relationshipsProjection.projectedScore,
      mentalHealth: mentalHealthProjection.projectedScore,
    });

    const trajectory = this.determineTrajectory(currentScore, projectedScore);
    const warnings = this.generateWarnings(currentPillarScores);
    const opportunities = this.generateOpportunities(currentPillarScores);

    const projection: FutureProjection = {
      userId,
      projectionDate: new Date(Date.now() + PROJECTION_YEARS * 365 * 24 * 60 * 60 * 1000),
      currentScore,
      projectedScore,
      trajectory,
      pillars: {
        career: careerProjection,
        health: healthProjection,
        relationships: relationshipsProjection,
        mentalHealth: mentalHealthProjection,
      },
      warnings,
      opportunities,
    };

    await this.saveProjection(projection);
    return projection;
  }

  private projectPillar(name: string, currentScore: number, growthRate: number): PillarProjection {
    const projectedScore = Math.min(10, currentScore + growthRate * PROJECTION_YEARS);
    const trend = this.determinePillarTrend(currentScore, projectedScore);
    const details = [`Current: ${currentScore.toFixed(1)}/10`, `Projected: ${projectedScore.toFixed(1)}/10`];
    const keyMetrics = { score: { current: currentScore, projected: projectedScore } };

    return { pillarName: name, currentScore, projectedScore, trend, details, keyMetrics };
  }

  private determinePillarTrend(current: number, projected: number): 'improving' | 'stable' | 'declining' {
    const change = (projected - current) / PROJECTION_YEARS;
    if (change >= TRAJECTORY_THRESHOLDS.improving) return 'improving';
    if (change <= TRAJECTORY_THRESHOLDS.declining) return 'declining';
    return 'stable';
  }

  private calculateOverallScore(scores: Record<string, number>): number {
    const values = Object.values(scores);
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private determineTrajectory(current: number, projected: number): 'improving' | 'stable' | 'declining' {
    const change = (projected - current) / PROJECTION_YEARS;
    if (change >= TRAJECTORY_THRESHOLDS.improving) return 'improving';
    if (change <= TRAJECTORY_THRESHOLDS.declining) return 'declining';
    return 'stable';
  }

  private generateWarnings(scores: Record<string, number>): Warning[] {
    const warnings: Warning[] = [];

    if (scores.career > 8 && scores.health < 6) {
      warnings.push({
        id: 'burnout_risk',
        ...WARNING_TEMPLATES.burnout,
        pillar: 'Career',
        description: 'High career focus with declining health indicates burnout risk',
      });
    }

    if (scores.relationships < 5) {
      warnings.push({
        id: 'isolation_risk',
        ...WARNING_TEMPLATES.isolation,
        pillar: 'Relationships',
        description: 'Low relationship score may lead to isolation',
      });
    }

    return warnings;
  }

  private generateOpportunities(scores: Record<string, number>): Opportunity[] {
    const opportunities: Opportunity[] = [];

    if (scores.career < 8) {
      opportunities.push({
        id: 'career_growth',
        pillar: 'Career',
        ...OPPORTUNITY_TEMPLATES.career_growth,
        description: 'Room for career advancement and skill development',
      });
    }

    if (scores.relationships < 9) {
      opportunities.push({
        id: 'relationship_investment',
        pillar: 'Relationships',
        ...OPPORTUNITY_TEMPLATES.relationship_investment,
        description: 'Opportunity to deepen meaningful connections',
      });
    }

    return opportunities;
  }

  private async saveProjection(projection: FutureProjection): Promise<void> {
    await AsyncStorage.setItem(this.PROJECTION_KEY, JSON.stringify(projection));
  }

  public async getProjection(userId: string): Promise<FutureProjection | null> {
    const data = await AsyncStorage.getItem(this.PROJECTION_KEY);
    if (!data) return null;

    const projection: FutureProjection = JSON.parse(data);
    return projection.userId === userId ? projection : null;
  }
}
