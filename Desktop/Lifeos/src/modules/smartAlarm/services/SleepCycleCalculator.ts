/**
 * Sleep Cycle Calculator
 * Calculates 90-minute sleep cycles and optimal wake windows
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepCycle, SleepForecast, SleepPattern } from '../types/smartAlarm.types';
import { SLEEP_CYCLE, SLEEP_PHASES } from '../constants/smartAlarm.constants';

export class SleepCycleCalculator {
  private readonly PATTERN_KEY = '@sleep_pattern';

  public calculateSleepCycles(bedtime: Date, wakeTime: Date): SleepCycle[] {
    const cycles: SleepCycle[] = [];
    const totalMinutes = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60);
    const numCycles = Math.floor(totalMinutes / SLEEP_CYCLE.standardLength);

    let currentTime = new Date(bedtime);

    for (let i = 0; i < numCycles; i++) {
      const cycleStart = new Date(currentTime);
      const cycleEnd = new Date(currentTime.getTime() + SLEEP_CYCLE.standardLength * 60 * 1000);

      // Determine phase based on cycle number
      let phase: SleepCycle['phase'];
      if (i === 0 || i === numCycles - 1) {
        phase = 'light'; // First and last cycles are lighter
      } else if (i % 3 === 1) {
        phase = 'deep'; // Every 3rd cycle has more deep sleep
      } else {
        phase = 'rem'; // REM increases in later cycles
      }

      cycles.push({
        cycleNumber: i + 1,
        startTime: cycleStart,
        endTime: cycleEnd,
        phase,
        duration: SLEEP_CYCLE.standardLength,
      });

      currentTime = cycleEnd;
    }

    return cycles;
  }

  public async generateSleepForecast(bedtime: Date, wakeTime: Date): Promise<SleepForecast> {
    const totalDuration = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60 * 60);
    const cycles = this.calculateSleepCycles(bedtime, wakeTime);
    const completeCycles = cycles.length;

    // Find optimal wake window (during light sleep phase)
    const lastCycle = cycles[cycles.length - 1];
    const optimalWakeWindow = {
      start: new Date(lastCycle.startTime.getTime() + 15 * 60 * 1000), // 15 min into last cycle
      end: new Date(lastCycle.endTime.getTime()), // End of last cycle
    };

    // Calculate expected quality based on cycle completion
    const expectedQuality = this.calculateExpectedQuality(completeCycles, totalDuration);
    const expectedGrogginess = this.calculateExpectedGrogginess(lastCycle.phase);

    return {
      bedtime,
      wakeTime,
      totalDuration,
      completeCycles,
      cycles,
      optimalWakeWindow,
      expectedQuality,
      expectedGrogginess,
    };
  }

  private calculateExpectedQuality(completeCycles: number, totalHours: number): number {
    let quality = 5;

    // Bonus for complete cycles
    quality += completeCycles * 0.5;

    // Bonus for optimal duration (7-9 hours)
    if (totalHours >= 7 && totalHours <= 9) {
      quality += 2;
    } else if (totalHours >= 6 && totalHours < 7) {
      quality += 1;
    } else if (totalHours < 6) {
      quality -= 2;
    }

    return Math.min(10, Math.max(0, quality));
  }

  private calculateExpectedGrogginess(phase: SleepCycle['phase']): number {
    return SLEEP_PHASES[phase].grogginess;
  }

  public findOptimalWakeTime(
    targetWakeTime: Date,
    flexibilityMinutes: number,
    bedtime: Date
  ): Date {
    const cycles = this.calculateSleepCycles(bedtime, targetWakeTime);
    
    // Find the last light sleep phase within flexibility window
    const windowStart = new Date(targetWakeTime.getTime() - flexibilityMinutes * 60 * 1000);
    const windowEnd = new Date(targetWakeTime.getTime() + flexibilityMinutes * 60 * 1000);

    for (let i = cycles.length - 1; i >= 0; i--) {
      const cycle = cycles[i];
      if (cycle.phase === 'light') {
        const midCycle = new Date(
          (cycle.startTime.getTime() + cycle.endTime.getTime()) / 2
        );

        if (midCycle >= windowStart && midCycle <= windowEnd) {
          return midCycle;
        }
      }
    }

    // If no light sleep found, return earliest time in window
    return windowStart;
  }

  public async saveSleepPattern(pattern: SleepPattern): Promise<void> {
    await AsyncStorage.setItem(this.PATTERN_KEY, JSON.stringify(pattern));
  }

  public async getSleepPattern(userId: string): Promise<SleepPattern | null> {
    const data = await AsyncStorage.getItem(this.PATTERN_KEY);
    if (!data) return null;

    const pattern: SleepPattern = JSON.parse(data);
    return pattern.userId === userId ? pattern : null;
  }

  public calculateCycleCompletion(bedtime: Date, wakeTime: Date): number {
    const totalMinutes = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60);
    const completeCycles = Math.floor(totalMinutes / SLEEP_CYCLE.standardLength);
    const remainder = totalMinutes % SLEEP_CYCLE.standardLength;
    
    return (completeCycles + remainder / SLEEP_CYCLE.standardLength) * 100;
  }
}
