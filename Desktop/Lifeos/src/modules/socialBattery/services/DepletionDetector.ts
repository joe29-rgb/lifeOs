/**
 * Depletion Detector
 * Alerts when battery low or isolation high
 */

import { DepletionAlert, IsolationAlert } from '../types/socialBattery.types';
import { SocialBatteryEngine } from './SocialBatteryEngine';
import { BATTERY_THRESHOLDS, ISOLATION_THRESHOLDS, DEPLETION_MESSAGES, ISOLATION_MESSAGES } from '../constants/socialBattery.constants';

export class DepletionDetector {
  private batteryEngine: SocialBatteryEngine;

  constructor() {
    this.batteryEngine = new SocialBatteryEngine();
  }

  public async checkDepletion(): Promise<DepletionAlert | null> {
    const battery = await this.batteryEngine.getCurrentBattery();

    if (battery.current <= BATTERY_THRESHOLDS.critical) {
      return {
        id: `depletion_${Date.now()}`,
        severity: 'critical',
        level: battery.current,
        message: DEPLETION_MESSAGES.critical.message,
        recommendations: DEPLETION_MESSAGES.critical.recommendations,
        timestamp: new Date(),
      };
    }

    if (battery.current <= BATTERY_THRESHOLDS.low) {
      return {
        id: `depletion_${Date.now()}`,
        severity: 'high',
        level: battery.current,
        message: DEPLETION_MESSAGES.high.message,
        recommendations: DEPLETION_MESSAGES.high.recommendations,
        timestamp: new Date(),
      };
    }

    if (battery.current <= BATTERY_THRESHOLDS.medium) {
      return {
        id: `depletion_${Date.now()}`,
        severity: 'medium',
        level: battery.current,
        message: DEPLETION_MESSAGES.medium.message,
        recommendations: DEPLETION_MESSAGES.medium.recommendations,
        timestamp: new Date(),
      };
    }

    return null;
  }

  public async checkIsolation(): Promise<IsolationAlert | null> {
    const socialEvents = await this.batteryEngine.getSocialEvents();
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const recentSocial = socialEvents.filter((e) => new Date(e.timestamp) > fiveDaysAgo);

    if (recentSocial.length === 0) {
      const daysAlone = this.calculateDaysAlone(socialEvents);
      const canceledPlans = 0;
      const moodTrend = 'stable' as const;

      if (daysAlone >= ISOLATION_THRESHOLDS.days_alone) {
        return {
          id: `isolation_${Date.now()}`,
          daysAlone,
          moodTrend,
          canceledPlans,
          message: ISOLATION_MESSAGES.warning.message,
          recommendations: ISOLATION_MESSAGES.warning.recommendations,
          timestamp: new Date(),
        };
      }
    }

    return null;
  }

  private calculateDaysAlone(socialEvents: any[]): number {
    if (socialEvents.length === 0) return 7;

    const lastEvent = socialEvents[socialEvents.length - 1];
    const daysSince = Math.floor((Date.now() - new Date(lastEvent.timestamp).getTime()) / (24 * 60 * 60 * 1000));

    return daysSince;
  }

  public async getSocialBalance(): Promise<{ socialHours: number; soloHours: number; ratio: number }> {
    const socialEvents = await this.batteryEngine.getSocialEvents();
    const soloEvents = await this.batteryEngine.getSoloEvents();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentSocial = socialEvents.filter((e) => new Date(e.timestamp) > weekAgo);
    const recentSolo = soloEvents.filter((e) => new Date(e.timestamp) > weekAgo);

    const socialHours = recentSocial.reduce((sum, e) => sum + e.duration, 0) / 60;
    const soloHours = recentSolo.reduce((sum, e) => sum + e.duration, 0) / 60;

    const ratio = socialHours > 0 ? soloHours / socialHours : 0;

    return { socialHours, soloHours, ratio };
  }
}
