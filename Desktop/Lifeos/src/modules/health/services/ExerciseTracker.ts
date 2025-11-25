/**
 * Exercise Tracker
 * Workouts, steps, streaks, motivational interventions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseEntry, ExerciseStreak, WorkoutType } from '../types/health.types';
import { HEALTH_THRESHOLDS, BARNEY_HEALTH_MESSAGES } from '../constants/health.constants';

export class ExerciseTracker {
  private readonly EXERCISE_KEY = '@health_exercise_entries';
  private readonly STREAK_KEY = '@health_exercise_streak';

  public async logWorkout(
    type: WorkoutType,
    duration: number,
    source: 'wearable' | 'manual' | 'audio',
    intensity?: 'light' | 'moderate' | 'intense',
    steps?: number
  ): Promise<{ entry: ExerciseEntry; streak: ExerciseStreak; message: string }> {
    const userId = await this.getUserId();
    const entry: ExerciseEntry = {
      id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      duration,
      intensity,
      steps,
      timestamp: new Date(),
      source,
    };

    const entries = await this.getAllEntries();
    entries.push(entry);
    await AsyncStorage.setItem(this.EXERCISE_KEY, JSON.stringify(entries));

    const streak = await this.updateStreak();
    const message = this.getMotivationalMessage(streak);

    return { entry, streak, message };
  }

  public async getStreak(): Promise<ExerciseStreak> {
    const data = await AsyncStorage.getItem(this.STREAK_KEY);
    if (!data) {
      const userId = await this.getUserId();
      return {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastWorkout: new Date(),
        missedWorkouts: 0,
        totalWorkouts: 0,
      };
    }
    const streak: ExerciseStreak = JSON.parse(data);
    streak.lastWorkout = new Date(streak.lastWorkout);
    return streak;
  }

  public async checkMissedWorkout(scheduledTime: Date): Promise<{ missed: boolean; message?: string }> {
    const now = new Date();
    const diff = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);

    if (diff >= 15 && diff <= 120) {
      return {
        missed: true,
        message: BARNEY_HEALTH_MESSAGES.workout_skipped[Math.floor(Math.random() * BARNEY_HEALTH_MESSAGES.workout_skipped.length)],
      };
    }

    return { missed: false };
  }

  public async getWeeklyWorkouts(): Promise<number> {
    const entries = await this.getAllEntries();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entries.filter((e) => e.timestamp >= weekAgo).length;
  }

  private async updateStreak(): Promise<ExerciseStreak> {
    const userId = await this.getUserId();
    const entries = await this.getAllEntries();
    const streak = await this.getStreak();

    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayWorkouts = entries.filter((e) => e.timestamp.setHours(0, 0, 0, 0) === today);
    const yesterdayWorkouts = entries.filter((e) => e.timestamp.setHours(0, 0, 0, 0) === yesterday.getTime());

    if (todayWorkouts.length > 0) {
      if (yesterdayWorkouts.length > 0 || streak.currentStreak === 0) {
        streak.currentStreak++;
      }
    }

    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastWorkout = new Date();
    streak.totalWorkouts = entries.length;

    await AsyncStorage.setItem(this.STREAK_KEY, JSON.stringify(streak));
    return streak;
  }

  private getMotivationalMessage(streak: ExerciseStreak): string {
    if (streak.currentStreak >= 7) {
      return BARNEY_HEALTH_MESSAGES.streak_milestone[Math.floor(Math.random() * BARNEY_HEALTH_MESSAGES.streak_milestone.length)];
    }
    return BARNEY_HEALTH_MESSAGES.workout_complete[Math.floor(Math.random() * BARNEY_HEALTH_MESSAGES.workout_complete.length)];
  }

  private async getAllEntries(): Promise<ExerciseEntry[]> {
    const data = await AsyncStorage.getItem(this.EXERCISE_KEY);
    if (!data) return [];
    const entries: ExerciseEntry[] = JSON.parse(data);
    return entries.map((e) => ({ ...e, timestamp: new Date(e.timestamp) }));
  }

  private async getUserId(): Promise<string> {
    const userId = await AsyncStorage.getItem('@user_id');
    return userId || 'default_user';
  }
}
