/**
 * Mental Health Monitor
 * Speech analysis, pattern detection, early warning system
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MoodEntry,
  MentalHealthBaseline,
  MentalHealthAlert,
  EarlyWarningSignal,
  MoodLevel,
} from '../types/health.types';
import { MENTAL_HEALTH_PHRASES, HEALTH_THRESHOLDS, BARNEY_HEALTH_MESSAGES } from '../constants/health.constants';

export class MentalHealthMonitor {
  private readonly MOOD_KEY = '@mental_health_moods';
  private readonly BASELINE_KEY = '@mental_health_baseline';
  private readonly ALERTS_KEY = '@mental_health_alerts';

  public async logMood(mood: MoodLevel, emoji: string, notes?: string, triggers?: string[]): Promise<MoodEntry> {
    const userId = await this.getUserId();
    const entry: MoodEntry = {
      id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      mood,
      emoji,
      notes,
      triggers,
      timestamp: new Date(),
    };

    const moods = await this.getAllMoods();
    moods.push(entry);
    await AsyncStorage.setItem(this.MOOD_KEY, JSON.stringify(moods));

    await this.updateBaseline();
    await this.checkForWarnings();

    return entry;
  }

  public async analyzeSpeech(transcript: string): Promise<{ signals: EarlyWarningSignal[]; score: number }> {
    const signals: EarlyWarningSignal[] = [];
    let negativeCount = 0;
    let isolationCount = 0;
    let stressCount = 0;

    const lowerTranscript = transcript.toLowerCase();

    MENTAL_HEALTH_PHRASES.negative.forEach((phrase) => {
      if (lowerTranscript.includes(phrase)) negativeCount++;
    });

    MENTAL_HEALTH_PHRASES.isolation.forEach((phrase) => {
      if (lowerTranscript.includes(phrase)) isolationCount++;
    });

    MENTAL_HEALTH_PHRASES.stress.forEach((phrase) => {
      if (lowerTranscript.includes(phrase)) stressCount++;
    });

    if (negativeCount > 0) {
      signals.push({
        type: 'speech',
        metric: 'negative_self_talk',
        currentValue: negativeCount,
        baselineValue: 0,
        deviation: negativeCount,
        severity: negativeCount >= 3 ? 'critical' : 'warning',
      });
    }

    if (isolationCount > 0) {
      signals.push({
        type: 'speech',
        metric: 'social_isolation',
        currentValue: isolationCount,
        baselineValue: 0,
        deviation: isolationCount,
        severity: isolationCount >= 2 ? 'warning' : 'info',
      });
    }

    if (stressCount > 0) {
      signals.push({
        type: 'speech',
        metric: 'stress_indicators',
        currentValue: stressCount,
        baselineValue: 0,
        deviation: stressCount,
        severity: stressCount >= 3 ? 'warning' : 'info',
      });
    }

    const words = transcript.split(/\s+/).length;
    const wordsPerMinute = words;
    const baseline = 150;
    const deviation = Math.abs(wordsPerMinute - baseline) / baseline;

    if (deviation > 0.2) {
      signals.push({
        type: 'speech',
        metric: 'speech_pace',
        currentValue: wordsPerMinute,
        baselineValue: baseline,
        deviation,
        severity: deviation > 0.3 ? 'warning' : 'info',
      });
    }

    const score = Math.max(0, 10 - (negativeCount * 2 + isolationCount + stressCount));

    return { signals, score };
  }

  public async getBaseline(): Promise<MentalHealthBaseline | null> {
    const data = await AsyncStorage.getItem(this.BASELINE_KEY);
    if (!data) return null;
    const baseline = JSON.parse(data);
    baseline.calculatedAt = new Date(baseline.calculatedAt);
    return baseline;
  }

  public async updateBaseline(): Promise<void> {
    const moods = await this.getAllMoods();
    if (moods.length < 7) return;

    const recentMoods = moods.slice(-30);
    const moodValues = recentMoods.map((m) => m.mood);
    const averageMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
    const minMood = Math.min(...moodValues);
    const maxMood = Math.max(...moodValues);

    const triggerCounts: Record<string, number> = {};
    recentMoods.forEach((entry) => {
      entry.triggers?.forEach((trigger) => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    });

    const typicalTriggers = Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trigger]) => trigger);

    const userId = await this.getUserId();
    const baseline: MentalHealthBaseline = {
      userId,
      averageMood,
      moodRange: { min: minMood, max: maxMood },
      typicalTriggers,
      supportNetwork: [],
      calculatedAt: new Date(),
      sampleSize: recentMoods.length,
    };

    await AsyncStorage.setItem(this.BASELINE_KEY, JSON.stringify(baseline));
  }

  public async checkForWarnings(): Promise<MentalHealthAlert[]> {
    const moods = await this.getAllMoods();
    const baseline = await this.getBaseline();
    if (!baseline || moods.length < 7) return [];

    const recentMoods = moods.slice(-7);
    const recentAverage = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
    const deviation = baseline.averageMood - recentAverage;

    const alerts: MentalHealthAlert[] = [];
    const userId = await this.getUserId();

    if (deviation >= HEALTH_THRESHOLDS.mood.baseline_deviation) {
      const lowMoodStreak = this.calculateLowMoodStreak(moods);

      const signals: string[] = [];
      if (deviation >= 2) signals.push(`Mood ${deviation.toFixed(1)} points below your baseline`);
      if (lowMoodStreak >= 3) signals.push(`${lowMoodStreak} consecutive days below normal`);

      const alert: MentalHealthAlert = {
        id: `alert_${Date.now()}`,
        userId,
        severity: deviation >= 2.5 ? 'critical' : 'warning',
        title: '⚠️ Pattern Alert',
        message: BARNEY_HEALTH_MESSAGES.mood_declining[0],
        signals,
        suggestions: [
          'Call a friend from your support network',
          'Schedule therapy session',
          'Take a mental health day',
          'Talk to Timeline AI',
        ],
        comparisonPeriod: 'Similar to past rough periods',
        createdAt: new Date(),
        acknowledged: false,
      };

      alerts.push(alert);
      await this.saveAlert(alert);
    }

    return alerts;
  }

  public async getActiveAlerts(): Promise<MentalHealthAlert[]> {
    const data = await AsyncStorage.getItem(this.ALERTS_KEY);
    if (!data) return [];
    const alerts: MentalHealthAlert[] = JSON.parse(data);
    return alerts
      .filter((a) => !a.acknowledged)
      .map((a) => ({ ...a, createdAt: new Date(a.createdAt) }));
  }

  public async acknowledgeAlert(alertId: string): Promise<void> {
    const data = await AsyncStorage.getItem(this.ALERTS_KEY);
    if (!data) return;
    const alerts: MentalHealthAlert[] = JSON.parse(data);
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      await AsyncStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
    }
  }

  private async saveAlert(alert: MentalHealthAlert): Promise<void> {
    const data = await AsyncStorage.getItem(this.ALERTS_KEY);
    const alerts: MentalHealthAlert[] = data ? JSON.parse(data) : [];
    alerts.push(alert);
    await AsyncStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
  }

  private async getAllMoods(): Promise<MoodEntry[]> {
    const data = await AsyncStorage.getItem(this.MOOD_KEY);
    if (!data) return [];
    const moods: MoodEntry[] = JSON.parse(data);
    return moods.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  }

  private calculateLowMoodStreak(moods: MoodEntry[]): number {
    let streak = 0;
    for (let i = moods.length - 1; i >= 0; i--) {
      if (moods[i].mood < 6) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private async getUserId(): Promise<string> {
    const userId = await AsyncStorage.getItem('@user_id');
    return userId || 'default_user';
  }
}
