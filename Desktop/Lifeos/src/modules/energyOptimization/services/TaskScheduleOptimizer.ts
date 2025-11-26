/**
 * Task Schedule Optimizer
 * Reschedules tasks to peak energy windows
 */

import { TaskOptimization, EnergyPattern } from '../types/energyOptimization.types';
import { EnergyPatternAnalyzer } from './EnergyPatternAnalyzer';
import { TASK_ENERGY_REQUIREMENTS, PRODUCTIVITY_MULTIPLIERS } from '../constants/energyOptimization.constants';

export class TaskScheduleOptimizer {
  private energyAnalyzer: EnergyPatternAnalyzer;

  constructor() {
    this.energyAnalyzer = new EnergyPatternAnalyzer();
  }

  public async optimizeTask(
    taskId: string,
    taskName: string,
    duration: number,
    priority: TaskOptimization['priority'],
    currentSchedule?: Date
  ): Promise<TaskOptimization> {
    const patterns = await this.energyAnalyzer.analyzeEnergyPattern();
    const requiredEnergy = TASK_ENERGY_REQUIREMENTS[priority];

    const currentEnergyLevel = currentSchedule
      ? await this.energyAnalyzer.getEnergyForHour(currentSchedule.getHours())
      : undefined;

    const optimalHour = this.findOptimalHour(patterns, requiredEnergy, duration);
    const recommendedSchedule = this.createScheduleForHour(optimalHour);
    const recommendedEnergyLevel = patterns.find((p) => p.hour === optimalHour)?.averageEnergy || 5;

    const productivityGain = this.calculateProductivityGain(
      currentEnergyLevel || 5,
      recommendedEnergyLevel
    );

    const reasoning = this.generateReasoning(
      priority,
      currentSchedule,
      currentEnergyLevel,
      recommendedSchedule,
      recommendedEnergyLevel,
      productivityGain
    );

    return {
      taskId,
      taskName,
      duration,
      priority,
      currentSchedule,
      currentEnergyLevel,
      recommendedSchedule,
      recommendedEnergyLevel,
      productivityGain,
      reasoning,
    };
  }

  private findOptimalHour(patterns: EnergyPattern[], requiredEnergy: number, duration: number): number {
    const suitableHours = patterns.filter((p) => p.averageEnergy >= requiredEnergy);

    if (suitableHours.length === 0) {
      const sorted = [...patterns].sort((a, b) => b.averageEnergy - a.averageEnergy);
      return sorted[0].hour;
    }

    const sorted = suitableHours.sort((a, b) => b.averageEnergy - a.averageEnergy);
    return sorted[0].hour;
  }

  private createScheduleForHour(hour: number): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hour, 0, 0, 0);
    return tomorrow;
  }

  private calculateProductivityGain(currentEnergy: number, recommendedEnergy: number): number {
    const currentMultiplier = this.getEnergyMultiplier(currentEnergy);
    const recommendedMultiplier = this.getEnergyMultiplier(recommendedEnergy);

    const gain = ((recommendedMultiplier - currentMultiplier) / currentMultiplier) * 100;
    return Math.round(gain);
  }

  private getEnergyMultiplier(energy: number): number {
    if (energy >= 8) return PRODUCTIVITY_MULTIPLIERS.peak;
    if (energy >= 7) return PRODUCTIVITY_MULTIPLIERS.high;
    if (energy >= 5.5) return PRODUCTIVITY_MULTIPLIERS.medium;
    return PRODUCTIVITY_MULTIPLIERS.low;
  }

  private generateReasoning(
    priority: TaskOptimization['priority'],
    currentSchedule: Date | undefined,
    currentEnergy: number | undefined,
    recommendedSchedule: Date,
    recommendedEnergy: number,
    productivityGain: number
  ): string[] {
    const reasons: string[] = [];

    if (currentSchedule && currentEnergy) {
      const currentTime = currentSchedule.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      const recommendedTime = recommendedSchedule.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

      reasons.push(`Current: ${currentTime} (energy ${currentEnergy.toFixed(1)}/10)`);
      reasons.push(`Recommended: ${recommendedTime} (energy ${recommendedEnergy.toFixed(1)}/10)`);

      if (currentEnergy < 6) {
        reasons.push('POOR TIMING - Low energy window');
      } else if (currentEnergy < 7) {
        reasons.push('MEDIUM TIMING - Moderate energy');
      }

      if (recommendedEnergy >= 8) {
        reasons.push('PEAK TIMING - Maximum focus and energy');
      } else if (recommendedEnergy >= 7) {
        reasons.push('GOOD TIMING - High energy window');
      }

      if (productivityGain > 0) {
        reasons.push(`Productivity gain: +${productivityGain}%`);
      }
    } else {
      const recommendedTime = recommendedSchedule.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      reasons.push(`Best time: ${recommendedTime} (energy ${recommendedEnergy.toFixed(1)}/10)`);
      reasons.push(`${priority.toUpperCase()} priority task needs high energy`);
      reasons.push('Scheduled during peak performance window');
    }

    return reasons;
  }

  public async optimizeMultipleTasks(
    tasks: Array<{
      id: string;
      name: string;
      duration: number;
      priority: TaskOptimization['priority'];
      currentSchedule?: Date;
    }>
  ): Promise<TaskOptimization[]> {
    const optimizations: TaskOptimization[] = [];

    for (const task of tasks) {
      const optimization = await this.optimizeTask(
        task.id,
        task.name,
        task.duration,
        task.priority,
        task.currentSchedule
      );
      optimizations.push(optimization);
    }

    return optimizations.sort((a, b) => b.productivityGain - a.productivityGain);
  }
}
