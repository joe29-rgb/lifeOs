/**
 * Intervention Engine
 * Manages layered interventions with Barney Stinson legendary motivation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  InterventionLevel,
  InterventionConfig,
  InterventionResponse,
  ProcrastinationEvent,
  UserProcrastinationProfile,
  InterventionAction,
} from '../types/procrastination.types';
import {
  INTERVENTION_MESSAGES,
  GENTLE_NUDGE_DELAY_MINUTES,
  FIRM_NUDGE_DELAY_MINUTES,
  EPIC_INTERVENTION_DELAY_MINUTES,
} from '../constants/procrastination.constants';

export class InterventionEngine {
  private activeIntervention?: {
    event: ProcrastinationEvent;
    level: InterventionLevel;
    startTime: Date;
  };
  private interventionHistory: Map<string, InterventionResponse[]> = new Map();
  private userProfile?: UserProcrastinationProfile;

  constructor() {
    this.loadUserProfile();
  }

  /**
   * Determine intervention level based on event and user history
   */
  public async determineInterventionLevel(event: ProcrastinationEvent): Promise<InterventionLevel> {
    // Check if there's an active intervention for the same trigger
    if (this.activeIntervention) {
      const timeSinceStart = (new Date().getTime() - this.activeIntervention.startTime.getTime()) / 60000;
      
      // Escalate based on time
      if (timeSinceStart >= EPIC_INTERVENTION_DELAY_MINUTES) {
        return 'epic';
      } else if (timeSinceStart >= FIRM_NUDGE_DELAY_MINUTES) {
        return 'firm';
      }
    }

    // Use user's preferred intervention level if available
    if (this.userProfile?.preferredInterventionLevel) {
      return this.userProfile.preferredInterventionLevel;
    }

    // Default to gentle for first intervention
    return 'gentle';
  }

  /**
   * Create intervention configuration
   */
  public async createIntervention(
    event: ProcrastinationEvent,
    level: InterventionLevel
  ): Promise<InterventionConfig> {
    const messages = INTERVENTION_MESSAGES[level];
    const message = messages[Math.floor(Math.random() * messages.length)];

    const actions = this.getActionsForLevel(level);

    const config: InterventionConfig = {
      level,
      message,
      actions,
      hapticPattern: this.getHapticPattern(level),
      barneyMode: await this.shouldUseBarneyMode(),
    };

    // Set active intervention
    this.activeIntervention = {
      event,
      level,
      startTime: new Date(),
    };

    return config;
  }

  /**
   * Get actions for intervention level
   */
  private getActionsForLevel(level: InterventionLevel): InterventionAction[] {
    switch (level) {
      case 'gentle':
        return [
          { id: 'start_now', label: 'Start Now', type: 'started_task', primary: true },
          { id: 'give_5', label: 'Give Me 5', type: 'delayed_5min' },
          { id: 'working', label: 'I\'m Actually Working', type: 'dismissed' },
        ];
      
      case 'firm':
        return [
          { id: 'break_down', label: 'Break Down the Task', type: 'broke_down_task', primary: true },
          { id: 'focus_mode', label: 'Focus Mode', type: 'enabled_focus_mode' },
          { id: 'remind_later', label: 'Remind Me Later', type: 'delayed_5min' },
        ];
      
      case 'epic':
        return [
          { id: 'call_support', label: 'Call In Support', type: 'called_support' },
          { id: 'pep_talk', label: 'Give Me a Pep Talk', type: 'started_task', primary: true },
          { id: 'not_now', label: 'Not Now', type: 'dismissed' },
        ];
      
      default:
        return [];
    }
  }

  /**
   * Get haptic pattern for level
   */
  private getHapticPattern(level: InterventionLevel): 'light' | 'medium' | 'heavy' {
    switch (level) {
      case 'gentle':
        return 'light';
      case 'firm':
        return 'medium';
      case 'epic':
        return 'heavy';
    }
  }

  /**
   * Determine if Barney mode should be used
   */
  private async shouldUseBarneyMode(): Promise<boolean> {
    try {
      const settings = await AsyncStorage.getItem('timeline_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        return parsed.barneyMode !== false; // Default to true
      }
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Trigger haptic feedback
   */
  public async triggerHaptic(pattern: 'light' | 'medium' | 'heavy'): Promise<void> {
    try {
      switch (pattern) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Record user response to intervention
   */
  public async recordResponse(
    event: ProcrastinationEvent,
    response: InterventionResponse
  ): Promise<void> {
    // Update event
    event.userResponse = response;
    event.respondedAt = new Date();
    event.wasSuccessful = this.isSuccessfulResponse(response);

    // Save to history
    const eventId = event.id;
    const history = this.interventionHistory.get(eventId) || [];
    history.push(response);
    this.interventionHistory.set(eventId, history);

    // Update user profile
    await this.updateUserProfile(event, response);

    // Clear active intervention if successful
    if (event.wasSuccessful) {
      this.activeIntervention = undefined;
    }

    // Save event
    await this.saveEvent(event);
  }

  /**
   * Check if response is successful
   */
  private isSuccessfulResponse(response: InterventionResponse): boolean {
    return [
      'started_task',
      'broke_down_task',
      'enabled_focus_mode',
      'called_support',
    ].includes(response);
  }

  /**
   * Update user profile based on intervention outcome
   */
  private async updateUserProfile(
    event: ProcrastinationEvent,
    response: InterventionResponse
  ): Promise<void> {
    if (!this.userProfile) {
      this.userProfile = await this.createDefaultProfile();
    }

    this.userProfile.totalEvents += 1;

    if (this.isSuccessfulResponse(response)) {
      this.userProfile.successfulInterventions += 1;
      
      // Update most effective intervention level
      const successRate = await this.getSuccessRateForLevel(event.interventionLevel);
      const currentBestRate = await this.getSuccessRateForLevel(this.userProfile.mostEffectiveIntervention);
      
      if (successRate > currentBestRate) {
        this.userProfile.mostEffectiveIntervention = event.interventionLevel;
      }
    }

    // Update common triggers
    if (!this.userProfile.commonTriggers.includes(event.trigger)) {
      this.userProfile.commonTriggers.push(event.trigger);
    }

    // Update peak procrastination hours
    const hour = new Date(event.detectedAt).getHours();
    if (!this.userProfile.peakProcrastinationHours.includes(hour)) {
      this.userProfile.peakProcrastinationHours.push(hour);
    }

    this.userProfile.updatedAt = new Date();

    await this.saveUserProfile();
  }

  /**
   * Get success rate for intervention level
   */
  private async getSuccessRateForLevel(level: InterventionLevel): Promise<number> {
    try {
      const eventsJson = await AsyncStorage.getItem('timeline_procrastination_events');
      if (!eventsJson) return 0.5;

      const events: ProcrastinationEvent[] = JSON.parse(eventsJson);
      const levelEvents = events.filter((e) => e.interventionLevel === level);
      
      if (levelEvents.length === 0) return 0.5;

      const successful = levelEvents.filter((e) => e.wasSuccessful).length;
      return successful / levelEvents.length;
    } catch (error) {
      console.error('Error calculating success rate:', error);
      return 0.5;
    }
  }

  /**
   * Create default user profile
   */
  private async createDefaultProfile(): Promise<UserProcrastinationProfile> {
    const userId = await this.getUserId();
    
    return {
      userId,
      totalEvents: 0,
      successfulInterventions: 0,
      preferredInterventionLevel: 'gentle',
      mostEffectiveIntervention: 'gentle',
      commonTriggers: [],
      peakProcrastinationHours: [],
      currentStreak: 0,
      longestStreak: 0,
      totalFocusMinutes: 0,
      averageTaskCompletionTime: 0,
      updatedAt: new Date(),
    };
  }

  /**
   * Load user profile
   */
  private async loadUserProfile(): Promise<void> {
    try {
      const profileJson = await AsyncStorage.getItem('timeline_procrastination_profile');
      if (profileJson) {
        this.userProfile = JSON.parse(profileJson);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  /**
   * Save user profile
   */
  private async saveUserProfile(): Promise<void> {
    try {
      if (this.userProfile) {
        await AsyncStorage.setItem(
          'timeline_procrastination_profile',
          JSON.stringify(this.userProfile)
        );
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  /**
   * Save event
   */
  private async saveEvent(event: ProcrastinationEvent): Promise<void> {
    try {
      const eventsJson = await AsyncStorage.getItem('timeline_procrastination_events');
      const events: ProcrastinationEvent[] = eventsJson ? JSON.parse(eventsJson) : [];
      
      // Update existing event or add new
      const index = events.findIndex((e) => e.id === event.id);
      if (index >= 0) {
        events[index] = event;
      } else {
        events.push(event);
      }
      
      await AsyncStorage.setItem('timeline_procrastination_events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving event:', error);
    }
  }

  /**
   * Get current user ID
   */
  private async getUserId(): Promise<string> {
    try {
      const userId = await AsyncStorage.getItem('timeline_user_id');
      return userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Get user profile
   */
  public getUserProfile(): UserProcrastinationProfile | undefined {
    return this.userProfile;
  }

  /**
   * Clear active intervention
   */
  public clearActiveIntervention(): void {
    this.activeIntervention = undefined;
  }
}

// Singleton instance
export const interventionEngine = new InterventionEngine();
