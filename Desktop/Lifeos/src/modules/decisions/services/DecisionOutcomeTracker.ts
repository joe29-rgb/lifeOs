/**
 * Decision Outcome Tracker
 * Tracks decision outcomes and schedules follow-ups
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { DecisionOutcome, Decision } from '../types/decision.types';
import { decisionLogger } from './DecisionLogger';

export class DecisionOutcomeTracker {
  public async recordOutcome(
    decisionId: string,
    outcome: Omit<DecisionOutcome, 'id' | 'userId' | 'reviewedAt'>
  ): Promise<DecisionOutcome> {
    const decision = await decisionLogger.getDecision(decisionId);
    if (!decision) {
      throw new Error('Decision not found');
    }

    const newOutcome: DecisionOutcome = {
      ...outcome,
      id: `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: decision.userId,
      reviewedAt: new Date(),
    };

    await this.saveOutcome(newOutcome);
    
    await decisionLogger.updateDecision(decisionId, {
      status: 'reviewed',
    });

    return newOutcome;
  }

  public async getOutcome(decisionId: string): Promise<DecisionOutcome | null> {
    try {
      const outcomesJson = await AsyncStorage.getItem('lifeos_decision_outcomes');
      if (!outcomesJson) return null;

      const outcomes: DecisionOutcome[] = JSON.parse(outcomesJson);
      return outcomes.find((o) => o.decisionId === decisionId) || null;
    } catch (error) {
      console.error('Error getting outcome:', error);
      return null;
    }
  }

  public async getAllOutcomes(): Promise<DecisionOutcome[]> {
    try {
      const outcomesJson = await AsyncStorage.getItem('lifeos_decision_outcomes');
      if (!outcomesJson) return [];

      return JSON.parse(outcomesJson);
    } catch (error) {
      console.error('Error getting outcomes:', error);
      return [];
    }
  }

  public async scheduleReviewNotification(decision: Decision): Promise<void> {
    if (!decision.reviewScheduledFor) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Decision Review Time! 🤔',
          body: `How did "${decision.title}" turn out?`,
          data: { decisionId: decision.id, type: 'decision_review' },
        },
        trigger: {
          date: new Date(decision.reviewScheduledFor),
        },
      });
    } catch (error) {
      console.error('Error scheduling review notification:', error);
    }
  }

  public async cancelReviewNotification(decisionId: string): Promise<void> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      const notification = notifications.find(
        (n) => n.content.data?.decisionId === decisionId
      );

      if (notification) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling review notification:', error);
    }
  }

  private async saveOutcome(outcome: DecisionOutcome): Promise<void> {
    try {
      const outcomesJson = await AsyncStorage.getItem('lifeos_decision_outcomes');
      const outcomes: DecisionOutcome[] = outcomesJson ? JSON.parse(outcomesJson) : [];

      const index = outcomes.findIndex((o) => o.id === outcome.id);
      if (index >= 0) {
        outcomes[index] = outcome;
      } else {
        outcomes.push(outcome);
      }

      await AsyncStorage.setItem('lifeos_decision_outcomes', JSON.stringify(outcomes));
    } catch (error) {
      console.error('Error saving outcome:', error);
    }
  }
}

export const decisionOutcomeTracker = new DecisionOutcomeTracker();
