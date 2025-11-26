/**
 * Regret Calculator
 * Calculates regret probability based on risk factors
 */

import { RiskFactors, ProtectiveFactors } from '../types/regretMinimizer.types';
import { RISK_WEIGHTS, PROTECTIVE_WEIGHTS, REGRET_THRESHOLDS } from '../constants/regretMinimizer.constants';

export class RegretCalculator {
  public calculateRegretProbability(
    riskFactors: RiskFactors,
    protectiveFactors: ProtectiveFactors
  ): number {
    let score = 0;

    if (riskFactors.rushing) score += RISK_WEIGHTS.rushing;
    if (riskFactors.moneyMotivated) score += RISK_WEIGHTS.money_motivated;
    if (riskFactors.ignoringGut) score += RISK_WEIGHTS.ignoring_gut;
    if (riskFactors.vagueAnswers) score += RISK_WEIGHTS.vague_culture;
    if (riskFactors.stressed) score += RISK_WEIGHTS.stressed;
    if (riskFactors.poorSleep) score += RISK_WEIGHTS.poor_sleep;

    if (protectiveFactors.goodSleep) score += PROTECTIVE_WEIGHTS.good_sleep;
    if (protectiveFactors.talkedToSomeone) score += PROTECTIVE_WEIGHTS.talked_to_someone;
    if (protectiveFactors.didResearch) score += PROTECTIVE_WEIGHTS.did_research;
    if (protectiveFactors.completedChecklist) score += PROTECTIVE_WEIGHTS.completed_checklist;
    if (protectiveFactors.trustedGut) score += PROTECTIVE_WEIGHTS.trusted_gut;

    return Math.max(0, Math.min(100, score));
  }

  public getRiskLevel(probability: number): 'low' | 'medium' | 'high' | 'critical' {
    if (probability >= REGRET_THRESHOLDS.critical) return 'critical';
    if (probability >= REGRET_THRESHOLDS.high) return 'high';
    if (probability >= REGRET_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  public getRecommendation(
    probability: number,
    redFlagCount: number
  ): 'proceed' | 'caution' | 'delay' | 'decline' {
    if (probability >= REGRET_THRESHOLDS.critical || redFlagCount >= 4) {
      return 'decline';
    }
    if (probability >= REGRET_THRESHOLDS.high || redFlagCount >= 3) {
      return 'delay';
    }
    if (probability >= REGRET_THRESHOLDS.medium || redFlagCount >= 2) {
      return 'caution';
    }
    return 'proceed';
  }

  public calculateRiskScore(
    redFlagCount: number,
    similarityToRegret: number,
    gutCheckNegative: boolean
  ): number {
    let score = 0;

    score += redFlagCount * 15;
    score += similarityToRegret * 50;
    if (gutCheckNegative) score += 20;

    return Math.min(100, score);
  }
}
