/**
 * Procrastination Detector
 * Multi-modal detection system: voice, device activity, biometrics, patterns
 */

import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ProcrastinationTrigger,
  ProcrastinationEvent,
  Task,
  BiometricData,
  ProcrastinationPattern,
} from '../types/procrastination.types';
import {
  IDLE_TIME_THRESHOLD_MINUTES,
  PROCRASTINATION_PHRASES,
  DISTRACTION_APPS,
  PATTERN_MATCH_CONFIDENCE_THRESHOLD,
  LOW_ENERGY_HRV_THRESHOLD,
  MOVEMENT_INACTIVITY_THRESHOLD_MINUTES,
} from '../constants/procrastination.constants';

export class ProcrastinationDetector {
  private lastActivityTime: Date = new Date();
  private currentAppState: AppStateStatus = 'active';
  private detectionCallbacks: Array<(event: ProcrastinationEvent) => void> = [];
  private idleCheckInterval?: NodeJS.Timeout;
  private patterns: ProcrastinationPattern[] = [];

  constructor() {
    this.initializeDetection();
  }

  /**
   * Initialize detection systems
   */
  private async initializeDetection(): Promise<void> {
    // Load historical patterns
    await this.loadPatterns();

    // Monitor app state changes
    AppState.addEventListener('change', this.handleAppStateChange);

    // Start idle time monitoring
    this.startIdleMonitoring();
  }

  /**
   * Register callback for procrastination detection
   */
  public onDetection(callback: (event: ProcrastinationEvent) => void): void {
    this.detectionCallbacks.push(callback);
  }

  /**
   * Remove detection callback
   */
  public offDetection(callback: (event: ProcrastinationEvent) => void): void {
    this.detectionCallbacks = this.detectionCallbacks.filter((cb) => cb !== callback);
  }

  /**
   * Voice detection - analyzes transcript for procrastination phrases
   */
  public async detectFromVoice(transcript: string): Promise<boolean> {
    const lowerTranscript = transcript.toLowerCase();
    
    for (const phrase of PROCRASTINATION_PHRASES) {
      if (lowerTranscript.includes(phrase)) {
        await this.triggerDetection('voice_detection', {
          voicePhrase: phrase,
        });
        return true;
      }
    }
    
    return false;
  }

  /**
   * Device activity detection - monitors idle time and app usage
   */
  private startIdleMonitoring(): void {
    this.idleCheckInterval = setInterval(() => {
      this.checkIdleTime();
    }, 60000); // Check every minute
  }

  private async checkIdleTime(): Promise<void> {
    const now = new Date();
    const idleMinutes = (now.getTime() - this.lastActivityTime.getTime()) / 60000;

    if (idleMinutes >= IDLE_TIME_THRESHOLD_MINUTES) {
      // Check if there's an overdue task
      const hasOverdueTask = await this.hasOverdueTasks();
      
      if (hasOverdueTask) {
        await this.triggerDetection('idle_time', {
          idleMinutes: Math.floor(idleMinutes),
        });
      }
    }
  }

  /**
   * Distraction app detection
   */
  public async detectDistractionApp(packageName: string, usageMinutes: number): Promise<boolean> {
    const isDistraction = this.isDistractionApp(packageName);
    
    if (isDistraction && usageMinutes > 10) {
      const hasOverdueTask = await this.hasOverdueTasks();
      
      if (hasOverdueTask) {
        await this.triggerDetection('distraction_app', {
          distractionApp: packageName,
          idleMinutes: usageMinutes,
        });
        return true;
      }
    }
    
    return false;
  }

  private isDistractionApp(packageName: string): boolean {
    return Object.values(DISTRACTION_APPS)
      .flat()
      .includes(packageName);
  }

  /**
   * Biometric detection - low energy signals
   */
  public async detectFromBiometrics(data: BiometricData): Promise<boolean> {
    let triggered = false;

    // Low HRV indicates stress or low energy
    if (data.heartRateVariability && data.heartRateVariability < LOW_ENERGY_HRV_THRESHOLD) {
      triggered = true;
    }

    // Extended inactivity
    if (data.movementMinutes !== undefined && data.movementMinutes < 5) {
      const lastActivity = data.lastActivityTime || new Date();
      const inactiveMinutes = (new Date().getTime() - lastActivity.getTime()) / 60000;
      
      if (inactiveMinutes > MOVEMENT_INACTIVITY_THRESHOLD_MINUTES) {
        triggered = true;
      }
    }

    if (triggered) {
      const hasOverdueTask = await this.hasOverdueTasks();
      
      if (hasOverdueTask) {
        await this.triggerDetection('biometric_low_energy', {
          biometricData: data,
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Pattern-based detection - learns from historical data
   */
  public async detectFromPatterns(): Promise<boolean> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Find matching patterns
    const matchingPatterns = this.patterns.filter((pattern) => {
      const hourMatch = Math.abs(pattern.timeOfDay - currentHour) <= 1;
      const dayMatch = pattern.dayOfWeek === currentDay;
      const frequencyThreshold = pattern.frequency >= 3; // At least 3 occurrences
      
      return hourMatch && dayMatch && frequencyThreshold;
    });

    if (matchingPatterns.length > 0) {
      const confidence = matchingPatterns.reduce((sum, p) => sum + p.frequency, 0) / 
                        (matchingPatterns.length * 10); // Normalize

      if (confidence >= PATTERN_MATCH_CONFIDENCE_THRESHOLD) {
        const hasOverdueTask = await this.hasOverdueTasks();
        
        if (hasOverdueTask) {
          await this.triggerDetection('pattern_match', {});
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Manual trigger (user-initiated or scheduled check)
   */
  public async triggerManualCheck(): Promise<void> {
    const hasOverdueTask = await this.hasOverdueTasks();
    
    if (hasOverdueTask) {
      await this.triggerDetection('manual', {});
    }
  }

  /**
   * Check if user has overdue tasks
   */
  private async hasOverdueTasks(): Promise<boolean> {
    try {
      const tasksJson = await AsyncStorage.getItem('timeline_tasks');
      if (!tasksJson) return false;

      const tasks: Task[] = JSON.parse(tasksJson);
      const now = new Date();

      return tasks.some((task) => {
        return (
          task.status === 'pending' &&
          task.dueDate &&
          new Date(task.dueDate) < now
        );
      });
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
      return false;
    }
  }

  /**
   * Trigger procrastination detection event
   */
  private async triggerDetection(
    trigger: ProcrastinationTrigger,
    metadata: Record<string, any>
  ): Promise<void> {
    const event: ProcrastinationEvent = {
      id: `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: await this.getUserId(),
      trigger,
      detectedAt: new Date(),
      interventionLevel: 'gentle', // Will be determined by InterventionEngine
      interventionMessage: '',
      wasSuccessful: false,
      metadata,
    };

    // Save event
    await this.saveEvent(event);

    // Update patterns
    await this.updatePatterns(trigger);

    // Notify callbacks
    this.detectionCallbacks.forEach((callback) => callback(event));
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active') {
      this.lastActivityTime = new Date();
    }
    this.currentAppState = nextAppState;
  };

  /**
   * Update user activity timestamp
   */
  public updateActivity(): void {
    this.lastActivityTime = new Date();
  }

  /**
   * Load historical patterns
   */
  private async loadPatterns(): Promise<void> {
    try {
      const patternsJson = await AsyncStorage.getItem('timeline_procrastination_patterns');
      if (patternsJson) {
        this.patterns = JSON.parse(patternsJson);
      }
    } catch (error) {
      console.error('Error loading patterns:', error);
    }
  }

  /**
   * Update patterns based on new detection
   */
  private async updatePatterns(trigger: ProcrastinationTrigger): Promise<void> {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Find existing pattern
    const existingPattern = this.patterns.find(
      (p) => p.triggerType === trigger && p.timeOfDay === hour && p.dayOfWeek === day
    );

    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.updatedAt = now;
    } else {
      const newPattern: ProcrastinationPattern = {
        id: `pattern_${Date.now()}`,
        userId: await this.getUserId(),
        triggerType: trigger,
        timeOfDay: hour,
        dayOfWeek: day,
        frequency: 1,
        createdAt: now,
        updatedAt: now,
      };
      this.patterns.push(newPattern);
    }

    // Save patterns
    await AsyncStorage.setItem('timeline_procrastination_patterns', JSON.stringify(this.patterns));
  }

  /**
   * Save procrastination event
   */
  private async saveEvent(event: ProcrastinationEvent): Promise<void> {
    try {
      const eventsJson = await AsyncStorage.getItem('timeline_procrastination_events');
      const events: ProcrastinationEvent[] = eventsJson ? JSON.parse(eventsJson) : [];
      
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      await AsyncStorage.setItem('timeline_procrastination_events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving procrastination event:', error);
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
   * Cleanup
   */
  public destroy(): void {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.detectionCallbacks = [];
  }
}

// Singleton instance
export const procrastinationDetector = new ProcrastinationDetector();
