/**
 * Sleep Analyzer
 * Wearable integration, pattern detection, sleep rescue protocol
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepEntry, SleepQuality, SleepPattern } from '../types/health.types';
import { HEALTH_THRESHOLDS, BARNEY_HEALTH_MESSAGES } from '../constants/health.constants';

export class SleepAnalyzer {
  private readonly SLEEP_KEY = '@health_sleep_entries';
  private readonly PATTERN_KEY = '@health_sleep_patterns';

  public async logSleep(
    bedtime: Date,
    wakeTime: Date,
    quality: SleepQuality,
    source: 'wearable' | 'manual',
    notes?: string
  ): Promise<SleepEntry> {
    const userId = await this.getUserId();
    const duration = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60 * 60);

    const entry: SleepEntry = {
      id: `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      bedtime,
      wakeTime,
      duration,
      quality,
      source,
      notes,
    };

    const entries = await this.getAllEntries();
    entries.push(entry);
    await AsyncStorage.setItem(this.SLEEP_KEY, JSON.stringify(entries));

    await this.analyzePatterns();
    await this.checkSleepEmergency();

    return entry;
  }

  public async getSleepPattern(): Promise<SleepPattern | null> {
    const data = await AsyncStorage.getItem(this.PATTERN_KEY);
    if (!data) return null;
    const pattern: SleepPattern = JSON.parse(data);
    pattern.createdAt = new Date(pattern.createdAt);
    return pattern;
  }

  public async checkSleepEmergency(): Promise<{ isEmergency: boolean; message?: string; protocol?: string[] }> {
    const entries = await this.getAllEntries();
    const recent = entries.slice(-5);

    if (recent.length < 3) return { isEmergency: false };

    const poorNights = recent.filter(
      (e) => e.duration < HEALTH_THRESHOLDS.sleep.minimum_hours || e.quality <= HEALTH_THRESHOLDS.sleep.poor_quality
    );

    if (poorNights.length >= HEALTH_THRESHOLDS.sleep.warning_nights) {
      const avgDuration = recent.reduce((sum, e) => sum + e.duration, 0) / recent.length;

      return {
        isEmergency: true,
        message: `🛏️ Sleep Emergency! You've averaged ${avgDuration.toFixed(1)} hrs for ${recent.length} nights (need ${HEALTH_THRESHOLDS.sleep.ideal_hours}).`,
        protocol: [
          '⏰ 9:30pm - Start winding down (earlier than usual)',
          '📵 10:00pm - Phone on Do Not Disturb',
          '🛏️ 10:30pm - Lights out',
          '🎯 Target: 8 hours recovery sleep',
        ],
      };
    }

    return { isEmergency: false };
  }

  public async getRecentSleep(days: number = 7): Promise<SleepEntry[]> {
    const entries = await this.getAllEntries();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entries.filter((e) => e.wakeTime >= cutoff);
  }

  public async getAverageSleep(days: number = 7): Promise<number> {
    const recent = await this.getRecentSleep(days);
    if (recent.length === 0) return 0;
    return recent.reduce((sum, e) => sum + e.duration, 0) / recent.length;
  }

  private async analyzePatterns(): Promise<void> {
    const entries = await this.getAllEntries();
    if (entries.length < 14) return;

    const recent = entries.slice(-30);
    const durations = recent.map((e) => e.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    const bedtimeHours = recent.map((e) => e.bedtime.getHours());
    const avgBedtime = bedtimeHours.reduce((sum, h) => sum + h, 0) / bedtimeHours.length;

    const goodSleep = recent.filter((e) => e.quality >= 7 && e.duration >= HEALTH_THRESHOLDS.sleep.ideal_hours);
    const poorSleep = recent.filter((e) => e.quality <= 5 || e.duration < HEALTH_THRESHOLDS.sleep.minimum_hours);

    const userId = await this.getUserId();
    const pattern: SleepPattern = {
      id: `sleep_pattern_${Date.now()}`,
      userId,
      idealDuration: HEALTH_THRESHOLDS.sleep.ideal_hours,
      bestBedtime: `${Math.floor(avgBedtime)}:00 PM`,
      worstBedtime: 'After 11:00 PM',
      factors: {
        positive: [
          'After workout + light dinner before 7pm',
          'No screen time after 10pm',
          'Consistent bedtime routine',
        ],
        negative: ['Screen time after 10pm', 'Caffeine after 2pm', 'High-stress days'],
      },
      createdAt: new Date(),
    };

    await AsyncStorage.setItem(this.PATTERN_KEY, JSON.stringify(pattern));
  }

  private async getAllEntries(): Promise<SleepEntry[]> {
    const data = await AsyncStorage.getItem(this.SLEEP_KEY);
    if (!data) return [];
    const entries: SleepEntry[] = JSON.parse(data);
    return entries.map((e) => ({
      ...e,
      bedtime: new Date(e.bedtime),
      wakeTime: new Date(e.wakeTime),
    }));
  }

  private async getUserId(): Promise<string> {
    const userId = await AsyncStorage.getItem('@user_id');
    return userId || 'default_user';
  }
}
