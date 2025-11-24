/**
 * Reward System
 * Lightweight, device-centric rewards for task completion
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { RewardConfig } from '../types/procrastination.types';
import { REWARD_MESSAGES } from '../constants/procrastination.constants';

export class RewardSystem {
  private rewardCallbacks: Array<(reward: RewardConfig) => void> = [];

  /**
   * Register reward callback
   */
  public onReward(callback: (reward: RewardConfig) => void): void {
    this.rewardCallbacks.push(callback);
  }

  /**
   * Trigger confetti reward
   */
  public async triggerConfetti(): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const reward: RewardConfig = {
      type: 'confetti',
      title: REWARD_MESSAGES.confetti,
      message: 'You crushed it! Time to celebrate!',
      icon: '🎉',
    };

    this.notifyCallbacks(reward);
  }

  /**
   * Trigger affirmation reward
   */
  public async triggerAffirmation(message: string): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const reward: RewardConfig = {
      type: 'affirmation',
      title: REWARD_MESSAGES.affirmation,
      message,
      icon: '⭐',
    };

    this.notifyCallbacks(reward);
  }

  /**
   * Trigger unlock reward (entertainment apps)
   */
  public async triggerUnlock(apps?: string[]): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const reward: RewardConfig = {
      type: 'unlock',
      title: REWARD_MESSAGES.unlock,
      message: 'You earned it! Enjoy your break.',
      icon: '🔓',
      unlockApps: apps,
    };

    this.notifyCallbacks(reward);
    
    // Actually unlock apps if provided
    if (apps && apps.length > 0) {
      await this.unlockApps(apps);
    }
  }

  /**
   * Trigger streak reward
   */
  public async triggerStreak(days: number): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const reward: RewardConfig = {
      type: 'streak',
      title: REWARD_MESSAGES.streak,
      message: `${days} days of legendary productivity!`,
      icon: '🔥',
    };

    this.notifyCallbacks(reward);
  }

  /**
   * Trigger achievement reward
   */
  public async triggerAchievement(title: string, message: string, icon: string): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const reward: RewardConfig = {
      type: 'achievement',
      title,
      message,
      icon,
    };

    this.notifyCallbacks(reward);
  }

  /**
   * Determine reward based on completion
   */
  public async rewardCompletion(
    pomodoroCount: number,
    streak: number,
    taskCompleted: boolean
  ): Promise<void> {
    // Always trigger confetti for task completion
    if (taskCompleted) {
      await this.triggerConfetti();
    }

    // Streak rewards
    if (streak > 0 && streak % 7 === 0) {
      await this.triggerStreak(streak);
    }

    // Pomodoro milestones
    if (pomodoroCount === 4) {
      await this.triggerAchievement(
        'Pomodoro Master!',
        'You completed 4 focus sessions in a row!',
        '🏆'
      );
    } else if (pomodoroCount === 8) {
      await this.triggerAchievement(
        'Productivity Legend!',
        'EIGHT pomodoros! You\'re unstoppable!',
        '👑'
      );
    }

    // Unlock entertainment after work
    if (taskCompleted) {
      await this.triggerUnlock();
    }
  }

  /**
   * Unlock apps (remove from blocked list)
   */
  private async unlockApps(apps: string[]): Promise<void> {
    try {
      const blockedJson = await AsyncStorage.getItem('timeline_blocked_apps');
      if (!blockedJson) return;

      const blocked: string[] = JSON.parse(blockedJson);
      const updated = blocked.filter((app) => !apps.includes(app));

      await AsyncStorage.setItem('timeline_blocked_apps', JSON.stringify(updated));
    } catch (error) {
      console.error('Error unlocking apps:', error);
    }
  }

  /**
   * Notify callbacks
   */
  private notifyCallbacks(reward: RewardConfig): void {
    this.rewardCallbacks.forEach((callback) => callback(reward));
  }

  /**
   * Get total rewards earned
   */
  public async getTotalRewards(): Promise<number> {
    try {
      const rewardsJson = await AsyncStorage.getItem('timeline_rewards_count');
      return rewardsJson ? parseInt(rewardsJson, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Increment rewards count
   */
  public async incrementRewards(): Promise<void> {
    try {
      const current = await this.getTotalRewards();
      await AsyncStorage.setItem('timeline_rewards_count', (current + 1).toString());
    } catch (error) {
      console.error('Error incrementing rewards:', error);
    }
  }
}

// Singleton instance
export const rewardSystem = new RewardSystem();
