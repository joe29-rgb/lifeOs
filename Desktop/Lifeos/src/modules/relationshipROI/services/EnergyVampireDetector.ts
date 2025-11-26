/**
 * Energy Vampire Detector
 * Identifies draining relationships
 */

import { EnergyVampire, EnergyImpact, VampireOption } from '../types/relationshipROI.types';
import { VAMPIRE_THRESHOLDS, VAMPIRE_OPTIONS, ENERGY_THRESHOLDS } from '../constants/relationshipROI.constants';

export class EnergyVampireDetector {
  public detectVampire(
    personId: string,
    personName: string,
    joyScore: number,
    energyImpact: EnergyImpact,
    supportRatio: number
  ): EnergyVampire | null {
    if (energyImpact.impact >= ENERGY_THRESHOLDS.neutral) {
      return null;
    }

    const severity = this.determineSeverity(joyScore, energyImpact.impact, energyImpact.avoidanceCount);

    if (!severity) return null;

    const evidence = this.buildEvidence(joyScore, energyImpact, supportRatio);
    const options = this.getOptions(severity);

    return {
      personId,
      personName,
      severity,
      joyScore,
      energyImpact: energyImpact.impact,
      moodDrop: energyImpact.moodChange,
      avoidanceCount: energyImpact.avoidanceCount,
      supportRatio,
      evidence,
      options,
    };
  }

  private determineSeverity(
    joy: number,
    energy: number,
    avoidance: number
  ): 'mild' | 'moderate' | 'severe' | null {
    if (
      joy <= VAMPIRE_THRESHOLDS.severe.joy &&
      energy <= VAMPIRE_THRESHOLDS.severe.energy &&
      avoidance >= VAMPIRE_THRESHOLDS.severe.avoidance
    ) {
      return 'severe';
    }

    if (
      joy <= VAMPIRE_THRESHOLDS.moderate.joy &&
      energy <= VAMPIRE_THRESHOLDS.moderate.energy &&
      avoidance >= VAMPIRE_THRESHOLDS.moderate.avoidance
    ) {
      return 'moderate';
    }

    if (
      joy <= VAMPIRE_THRESHOLDS.mild.joy &&
      energy <= VAMPIRE_THRESHOLDS.mild.energy &&
      avoidance >= VAMPIRE_THRESHOLDS.mild.avoidance
    ) {
      return 'mild';
    }

    return null;
  }

  private buildEvidence(joy: number, energyImpact: EnergyImpact, supportRatio: number): string[] {
    const evidence: string[] = [];

    evidence.push(`Joy Score: ${joy}/10 (consistently low)`);
    evidence.push(`Energy Impact: ${energyImpact.impact}% (always draining)`);
    evidence.push(`Post-interaction mood: ${energyImpact.moodChange.toFixed(1)} average`);

    if (energyImpact.avoidanceCount > 0) {
      evidence.push(`You avoid calls from this person (${energyImpact.avoidanceCount}× this month)`);
    }

    if (supportRatio > 2) {
      evidence.push(`Support Balance: ${supportRatio.toFixed(1)} (give ${supportRatio.toFixed(0)}× more than receive)`);
    }

    const drainPercentage = Math.round(
      (energyImpact.interactions / Math.max(1, energyImpact.interactions)) * 100
    );
    evidence.push(
      `After ${drainPercentage}% of interactions, your mood drops and energy depletes significantly.`
    );

    return evidence;
  }

  private getOptions(severity: 'mild' | 'moderate' | 'severe'): VampireOption[] {
    const options: VampireOption[] = [];

    options.push({
      type: 'boundaries',
      title: VAMPIRE_OPTIONS.boundaries.title,
      actions: [...VAMPIRE_OPTIONS.boundaries.actions],
      description: VAMPIRE_OPTIONS.boundaries.description,
    });

    if (severity === 'mild' || severity === 'moderate') {
      options.push({
        type: 'conversation',
        title: VAMPIRE_OPTIONS.conversation.title,
        actions: [...VAMPIRE_OPTIONS.conversation.actions],
        description: VAMPIRE_OPTIONS.conversation.description,
      });
    }

    options.push({
      type: 'distance',
      title: VAMPIRE_OPTIONS.distance.title,
      actions: [...VAMPIRE_OPTIONS.distance.actions],
      description: VAMPIRE_OPTIONS.distance.description,
    });

    if (severity === 'severe') {
      options.push({
        type: 'exit',
        title: VAMPIRE_OPTIONS.exit.title,
        actions: [...VAMPIRE_OPTIONS.exit.actions],
        description: VAMPIRE_OPTIONS.exit.description,
      });
    }

    return options;
  }

  public analyzeEnergyPattern(interactions: { moodBefore?: number; moodAfter?: number; timestamp: Date }[]): {
    impact: number;
    moodChange: number;
    pattern: 'energizer' | 'neutral' | 'drainer';
  } {
    if (interactions.length === 0) {
      return { impact: 0, moodChange: 0, pattern: 'neutral' };
    }

    const validInteractions = interactions.filter(
      (i) => i.moodBefore !== undefined && i.moodAfter !== undefined
    );

    if (validInteractions.length === 0) {
      return { impact: 0, moodChange: 0, pattern: 'neutral' };
    }

    const moodChanges = validInteractions.map((i) => (i.moodAfter || 0) - (i.moodBefore || 0));
    const avgMoodChange = moodChanges.reduce((sum, c) => sum + c, 0) / moodChanges.length;

    const impact = avgMoodChange * 10;

    let pattern: 'energizer' | 'neutral' | 'drainer';
    if (impact >= ENERGY_THRESHOLDS.energizer) {
      pattern = 'energizer';
    } else if (impact <= ENERGY_THRESHOLDS.drainer) {
      pattern = 'drainer';
    } else {
      pattern = 'neutral';
    }

    return {
      impact: Math.round(impact),
      moodChange: avgMoodChange,
      pattern,
    };
  }
}
