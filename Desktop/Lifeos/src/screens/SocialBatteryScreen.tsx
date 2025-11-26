/**
 * Social Battery Screen
 * Main battery dashboard
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SocialBatteryEngine } from '../modules/socialBattery/services/SocialBatteryEngine';
import { DepletionDetector } from '../modules/socialBattery/services/DepletionDetector';
import { SocialTypeDetector } from '../modules/socialBattery/services/SocialTypeDetector';
import { BatteryLevel, DepletionAlert, IsolationAlert } from '../modules/socialBattery/types/socialBattery.types';

const batteryEngine = new SocialBatteryEngine();
const depletionDetector = new DepletionDetector();
const typeDetector = new SocialTypeDetector();

export function SocialBatteryScreen() {
  const [battery, setBattery] = useState<BatteryLevel | null>(null);
  const [weeklyPattern, setWeeklyPattern] = useState<any[]>([]);
  const [depletionAlert, setDepletionAlert] = useState<DepletionAlert | null>(null);
  const [isolationAlert, setIsolationAlert] = useState<IsolationAlert | null>(null);
  const [timeToRecharge, setTimeToRecharge] = useState(0);
  const [socialType, setSocialType] = useState<string>('');

  useEffect(() => {
    loadBatteryData();
  }, []);

  const loadBatteryData = async () => {
    const currentBattery = await batteryEngine.getCurrentBattery();
    setBattery(currentBattery);

    const pattern = await batteryEngine.getWeeklyPattern();
    setWeeklyPattern(pattern);

    const depletion = await depletionDetector.checkDepletion();
    setDepletionAlert(depletion);

    const isolation = await depletionDetector.checkIsolation();
    setIsolationAlert(isolation);

    const rechargeTime = await batteryEngine.getTimeToFullRecharge();
    setTimeToRecharge(rechargeTime);

    const profile = await typeDetector.detectSocialType();
    setSocialType(profile.type);
  };

  const getBatteryColor = (level: number) => {
    if (level >= 60) return '#4CAF50';
    if (level >= 40) return '#FFC107';
    if (level >= 25) return '#FF9800';
    return '#F44336';
  };

  const getStatusText = (level: number) => {
    if (level >= 90) return '✅ FULLY CHARGED';
    if (level >= 60) return '😊 GOOD';
    if (level >= 40) return '⚠️ GETTING DEPLETED';
    if (level >= 25) return '🚨 LOW';
    return '🆘 CRITICAL';
  };

  const handleLogSocial = () => {
    Alert.alert(
      'Log Social Event',
      'Quick log a social interaction',
      [
        {
          text: '1:1 (1hr)',
          onPress: async () => {
            await batteryEngine.logSocialEvent({
              type: '1on1',
              duration: 60,
              location: 'familiar',
            });
            loadBatteryData();
          },
        },
        {
          text: 'Group (2hrs)',
          onPress: async () => {
            await batteryEngine.logSocialEvent({
              type: 'group',
              duration: 120,
              location: 'familiar',
            });
            loadBatteryData();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogSolo = () => {
    Alert.alert(
      'Log Solo Time',
      'Quick log alone time',
      [
        {
          text: 'Hobby (2hrs)',
          onPress: async () => {
            await batteryEngine.logSoloEvent({
              type: 'hobby',
              duration: 120,
            });
            loadBatteryData();
          },
        },
        {
          text: 'Relaxing (4hrs)',
          onPress: async () => {
            await batteryEngine.logSoloEvent({
              type: 'relaxing',
              duration: 240,
            });
            loadBatteryData();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (!battery) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔋 Social Battery</Text>
        <Text style={styles.subtitle}>Relationship Energy Management</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.batteryCard}>
          <Text style={styles.batteryTitle}>Current Level: {battery.current}%</Text>
          <View style={styles.batteryMeter}>
            <View
              style={[
                styles.batteryFill,
                {
                  width: `${battery.current}%`,
                  backgroundColor: getBatteryColor(battery.current),
                },
              ]}
            />
          </View>
          <Text style={[styles.statusText, { color: getBatteryColor(battery.current) }]}>
            {getStatusText(battery.current)}
          </Text>
        </View>

        {depletionAlert && (
          <View style={[styles.alertCard, styles.depletionAlert]}>
            <Text style={styles.alertTitle}>
              {depletionAlert.severity === 'critical' ? '🆘' : '⚠️'} Battery {depletionAlert.severity.toUpperCase()}
            </Text>
            <Text style={styles.alertMessage}>{depletionAlert.message}</Text>
            <Text style={styles.alertRecommendations}>Recommendations:</Text>
            {[...depletionAlert.recommendations].map((rec, idx) => (
              <Text key={idx} style={styles.alertRec}>• {rec}</Text>
            ))}
          </View>
        )}

        {isolationAlert && (
          <View style={[styles.alertCard, styles.isolationAlert]}>
            <Text style={styles.alertTitle}>🚨 ISOLATION ALERT</Text>
            <Text style={styles.alertMessage}>{isolationAlert.message}</Text>
            <Text style={styles.alertMeta}>Days mostly alone: {isolationAlert.daysAlone}</Text>
            <Text style={styles.alertRecommendations}>Recommendations:</Text>
            {[...isolationAlert.recommendations].map((rec, idx) => (
              <Text key={idx} style={styles.alertRec}>• {rec}</Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 This Week&apos;s Pattern</Text>
          {weeklyPattern.map((day, idx) => (
            <View key={idx} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day.day}</Text>
                <Text style={[styles.dayBattery, { color: getBatteryColor(day.batteryLevel) }]}>
                  {Math.round(day.batteryLevel)}%
                </Text>
              </View>
              <View style={styles.dayMeter}>
                <View
                  style={[
                    styles.dayFill,
                    {
                      width: `${day.batteryLevel}%`,
                      backgroundColor: getBatteryColor(day.batteryLevel),
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayStats}>
                Social: {day.socialEvents} events • Solo: {day.soloHours.toFixed(1)}hrs
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>⚡ Recharge Info</Text>
          <Text style={styles.infoText}>Time to fully recharge: ~{timeToRecharge} hours</Text>
          <Text style={styles.infoText}>Your type: {socialType.charAt(0).toUpperCase() + socialType.slice(1)}</Text>
          <Text style={styles.infoText}>Suggested: Solo hobby or relaxing activity</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.logButton} onPress={handleLogSocial}>
            <Text style={styles.logButtonText}>👥 Log Social Event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.soloButton} onPress={handleLogSolo}>
            <Text style={styles.soloButtonText}>🏠 Log Solo Time</Text>
          </TouchableOpacity>
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
  batteryCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 12, alignItems: 'center' },
  batteryTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 16 },
  batteryMeter: { width: '100%', height: 40, backgroundColor: '#E0E0E0', borderRadius: 20, overflow: 'hidden', marginBottom: 12 },
  batteryFill: { height: '100%', borderRadius: 20 },
  statusText: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  alertCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12 },
  depletionAlert: { backgroundColor: '#FFEBEE' },
  isolationAlert: { backgroundColor: '#FFF3E0' },
  alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  alertMessage: { fontSize: 14, color: '#616161', marginBottom: 12 },
  alertMeta: { fontSize: 12, color: '#757575', marginBottom: 8 },
  alertRecommendations: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  alertRec: { fontSize: 14, color: '#616161', marginBottom: 4 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  dayCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 8 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayName: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  dayBattery: { fontSize: 16, fontWeight: 'bold' },
  dayMeter: { width: '100%', height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  dayFill: { height: '100%', borderRadius: 4 },
  dayStats: { fontSize: 12, color: '#757575' },
  infoCard: { backgroundColor: '#E3F2FD', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#616161', marginBottom: 4 },
  actions: { padding: 16 },
  logButton: { backgroundColor: '#2196F3', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  logButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  soloButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center' },
  soloButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
