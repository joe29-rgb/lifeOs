/**
 * Gratitude Engine
 * Prompts appreciation for high-ROI relationships
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GratitudePrompt, ROIScore, SupportBalance } from '../types/relationshipROI.types';
import { GRATITUDE_TRIGGERS, GRATITUDE_TEMPLATES, INTERACTION_QUALITIES } from '../constants/relationshipROI.constants';

export class GratitudeEngine {
  private readonly GRATITUDE_KEY = '@gratitude_prompts';
  private readonly LAST_APPRECIATION_KEY = '@last_appreciation';

  public async checkForGratitudePrompt(
    roi: ROIScore,
    supportBalance: SupportBalance,
    recentMoments: string[]
  ): Promise<GratitudePrompt | null> {
    if (roi.overall < GRATITUDE_TRIGGERS.highROI) {
      return null;
    }

    const daysSinceAppreciation = await this.getDaysSinceLastAppreciation(roi.personId);

    if (daysSinceAppreciation < GRATITUDE_TRIGGERS.longTimeSinceAppreciation) {
      return null;
    }

    const recentSupport = supportBalance.history
      .filter((e) => e.type === 'received')
      .slice(-GRATITUDE_TRIGGERS.consistentSupport);

    if (recentSupport.length < GRATITUDE_TRIGGERS.consistentSupport) {
      return null;
    }

    const reason = this.generateReason(roi, supportBalance);
    const suggestedMessage = this.generateMessage(roi.personName, recentMoments);

    const prompt: GratitudePrompt = {
      id: `gratitude_${Date.now()}`,
      personId: roi.personId,
      personName: roi.personName,
      reason,
      recentMoments: recentMoments.slice(0, 3),
      suggestedMessage,
      timestamp: new Date(),
    };

    await this.savePrompt(prompt);
    return prompt;
  }

  private generateReason(roi: ROIScore, supportBalance: SupportBalance): string {
    const reasons: string[] = [];

    if (roi.overall >= 85) {
      reasons.push('Highest-ROI relationship');
    }
    if (roi.joy >= 8) {
      reasons.push('Consistent source of joy');
    }
    if (roi.energyImpact > 30) {
      reasons.push('Always energizing');
    }
    if (supportBalance.received >= 5) {
      reasons.push('Reliable support');
    }

    return reasons.join(', ');
  }

  private generateMessage(personName: string, recentMoments: string[]): string {
    const template = GRATITUDE_TEMPLATES[Math.floor(Math.random() * GRATITUDE_TEMPLATES.length)];
    const quality = INTERACTION_QUALITIES[Math.floor(Math.random() * INTERACTION_QUALITIES.length)];
    const recentMoment = recentMoments.length > 0 ? recentMoments[0] : 'everything you do';

    return template
      .replace('{name}', personName)
      .replace('{recent_moment}', recentMoment)
      .replace('{quality}', quality);
  }

  private async getDaysSinceLastAppreciation(personId: string): Promise<number> {
    const data = await AsyncStorage.getItem(this.LAST_APPRECIATION_KEY);
    if (!data) return 999;

    const lastAppreciation: Record<string, string> = JSON.parse(data);
    const lastDate = lastAppreciation[personId];

    if (!lastDate) return 999;

    const daysSince = Math.floor((Date.now() - new Date(lastDate).getTime()) / (24 * 60 * 60 * 1000));
    return daysSince;
  }

  public async markAppreciationSent(personId: string): Promise<void> {
    const data = await AsyncStorage.getItem(this.LAST_APPRECIATION_KEY);
    const lastAppreciation: Record<string, string> = data ? JSON.parse(data) : {};

    lastAppreciation[personId] = new Date().toISOString();

    await AsyncStorage.setItem(this.LAST_APPRECIATION_KEY, JSON.stringify(lastAppreciation));
  }

  private async savePrompt(prompt: GratitudePrompt): Promise<void> {
    const prompts = await this.getAllPrompts();
    prompts.push(prompt);

    await AsyncStorage.setItem(this.GRATITUDE_KEY, JSON.stringify(prompts));
  }

  public async getAllPrompts(): Promise<GratitudePrompt[]> {
    const data = await AsyncStorage.getItem(this.GRATITUDE_KEY);
    if (!data) return [];

    const prompts: GratitudePrompt[] = JSON.parse(data);
    return prompts.map((p) => ({
      ...p,
      timestamp: new Date(p.timestamp),
    }));
  }

  public async getPendingPrompts(): Promise<GratitudePrompt[]> {
    const prompts = await this.getAllPrompts();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return prompts.filter((p) => new Date(p.timestamp) > weekAgo);
  }

  public async dismissPrompt(promptId: string): Promise<void> {
    const prompts = await this.getAllPrompts();
    const filtered = prompts.filter((p) => p.id !== promptId);

    await AsyncStorage.setItem(this.GRATITUDE_KEY, JSON.stringify(filtered));
  }
}
