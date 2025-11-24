/**
 * Pomodoro Timer
 * Mobile-optimized with Android notifications, haptics, and rewards
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PomodoroConfig,
  FocusModeStatus,
  FocusSession,
} from '../types/procrastination.types';
import {
  DEFAULT_POMODORO_CONFIG,
  FOCUS_MODE_CHANNEL_ID,
  FOCUS_MODE_NOTIFICATION_ID,
} from '../constants/procrastination.constants';

export class PomodoroTimer {
  private config: PomodoroConfig = DEFAULT_POMODORO_CONFIG;
  private status: FocusModeStatus = 'inactive';
  private currentSession?: FocusSession;
  private timer?: NodeJS.Timeout;
  private remainingSeconds: number = 0;
  private pomodoroCount: number = 0;
  private callbacks: {
    onTick?: (seconds: number) => void;
    onComplete?: () => void;
    onBreakStart?: () => void;
    onWorkStart?: () => void;
  } = {};

  constructor() {
    this.loadConfig();
    this.setupNotifications();
  }

  /**
   * Load saved configuration
   */
  private async loadConfig(): Promise<void> {
    try {
      const configJson = await AsyncStorage.getItem('timeline_pomodoro_config');
      if (configJson) {
        this.config = { ...DEFAULT_POMODORO_CONFIG, ...JSON.parse(configJson) };
      }
    } catch (error) {
      console.error('Error loading Pomodoro config:', error);
    }
  }

  /**
   * Save configuration
   */
  public async saveConfig(config: Partial<PomodoroConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    try {
      await AsyncStorage.setItem('timeline_pomodoro_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving Pomodoro config:', error);
    }
  }

  /**
   * Setup notification channels (Android)
   */
  private async setupNotifications(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(FOCUS_MODE_CHANNEL_ID, {
        name: 'Focus Mode',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }

    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  /**
   * Start work session
   */
  public async startWork(taskId?: string): Promise<void> {
    if (this.status !== 'inactive') {
      await this.stop();
    }

    this.status = 'active';
    this.remainingSeconds = this.config.workMinutes * 60;
    this.pomodoroCount += 1;

    // Create session
    this.currentSession = {
      id: `session_${Date.now()}`,
      userId: await this.getUserId(),
      taskId,
      startedAt: new Date(),
      targetMinutes: this.config.workMinutes,
      completed: false,
      distractionsBlocked: 0,
      pomodoroCount: this.pomodoroCount,
    };

    // Start timer
    this.startTimer();

    // Trigger haptic
    if (this.config.hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Show notification
    if (this.config.notificationEnabled) {
      await this.showNotification(
        'Focus Mode Started',
        `${this.config.workMinutes} minutes of legendary productivity!`,
        true
      );
    }

    // Callback
    this.callbacks.onWorkStart?.();
  }

  /**
   * Start break
   */
  public async startBreak(): Promise<void> {
    const isLongBreak = this.pomodoroCount % this.config.sessionsUntilLongBreak === 0;
    const breakMinutes = isLongBreak ? this.config.longBreakMinutes : this.config.breakMinutes;

    this.status = 'break';
    this.remainingSeconds = breakMinutes * 60;

    // Start timer
    this.startTimer();

    // Trigger haptic
    if (this.config.hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Show notification
    if (this.config.notificationEnabled) {
      await this.showNotification(
        isLongBreak ? 'Long Break Time!' : 'Break Time!',
        `Take ${breakMinutes} minutes to recharge. You've earned it!`,
        false
      );
    }

    // Callback
    this.callbacks.onBreakStart?.();
  }

  /**
   * Stop timer
   */
  public async stop(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    // Complete session if in work mode
    if (this.status === 'active' && this.currentSession) {
      this.currentSession.endedAt = new Date();
      this.currentSession.actualMinutes = Math.floor(
        (this.currentSession.endedAt.getTime() - this.currentSession.startedAt.getTime()) / 60000
      );
      this.currentSession.completed = this.remainingSeconds === 0;

      await this.saveSession(this.currentSession);
    }

    this.status = 'inactive';
    this.remainingSeconds = 0;

    // Cancel notification
    await Notifications.dismissNotificationAsync(FOCUS_MODE_NOTIFICATION_ID);
  }

  /**
   * Pause timer
   */
  public pause(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /**
   * Resume timer
   */
  public resume(): void {
    if (this.status !== 'inactive' && !this.timer) {
      this.startTimer();
    }
  }

  /**
   * Start internal timer
   */
  private startTimer(): void {
    this.timer = setInterval(() => {
      this.remainingSeconds -= 1;

      // Callback
      this.callbacks.onTick?.(this.remainingSeconds);

      // Update notification
      if (this.config.notificationEnabled && this.remainingSeconds % 60 === 0) {
        const minutes = Math.floor(this.remainingSeconds / 60);
        this.updateNotification(`${minutes} minutes remaining`);
      }

      // Timer complete
      if (this.remainingSeconds <= 0) {
        this.onTimerComplete();
      }
    }, 1000);
  }

  /**
   * Handle timer completion
   */
  private async onTimerComplete(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    // Trigger haptic
    if (this.config.hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (this.status === 'active') {
      // Work session complete
      if (this.currentSession) {
        this.currentSession.completed = true;
        this.currentSession.endedAt = new Date();
        this.currentSession.actualMinutes = this.config.workMinutes;
        await this.saveSession(this.currentSession);
      }

      // Callback
      this.callbacks.onComplete?.();

      // Auto-start break
      if (this.config.autoStartBreaks) {
        await this.startBreak();
      } else {
        this.status = 'inactive';
        await this.showNotification(
          'Pomodoro Complete! 🎉',
          'Great work! Ready for a break?',
          false
        );
      }
    } else if (this.status === 'break') {
      // Break complete
      if (this.config.autoStartWork) {
        await this.startWork(this.currentSession?.taskId);
      } else {
        this.status = 'inactive';
        await this.showNotification(
          'Break Over!',
          'Ready to get back to legendary productivity?',
          false
        );
      }
    }
  }

  /**
   * Show notification
   */
  private async showNotification(
    title: string,
    body: string,
    ongoing: boolean
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: FOCUS_MODE_NOTIFICATION_ID.toString(),
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          sticky: ongoing,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Update notification
   */
  private async updateNotification(body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: FOCUS_MODE_NOTIFICATION_ID.toString(),
        content: {
          title: this.status === 'active' ? 'Focus Mode' : 'Break Time',
          body,
          sound: false,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          sticky: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  }

  /**
   * Register callbacks
   */
  public onTick(callback: (seconds: number) => void): void {
    this.callbacks.onTick = callback;
  }

  public onComplete(callback: () => void): void {
    this.callbacks.onComplete = callback;
  }

  public onBreakStart(callback: () => void): void {
    this.callbacks.onBreakStart = callback;
  }

  public onWorkStart(callback: () => void): void {
    this.callbacks.onWorkStart = callback;
  }

  /**
   * Get current status
   */
  public getStatus(): FocusModeStatus {
    return this.status;
  }

  /**
   * Get remaining time
   */
  public getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  /**
   * Get pomodoro count
   */
  public getPomodoroCount(): number {
    return this.pomodoroCount;
  }

  /**
   * Get configuration
   */
  public getConfig(): PomodoroConfig {
    return { ...this.config };
  }

  /**
   * Save session
   */
  private async saveSession(session: FocusSession): Promise<void> {
    try {
      const sessionsJson = await AsyncStorage.getItem('timeline_focus_sessions');
      const sessions: FocusSession[] = sessionsJson ? JSON.parse(sessionsJson) : [];
      
      sessions.push(session);
      
      // Keep only last 100 sessions
      if (sessions.length > 100) {
        sessions.splice(0, sessions.length - 100);
      }
      
      await AsyncStorage.setItem('timeline_focus_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving focus session:', error);
    }
  }

  /**
   * Get user ID
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
   * Reset pomodoro count
   */
  public resetCount(): void {
    this.pomodoroCount = 0;
  }
}

// Singleton instance
export const pomodoroTimer = new PomodoroTimer();
