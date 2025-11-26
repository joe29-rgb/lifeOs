/**
 * Red Flag Detector
 * Detects warning signs in new decisions
 */

import { RedFlag, SimilarDecision } from '../types/regretMinimizer.types';
import { RegretAnalyzer } from './RegretAnalyzer';
import { RED_FLAG_PATTERNS, SIMILARITY_KEYWORDS } from '../constants/regretMinimizer.constants';

export class RedFlagDetector {
  private regretAnalyzer: RegretAnalyzer;

  constructor() {
    this.regretAnalyzer = new RegretAnalyzer();
  }

  public async detectRedFlags(
    decision: string,
    category: string,
    context: Record<string, any>
  ): Promise<RedFlag[]> {
    const redFlags: RedFlag[] = [];
    const decisionLower = decision.toLowerCase();

    const patterns = RED_FLAG_PATTERNS[category as keyof typeof RED_FLAG_PATTERNS] || [];

    for (const pattern of patterns) {
      if (this.matchesPattern(decisionLower, context, pattern.pattern)) {
        redFlags.push({
          id: `flag_${Date.now()}_${Math.random()}`,
          type: pattern.pattern,
          description: pattern.description,
          severity: pattern.severity,
          pattern: pattern.pattern,
        });
      }
    }

    const pastRegrets = await this.regretAnalyzer.getRegrets();
    const categoryRegrets = pastRegrets.filter((r) => r.category === category);

    for (const regret of categoryRegrets) {
      const similarity = this.calculateSimilarity(decision, regret.decision);
      if (similarity > 0.5) {
        redFlags.push({
          id: `flag_regret_${Date.now()}_${Math.random()}`,
          type: 'similar_to_regret',
          description: `Similar to past regret: "${regret.decision}"`,
          severity: regret.regretIntensity > 7 ? 'critical' : 'high',
          basedOnRegret: regret.id,
          pattern: 'past_regret_match',
        });
      }
    }

    return redFlags;
  }

  private matchesPattern(decision: string, context: Record<string, any>, pattern: string): boolean {
    switch (pattern) {
      case 'high_salary_primary':
        return context.salaryIncrease > 30 || decision.includes('salary') || decision.includes('pay');
      case 'vague_culture':
        return context.cultureAnswers === 'vague' || !context.askedAboutCulture;
      case 'long_hours_expected':
        return decision.includes('long hours') || decision.includes('60') || decision.includes('overtime');
      case 'fast_growing':
        return decision.includes('startup') || decision.includes('fast-growing') || decision.includes('rapid growth');
      case 'no_work_life_balance':
        return !context.askedAboutWorkLife || context.workLifeBalance === 'poor';
      case 'intense_leadership':
        return decision.includes('intense') || decision.includes('demanding') || context.leadershipConcern;
      case 'ignoring_red_flags':
        return context.hasRedFlags && !context.addressedRedFlags;
      case 'rushing_commitment':
        return context.timeKnown < 90;
      case 'different_values':
        return context.valuesMismatch;
      case 'friends_concerned':
        return context.friendsConcerned;
      case 'impulse_purchase':
        return context.timeConsidering < 1;
      case 'too_good_to_be_true':
        return context.dealQuality === 'too_good';
      case 'pressure_to_decide':
        return context.pressured || context.deadline < 48;
      case 'didnt_read_terms':
        return !context.readTerms;
      default:
        return false;
    }
  }

  public async findSimilarDecisions(
    decision: string,
    category: string
  ): Promise<SimilarDecision[]> {
    const pastRegrets = await this.regretAnalyzer.getRegrets();
    const categoryRegrets = pastRegrets.filter((r) => r.category === category);

    const similar: SimilarDecision[] = [];

    for (const regret of categoryRegrets) {
      const matchScore = this.calculateSimilarity(decision, regret.decision);
      if (matchScore > 0.3) {
        const similarities = this.findSimilarities(decision, regret.decision);
        similar.push({
          id: regret.id,
          decision: regret.decision,
          date: regret.date,
          similarities,
          outcome: regret.outcome,
          regretIntensity: regret.regretIntensity,
          whatWentWrong: regret.regretReasons.join(', '),
          matchScore,
        });
      }
    }

    return similar.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  }

  private calculateSimilarity(decision1: string, decision2: string): number {
    const words1 = decision1.toLowerCase().split(/\s+/);
    const words2 = decision2.toLowerCase().split(/\s+/);

    const commonWords = words1.filter((word) => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return commonWords.length / totalWords;
  }

  private findSimilarities(decision1: string, decision2: string): string[] {
    const similarities: string[] = [];
    const d1Lower = decision1.toLowerCase();
    const d2Lower = decision2.toLowerCase();

    for (const [category, keywords] of Object.entries(SIMILARITY_KEYWORDS)) {
      const d1Matches = keywords.filter((kw) => d1Lower.includes(kw));
      const d2Matches = keywords.filter((kw) => d2Lower.includes(kw));

      if (d1Matches.length > 0 && d2Matches.length > 0) {
        similarities.push(`Both involve ${category}`);
      }
    }

    const commonWords = decision1.split(/\s+/).filter((word) =>
      decision2.toLowerCase().includes(word.toLowerCase()) && word.length > 4
    );

    for (const word of commonWords.slice(0, 3)) {
      similarities.push(`Both mention "${word}"`);
    }

    return similarities;
  }
}
