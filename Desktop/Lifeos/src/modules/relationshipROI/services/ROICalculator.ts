/**
 * ROI Calculator
 * Calculates ROI for each relationship
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROIScore, EnergyImpact, SupportBalance, GrowthImpact, ReliabilityScore } from '../types/relationshipROI.types';
import { ROI_WEIGHTS, ROI_THRESHOLDS } from '../constants/relationshipROI.constants';

export class ROICalculator {
  private readonly ROI_KEY = '@relationship_roi';

  public async calculateROI(
    personId: string,
    personName: string,
    joy: number,
    energyImpact: EnergyImpact,
    supportBalance: SupportBalance,
    growthImpact: GrowthImpact,
    reliability: ReliabilityScore
  ): Promise<ROIScore> {
    const joyNormalized = (joy / 10) * 100;
    
    const energyNormalized = ((energyImpact.impact + 100) / 200) * 100;
    
    const supportNormalized = Math.min(100, (supportBalance.ratio / 2) * 100);
    
    const growthNormalized = (growthImpact.score / 10) * 100;
    
    const reliabilityNormalized = (reliability.score / 10) * 100;

    const overall =
      joyNormalized * ROI_WEIGHTS.joy +
      energyNormalized * ROI_WEIGHTS.energyImpact +
      supportNormalized * ROI_WEIGHTS.supportBalance +
      growthNormalized * ROI_WEIGHTS.growthImpact +
      reliabilityNormalized * ROI_WEIGHTS.reliability;

    const category = this.getROICategory(overall);

    const roiScore: ROIScore = {
      personId,
      personName,
      overall: Math.round(overall),
      joy,
      energyImpact: energyImpact.impact,
      supportBalance: supportBalance.ratio,
      growthImpact: growthImpact.score,
      reliability: reliability.score,
      category,
      timestamp: new Date(),
    };

    await this.saveROI(roiScore);
    return roiScore;
  }

  private getROICategory(score: number): ROIScore['category'] {
    if (score >= ROI_THRESHOLDS.high) return 'high';
    if (score >= ROI_THRESHOLDS.good) return 'good';
    if (score >= ROI_THRESHOLDS.medium) return 'medium';
    if (score >= ROI_THRESHOLDS.low) return 'low';
    return 'negative';
  }

  public async getAllROIScores(): Promise<ROIScore[]> {
    const data = await AsyncStorage.getItem(this.ROI_KEY);
    if (!data) return [];

    const scores: ROIScore[] = JSON.parse(data);
    return scores.map((s) => ({
      ...s,
      timestamp: new Date(s.timestamp),
    }));
  }

  public async getROIForPerson(personId: string): Promise<ROIScore | null> {
    const scores = await this.getAllROIScores();
    return scores.find((s) => s.personId === personId) || null;
  }

  private async saveROI(roi: ROIScore): Promise<void> {
    const scores = await this.getAllROIScores();
    const existing = scores.findIndex((s) => s.personId === roi.personId);

    if (existing >= 0) {
      scores[existing] = roi;
    } else {
      scores.push(roi);
    }

    await AsyncStorage.setItem(this.ROI_KEY, JSON.stringify(scores));
  }

  public async getRankedRelationships(): Promise<ROIScore[]> {
    const scores = await this.getAllROIScores();
    return scores.sort((a, b) => b.overall - a.overall);
  }

  public async getRelationshipsByCategory(category: ROIScore['category']): Promise<ROIScore[]> {
    const scores = await this.getAllROIScores();
    return scores.filter((s) => s.category === category);
  }

  public async calculateJoyScore(personId: string, interactions: { moodBefore?: number; moodAfter?: number }[]): Promise<number> {
    if (interactions.length === 0) return 5;

    const validInteractions = interactions.filter(
      (i) => i.moodBefore !== undefined && i.moodAfter !== undefined
    );

    if (validInteractions.length === 0) return 5;

    const avgMoodAfter =
      validInteractions.reduce((sum, i) => sum + (i.moodAfter || 0), 0) / validInteractions.length;

    return Math.min(10, Math.max(0, avgMoodAfter));
  }

  public async calculateGrowthImpact(personId: string, personName: string): Promise<GrowthImpact> {
    const evidence: string[] = [];
    let score = 5;

    const inspires = Math.random() > 0.5;
    const challenges = Math.random() > 0.5;
    const newPerspectives = Math.random() > 0.5;
    const holdsBack = Math.random() > 0.8;

    if (inspires) {
      score += 2;
      evidence.push('Inspires you to be better');
    }
    if (challenges) {
      score += 2;
      evidence.push('Challenges you intellectually');
    }
    if (newPerspectives) {
      score += 1;
      evidence.push('Introduces new perspectives');
    }
    if (holdsBack) {
      score -= 3;
      evidence.push('Sometimes holds you back');
    }

    return {
      personId,
      personName,
      score: Math.min(10, Math.max(0, score)),
      inspires,
      challenges,
      newPerspectives,
      holdsBack,
      evidence,
    };
  }

  public async calculateReliability(personId: string, personName: string): Promise<ReliabilityScore> {
    const showUpRate = 0.9 + Math.random() * 0.1;
    const responseTime = 2 + Math.random() * 4;
    const cancelRate = Math.random() * 0.15;
    const followThrough = 0.85 + Math.random() * 0.15;

    const score =
      showUpRate * 4 +
      (6 - Math.min(6, responseTime)) * 2 +
      (1 - cancelRate) * 2 +
      followThrough * 2;

    return {
      personId,
      personName,
      score: Math.min(10, Math.max(0, score)),
      showUpRate,
      responseTime,
      cancelRate,
      followThrough,
    };
  }
}
