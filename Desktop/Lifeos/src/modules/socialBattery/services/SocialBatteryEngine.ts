/**
 * Social Battery Engine
 * Tracks battery level, calculates drain/recharge
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BatteryLevel, SocialEvent, SoloEvent, DrainFactors, RechargeFactors } from '../types/socialBattery.types';
import { DRAIN_RATES, RECHARGE_RATES, BATTERY_THRESHOLDS } from '../constants/socialBattery.constants';

export class SocialBatteryEngine {
  private readonly BATTERY_KEY = '@social_battery';
  private readonly EVENTS_KEY = '@social_events';
  private readonly SOLO_KEY = '@solo_events';

  public async getCurrentBattery(): Promise<BatteryLevel> {
    const data = await AsyncStorage.getItem(this.BATTERY_KEY);
    if (!data) {
      return this.initializeBattery();
    }

    const battery: BatteryLevel = JSON.parse(data);
    return {
      ...battery,
      timestamp: new Date(battery.timestamp),
    };
  }

  private initializeBattery(): BatteryLevel {
    return {
      current: 100,
      timestamp: new Date(),
      status: 'full',
    };
  }

  public async updateBattery(newLevel: number): Promise<BatteryLevel> {
    const battery: BatteryLevel = {
      current: Math.max(0, Math.min(100, newLevel)),
      timestamp: new Date(),
      status: this.getStatus(newLevel),
    };

    await AsyncStorage.setItem(this.BATTERY_KEY, JSON.stringify(battery));
    return battery;
  }

  private getStatus(level: number): BatteryLevel['status'] {
    if (level >= BATTERY_THRESHOLDS.full) return 'full';
    if (level >= BATTERY_THRESHOLDS.good) return 'good';
    if (level >= BATTERY_THRESHOLDS.medium) return 'medium';
    if (level >= BATTERY_THRESHOLDS.low) return 'low';
    return 'critical';
  }

  public calculateDrain(factors: DrainFactors): number {
    const baseRate = DRAIN_RATES.meeting_type[factors.meetingType];
    const personMultiplier = DRAIN_RATES.person_type[factors.personType];
    const locationMultiplier = DRAIN_RATES.location[factors.location];
    const energyMultiplier = DRAIN_RATES.energy_multiplier[factors.energyLevel];

    const durationDrain = this.getDurationDrain(factors.duration);

    const totalDrain = durationDrain * baseRate * personMultiplier * locationMultiplier * energyMultiplier;

    return Math.min(100, totalDrain);
  }

  private getDurationDrain(minutes: number): number {
    if (minutes <= 30) return DRAIN_RATES.duration[30];
    if (minutes <= 60) return DRAIN_RATES.duration[60];
    if (minutes <= 120) return DRAIN_RATES.duration[120];
    if (minutes <= 180) return DRAIN_RATES.duration[180];
    return DRAIN_RATES.duration[240];
  }

  public calculateRecharge(factors: RechargeFactors): number {
    const baseRate = RECHARGE_RATES.activity_type[factors.activityType];
    const durationRecharge = this.getDurationRecharge(factors.duration);

    const qualityMultiplier = factors.quality === 'high' ? 1.2 : factors.quality === 'low' ? 0.8 : 1.0;

    const totalRecharge = (durationRecharge * baseRate / 100) * qualityMultiplier;

    return Math.min(100, totalRecharge);
  }

  private getDurationRecharge(minutes: number): number {
    if (minutes <= 60) return RECHARGE_RATES.duration[60];
    if (minutes <= 120) return RECHARGE_RATES.duration[120];
    if (minutes <= 240) return RECHARGE_RATES.duration[240];
    return RECHARGE_RATES.duration[480];
  }

  public async logSocialEvent(event: Omit<SocialEvent, 'id' | 'timestamp' | 'drainAmount'>): Promise<void> {
    const drainFactors: DrainFactors = {
      meetingType: event.type === '1on1' ? '1on1' : event.type === 'group' ? 'group' : 'work',
      duration: event.duration,
      energyLevel: 'rested',
      personType: 'acquaintance',
      location: event.location,
    };

    const drainAmount = this.calculateDrain(drainFactors);

    const socialEvent: SocialEvent = {
      ...event,
      id: `social_${Date.now()}`,
      timestamp: new Date(),
      drainAmount,
    };

    const events = await this.getSocialEvents();
    events.push(socialEvent);
    await AsyncStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));

    const battery = await this.getCurrentBattery();
    await this.updateBattery(battery.current - drainAmount);
  }

  public async logSoloEvent(event: Omit<SoloEvent, 'id' | 'timestamp' | 'rechargeAmount'>): Promise<void> {
    const rechargeFactors: RechargeFactors = {
      duration: event.duration,
      activityType: event.type,
      quality: 'high',
    };

    const rechargeAmount = this.calculateRecharge(rechargeFactors);

    const soloEvent: SoloEvent = {
      ...event,
      id: `solo_${Date.now()}`,
      timestamp: new Date(),
      rechargeAmount,
    };

    const events = await this.getSoloEvents();
    events.push(soloEvent);
    await AsyncStorage.setItem(this.SOLO_KEY, JSON.stringify(events));

    const battery = await this.getCurrentBattery();
    await this.updateBattery(battery.current + rechargeAmount);
  }

  public async getSocialEvents(): Promise<SocialEvent[]> {
    const data = await AsyncStorage.getItem(this.EVENTS_KEY);
    if (!data) return [];

    const events: SocialEvent[] = JSON.parse(data);
    return events.map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
  }

  public async getSoloEvents(): Promise<SoloEvent[]> {
    const data = await AsyncStorage.getItem(this.SOLO_KEY);
    if (!data) return [];

    const events: SoloEvent[] = JSON.parse(data);
    return events.map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
  }

  public async getWeeklyPattern(): Promise<{ day: string; batteryLevel: number; socialEvents: number; soloHours: number }[]> {
    const socialEvents = await this.getSocialEvents();
    const soloEvents = await this.getSoloEvents();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const pattern = [];

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);

      const daySocial = socialEvents.filter((e) => 
        new Date(e.timestamp).toDateString() === day.toDateString()
      );

      const daySolo = soloEvents.filter((e) =>
        new Date(e.timestamp).toDateString() === day.toDateString()
      );

      const totalDrain = daySocial.reduce((sum, e) => sum + e.drainAmount, 0);
      const totalRecharge = daySolo.reduce((sum, e) => sum + e.rechargeAmount, 0);

      pattern.push({
        day: days[i],
        batteryLevel: Math.max(0, Math.min(100, 100 - totalDrain + totalRecharge)),
        socialEvents: daySocial.length,
        soloHours: daySolo.reduce((sum, e) => sum + e.duration, 0) / 60,
      });
    }

    return pattern;
  }

  public async getTimeToFullRecharge(): Promise<number> {
    const battery = await this.getCurrentBattery();
    const deficit = 100 - battery.current;

    const hoursNeeded = (deficit / RECHARGE_RATES.activity_type.hobby) * 60;

    return Math.ceil(hoursNeeded);
  }
}
