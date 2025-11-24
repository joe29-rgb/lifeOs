/**
 * Decision Logger
 * Manages decision creation, updates, and storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Decision, DecisionChoice } from '../types/decision.types';
import { REVIEW_DELAY_MONTHS } from '../constants/decision.constants';

export class DecisionLogger {
  public async createDecision(decision: Partial<Decision>): Promise<Decision> {
    const newDecision: Decision = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: decision.userId || await this.getUserId(),
      title: decision.title || 'Untitled Decision',
      description: decision.description || '',
      choices: decision.choices || [],
      confidence: decision.confidence || 3,
      emotions: decision.emotions || [],
      consultedPeople: decision.consultedPeople || [],
      category: decision.category || 'other',
      status: 'pending',
      createdAt: new Date(),
      voiceTranscript: decision.voiceTranscript,
      detectedFromAudio: decision.detectedFromAudio || false,
    };

    await this.saveDecision(newDecision);
    return newDecision;
  }

  public async makeDecision(
    decisionId: string,
    selectedChoiceId: string,
    confidence: number
  ): Promise<Decision> {
    const decision = await this.getDecision(decisionId);
    if (!decision) {
      throw new Error('Decision not found');
    }

    decision.selectedChoiceId = selectedChoiceId;
    decision.confidence = confidence;
    decision.status = 'made';
    decision.decidedAt = new Date();
    decision.reviewScheduledFor = this.calculateReviewDate();

    await this.saveDecision(decision);
    return decision;
  }

  public async updateDecision(
    decisionId: string,
    updates: Partial<Decision>
  ): Promise<Decision> {
    const decision = await this.getDecision(decisionId);
    if (!decision) {
      throw new Error('Decision not found');
    }

    Object.assign(decision, updates);
    await this.saveDecision(decision);
    return decision;
  }

  public async addChoice(
    decisionId: string,
    choice: Omit<DecisionChoice, 'id'>
  ): Promise<Decision> {
    const decision = await this.getDecision(decisionId);
    if (!decision) {
      throw new Error('Decision not found');
    }

    const newChoice: DecisionChoice = {
      ...choice,
      id: `choice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    decision.choices.push(newChoice);
    await this.saveDecision(decision);
    return decision;
  }

  public async updateChoice(
    decisionId: string,
    choiceId: string,
    updates: Partial<DecisionChoice>
  ): Promise<Decision> {
    const decision = await this.getDecision(decisionId);
    if (!decision) {
      throw new Error('Decision not found');
    }

    const choice = decision.choices.find((c) => c.id === choiceId);
    if (choice) {
      Object.assign(choice, updates);
      await this.saveDecision(decision);
    }

    return decision;
  }

  public async getDecision(decisionId: string): Promise<Decision | null> {
    try {
      const decisionsJson = await AsyncStorage.getItem('lifeos_decisions');
      if (!decisionsJson) return null;

      const decisions: Decision[] = JSON.parse(decisionsJson);
      return decisions.find((d) => d.id === decisionId) || null;
    } catch (error) {
      console.error('Error getting decision:', error);
      return null;
    }
  }

  public async getAllDecisions(): Promise<Decision[]> {
    try {
      const decisionsJson = await AsyncStorage.getItem('lifeos_decisions');
      if (!decisionsJson) return [];

      return JSON.parse(decisionsJson);
    } catch (error) {
      console.error('Error getting decisions:', error);
      return [];
    }
  }

  public async getDecisionsDueForReview(): Promise<Decision[]> {
    const decisions = await this.getAllDecisions();
    const now = new Date();

    return decisions.filter((d) => {
      return (
        d.status === 'made' &&
        d.reviewScheduledFor &&
        new Date(d.reviewScheduledFor) <= now
      );
    });
  }

  public async deleteDecision(decisionId: string): Promise<void> {
    try {
      const decisionsJson = await AsyncStorage.getItem('lifeos_decisions');
      if (!decisionsJson) return;

      const decisions: Decision[] = JSON.parse(decisionsJson);
      const filtered = decisions.filter((d) => d.id !== decisionId);

      await AsyncStorage.setItem('lifeos_decisions', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting decision:', error);
    }
  }

  private async saveDecision(decision: Decision): Promise<void> {
    try {
      const decisionsJson = await AsyncStorage.getItem('lifeos_decisions');
      const decisions: Decision[] = decisionsJson ? JSON.parse(decisionsJson) : [];

      const index = decisions.findIndex((d) => d.id === decision.id);
      if (index >= 0) {
        decisions[index] = decision;
      } else {
        decisions.push(decision);
      }

      await AsyncStorage.setItem('lifeos_decisions', JSON.stringify(decisions));
    } catch (error) {
      console.error('Error saving decision:', error);
    }
  }

  private calculateReviewDate(): Date {
    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() + REVIEW_DELAY_MONTHS);
    return reviewDate;
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

export const decisionLogger = new DecisionLogger();
