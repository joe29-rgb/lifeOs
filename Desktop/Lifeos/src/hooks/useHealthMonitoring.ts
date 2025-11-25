/**
 * Health Monitoring Hook
 * Manages health data state and interactions
 */

import { useState, useEffect } from 'react';
import { MoodEntry, MoodLevel, FoodEntry, MealType, EnergyLevel, SleepEntry, SleepQuality, ExerciseEntry, WorkoutType, MentalHealthAlert, HealthCorrelation } from '../modules/health/types/health.types';
import { MentalHealthMonitor } from '../modules/health/services/MentalHealthMonitor';
import { FoodLogger } from '../modules/health/services/FoodLogger';
import { SleepAnalyzer } from '../modules/health/services/SleepAnalyzer';
import { ExerciseTracker } from '../modules/health/services/ExerciseTracker';
import { HealthCorrelator } from '../modules/health/services/HealthCorrelator';

const mentalHealth = new MentalHealthMonitor();
const foodLogger = new FoodLogger();
const sleepAnalyzer = new SleepAnalyzer();
const exerciseTracker = new ExerciseTracker();
const healthCorrelator = new HealthCorrelator();

export function useHealthMonitoring() {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<MentalHealthAlert[]>([]);
  const [correlations, setCorrelations] = useState<HealthCorrelation[]>([]);
  const [recentMeals, setRecentMeals] = useState<FoodEntry[]>([]);
  const [recentSleep, setRecentSleep] = useState<SleepEntry[]>([]);
  const [exerciseStreak, setExerciseStreak] = useState({ currentStreak: 0, longestStreak: 0 });

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const [alertsData, correlationsData, meals, sleep, streak] = await Promise.all([
        mentalHealth.getActiveAlerts(),
        healthCorrelator.getCorrelations(),
        foodLogger.getRecentMeals(7),
        sleepAnalyzer.getRecentSleep(7),
        exerciseTracker.getStreak(),
      ]);

      setAlerts(alertsData);
      setCorrelations(correlationsData);
      setRecentMeals(meals);
      setRecentSleep(sleep);
      setExerciseStreak(streak);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logMood = async (mood: MoodLevel, emoji: string, notes?: string) => {
    try {
      await mentalHealth.logMood(mood, emoji, notes);
      await loadHealthData();
    } catch (error) {
      console.error('Error logging mood:', error);
    }
  };

  const logFood = async (foods: string[], mealType: MealType, source: 'voice' | 'photo' | 'manual') => {
    try {
      await foodLogger.logFood(foods, mealType, source);
      const meals = await foodLogger.getRecentMeals(7);
      setRecentMeals(meals);
    } catch (error) {
      console.error('Error logging food:', error);
    }
  };

  const logSleep = async (bedtime: Date, wakeTime: Date, quality: SleepQuality) => {
    try {
      await sleepAnalyzer.logSleep(bedtime, wakeTime, quality, 'manual');
      const sleep = await sleepAnalyzer.getRecentSleep(7);
      setRecentSleep(sleep);
    } catch (error) {
      console.error('Error logging sleep:', error);
    }
  };

  const logWorkout = async (type: WorkoutType, duration: number) => {
    try {
      const result = await exerciseTracker.logWorkout(type, duration, 'manual');
      setExerciseStreak(result.streak);
      return result.message;
    } catch (error) {
      console.error('Error logging workout:', error);
      return '';
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await mentalHealth.acknowledgeAlert(alertId);
      const alertsData = await mentalHealth.getActiveAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const analyzeCorrelations = async () => {
    try {
      const correlationsData = await healthCorrelator.analyzeCorrelations();
      setCorrelations(correlationsData);
    } catch (error) {
      console.error('Error analyzing correlations:', error);
    }
  };

  return {
    loading,
    alerts,
    correlations,
    recentMeals,
    recentSleep,
    exerciseStreak,
    logMood,
    logFood,
    logSleep,
    logWorkout,
    acknowledgeAlert,
    analyzeCorrelations,
    refresh: loadHealthData,
  };
}
