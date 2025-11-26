/**
 * Energy Optimization Screen
 * Daily energy chart and task scheduler
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { EnergyPatternAnalyzer } from '../modules/energyOptimization/services/EnergyPatternAnalyzer';
import { TaskScheduleOptimizer } from '../modules/energyOptimization/services/TaskScheduleOptimizer';
import { EnergyPattern, DailyEnergyProfile, TaskOptimization } from '../modules/energyOptimization/types/energyOptimization.types';

const energyAnalyzer = new EnergyPatternAnalyzer();
const taskOptimizer = new TaskScheduleOptimizer();

export function EnergyOptimizationScreen() {
  const [patterns, setPatterns] = useState<EnergyPattern[]>([]);
  const [profile, setProfile] = useState<DailyEnergyProfile | null>(null);
  const [optimizations, setOptimizations] = useState<TaskOptimization[]>([]);
  const [currentEnergy, setCurrentEnergy] = useState(5);

  useEffect(() => {
    loadEnergyData();
  }, []);

  const loadEnergyData = async () => {
    const energyPatterns = await energyAnalyzer.analyzeEnergyPattern();
    setPatterns(energyPatterns);

    const energyProfile = await energyAnalyzer.getDailyEnergyProfile();
    setProfile(energyProfile);

    const current = await energyAnalyzer.getCurrentEnergy();
    setCurrentEnergy(current);

    const sampleTasks = [
      { id: '1', name: 'Finish presentation', duration: 180, priority: 'urgent' as const, currentSchedule: new Date(Date.now() + 86400000 + 14 * 3600000) },
      { id: '2', name: 'Client call', duration: 30, priority: 'high' as const, currentSchedule: new Date(Date.now() + 86400000 + 15 * 3600000) },
      { id: '3', name: 'Email responses', duration: 60, priority: 'medium' as const },
    ];

    const opts = await taskOptimizer.optimizeMultipleTasks(sampleTasks);
    setOptimizations(opts);
  };

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'peak': return '#10B981';
      case 'high': return '#8BC34A';
      case 'medium': return '#FFC107';
      case 'low': return '#FF9800';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Energy Optimization</Text>
        <Text style={styles.subtitle}>Schedule tasks at peak times</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.currentCard}>
          <Text style={styles.currentTitle}>Current Energy</Text>
          <Text style={styles.currentValue}>{currentEnergy.toFixed(1)}/10</Text>
          <View style={styles.currentMeter}>
            <View style={[styles.currentFill, { width: `${(currentEnergy / 10) * 100}%`, backgroundColor: getEnergyColor(currentEnergy >= 8 ? 'peak' : currentEnergy >= 7 ? 'high' : currentEnergy >= 5.5 ? 'medium' : 'low') }]} />
          </View>
        </View>

        {profile && (
          <View style={styles.profileCard}>
            <Text style={styles.profileTitle}>⚡ Your Daily Energy Pattern</Text>
            <View style={styles.profileSection}>
              <Text style={styles.profileLabel}>Peak Hours:</Text>
              <Text style={styles.profileValue}>
                {profile.peakHours.map((h) => `${h}:00`).join(', ') || 'None detected'}
              </Text>
              <Text style={styles.profileNote}>Energy: 8.5/10 - Best for hard/creative tasks</Text>
            </View>
            <View style={styles.profileSection}>
              <Text style={styles.profileLabel}>High Hours:</Text>
              <Text style={styles.profileValue}>
                {profile.highHours.map((h) => `${h}:00`).join(', ') || 'None detected'}
              </Text>
              <Text style={styles.profileNote}>Energy: 7/10 - Good for meetings, exercise</Text>
            </View>
            <View style={styles.profileSection}>
              <Text style={styles.profileLabel}>Pattern:</Text>
              <Text style={styles.profileValue}>
                {profile.pattern === 'morning_person' ? 'Morning person' : profile.pattern === 'night_owl' ? 'Night owl' : 'Balanced'}
                {profile.afternoonSlump && ' + Afternoon dip'}
                {profile.secondWind && ' + Second wind'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 24-Hour Energy Chart</Text>
          <View style={styles.chart}>
            {patterns.map((pattern) => (
              <View key={pattern.hour} style={styles.chartBar}>
                <View style={[styles.chartBarFill, { height: `${(pattern.averageEnergy / 10) * 100}%`, backgroundColor: getEnergyColor(pattern.level) }]} />
                <Text style={styles.chartLabel}>{pattern.hour}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Smart Task Scheduler</Text>
          {optimizations.map((opt) => (
            <View key={opt.taskId} style={[styles.taskCard, { borderLeftColor: getPriorityColor(opt.priority) }]}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskPriority}>{opt.priority.toUpperCase()}</Text>
                <Text style={styles.taskName}>{opt.taskName}</Text>
              </View>
              {opt.currentSchedule && (
                <View style={styles.taskCurrent}>
                  <Text style={styles.taskLabel}>Current:</Text>
                  <Text style={styles.taskTime}>
                    {opt.currentSchedule.toLocaleDateString()} {opt.currentSchedule.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </Text>
                  {opt.currentEnergyLevel && (
                    <Text style={styles.taskEnergy}>Energy: {opt.currentEnergyLevel.toFixed(1)}/10</Text>
                  )}
                </View>
              )}
              <View style={styles.taskRecommended}>
                <Text style={styles.taskLabel}>Recommended:</Text>
                <Text style={[styles.taskTime, styles.taskTimeRecommended]}>
                  {opt.recommendedSchedule.toLocaleDateString()} {opt.recommendedSchedule.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </Text>
                <Text style={styles.taskEnergyGood}>Energy: {opt.recommendedEnergyLevel.toFixed(1)}/10</Text>
              </View>
              {opt.productivityGain > 0 && (
                <Text style={styles.taskGain}>Productivity gain: +{opt.productivityGain}%</Text>
              )}
              <View style={styles.taskReasoning}>
                {opt.reasoning.map((reason, idx) => (
                  <Text key={idx} style={styles.taskReason}>• {reason}</Text>
                ))}
              </View>
              <TouchableOpacity style={styles.rescheduleButton}>
                <Text style={styles.rescheduleButtonText}>Auto-Reschedule to Peak Time</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>🎯 Recommendations</Text>
          <Text style={styles.recommendationSection}>SCHEDULE HERE:</Text>
          <Text style={styles.recommendationText}>✅ Hard/creative tasks → Peak hours (best focus)</Text>
          <Text style={styles.recommendationText}>✅ Important decisions → Peak hours (best judgment)</Text>
          <Text style={styles.recommendationSection}>AVOID HERE:</Text>
          <Text style={styles.recommendationText}>❌ Complex work → Low energy hours</Text>
          <Text style={styles.recommendationText}>❌ Important calls → When depleted</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  subtitle: { fontSize: 14, color: '#757575', marginTop: 4 },
  scrollView: { flex: 1 },
  currentCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 12, alignItems: 'center' },
  currentTitle: { fontSize: 16, color: '#757575', marginBottom: 8 },
  currentValue: { fontSize: 48, fontWeight: 'bold', color: '#10B981', marginBottom: 12 },
  currentMeter: { width: '100%', height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, overflow: 'hidden' },
  currentFill: { height: '100%', borderRadius: 6 },
  profileCard: { backgroundColor: '#E3F2FD', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12 },
  profileTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  profileSection: { marginBottom: 12 },
  profileLabel: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  profileValue: { fontSize: 14, color: '#616161', marginBottom: 4 },
  profileNote: { fontSize: 12, color: '#757575', fontStyle: 'italic' },
  chartCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 16 },
  chart: { flexDirection: 'row', height: 120, alignItems: 'flex-end', justifyContent: 'space-between' },
  chartBar: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBarFill: { width: '80%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabel: { fontSize: 10, color: '#757575', marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginLeft: 16, marginBottom: 12 },
  taskCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4 },
  taskHeader: { marginBottom: 12 },
  taskPriority: { fontSize: 12, fontWeight: 'bold', color: '#F44336', marginBottom: 4 },
  taskName: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  taskCurrent: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  taskRecommended: { marginBottom: 12 },
  taskLabel: { fontSize: 12, color: '#757575', marginBottom: 4 },
  taskTime: { fontSize: 14, color: '#616161', marginBottom: 4 },
  taskTimeRecommended: { color: '#10B981', fontWeight: 'bold' },
  taskEnergy: { fontSize: 12, color: '#757575' },
  taskEnergyGood: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
  taskGain: { fontSize: 14, fontWeight: 'bold', color: '#10B981', marginBottom: 12 },
  taskReasoning: { marginBottom: 12 },
  taskReason: { fontSize: 12, color: '#616161', marginBottom: 2 },
  rescheduleButton: { backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center' },
  rescheduleButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  recommendationsCard: { backgroundColor: '#FFF3E0', marginHorizontal: 16, marginBottom: 24, padding: 16, borderRadius: 12 },
  recommendationsTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  recommendationSection: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginTop: 8, marginBottom: 4 },
  recommendationText: { fontSize: 14, color: '#616161', marginBottom: 4 },
});
