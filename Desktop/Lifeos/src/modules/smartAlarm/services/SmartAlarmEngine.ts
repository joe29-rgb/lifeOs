/**
 * Smart Alarm Engine
 * Finds optimal wake window and manages alarm logic
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmartAlarm, AlarmOptimization } from '../types/smartAlarm.types';
import { SleepCycleCalculator } from './SleepCycleCalculator';
import { SLEEP_PHASES, WAKE_WINDOWS } from '../constants/smartAlarm.constants';

export class SmartAlarmEngine {
  private readonly ALARM_KEY = '@smart_alarms';
  private sleepCalculator: SleepCycleCalculator;

  constructor() {
    this.sleepCalculator = new SleepCycleCalculator();
  }

  public async createSmartAlarm(
    userId: string,
    standardWakeTime: Date,
    flexibilityMinutes: number = WAKE_WINDOWS.optimal
  ): Promise<SmartAlarm> {
    const alarm: SmartAlarm = {
      id: `alarm_${Date.now()}`,
      userId,
      standardWakeTime,
      flexibilityMinutes,
      enabled: true,
      createdAt: new Date(),
    };

    await this.saveAlarm(alarm);
    return alarm;
  }

  public async optimizeAlarm(
    alarmId: string,
    bedtime: Date
  ): Promise<AlarmOptimization> {
    const alarm = await this.getAlarm(alarmId);
    if (!alarm) throw new Error('Alarm not found');

    const cycles = await this.sleepCalculator.calculateSleepCycles(
      bedtime,
      alarm.standardWakeTime
    );

    const optimalWakeTime = this.sleepCalculator.findOptimalWakeTime(
      alarm.standardWakeTime,
      alarm.flexibilityMinutes,
      bedtime
    );

    // Determine if optimal time is in light sleep
    const optimalCycle = cycles.find(
      (c) =>
        optimalWakeTime >= c.startTime && optimalWakeTime <= c.endTime
    );

    const inLightSleep = optimalCycle?.phase === 'light';
    const sleepCycleCompletion = this.sleepCalculator.calculateCycleCompletion(
      bedtime,
      optimalWakeTime
    );

    // Calculate expected wake quality
    const phase = optimalCycle?.phase || 'light';
    const expectedWakeQuality = SLEEP_PHASES[phase].wakeQuality;
    const expectedGrogginess = SLEEP_PHASES[phase].grogginess;

    // Traditional alarm comparison (waking at exact time, possibly in deep sleep)
    const traditionalPhase = cycles.find(
      (c) =>
        alarm.standardWakeTime >= c.startTime &&
        alarm.standardWakeTime <= c.endTime
    )?.phase || 'deep';

    const traditionalQuality = SLEEP_PHASES[traditionalPhase].wakeQuality;
    const traditionalGrogginess = SLEEP_PHASES[traditionalPhase].grogginess;

    const improvement = ((expectedWakeQuality - traditionalQuality) / traditionalQuality) * 100;

    const reasoning = this.generateReasoning(
      alarm.standardWakeTime,
      optimalWakeTime,
      inLightSleep,
      sleepCycleCompletion,
      cycles.length
    );

    return {
      alarmId,
      recommendedWakeTime: optimalWakeTime,
      inLightSleep,
      sleepCycleCompletion,
      expectedWakeQuality,
      expectedGrogginess,
      reasoning,
      comparison: {
        traditional: {
          wakeQuality: traditionalQuality,
          grogginess: traditionalGrogginess,
        },
        smart: {
          wakeQuality: expectedWakeQuality,
          grogginess: expectedGrogginess,
        },
        improvement: Math.round(improvement),
      },
    };
  }

  private generateReasoning(
    standardTime: Date,
    optimalTime: Date,
    inLightSleep: boolean,
    cycleCompletion: number,
    totalCycles: number
  ): string[] {
    const reasons: string[] = [];

    const timeDiff = (optimalTime.getTime() - standardTime.getTime()) / (1000 * 60);

    if (timeDiff < -5) {
      reasons.push(`Waking you ${Math.abs(Math.round(timeDiff))} minutes early`);
    } else if (timeDiff > 5) {
      reasons.push(`Waking you ${Math.round(timeDiff)} minutes late`);
    } else {
      reasons.push('Waking you at your target time');
    }

    if (inLightSleep) {
      reasons.push('✅ You\'ll be in light sleep phase');
      reasons.push('Minimal grogginess expected');
    } else {
      reasons.push('⚠️ Not in light sleep, but best available time');
    }

    if (cycleCompletion >= 95) {
      reasons.push(`✅ ${totalCycles} complete sleep cycles`);
    } else {
      reasons.push(`${totalCycles} cycles, ${Math.round(cycleCompletion)}% complete`);
    }

    if (inLightSleep && cycleCompletion >= 95) {
      reasons.push('🌟 Optimal wake conditions!');
    }

    return reasons;
  }

  private async saveAlarm(alarm: SmartAlarm): Promise<void> {
    const alarms = await this.getAllAlarms();
    const existing = alarms.findIndex((a) => a.id === alarm.id);

    if (existing >= 0) {
      alarms[existing] = alarm;
    } else {
      alarms.push(alarm);
    }

    await AsyncStorage.setItem(this.ALARM_KEY, JSON.stringify(alarms));
  }

  public async getAlarm(alarmId: string): Promise<SmartAlarm | null> {
    const alarms = await this.getAllAlarms();
    return alarms.find((a) => a.id === alarmId) || null;
  }

  public async getAllAlarms(): Promise<SmartAlarm[]> {
    const data = await AsyncStorage.getItem(this.ALARM_KEY);
    if (!data) return [];

    const alarms: SmartAlarm[] = JSON.parse(data);
    return alarms.map((a) => ({
      ...a,
      standardWakeTime: new Date(a.standardWakeTime),
      actualWakeTime: a.actualWakeTime ? new Date(a.actualWakeTime) : undefined,
      createdAt: new Date(a.createdAt),
    }));
  }

  public async updateAlarm(alarmId: string, updates: Partial<SmartAlarm>): Promise<void> {
    const alarm = await this.getAlarm(alarmId);
    if (!alarm) throw new Error('Alarm not found');

    const updated = { ...alarm, ...updates };
    await this.saveAlarm(updated);
  }

  public async deleteAlarm(alarmId: string): Promise<void> {
    const alarms = await this.getAllAlarms();
    const filtered = alarms.filter((a) => a.id !== alarmId);
    await AsyncStorage.setItem(this.ALARM_KEY, JSON.stringify(filtered));
  }

  public async logWakeQuality(
    alarmId: string,
    actualWakeTime: Date,
    wakeQuality: number,
    grogginess: number
  ): Promise<void> {
    await this.updateAlarm(alarmId, {
      actualWakeTime,
      wakeQuality,
      grogginess,
    });
  }
}
