/**
 * Settings Screen
 * App-wide settings and profile management
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useApp } from '../context/AppContext';

export function SettingsScreen() {
  const { userProfile, settings, updateSettings } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <Text style={styles.profileName}>{userProfile?.name || 'User'}</Text>
            <Text style={styles.profileDetail}>Sleep Goal: {userProfile?.sleepGoal || 7.5} hours</Text>
            <Text style={styles.profileDetail}>Exercise Goal: {userProfile?.exerciseGoal || 4}×/week</Text>
            <Text style={styles.profileDetail}>Work Type: {userProfile?.workType || 'hybrid'}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pillars</Text>
          
          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>🎯 Procrastination</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Barney Mode</Text>
              <Switch
                value={settings.barneyMode}
                onValueChange={(value) => updateSettings({ barneyMode: value })}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>😴 Health</Text>
            <Text style={styles.settingDetail}>Sleep goal: {settings.sleepGoal} hours</Text>
            <Text style={styles.settingDetail}>Exercise goal: {settings.exerciseGoal}×/week</Text>
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>🧠 Intelligence</Text>
            <Text style={styles.settingDetail}>Data retention: {settings.dataRetentionDays} days</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>All Notifications</Text>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
              />
            </View>
            <Text style={styles.settingDetail}>Daily briefing: {settings.dailyBriefingTime}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Export All Data (JSON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Clear History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Text style={[styles.actionButtonText, styles.dangerText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>Version: 1.0.0</Text>
            <Text style={styles.aboutText}>Build: 1</Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Send Feedback</Text>
            </TouchableOpacity>
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
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  profileDetail: { fontSize: 14, color: '#616161', marginBottom: 4 },
  editButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  editButtonText: { color: '#FFFFFF', fontWeight: '600' },
  settingCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8 },
  settingTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  settingLabel: { fontSize: 14, color: '#616161' },
  settingDetail: { fontSize: 14, color: '#757575', marginBottom: 4 },
  actionButton: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
  dangerButton: { backgroundColor: '#FFEBEE' },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#212121' },
  dangerText: { color: '#F44336' },
  aboutText: { fontSize: 14, color: '#616161', marginBottom: 8 },
  linkButton: { marginTop: 8 },
  linkText: { fontSize: 14, color: '#2196F3', fontWeight: '600' },
});
