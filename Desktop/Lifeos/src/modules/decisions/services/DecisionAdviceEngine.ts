/**
 * Decision Advice Engine
 * Provides advice based on past similar decisions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Decision, DecisionAdvice, DecisionOutcome } from '../types/decision.types';
import { decisionLogger } from './DecisionLogger';
import { decisionOutcomeTracker } from './DecisionOutcomeTracker';

export class DecisionAdviceEngine {
  public async getAdviceForDecision(decision: Decision): Promise<DecisionAdvice[]> {
    const allDecisions = await decisionLogger.getAllDecisions();
    const allOutcomes = await decisionOutcomeTracker.getAllOutcomes();

    const similarDecisions = this.findSimilarDecisions(decision, allDecisions);
    const advice: DecisionAdvice[] = [];

    for (const similarDecision of similarDecisions) {
      const outcome = allOutcomes.find((o) => o.decisionId === similarDecision.id);
      if (outcome) {
        const adviceItem = await this.createAdvice(decision, similarDecision, outcome);
        advice.push(adviceItem);
      }
    }

    advice.sort((a, b) => b.relevanceScore - a.relevanceScore);

    await this.saveAdvice(advice);
    return advice.slice(0, 3);
  }

  private findSimilarDecisions(decision: Decision, allDecisions: Decision[]): Decision[] {
    const similar: Array<{ decision: Decision; score: number }> = [];

    allDecisions.forEach((d) => {
      if (d.id === decision.id || d.status !== 'reviewed') return;

      let score = 0;

      if (d.category === decision.category) score += 3;

      const sharedEmotions = d.emotions.filter((e) => decision.emotions.includes(e));
      score += sharedEmotions.length;

      const sharedPeople = d.consultedPeople.filter((p) =>
        decision.consultedPeople.includes(p)
      );
      score += sharedPeople.length * 2;

      if (Math.abs(d.confidence - decision.confidence) <= 1) score += 1;

      const titleSimilarity = this.calculateTitleSimilarity(decision.title, d.title);
      score += titleSimilarity * 2;

      if (score > 0) {
        similar.push({ decision: d, score });
      }
    });

    similar.sort((a, b) => b.score - a.score);

    return similar.slice(0, 5).map((s) => s.decision);
  }

  private calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = title1.toLowerCase().split(/\s+/);
    const words2 = title2.toLowerCase().split(/\s+/);

    const commonWords = words1.filter((w) => words2.includes(w) && w.length > 3);
    const totalWords = Math.max(words1.length, words2.length);

    return commonWords.length / totalWords;
  }

  private async createAdvice(
    currentDecision: Decision,
    pastDecision: Decision,
    outcome: DecisionOutcome
  ): Promise<DecisionAdvice> {
    const relevanceScore = this.calculateRelevanceScore(currentDecision, pastDecision);

    let advice = '';
    if (outcome.satisfaction >= 4) {
      advice = `Last time you chose "${this.getChoiceDescription(pastDecision)}", it worked out great! ${outcome.adviceToPastSelf}`;
    } else if (outcome.satisfaction <= 2) {
      advice = `Be careful: Last time you chose "${this.getChoiceDescription(pastDecision)}", you regretted it. ${outcome.adviceToPastSelf}`;
    } else {
      advice = `Last time you made a similar choice, it was okay. Here's what you learned: ${outcome.adviceToPastSelf}`;
    }

    return {
      id: `advice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      decisionId: currentDecision.id,
      sourceDecisionId: pastDecision.id,
      advice,
      pastOutcome: this.formatOutcome(outcome),
      relevanceScore,
      createdAt: new Date(),
    };
  }

  private calculateRelevanceScore(current: Decision, past: Decision): number {
    let score = 0;

    if (current.category === past.category) score += 0.3;

    const sharedEmotions = current.emotions.filter((e) => past.emotions.includes(e));
    score += sharedEmotions.length * 0.1;

    const sharedPeople = current.consultedPeople.filter((p) =>
      past.consultedPeople.includes(p)
    );
    score += sharedPeople.length * 0.2;

    const titleSimilarity = this.calculateTitleSimilarity(current.title, past.title);
    score += titleSimilarity * 0.4;

    return Math.min(score, 1.0);
  }

  private getChoiceDescription(decision: Decision): string {
    if (!decision.selectedChoiceId) return 'that option';

    const choice = decision.choices.find((c) => c.id === decision.selectedChoiceId);
    return choice?.description || 'that option';
  }

  private formatOutcome(outcome: DecisionOutcome): string {
    const satisfaction = ['Big Regret', 'Some Regret', 'Neutral', 'Pretty Happy', 'Amazing Choice'][
      outcome.satisfaction - 1
    ];

    return `${satisfaction}. ${outcome.whatWentRight.join(', ')}`;
  }

  private async saveAdvice(advice: DecisionAdvice[]): Promise<void> {
    try {
      const adviceJson = await AsyncStorage.getItem('lifeos_decision_advice');
      const allAdvice: DecisionAdvice[] = adviceJson ? JSON.parse(adviceJson) : [];

      advice.forEach((a) => {
        const index = allAdvice.findIndex((existing) => existing.id === a.id);
        if (index >= 0) {
          allAdvice[index] = a;
        } else {
          allAdvice.push(a);
        }
      });

      await AsyncStorage.setItem('lifeos_decision_advice', JSON.stringify(allAdvice));
    } catch (error) {
      console.error('Error saving advice:', error);
    }
  }

  public async getAdviceForDecisionId(decisionId: string): Promise<DecisionAdvice[]> {
    try {
      const adviceJson = await AsyncStorage.getItem('lifeos_decision_advice');
      if (!adviceJson) return [];

      const allAdvice: DecisionAdvice[] = JSON.parse(adviceJson);
      return allAdvice.filter((a) => a.decisionId === decisionId);
    } catch (error) {
      console.error('Error getting advice:', error);
      return [];
    }
  }
}

export const decisionAdviceEngine = new DecisionAdviceEngine();
