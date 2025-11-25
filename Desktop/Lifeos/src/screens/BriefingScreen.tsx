/**
 * Briefing Screen
 * Daily bedtime briefing viewer with swipeable sections
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useDailyBriefing } from '../hooks/useDailyBriefing';

export function BriefingScreen() {
  const { loading, briefing, generateNewBriefing, markAsRead } = useDailyBriefing();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Generating your briefing...</Text>
      </View>
    );
  }

  if (!briefing) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>📊 Daily Briefing</Text>
          <Text style={styles.emptyText}>Your personalized bedtime briefing will appear here</Text>
          <TouchableOpacity style={styles.generateButton} onPress={generateNewBriefing}>
            <Text style={styles.generateButtonText}>Generate Today's Briefing</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { sections } = briefing;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Briefing</Text>
        <Text style={styles.date}>{briefing.date.toLocaleDateString()}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Today's Summary</Text>
          <View style={styles.card}>
            <Text style={styles.summaryLine}>🎯 Mood: {sections.summary.mood.average}/10 ({sections.summary.mood.trend})</Text>
            <Text style={styles.summaryLine}>💪 Movement: {sections.summary.movement.steps} steps, {sections.summary.movement.workouts} workout(s)</Text>
            <Text style={styles.summaryLine}>😴 Sleep: {sections.summary.sleep.duration.toFixed(1)} hrs (quality: {sections.summary.sleep.quality}/10)</Text>
            <Text style={styles.summaryLine}>🍽️ Meals: {sections.summary.meals.logged} logged</Text>
            <Text style={styles.summaryLine}>✅ Tasks: {sections.summary.tasks.completed} completed, {sections.summary.tasks.procrastinated} procrastinated</Text>
          </View>
        </View>

        {sections.highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎉 Today's Wins</Text>
            <View style={styles.card}>
              {sections.highlights.map((highlight, idx) => (
                <Text key={idx} style={styles.highlightText}>
                  {highlight.emoji} {highlight.text}
                </Text>
              ))}
            </View>
          </View>
        )}

        {sections.patterns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Weekly Trends</Text>
            <View style={styles.card}>
              {sections.patterns.map((pattern, idx) => (
                <View key={idx} style={styles.patternItem}>
                  <Text style={styles.patternTitle}>{pattern.title}</Text>
                  <Text style={styles.patternDesc}>{pattern.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 Tomorrow Preview</Text>
          <View style={styles.card}>
            <Text style={styles.forecastEnergy}>
              Energy Prediction: {sections.forecast.energyPrediction}/10
            </Text>
            <Text style={styles.subheading}>Schedule:</Text>
            {sections.forecast.schedule.map((item, idx) => (
              <Text key={idx} style={styles.scheduleItem}>
                {item.time} - {item.event}
                {item.notes && <Text style={styles.scheduleNotes}> ({item.notes})</Text>}
              </Text>
            ))}
            <Text style={styles.subheading}>Top 3 Priorities:</Text>
            {sections.forecast.priorities.map((priority, idx) => (
              <Text key={idx} style={styles.priorityItem}>
                {idx + 1}. {priority}
              </Text>
            ))}
          </View>
        </View>

        {sections.pastAdvice.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💭 Advice from Past You</Text>
            <View style={styles.card}>
              {sections.pastAdvice.map((advice, idx) => (
                <View key={idx} style={styles.adviceItem}>
                  <Text style={styles.adviceSituation}>{advice.situation}</Text>
                  <Text style={styles.adviceText}>"{advice.advice}"</Text>
                  {advice.outcome && (
                    <Text style={styles.adviceOutcome}>Outcome: {advice.outcome}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌙 Tonight's Routine</Text>
          <View style={styles.card}>
            <Text style={styles.routineItem}>⏰ {sections.routine.windDownTime} - Start winding down</Text>
            <Text style={styles.routineItem}>📵 {sections.routine.screenOffTime} - No screens (read 20min)</Text>
            <Text style={styles.routineItem}>🛏️ {sections.routine.lightsOutTime} - Lights out</Text>
            <Text style={styles.routineGoal}>🎯 Sleep goal: {sections.routine.sleepGoal} hours</Text>
            <Text style={styles.routineWake}>⏰ Wake: {sections.routine.wakeTime}</Text>
            <Text style={styles.routinePrediction}>
              Predicted energy tomorrow: {sections.routine.predictedEnergy}/10
            </Text>
          </View>
        </View>

        {!briefing.read && (
          <TouchableOpacity style={styles.markReadButton} onPress={markAsRead}>
            <Text style={styles.markReadText}>Mark as Read</Text>
          </TouchableOpacity>
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
  date: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  summaryLine: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 8,
  },
  patternItem: {
    marginBottom: 12,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  patternDesc: {
    fontSize: 14,
    color: '#616161',
    marginTop: 4,
  },
  forecastEnergy: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginTop: 12,
    marginBottom: 8,
  },
  scheduleItem: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 6,
  },
  scheduleNotes: {
    color: '#757575',
    fontSize: 12,
  },
  priorityItem: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 6,
  },
  adviceItem: {
    marginBottom: 16,
  },
  adviceSituation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 14,
    color: '#616161',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  adviceOutcome: {
    fontSize: 12,
    color: '#4CAF50',
  },
  routineItem: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 8,
  },
  routineGoal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 12,
  },
  routineWake: {
    fontSize: 14,
    color: '#616161',
    marginTop: 4,
  },
  routinePrediction: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
  },
  markReadButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  markReadText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 32,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
    marginTop: 100,
  },
});
