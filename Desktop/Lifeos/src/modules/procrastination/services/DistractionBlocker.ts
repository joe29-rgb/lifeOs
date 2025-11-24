/**
 * Distraction Blocker
 * Mobile-native focus mode with app blocking (Android accessibility service)
 */

import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DistractionApp } from '../types/procrastination.types';
import { DISTRACTION_APPS } from '../constants/procrastination.constants';

export class DistractionBlocker {
  private isBlocking: boolean = false;
  private blockedApps: Set<string> = new Set();
  private blockStartTime?: Date;

  /**
   * Enable focus mode (block distraction apps)
   */
  public async enableFocusMode(durationMinutes?: number): Promise<boolean> {
    // Check if accessibility service is enabled
    const hasPermission = await this.checkAccessibilityPermission();
    
    if (!hasPermission) {
      // Prompt user to enable
      await this.requestAccessibilityPermission();
      return false;
    }

    this.isBlocking = true;
    this.blockStartTime = new Date();

    // Load user's blocked apps list
    await this.loadBlockedApps();

    // Save focus mode state
    await AsyncStorage.setItem('timeline_focus_mode', JSON.stringify({
      active: true,
      startTime: this.blockStartTime,
      duration: durationMinutes,
    }));

    // If duration specified, auto-disable after time
    if (durationMinutes) {
      setTimeout(() => {
        this.disableFocusMode();
      }, durationMinutes * 60 * 1000);
    }

    return true;
  }

  /**
   * Disable focus mode (unblock apps)
   */
  public async disableFocusMode(): Promise<void> {
    this.isBlocking = false;
    this.blockStartTime = undefined;

    await AsyncStorage.setItem('timeline_focus_mode', JSON.stringify({
      active: false,
    }));
  }

  /**
   * Check if app should be blocked
   */
  public isAppBlocked(packageName: string): boolean {
    return this.isBlocking && this.blockedApps.has(packageName);
  }

  /**
   * Add app to block list
   */
  public async addBlockedApp(packageName: string): Promise<void> {
    this.blockedApps.add(packageName);
    await this.saveBlockedApps();
  }

  /**
   * Remove app from block list
   */
  public async removeBlockedApp(packageName: string): Promise<void> {
    this.blockedApps.delete(packageName);
    await this.saveBlockedApps();
  }

  /**
   * Get all blocked apps
   */
  public async getBlockedApps(): Promise<DistractionApp[]> {
    await this.loadBlockedApps();
    
    const apps: DistractionApp[] = [];
    
    // Convert blocked apps to DistractionApp objects
    for (const packageName of this.blockedApps) {
      const category = this.getAppCategory(packageName);
      apps.push({
        packageName,
        displayName: this.getAppDisplayName(packageName),
        category,
        blocked: true,
      });
    }

    return apps;
  }

  /**
   * Get suggested apps to block
   */
  public getSuggestedApps(): DistractionApp[] {
    const suggested: DistractionApp[] = [];

    Object.entries(DISTRACTION_APPS).forEach(([category, packages]) => {
      packages.forEach((packageName) => {
        suggested.push({
          packageName,
          displayName: this.getAppDisplayName(packageName),
          category: category as any,
          blocked: this.blockedApps.has(packageName),
        });
      });
    });

    return suggested;
  }

  /**
   * Load blocked apps from storage
   */
  private async loadBlockedApps(): Promise<void> {
    try {
      const blockedJson = await AsyncStorage.getItem('timeline_blocked_apps');
      if (blockedJson) {
        const blocked: string[] = JSON.parse(blockedJson);
        this.blockedApps = new Set(blocked);
      } else {
        // Default to common distractions
        this.blockedApps = new Set([
          ...DISTRACTION_APPS.social,
          ...DISTRACTION_APPS.entertainment,
        ]);
      }
    } catch (error) {
      console.error('Error loading blocked apps:', error);
    }
  }

  /**
   * Save blocked apps to storage
   */
  private async saveBlockedApps(): Promise<void> {
    try {
      const blocked = Array.from(this.blockedApps);
      await AsyncStorage.setItem('timeline_blocked_apps', JSON.stringify(blocked));
    } catch (error) {
      console.error('Error saving blocked apps:', error);
    }
  }

  /**
   * Get app category
   */
  private getAppCategory(packageName: string): 'social' | 'entertainment' | 'games' | 'news' | 'other' {
    for (const [category, packages] of Object.entries(DISTRACTION_APPS)) {
      if (packages.includes(packageName)) {
        return category as any;
      }
    }
    return 'other';
  }

  /**
   * Get app display name (simplified)
   */
  private getAppDisplayName(packageName: string): string {
    const nameMap: Record<string, string> = {
      'com.instagram.android': 'Instagram',
      'com.facebook.katana': 'Facebook',
      'com.twitter.android': 'Twitter',
      'com.snapchat.android': 'Snapchat',
      'com.tiktok': 'TikTok',
      'com.google.android.youtube': 'YouTube',
      'com.netflix.mediaclient': 'Netflix',
      'com.spotify.music': 'Spotify',
      'com.hulu.plus': 'Hulu',
      'com.reddit.frontpage': 'Reddit',
    };

    return nameMap[packageName] || packageName;
  }

  /**
   * Check if accessibility permission is granted (Android)
   */
  private async checkAccessibilityPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const granted = await AsyncStorage.getItem('timeline_accessibility_granted');
      return granted === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Request accessibility permission
   */
  private async requestAccessibilityPermission(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    // Open accessibility settings
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }

  /**
   * Mark accessibility as granted (called after user enables)
   */
  public async markAccessibilityGranted(): Promise<void> {
    await AsyncStorage.setItem('timeline_accessibility_granted', 'true');
  }

  /**
   * Get focus mode status
   */
  public async getFocusModeStatus(): Promise<{
    active: boolean;
    startTime?: Date;
    duration?: number;
    remainingMinutes?: number;
  }> {
    try {
      const statusJson = await AsyncStorage.getItem('timeline_focus_mode');
      if (statusJson) {
        const status = JSON.parse(statusJson);
        
        if (status.active && status.startTime && status.duration) {
          const elapsed = (new Date().getTime() - new Date(status.startTime).getTime()) / 60000;
          const remaining = Math.max(0, status.duration - elapsed);
          
          return {
            ...status,
            startTime: new Date(status.startTime),
            remainingMinutes: remaining,
          };
        }
        
        return status;
      }
    } catch (error) {
      console.error('Error getting focus mode status:', error);
    }

    return { active: false };
  }

  /**
   * Get distraction count (how many times user tried to open blocked app)
   */
  public async getDistractionCount(): Promise<number> {
    try {
      const countJson = await AsyncStorage.getItem('timeline_distraction_count');
      return countJson ? parseInt(countJson, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Increment distraction count
   */
  public async incrementDistractionCount(): Promise<void> {
    try {
      const current = await this.getDistractionCount();
      await AsyncStorage.setItem('timeline_distraction_count', (current + 1).toString());
    } catch (error) {
      console.error('Error incrementing distraction count:', error);
    }
  }

  /**
   * Reset distraction count
   */
  public async resetDistractionCount(): Promise<void> {
    await AsyncStorage.setItem('timeline_distraction_count', '0');
  }
}

// Singleton instance
export const distractionBlocker = new DistractionBlocker();
