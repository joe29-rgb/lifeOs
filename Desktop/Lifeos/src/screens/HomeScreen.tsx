/**
 * Home Screen
 * Main dashboard combining Intelligence + Today's overview
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useApp } from '../context/AppContext';
import { useIntegration } from '../hooks/useIntegration';

export function HomeScreen({ navigation }: { navigation: any }) {
  const { userProfile } = useApp();
  const { loading, intelligence, refresh } = useIntegration();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return '#4CAF50';
    if (score >= 7.0) return '#8BC34A';
    if (score >= 5.5) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {userProfile?.name || 'User'}!</Text>
        <Text style={styles.subtitle}>Today's Focus</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {intelligence && (
          <>
            <View style={styles.scoreSection}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>⭐ Life Score</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(intelligence.overallScore) }]}>
                  {intelligence.overallScore.toFixed(1)}/10
                </Text>
                {intelligence.weeklyChange !== 0 && (
                  <Text style={[styles.scoreChange, { color: intelligence.weeklyChange > 0 ? '#4CAF50' : '#F44336' }]}>
                    {intelligence.weeklyChange > 0 ? '↑' : '↓'} {Math.abs(intelligence.weeklyChange).toFixed(1)}
                  </Text>
                )}
              </View>

              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>😊 Mood</Text>
                  <Text style={styles.statValue}>
                    {intelligence.pillarHealth.find((p) => p.pillar === 'health')?.score.toFixed(1) || '7.0'}/10
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>⚡ Energy</Text>
                  <Text style={styles.statValue}>{intelligence.weekForecast.energy.toFixed(1)}/10</Text>
                </View>
              </View>
            </View>

            {intelligence.smartActions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Right Now</Text>
                {intelligence.smartActions.slice(0, 3).map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Intelligence')}
                  >
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                    <View style={styles.actionMeta}>
                      <Text style={styles.actionMetaText}>Impact: {action.impact}/10</Text>
                      <Text style={styles.actionMetaText}>→</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Quick Stats</Text>
              <View style={styles.statsGrid}>
                {intelligence.pillarHealth.map((pillar) => (
                  <View key={pillar.pillar} style={styles.statCard}>
                    <Text style={styles.statCardLabel}>
                      {pillar.pillar.charAt(0).toUpperCase() + pillar.pillar.slice(1)}
                    </Text>
                    <Text style={[styles.statCardValue, { color: getScoreColor(pillar.score) }]}>
                      {pillar.score.toFixed(1)}
                    </Text>
                    <Text style={styles.statCardStatus}>
                      {pillar.trend === 'improving' ? '📈' : pillar.trend === 'declining' ? '📉' : '➡️'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌙 Tonight</Text>
              <View style={styles.card}>
                <Text style={styles.cardText}>Bedtime: 10:30 PM (in 2hrs)</Text>
                <Text style={styles.cardText}>
                  Tomorrow Energy: {intelligence.weekForecast.energy.toFixed(1)}/10 (predicted)
                </Text>
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() => navigation.navigate('Briefing')}
                >
                  <Text style={styles.cardButtonText}>View Full Briefing</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Focus')}
              >
                <Text style={styles.quickActionText}>🎯 Start Focus</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Health')}
              >
                <Text style={styles.quickActionText}>😴 Log Mood</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  subtitle: { fontSize: 16, color: '#757575', marginTop: 4 },
  scrollView: { flex: 1 },
  scoreSection: { backgroundColor: '#FFFFFF', padding: 20, marginTop: 16, marginHorizontal: 16, borderRadius: 12 },
  scoreCard: { alignItems: 'center', marginBottom: 20 },
  scoreLabel: { fontSize: 16, color: '#757575', marginBottom: 8 },
  scoreValue: { fontSize: 48, fontWeight: 'bold' },
  scoreChange: { fontSize: 16, marginTop: 8, fontWeight: '600' },
  quickStats: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 14, color: '#757575', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#212121' },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  actionCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  actionDescription: { fontSize: 14, color: '#616161', marginBottom: 8 },
  actionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionMetaText: { fontSize: 12, color: '#757575' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  statCard: { width: '30%', backgroundColor: '#FFFFFF', margin: 8, padding: 12, borderRadius: 8, alignItems: 'center' },
  statCardLabel: { fontSize: 12, color: '#757575', marginBottom: 4, textAlign: 'center' },
  statCardValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statCardStatus: { fontSize: 16 },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  cardText: { fontSize: 14, color: '#616161', marginBottom: 8 },
  cardButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' },
  cardButtonText: { color: '#FFFFFF', fontWeight: '600' },
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, marginBottom: 24 },
  quickActionButton: { flex: 1, backgroundColor: '#2196F3', padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center' },
  quickActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
