/**
 * Health Screen
 * Main health dashboard with mood, food, sleep, exercise tracking
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useHealthMonitoring } from '../hooks/useHealthMonitoring';
import { MoodLevel, WorkoutType, MealType, SleepQuality } from '../modules/health/types/health.types';
import { MOOD_EMOJIS, WORKOUT_EMOJIS } from '../modules/health/constants/health.constants';

export function HealthScreen() {
  const {
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
    refresh,
  } = useHealthMonitoring();

  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);

  const handleMoodSelect = async (mood: MoodLevel) => {
    setSelectedMood(mood);
    await logMood(mood, MOOD_EMOJIS[mood]);
  };

  const handleQuickWorkout = async (type: WorkoutType) => {
    const message = await logWorkout(type, 30);
    alert(message);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Alerts</Text>
            {alerts.map((alert) => (
              <View key={alert.id} style={[styles.alertCard, { borderLeftColor: alert.severity === 'critical' ? '#F44336' : '#FF9800' }]}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                {alert.signals.map((signal, idx) => (
                  <Text key={idx} style={styles.alertSignal}>• {signal}</Text>
                ))}
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={() => acknowledgeAlert(alert.id)}
                >
                  <Text style={styles.alertButtonText}>Got it</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>😊 How are you feeling?</Text>
          <View style={styles.moodGrid}>
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as MoodLevel[]).map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[styles.moodButton, selectedMood === mood && styles.moodButtonSelected]}
                onPress={() => handleMoodSelect(mood)}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood]}</Text>
                <Text style={styles.moodNumber}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💪 Exercise Streak</Text>
          <View style={styles.streakCard}>
            <Text style={styles.streakNumber}>{exerciseStreak.currentStreak}</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakRecord}>Record: {exerciseStreak.longestStreak} days</Text>
          </View>
          <View style={styles.workoutGrid}>
            {(['cardio', 'strength', 'yoga', 'walking'] as WorkoutType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.workoutButton}
                onPress={() => handleQuickWorkout(type)}
              >
                <Text style={styles.workoutEmoji}>{WORKOUT_EMOJIS[type]}</Text>
                <Text style={styles.workoutLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>😴 Recent Sleep</Text>
          {recentSleep.length === 0 ? (
            <Text style={styles.emptyText}>No sleep data yet</Text>
          ) : (
            recentSleep.slice(0, 3).map((sleep) => (
              <View key={sleep.id} style={styles.sleepCard}>
                <Text style={styles.sleepDuration}>{sleep.duration.toFixed(1)} hrs</Text>
                <Text style={styles.sleepQuality}>Quality: {sleep.quality}/10</Text>
                <Text style={styles.sleepDate}>{sleep.wakeTime.toLocaleDateString()}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Recent Meals</Text>
          {recentMeals.length === 0 ? (
            <Text style={styles.emptyText}>No meals logged yet</Text>
          ) : (
            recentMeals.slice(0, 3).map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <Text style={styles.mealType}>{meal.mealType}</Text>
                <Text style={styles.mealFoods}>{meal.foods.join(', ')}</Text>
                {meal.energyAfter && (
                  <Text style={styles.mealEnergy}>Energy: {meal.energyAfter}</Text>
                )}
              </View>
            ))
          )}
        </View>

        {correlations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Insights</Text>
            {correlations.map((corr) => (
              <View key={corr.id} style={styles.correlationCard}>
                <Text style={styles.correlationDesc}>{corr.description}</Text>
                <Text style={styles.correlationConfidence}>
                  Confidence: {Math.round(corr.confidence * 100)}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 16,
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
  },
  alertSignal: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 8,
    marginBottom: 4,
  },
  alertButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  moodButton: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodNumber: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  streakLabel: {
    fontSize: 16,
    color: '#616161',
    marginTop: 8,
  },
  streakRecord: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  workoutButton: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  workoutEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  workoutLabel: {
    fontSize: 12,
    color: '#616161',
    textTransform: 'capitalize',
  },
  sleepCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sleepDuration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  sleepQuality: {
    fontSize: 14,
    color: '#616161',
    marginTop: 4,
  },
  sleepDate: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    textTransform: 'capitalize',
  },
  mealFoods: {
    fontSize: 14,
    color: '#616161',
    marginTop: 4,
  },
  mealEnergy: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  correlationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  correlationDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  correlationConfidence: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 14,
    marginTop: 16,
  },
});
