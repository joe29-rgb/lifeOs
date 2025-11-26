/**
 * Investment Advisor
 * Recommends where to spend time
 */

import { InvestmentRecommendation, ROIScore, TimeAllocation } from '../types/relationshipROI.types';
import { INVESTMENT_ACTIONS } from '../constants/relationshipROI.constants';
import { ROICalculator } from './ROICalculator';

export class InvestmentAdvisor {
  private roiCalculator: ROICalculator;

  constructor() {
    this.roiCalculator = new ROICalculator();
  }

  public async generateRecommendations(): Promise<InvestmentRecommendation[]> {
    const scores = await this.roiCalculator.getRankedRelationships();
    const recommendations: InvestmentRecommendation[] = [];

    for (const score of scores) {
      const action = this.determineAction(score.overall);
      const currentHours = this.estimateCurrentHours(score.overall);
      const suggestedHours = this.calculateSuggestedHours(currentHours, action);
      const reasoning = this.buildReasoning(score, action);
      const potentialImpact = this.calculatePotentialImpact(score, action);

      recommendations.push({
        personId: score.personId,
        personName: score.personName,
        currentROI: score.overall,
        action,
        currentHours,
        suggestedHours,
        reasoning,
        potentialImpact,
      });
    }

    return recommendations;
  }

  private determineAction(roi: number): InvestmentRecommendation['action'] {
    if (roi >= INVESTMENT_ACTIONS.increase.minROI) return 'increase';
    if (roi >= INVESTMENT_ACTIONS.maintain.minROI) return 'maintain';
    return 'decrease';
  }

  private estimateCurrentHours(roi: number): number {
    if (roi >= 80) return 2;
    if (roi >= 60) return 2;
    if (roi >= 40) return 3;
    if (roi >= 20) return 2;
    return 1;
  }

  private calculateSuggestedHours(current: number, action: InvestmentRecommendation['action']): number {
    const multiplier = INVESTMENT_ACTIONS[action].multiplier;
    return Math.round(current * multiplier);
  }

  private buildReasoning(score: ROIScore, action: InvestmentRecommendation['action']): string[] {
    const reasons: string[] = [];

    if (action === 'increase') {
      if (score.joy >= 8) {
        reasons.push('Consistently brings you joy');
      }
      if (score.energyImpact > 20) {
        reasons.push('Energizes you significantly');
      }
      if (score.supportBalance >= 0.8 && score.supportBalance <= 1.2) {
        reasons.push('Healthy reciprocal support');
      }
      if (score.growthImpact >= 7) {
        reasons.push('Helps you grow and improve');
      }
      reasons.push('High return on investment');
    } else if (action === 'maintain') {
      reasons.push('Stable, positive relationship');
      if (score.reliability >= 7) {
        reasons.push('Reliable and consistent');
      }
      reasons.push('Worth preserving at current level');
    } else {
      if (score.joy < 5) {
        reasons.push('Low joy from interactions');
      }
      if (score.energyImpact < -10) {
        reasons.push('Drains your energy');
      }
      if (score.supportBalance > 2) {
        reasons.push('Imbalanced support (you give much more)');
      }
      reasons.push('Consider reducing time investment');
    }

    return reasons;
  }

  private calculatePotentialImpact(score: ROIScore, action: InvestmentRecommendation['action']): number {
    if (action === 'increase' && score.overall >= 80) {
      return 15;
    }
    if (action === 'decrease' && score.overall < 30) {
      return 10;
    }
    if (action === 'maintain') {
      return 5;
    }
    return 8;
  }

  public async getTimeAllocations(): Promise<TimeAllocation[]> {
    const recommendations = await this.generateRecommendations();

    return recommendations.map((rec) => ({
      personId: rec.personId,
      personName: rec.personName,
      currentHours: rec.currentHours,
      suggestedHours: rec.suggestedHours,
      change: rec.suggestedHours - rec.currentHours,
      roi: rec.currentROI,
    }));
  }

  public async calculatePortfolioImprovement(): Promise<number> {
    const recommendations = await this.generateRecommendations();
    
    const totalImpact = recommendations.reduce((sum, rec) => sum + rec.potentialImpact, 0);
    const avgImpact = totalImpact / Math.max(1, recommendations.length);

    return Math.round(avgImpact);
  }

  public async getActionableSteps(): Promise<{ action: string; impact: number }[]> {
    const recommendations = await this.generateRecommendations();
    const steps: { action: string; impact: number }[] = [];

    const highROI = recommendations.filter((r) => r.action === 'increase');
    const lowROI = recommendations.filter((r) => r.action === 'decrease');

    if (highROI.length > 0) {
      const top = highROI[0];
      steps.push({
        action: `Schedule more time with ${top.personName} (+${top.suggestedHours - top.currentHours}hrs)`,
        impact: top.potentialImpact,
      });
    }

    if (lowROI.length > 0) {
      const bottom = lowROI[0];
      steps.push({
        action: `Set boundaries with ${bottom.personName} (-${bottom.currentHours - bottom.suggestedHours}hrs)`,
        impact: bottom.potentialImpact,
      });
    }

    return steps.sort((a, b) => b.impact - a.impact);
  }
}
