/**
 * useDecisionTracking Hook
 * Manages decision detection, logging, and tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { Decision, DecisionOutcome, DecisionAdvice, DecisionStats } from '../modules/decisions/types/decision.types';
import { decisionDetector } from '../modules/decisions/services/DecisionDetector';
import { decisionLogger } from '../modules/decisions/services/DecisionLogger';
import { decisionOutcomeTracker } from '../modules/decisions/services/DecisionOutcomeTracker';
import { decisionAnalyzer } from '../modules/decisions/services/DecisionAnalyzer';
import { decisionAdviceEngine } from '../modules/decisions/services/DecisionAdviceEngine';

export function useDecisionTracking() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<Decision[]>([]);
  const [reviewDue, setReviewDue] = useState<Decision[]>([]);
  const [stats, setStats] = useState<DecisionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDecisions = useCallback(async () => {
    try {
      setLoading(true);
      const allDecisions = await decisionLogger.getAllDecisions();
      setDecisions(allDecisions);

      const pending = allDecisions.filter((d) => d.status === 'pending');
      setPendingDecisions(pending);

      const due = await decisionLogger.getDecisionsDueForReview();
      setReviewDue(due);

      const statsData = await decisionAnalyzer.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading decisions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecisions();

    const handleDetection = (partialDecision: Partial<Decision>) => {
      loadDecisions();
    };

    decisionDetector.onDetection(handleDetection);

    return () => {
      decisionDetector.offDetection(handleDetection);
    };
  }, [loadDecisions]);

  const createDecision = useCallback(async (decision: Partial<Decision>): Promise<Decision> => {
    const newDecision = await decisionLogger.createDecision(decision);
    await loadDecisions();
    return newDecision;
  }, [loadDecisions]);

  const makeDecision = useCallback(async (
    decisionId: string,
    selectedChoiceId: string,
    confidence: number
  ): Promise<Decision> => {
    const decision = await decisionLogger.makeDecision(decisionId, selectedChoiceId, confidence);
    await decisionOutcomeTracker.scheduleReviewNotification(decision);
    await loadDecisions();
    return decision;
  }, [loadDecisions]);

  const recordOutcome = useCallback(async (
    decisionId: string,
    outcome: Omit<DecisionOutcome, 'id' | 'userId' | 'reviewedAt'>
  ): Promise<DecisionOutcome> => {
    const newOutcome = await decisionOutcomeTracker.recordOutcome(decisionId, outcome);
    await loadDecisions();
    return newOutcome;
  }, [loadDecisions]);

  const getAdvice = useCallback(async (decision: Decision): Promise<DecisionAdvice[]> => {
    return await decisionAdviceEngine.getAdviceForDecision(decision);
  }, []);

  const deleteDecision = useCallback(async (decisionId: string): Promise<void> => {
    await decisionLogger.deleteDecision(decisionId);
    await loadDecisions();
  }, [loadDecisions]);

  return {
    decisions,
    pendingDecisions,
    reviewDue,
    stats,
    loading,
    createDecision,
    makeDecision,
    recordOutcome,
    getAdvice,
    deleteDecision,
    refresh: loadDecisions,
  };
}
