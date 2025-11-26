/**
 * Energy Pattern Analyzer
 * Detects peak/low hours from health data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnergyPattern, DailyEnergyProfile } from '../types/energyOptimization.types';
import { ENERGY_THRESHOLDS, PATTERN_INDICATORS } from '../constants/energyOptimization.constants';

export class EnergyPatternAnalyzer {
  private readonly ENERGY_LOG_KEY = '@energy_logs';

  public async logEnergyLevel(hour: number, energy: number): Promise<void> {
    const logs = await this.getEnergyLogs();
    logs.push({
      hour,
      energy,
      timestamp: new Date(),
    });

    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    await AsyncStorage.setItem(this.ENERGY_LOG_KEY, JSON.stringify(logs));
  }

  private async getEnergyLogs(): Promise<{ hour: number; energy: number; timestamp: Date }[]> {
    const data = await AsyncStorage.getItem(this.ENERGY_LOG_KEY);
    if (!data) return [];

    const logs = JSON.parse(data);
    return logs.map((l: any) => ({
      ...l,
      timestamp: new Date(l.timestamp),
    }));
  }

  public async analyzeEnergyPattern(): Promise<EnergyPattern[]> {
    const logs = await this.getEnergyLogs();
    const hourlyData: Record<number, { total: number; count: number }> = {};

    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = { total: 0, count: 0 };
    }

    for (const log of logs) {
      hourlyData[log.hour].total += log.energy;
      hourlyData[log.hour].count += 1;
    }

    const patterns: EnergyPattern[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyData[hour];
      const averageEnergy = data.count > 0 ? data.total / data.count : 5;

      let level: EnergyPattern['level'];
      if (averageEnergy >= ENERGY_THRESHOLDS.peak) {
        level = 'peak';
      } else if (averageEnergy >= ENERGY_THRESHOLDS.high) {
        level = 'high';
      } else if (averageEnergy >= ENERGY_THRESHOLDS.medium) {
        level = 'medium';
      } else {
        level = 'low';
      }

      patterns.push({
        hour,
        averageEnergy,
        level,
        sampleSize: data.count,
      });
    }

    return patterns;
  }

  public async getDailyEnergyProfile(): Promise<DailyEnergyProfile> {
    const patterns = await this.analyzeEnergyPattern();

    const peakHours = patterns.filter((p) => p.level === 'peak').map((p) => p.hour);
    const highHours = patterns.filter((p) => p.level === 'high').map((p) => p.hour);
    const mediumHours = patterns.filter((p) => p.level === 'medium').map((p) => p.hour);
    const lowHours = patterns.filter((p) => p.level === 'low').map((p) => p.hour);

    const pattern = this.detectPattern(patterns);
    const secondWind = this.detectSecondWind(patterns);
    const afternoonSlump = this.detectAfternoonSlump(patterns);

    return {
      peakHours,
      highHours,
      mediumHours,
      lowHours,
      pattern,
      secondWind,
      afternoonSlump,
    };
  }

  private detectPattern(patterns: EnergyPattern[]): DailyEnergyProfile['pattern'] {
    const morningEnergy = patterns
      .filter((p) => p.hour >= 6 && p.hour <= 11)
      .reduce((sum, p) => sum + p.averageEnergy, 0) / 6;

    const eveningEnergy = patterns
      .filter((p) => p.hour >= 18 && p.hour <= 23)
      .reduce((sum, p) => sum + p.averageEnergy, 0) / 6;

    if (morningEnergy > eveningEnergy + 1) {
      return 'morning_person';
    } else if (eveningEnergy > morningEnergy + 1) {
      return 'night_owl';
    } else {
      return 'balanced';
    }
  }

  private detectSecondWind(patterns: EnergyPattern[]): boolean {
    const afternoonEnergy = patterns
      .filter((p) => p.hour >= 13 && p.hour <= 16)
      .reduce((sum, p) => sum + p.averageEnergy, 0) / 4;

    const eveningEnergy = patterns
      .filter((p) => p.hour >= 18 && p.hour <= 20)
      .reduce((sum, p) => sum + p.averageEnergy, 0) / 3;

    return eveningEnergy > afternoonEnergy + 1;
  }

  private detectAfternoonSlump(patterns: EnergyPattern[]): boolean {
    const morningEnergy = patterns
      .filter((p) => p.hour >= 9 && p.hour <= 12)
      .reduce((sum, p) => sum + p.averageEnergy, 0) / 4;

    const afternoonEnergy = patterns
      .filter((p) => p.hour >= 13 && p.hour <= 16)
      .reduce((sum, p) => sum + p.averageEnergy, 0) / 4;

    return afternoonEnergy < morningEnergy - 1.5;
  }

  public async getEnergyForHour(hour: number): Promise<number> {
    const patterns = await this.analyzeEnergyPattern();
    const pattern = patterns.find((p) => p.hour === hour);
    return pattern ? pattern.averageEnergy : 5;
  }

  public async getCurrentEnergy(): Promise<number> {
    const currentHour = new Date().getHours();
    return this.getEnergyForHour(currentHour);
  }
}
