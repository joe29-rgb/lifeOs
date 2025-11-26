/**
 * Focus Screen
 * Procrastination hub with Pomodoro timer
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export function FocusScreen() {
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimerActive(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Focus Mode</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.timerSection}>
          {timerActive ? (
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>Focus Session</Text>
              <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
              <View style={styles.timerButtons}>
                <TouchableOpacity style={styles.timerButton} onPress={() => setTimerActive(false)}>
                  <Text style={styles.timerButtonText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.timerButton, styles.endButton]} onPress={() => {
                  setTimerActive(false);
                  setTimeRemaining(25 * 60);
                }}>
                  <Text style={styles.timerButtonText}>End</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={startTimer}>
              <Text style={styles.startButtonText}>Start 25-Min Focus Session</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Today&apos;s Tasks</Text>
          <View style={styles.taskCard}>
            <Text style={styles.taskCompleted}>✅ Morning standup</Text>
          </View>
          <View style={styles.taskCard}>
            <Text style={styles.taskCompleted}>✅ Code review</Text>
          </View>
          <View style={styles.taskCard}>
            <Text style={styles.taskPending}>⏳ Presentation slides (avoiding 3 days) ⚠️</Text>
          </View>
          <View style={styles.taskCard}>
            <Text style={styles.taskPending}>⏳ Email client</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Procrastination Alerts</Text>
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>You&apos;ve avoided &quot;Presentation slides&quot; for 3 days</Text>
            <Text style={styles.alertText}>Pattern: You always feel better after starting</Text>
            <Text style={styles.alertText}>Success rate after intervention: 85%</Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity style={styles.alertButton}>
                <Text style={styles.alertButtonText}>Suit Up - Start Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.alertButton, styles.secondaryButton]}>
                <Text style={styles.alertButtonText}>Break It Down</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 This Week</Text>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Focus Sessions:</Text>
              <Text style={styles.statValue}>12 completed</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tasks:</Text>
              <Text style={styles.statValue}>34 done, 3 avoided</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Streak:</Text>
              <Text style={styles.statValue}>5 days</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Procrastination:</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>↓ 40% (great!)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  scrollView: { flex: 1 },
  timerSection: { padding: 16, marginTop: 16 },
  timerCard: { backgroundColor: '#FFFFFF', padding: 32, borderRadius: 12, alignItems: 'center' },
  timerLabel: { fontSize: 16, color: '#757575', marginBottom: 16 },
  timerValue: { fontSize: 64, fontWeight: 'bold', color: '#FF9800', marginBottom: 24 },
  timerButtons: { flexDirection: 'row' },
  timerButton: { backgroundColor: '#2196F3', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginHorizontal: 8 },
  endButton: { backgroundColor: '#F44336' },
  timerButtonText: { color: '#FFFFFF', fontWeight: '600' },
  startButton: { backgroundColor: '#4CAF50', padding: 24, borderRadius: 12, alignItems: 'center' },
  startButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  taskCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 8, marginBottom: 8 },
  taskCompleted: { fontSize: 16, color: '#757575', textDecorationLine: 'line-through' },
  taskPending: { fontSize: 16, color: '#212121' },
  alertCard: { backgroundColor: '#FFF3E0', marginHorizontal: 16, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  alertTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  alertText: { fontSize: 14, color: '#616161', marginBottom: 4 },
  alertButtons: { flexDirection: 'row', marginTop: 12 },
  alertButton: { flex: 1, backgroundColor: '#FF9800', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  secondaryButton: { backgroundColor: '#2196F3' },
  alertButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  statsCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statLabel: { fontSize: 14, color: '#757575' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#212121' },
});
