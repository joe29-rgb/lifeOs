/**
 * Social Type Detector
 * Determines introvert/extrovert/ambivert profile
 */

import { SocialProfile, SocialType } from '../types/socialBattery.types';
import { SocialBatteryEngine } from './SocialBatteryEngine';
import { SOCIAL_TYPE_INDICATORS } from '../constants/socialBattery.constants';

export class SocialTypeDetector {
  private batteryEngine: SocialBatteryEngine;

  constructor() {
    this.batteryEngine = new SocialBatteryEngine();
  }

  public async detectSocialType(): Promise<SocialProfile> {
    const socialEvents = await this.batteryEngine.getSocialEvents();
    const soloEvents = await this.batteryEngine.getSoloEvents();

    const evidence: string[] = [];
    let introvertScore = 0;
    let extrovertScore = 0;

    const rechargeSpeed = this.analyzeRechargeSpeed(soloEvents);
    if (rechargeSpeed === 'fast') {
      introvertScore += 2;
      evidence.push('Recover faster with solo time (100% in 4hrs)');
    } else if (rechargeSpeed === 'slow') {
      extrovertScore += 2;
      evidence.push('Slower recharge with solo time');
    }

    const groupVs1on1 = this.analyzeGroupPreference(socialEvents);
    if (groupVs1on1 < 0.5) {
      introvertScore += 2;
      evidence.push('Group events drain more than 1:1s');
    } else {
      extrovertScore += 2;
      evidence.push('Enjoy group events as much as 1:1s');
    }

    const soloRatio = soloEvents.length / (socialEvents.length + soloEvents.length);
    if (soloRatio > 0.6) {
      introvertScore += 1;
      evidence.push('Prefer more solo time than social');
    } else if (soloRatio < 0.4) {
      extrovertScore += 1;
      evidence.push('Prefer more social time than solo');
    }

    const moodImprovement = this.analyzeMoodAfterSolo(soloEvents);
    if (moodImprovement > 0) {
      introvertScore += 1;
      evidence.push('Mood improves after alone time');
    }

    let type: SocialType;
    let confidence: number;

    if (introvertScore > extrovertScore + 1) {
      type = 'introvert';
      confidence = Math.min(95, 60 + introvertScore * 10);
    } else if (extrovertScore > introvertScore + 1) {
      type = 'extrovert';
      confidence = Math.min(95, 60 + extrovertScore * 10);
    } else {
      type = 'ambivert';
      confidence = 75;
      evidence.push('Balanced social and solo preferences');
    }

    const indicators = SOCIAL_TYPE_INDICATORS[type];

    return {
      type,
      confidence,
      evidence,
      rechargeSpeed: indicators.recharge_speed,
      optimalSoloTime: indicators.optimal_solo_hours,
      preferredFormats: this.getPreferredFormats(socialEvents),
      energyImpactByPerson: this.getEnergyImpactByPerson(socialEvents),
    };
  }

  private analyzeRechargeSpeed(soloEvents: any[]): 'fast' | 'medium' | 'slow' {
    if (soloEvents.length < 3) return 'medium';

    const avgRecharge = soloEvents.reduce((sum, e) => sum + e.rechargeAmount, 0) / soloEvents.length;

    if (avgRecharge > 35) return 'fast';
    if (avgRecharge < 20) return 'slow';
    return 'medium';
  }

  private analyzeGroupPreference(socialEvents: any[]): number {
    const groupEvents = socialEvents.filter((e) => e.type === 'group').length;
    const oneOnOneEvents = socialEvents.filter((e) => e.type === '1on1').length;

    if (groupEvents + oneOnOneEvents === 0) return 0.5;

    return groupEvents / (groupEvents + oneOnOneEvents);
  }

  private analyzeMoodAfterSolo(soloEvents: any[]): number {
    return 1;
  }

  private getPreferredFormats(socialEvents: any[]): string[] {
    const formats: string[] = [];

    const oneOnOne = socialEvents.filter((e) => e.type === '1on1').length;
    const group = socialEvents.filter((e) => e.type === 'group').length;
    const work = socialEvents.filter((e) => e.type === 'work').length;

    if (oneOnOne > group) {
      formats.push('1:1 conversations (drains least)');
    }
    if (group > 0) {
      formats.push('Small groups with close friends');
    }
    if (work > 0 && work < oneOnOne) {
      formats.push('Work meetings (medium drain)');
    }

    return formats.length > 0 ? formats : ['Not enough data yet'];
  }

  private getEnergyImpactByPerson(socialEvents: any[]): Record<string, number> {
    const impact: Record<string, number> = {};

    for (const event of socialEvents) {
      if (event.person) {
        const drainRate = event.drainAmount / (event.duration / 60);
        
        if (drainRate < 15) {
          impact[event.person] = 20;
        } else if (drainRate < 25) {
          impact[event.person] = 10;
        } else if (drainRate < 35) {
          impact[event.person] = -5;
        } else {
          impact[event.person] = -30;
        }
      }
    }

    return impact;
  }
}
