/**
 * Scenario Simulator
 * Generates alternative life paths
 */

import { LifeScenario } from '../types/futureSelf.types';
import { SCENARIO_TEMPLATES } from '../constants/futureSelf.constants';

export class ScenarioSimulator {
  public generateScenarios(
    currentScores: {
      career: number;
      health: number;
      relationships: number;
      mentalHealth: number;
    }
  ): LifeScenario[] {
    const scenarios: LifeScenario[] = [];

    scenarios.push(this.createScenario('current', currentScores, SCENARIO_TEMPLATES.current_path));
    scenarios.push(this.createScenario('stress', currentScores, SCENARIO_TEMPLATES.high_stress_job));
    scenarios.push(this.createScenario('health', currentScores, SCENARIO_TEMPLATES.prioritize_health));
    scenarios.push(this.createScenario('career', currentScores, SCENARIO_TEMPLATES.ignore_relationships));

    return scenarios.sort((a, b) => b.projectedScore - a.projectedScore);
  }

  private createScenario(
    id: string,
    currentScores: Record<string, number>,
    template: typeof SCENARIO_TEMPLATES[keyof typeof SCENARIO_TEMPLATES]
  ): LifeScenario {
    const projectedPillars = {
      career: Math.min(10, currentScores.career * template.multipliers.career),
      health: Math.min(10, currentScores.health * template.multipliers.health),
      relationships: Math.min(10, currentScores.relationships * template.multipliers.relationships),
      mentalHealth: Math.min(10, currentScores.mentalHealth * template.multipliers.mentalHealth),
    };

    const projectedScore = Object.values(projectedPillars).reduce((sum, v) => sum + v, 0) / 4;

    const pros = this.generatePros(projectedPillars, currentScores);
    const cons = this.generateCons(projectedPillars, currentScores);
    const recommendation = this.generateRecommendation(projectedScore);

    return {
      id,
      name: template.name,
      description: template.description,
      projectedScore: Math.round(projectedScore * 10) / 10,
      pillars: projectedPillars,
      pros,
      cons,
      recommendation,
    };
  }

  private generatePros(projected: Record<string, number>, current: Record<string, number>): string[] {
    const pros: string[] = [];
    Object.entries(projected).forEach(([key, value]) => {
      if (value > current[key] + 1) {
        pros.push(`${key} significantly improved`);
      }
    });
    return pros.length > 0 ? pros : ['Maintains current trajectory'];
  }

  private generateCons(projected: Record<string, number>, current: Record<string, number>): string[] {
    const cons: string[] = [];
    Object.entries(projected).forEach(([key, value]) => {
      if (value < current[key] - 1) {
        cons.push(`${key} significantly declined`);
      }
    });
    return cons.length > 0 ? cons : ['No major downsides'];
  }

  private generateRecommendation(score: number): string {
    if (score >= 8.5) return 'Highly recommended - Best overall life quality';
    if (score >= 7.5) return 'Recommended - Good balance';
    if (score >= 6.5) return 'Consider carefully - Mixed outcomes';
    return 'Not recommended - Significant trade-offs';
  }
}
