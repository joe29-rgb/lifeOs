/**
 * Smart Alarm Screen
 * Sleep cycle visualization and alarm configuration
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SleepCycleCalculator } from '../modules/smartAlarm/services/SleepCycleCalculator';
import { SmartAlarmEngine } from '../modules/smartAlarm/services/SmartAlarmEngine';
import { SleepForecast, AlarmOptimization, SmartAlarm } from '../modules/smartAlarm/types/smartAlarm.types';

const sleepCalculator = new SleepCycleCalculator();
const alarmEngine = new SmartAlarmEngine();

export function SmartAlarmScreen() {
  const [alarm, setAlarm] = useState<SmartAlarm | null>(null);
  const [forecast, setForecast] = useState<SleepForecast | null>(null);
  const [optimization, setOptimization] = useState<AlarmOptimization | null>(null);
  const [bedtime, setBedtime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());

  useEffect(() => {
    loadAlarmData();
  }, []);

  const loadAlarmData = async () => {
    // Set default times (10:30 PM bedtime, 7:00 AM wake)
    const defaultBedtime = new Date();
    defaultBedtime.setHours(22, 30, 0, 0);
    
    const defaultWakeTime = new Date();
    defaultWakeTime.setDate(defaultWakeTime.getDate() + 1);
    defaultWakeTime.setHours(7, 0, 0, 0);

    setBedtime(defaultBedtime);
    setWakeTime(defaultWakeTime);

    // Generate forecast
    const sleepForecast = await sleepCalculator.generateSleepForecast(
      defaultBedtime,
      defaultWakeTime
    );
    setForecast(sleepForecast);

    // Check for existing alarm
    const alarms = await alarmEngine.getAllAlarms();
    if (alarms.length > 0) {
      const existingAlarm = alarms[0];
      setAlarm(existingAlarm);

      // Generate optimization
      const opt = await alarmEngine.optimizeAlarm(existingAlarm.id, defaultBedtime);
      setOptimization(opt);
    }
  };

  const handleCreateAlarm = async () => {
    const newAlarm = await alarmEngine.createSmartAlarm(
      'user-id',
      wakeTime,
      30 // ±30 minutes flexibility
    );
    setAlarm(newAlarm);

    const opt = await alarmEngine.optimizeAlarm(newAlarm.id, bedtime);
    setOptimization(opt);
  };

  const handleToggleAlarm = async () => {
    if (!alarm) return;
    await alarmEngine.updateAlarm(alarm.id, { enabled: !alarm.enabled });
    setAlarm({ ...alarm, enabled: !alarm.enabled });
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'light': return '#4CAF50';
      case 'deep': return '#2196F3';
      case 'rem': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'light': return '🌙';
      case 'deep': return '😴';
      case 'rem': return '💭';
      default: return '😴';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Smart Wake-Up Alarm</Text>
        <Text style={styles.subtitle}>Wake during light sleep</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {forecast && (
          <View style={styles.forecastCard}>
            <Text style={styles.forecastTitle}>😴 Tonight's Sleep Forecast</Text>
            
            <View style={styles.forecastRow}>
              <Text style={styles.forecastLabel}>Bedtime:</Text>
              <Text style={styles.forecastValue}>
                {forecast.bedtime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </Text>
            </View>

            <View style={styles.forecastRow}>
              <Text style={styles.forecastLabel}>Wake time:</Text>
              <Text style={styles.forecastValue}>
                {forecast.wakeTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </Text>
            </View>

            <View style={styles.forecastRow}>
              <Text style={styles.forecastLabel}>Sleep duration:</Text>
              <Text style={styles.forecastValue}>
                {forecast.totalDuration.toFixed(1)} hours ({forecast.completeCycles} complete cycles)
              </Text>
            </View>

            <View style={styles.cyclesSection}>
              <Text style={styles.cyclesTitle}>Sleep Cycles:</Text>
              {forecast.cycles.map((cycle) => (
                <View key={cycle.cycleNumber} style={styles.cycleRow}>
                  <Text style={styles.cycleNumber}>Cycle {cycle.cycleNumber}</Text>
                  <Text style={styles.cycleTime}>
                    {cycle.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {cycle.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </Text>
                  <View style={[styles.cyclePhase, { backgroundColor: getPhaseColor(cycle.phase) }]}>
                    <Text style={styles.cyclePhaseText}>
                      {getPhaseIcon(cycle.phase)} {cycle.phase.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.wakeWindowCard}>
              <Text style={styles.wakeWindowTitle}>🎯 Smart Wake Window</Text>
              <Text style={styles.wakeWindowTime}>
                {forecast.optimalWakeWindow.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {forecast.optimalWakeWindow.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </Text>
              <Text style={styles.wakeWindowNote}>
                Within this window, you're in light sleep.
              </Text>
              <Text style={styles.wakeWindowNote}>
                Waking here = {forecast.expectedGrogginess}/10 grogginess
              </Text>
            </View>
          </View>
        )}

        {optimization && (
          <View style={styles.optimizationCard}>
            <Text style={styles.optimizationTitle}>⚙️ Smart Alarm Configuration</Text>
            
            <View style={styles.alarmToggle}>
              <Text style={styles.alarmToggleLabel}>Alarm Enabled</Text>
              <Switch
                value={alarm?.enabled || false}
                onValueChange={handleToggleAlarm}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              />
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Standard wake time:</Text>
              <Text style={styles.timeValue}>
                {alarm?.standardWakeTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </Text>
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Allow flexibility:</Text>
              <Text style={styles.timeValue}>±{alarm?.flexibilityMinutes || 30} minutes</Text>
            </View>

            <View style={styles.recommendedSection}>
              <Text style={styles.recommendedTitle}>Recommended Wake Time:</Text>
              <Text style={styles.recommendedTime}>
                {optimization.recommendedWakeTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </Text>
              {optimization.inLightSleep && (
                <Text style={styles.lightSleepBadge}>✅ In Light Sleep</Text>
              )}
            </View>

            <View style={styles.reasoningSection}>
              <Text style={styles.reasoningTitle}>Why this time:</Text>
              {optimization.reasoning.map((reason, idx) => (
                <Text key={idx} style={styles.reasoningText}>• {reason}</Text>
              ))}
            </View>

            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>📊 vs Traditional Alarm</Text>
              
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCol}>
                  <Text style={styles.comparisonLabel}>Traditional</Text>
                  <Text style={styles.comparisonValue}>
                    Wake Quality: {optimization.comparison.traditional.wakeQuality}/10
                  </Text>
                  <Text style={styles.comparisonValue}>
                    Grogginess: {optimization.comparison.traditional.grogginess}/10
                  </Text>
                </View>
                
                <View style={styles.comparisonCol}>
                  <Text style={styles.comparisonLabel}>Smart Alarm</Text>
                  <Text style={[styles.comparisonValue, styles.comparisonValueGood]}>
                    Wake Quality: {optimization.comparison.smart.wakeQuality}/10
                  </Text>
                  <Text style={[styles.comparisonValue, styles.comparisonValueGood]}>
                    Grogginess: {optimization.comparison.smart.grogginess}/10
                  </Text>
                </View>
              </View>

              <Text style={styles.improvementText}>
                Improvement: +{optimization.comparison.improvement}% better wake experience
              </Text>
            </View>
          </View>
        )}

        {!alarm && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreateAlarm}>
            <Text style={styles.createButtonText}>🔔 Create Smart Alarm</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How It Works</Text>
          <Text style={styles.infoText}>
            • Sleep cycles are ~90 minutes long
          </Text>
          <Text style={styles.infoText}>
            • Each cycle has light, deep, and REM phases
          </Text>
          <Text style={styles.infoText}>
            • Waking during light sleep = less grogginess
          </Text>
          <Text style={styles.infoText}>
            • Smart alarm finds your light sleep window
          </Text>
          <Text style={styles.infoText}>
            • Wake up feeling refreshed, not groggy!
          </Text>
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
  forecastCard: { backgroundColor: '#E3F2FD', margin: 16, padding: 20, borderRadius: 12 },
  forecastTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 16 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  forecastLabel: { fontSize: 14, color: '#616161' },
  forecastValue: { fontSize: 14, fontWeight: 'bold', color: '#212121' },
  cyclesSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#BBDEFB' },
  cyclesTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  cycleRow: { marginBottom: 12, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 8 },
  cycleNumber: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  cycleTime: { fontSize: 12, color: '#757575', marginBottom: 8 },
  cyclePhase: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start' },
  cyclePhaseText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
  wakeWindowCard: { marginTop: 16, padding: 16, backgroundColor: '#C8E6C9', borderRadius: 8 },
  wakeWindowTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  wakeWindowTime: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  wakeWindowNote: { fontSize: 14, color: '#616161', marginBottom: 4 },
  optimizationCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 12 },
  optimizationTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 16 },
  alarmToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  alarmToggleLabel: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  timeLabel: { fontSize: 14, color: '#616161' },
  timeValue: { fontSize: 14, fontWeight: 'bold', color: '#212121' },
  recommendedSection: { marginTop: 16, padding: 16, backgroundColor: '#E8F5E9', borderRadius: 8 },
  recommendedTitle: { fontSize: 14, color: '#616161', marginBottom: 4 },
  recommendedTime: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  lightSleepBadge: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50' },
  reasoningSection: { marginTop: 16 },
  reasoningTitle: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  reasoningText: { fontSize: 14, color: '#616161', marginBottom: 4 },
  comparisonCard: { marginTop: 16, padding: 16, backgroundColor: '#FFF3E0', borderRadius: 8 },
  comparisonTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  comparisonCol: { flex: 1 },
  comparisonLabel: { fontSize: 12, color: '#757575', marginBottom: 8, fontWeight: 'bold' },
  comparisonValue: { fontSize: 14, color: '#616161', marginBottom: 4 },
  comparisonValueGood: { color: '#4CAF50', fontWeight: 'bold' },
  improvementText: { fontSize: 14, fontWeight: 'bold', color: '#F57C00', textAlign: 'center' },
  createButton: { backgroundColor: '#4CAF50', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  infoCard: { backgroundColor: '#FFF9C4', marginHorizontal: 16, marginBottom: 24, padding: 16, borderRadius: 12 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  infoText: { fontSize: 14, color: '#616161', marginBottom: 6 },
});
