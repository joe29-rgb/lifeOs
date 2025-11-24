/**
 * Decision Analyzer
 * Analyzes decision patterns and generates insights
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Decision, DecisionOutcome, DecisionPattern, DecisionStats } from '../types/decision.types';
import { decisionLogger } from './DecisionLogger';
import { decisionOutcomeTracker } from './DecisionOutcomeTracker';

export class DecisionAnalyzer {
  public async generatePatterns(): Promise<DecisionPattern[]> {
    const decisions = await decisionLogger.getAllDecisions();
    const outcomes = await decisionOutcomeTracker.getAllOutcomes();

    const patterns: DecisionPattern[] = [];

    patterns.push(...await this.analyzeTimeOfDay(decisions, outcomes));
    patterns.push(...await this.analyzeCategory(decisions, outcomes));
    patterns.push(...await this.analyzeEmotions(decisions, outcomes));
    patterns.push(...await this.analyzeConsultation(decisions, outcomes));
    patterns.push(...await this.analyzeConfidence(decisions, outcomes));

    await this.savePatterns(patterns);
    return patterns;
  }

  private async analyzeTimeOfDay(
    decisions: Decision[],
    outcomes: DecisionOutcome[]
  ): Promise<DecisionPattern[]> {
    const hourlyStats: Record<number, { total: number; successful: number }> = {};

    decisions.forEach((decision) => {
      if (!decision.decidedAt) return;

      const hour = new Date(decision.decidedAt).getHours();
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { total: 0, successful: 0 };
      }

      hourlyStats[hour].total += 1;

      const outcome = outcomes.find((o) => o.decisionId === decision.id);
      if (outcome && outcome.satisfaction >= 4) {
        hourlyStats[hour].successful += 1;
      }
    });

    const patterns: DecisionPattern[] = [];
    const userId = await this.getUserId();
    
    Object.entries(hourlyStats).forEach(([hour, stats]) => {
      if (stats.total >= 3) {
        const successRate = stats.successful / stats.total;
        const timeLabel = this.formatHour(parseInt(hour));

        patterns.push({
          id: `pattern_time_${hour}`,
          userId,
          patternType: 'time_of_day',
          description: `Decisions made at ${timeLabel}`,
          successRate,
          sampleSize: stats.total,
          insight:
            successRate >= 0.7
              ? `Your best decisions happen at ${timeLabel}`
              : `Decisions at ${timeLabel} need more thought`,
          createdAt: new Date(),
        });
      }
    });

    return patterns;
  }

  private async analyzeCategory(
    decisions: Decision[],
    outcomes: DecisionOutcome[]
  ): Promise<DecisionPattern[]> {
    const categoryStats: Record<string, { total: number; successful: number }> = {};

    decisions.forEach((decision) => {
      const category = decision.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, successful: 0 };
      }

      categoryStats[category].total += 1;

      const outcome = outcomes.find((o) => o.decisionId === decision.id);
      if (outcome && outcome.satisfaction >= 4) {
        categoryStats[category].successful += 1;
      }
    });

    const patterns: DecisionPattern[] = [];
    const userId = await this.getUserId();
    
    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.total >= 3) {
        const successRate = stats.successful / stats.total;
        const percent = Math.round(successRate * 100);

        patterns.push({
          id: `pattern_category_${category}`,
          userId,
          patternType: 'category',
          description: `${category} decisions`,
          successRate,
          sampleSize: stats.total,
          insight: `You nail ${category} choices ${percent}% of the time`,
          createdAt: new Date(),
        });
      }
    });

    return patterns;
  }

  private async analyzeEmotions(
    decisions: Decision[],
    outcomes: DecisionOutcome[]
  ): Promise<DecisionPattern[]> {
    const emotionStats: Record<string, { total: number; successful: number }> = {};

    decisions.forEach((decision) => {
      decision.emotions.forEach((emotion) => {
        if (!emotionStats[emotion]) {
          emotionStats[emotion] = { total: 0, successful: 0 };
        }

        emotionStats[emotion].total += 1;

        const outcome = outcomes.find((o) => o.decisionId === decision.id);
        if (outcome && outcome.satisfaction >= 4) {
          emotionStats[emotion].successful += 1;
        }
      });
    });

    const patterns: DecisionPattern[] = [];
    const userId = await this.getUserId();
    
    Object.entries(emotionStats).forEach(([emotion, stats]) => {
      if (stats.total >= 3) {
        const successRate = stats.successful / stats.total;

        patterns.push({
          id: `pattern_emotion_${emotion}`,
          userId,
          patternType: 'emotion',
          description: `Decisions when feeling ${emotion}`,
          successRate,
          sampleSize: stats.total,
          insight:
            successRate >= 0.7
              ? `When you feel ${emotion}, you usually make great calls`
              : `Be careful when feeling ${emotion}`,
          createdAt: new Date(),
        });
      }
    });

    return patterns;
  }

  private async analyzeConsultation(
    decisions: Decision[],
    outcomes: DecisionOutcome[]
  ): Promise<DecisionPattern[]> {
    const consultationStats: Record<string, { total: number; successful: number }> = {};

    decisions.forEach((decision) => {
      decision.consultedPeople.forEach((personId) => {
        if (!consultationStats[personId]) {
          consultationStats[personId] = { total: 0, successful: 0 };
        }

        consultationStats[personId].total += 1;

        const outcome = outcomes.find((o) => o.decisionId === decision.id);
        if (outcome && outcome.satisfaction >= 4) {
          consultationStats[personId].successful += 1;
        }
      });
    });

    const patterns: DecisionPattern[] = [];
    for (const [personId, stats] of Object.entries(consultationStats)) {
      if (stats.total >= 3) {
        const successRate = stats.successful / stats.total;
        const personName = await this.getPersonName(personId);

        patterns.push({
          id: `pattern_consultation_${personId}`,
          userId: await this.getUserId(),
          patternType: 'consultation',
          description: `Decisions after consulting ${personName}`,
          successRate,
          sampleSize: stats.total,
          insight: `Talking to ${personName} leads to better outcomes`,
          createdAt: new Date(),
        });
      }
    }

    return patterns;
  }

  private async analyzeConfidence(
    decisions: Decision[],
    outcomes: DecisionOutcome[]
  ): Promise<DecisionPattern[]> {
    const confidenceStats: Record<number, { total: number; successful: number }> = {};

    decisions.forEach((decision) => {
      const confidence = decision.confidence;
      if (!confidenceStats[confidence]) {
        confidenceStats[confidence] = { total: 0, successful: 0 };
      }

      confidenceStats[confidence].total += 1;

      const outcome = outcomes.find((o) => o.decisionId === decision.id);
      if (outcome && outcome.satisfaction >= 4) {
        confidenceStats[confidence].successful += 1;
      }
    });

    const patterns: DecisionPattern[] = [];
    const userId = await this.getUserId();
    
    Object.entries(confidenceStats).forEach(([confidence, stats]) => {
      if (stats.total >= 3) {
        const successRate = stats.successful / stats.total;

        patterns.push({
          id: `pattern_confidence_${confidence}`,
          userId,
          patternType: 'confidence',
          description: `Decisions with confidence level ${confidence}`,
          successRate,
          sampleSize: stats.total,
          insight: `Your confidence-${confidence} decisions work out best`,
          createdAt: new Date(),
        });
      }
    });

    return patterns;
  }

  public async getStats(): Promise<DecisionStats> {
    const decisions = await decisionLogger.getAllDecisions();
    const outcomes = await decisionOutcomeTracker.getAllOutcomes();

    const reviewedDecisions = decisions.filter((d) => d.status === 'reviewed');
    const satisfactions = outcomes.map((o) => o.satisfaction);
    const avgSatisfaction =
      satisfactions.length > 0
        ? satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length
        : 0;

    const categorySuccess = this.calculateCategorySuccess(decisions, outcomes);
    const timeSuccess = this.calculateTimeSuccess(decisions, outcomes);

    return {
      totalDecisions: decisions.length,
      reviewedDecisions: reviewedDecisions.length,
      averageSatisfaction: avgSatisfaction,
      bestCategory: categorySuccess.best,
      worstCategory: categorySuccess.worst,
      bestTimeOfDay: timeSuccess.best,
      worstTimeOfDay: timeSuccess.worst,
      highestSuccessRate: categorySuccess.bestRate,
      patternsIdentified: (await this.getPatterns()).length,
    };
  }

  private calculateCategorySuccess(decisions: Decision[], outcomes: DecisionOutcome[]) {
    const categoryStats: Record<string, { total: number; successful: number }> = {};

    decisions.forEach((decision) => {
      const category = decision.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, successful: 0 };
      }

      categoryStats[category].total += 1;

      const outcome = outcomes.find((o) => o.decisionId === decision.id);
      if (outcome && outcome.satisfaction >= 4) {
        categoryStats[category].successful += 1;
      }
    });

    let bestCategory: any = 'other';
    let worstCategory: any = 'other';
    let bestRate = 0;
    let worstRate = 1;

    Object.entries(categoryStats).forEach(([category, stats]) => {
      const rate = stats.successful / stats.total;
      if (rate > bestRate) {
        bestRate = rate;
        bestCategory = category;
      }
      if (rate < worstRate) {
        worstRate = rate;
        worstCategory = category;
      }
    });

    return { best: bestCategory, worst: worstCategory, bestRate };
  }

  private calculateTimeSuccess(decisions: Decision[], outcomes: DecisionOutcome[]) {
    const hourlyStats: Record<number, { total: number; successful: number }> = {};

    decisions.forEach((decision) => {
      if (!decision.decidedAt) return;

      const hour = new Date(decision.decidedAt).getHours();
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { total: 0, successful: 0 };
      }

      hourlyStats[hour].total += 1;

      const outcome = outcomes.find((o) => o.decisionId === decision.id);
      if (outcome && outcome.satisfaction >= 4) {
        hourlyStats[hour].successful += 1;
      }
    });

    let bestHour = 9;
    let worstHour = 21;
    let bestRate = 0;
    let worstRate = 1;

    Object.entries(hourlyStats).forEach(([hour, stats]) => {
      const rate = stats.successful / stats.total;
      if (rate > bestRate) {
        bestRate = rate;
        bestHour = parseInt(hour);
      }
      if (rate < worstRate) {
        worstRate = rate;
        worstHour = parseInt(hour);
      }
    });

    return { best: bestHour, worst: worstHour };
  }

  private async getPatterns(): Promise<DecisionPattern[]> {
    try {
      const patternsJson = await AsyncStorage.getItem('lifeos_decision_patterns');
      if (!patternsJson) return [];

      return JSON.parse(patternsJson);
    } catch (error) {
      console.error('Error getting patterns:', error);
      return [];
    }
  }

  private async savePatterns(patterns: DecisionPattern[]): Promise<void> {
    try {
      await AsyncStorage.setItem('lifeos_decision_patterns', JSON.stringify(patterns));
    } catch (error) {
      console.error('Error saving patterns:', error);
    }
  }

  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${period}`;
  }

  private async getPersonName(personId: string): Promise<string> {
    try {
      const peopleJson = await AsyncStorage.getItem('lifeos_people');
      if (!peopleJson) return 'Someone';

      const people = JSON.parse(peopleJson);
      const person = people.find((p: any) => p.id === personId);
      return person?.name || 'Someone';
    } catch {
      return 'Someone';
    }
  }

  private async getUserId(): Promise<string> {
    try {
      const userId = await AsyncStorage.getItem('timeline_user_id');
      return userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }
}

export const decisionAnalyzer = new DecisionAnalyzer();
