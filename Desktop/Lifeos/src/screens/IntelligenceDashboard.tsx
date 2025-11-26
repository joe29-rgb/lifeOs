/**
 * Intelligence Dashboard
 * Unified life overview showing all pillars integrated
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useIntegration } from '../hooks/useIntegration';

export function IntelligenceDashboard() {
  const { loading, intelligence, refresh, completeAction } = useIntegration();

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return '#4CAF50';
    if (score >= 7.0) return '#8BC34A';
    if (score >= 5.5) return '#FF9800';
    return '#F44336';
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'excellent': return '✅';
      case 'good': return '👍';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '➡️';
    }
  };

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Life Intelligence</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {intelligence ? (
          <>
            <View style={styles.overallSection}>
              <Text style={styles.overallLabel}>Overall Score</Text>
              <Text style={[styles.overallScore, { color: getScoreColor(intelligence.overallScore) }]}>
                {intelligence.overallScore.toFixed(1)}/10
              </Text>
              {intelligence.weeklyChange !== 0 && (
                <Text style={[styles.weeklyChange, { color: intelligence.weeklyChange > 0 ? '#4CAF50' : '#F44336' }]}>
                  {intelligence.weeklyChange > 0 ? '↑' : '↓'} {Math.abs(intelligence.weeklyChange).toFixed(1)} from last week
                </Text>
              )}
            </View>

            {intelligence.topInsight && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Top Insight</Text>
                <View style={styles.card}>
                  <Text style={styles.insightMessage}>{intelligence.topInsight.message}</Text>
                  {intelligence.topInsight.actions && intelligence.topInsight.actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                      {intelligence.topInsight.actions.map((action, idx) => (
                        <Text key={idx} style={styles.actionItem}>• {action}</Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Pillar Health</Text>
              {intelligence.pillarHealth.map((pillar) => (
                <View key={pillar.pillar} style={styles.pillarCard}>
                  <View style={styles.pillarHeader}>
                    <Text style={styles.pillarName}>
                      {getStatusEmoji(pillar.status)} {pillar.pillar.charAt(0).toUpperCase() + pillar.pillar.slice(1)}
                    </Text>
                    <View style={styles.pillarScoreContainer}>
                      <Text style={[styles.pillarScore, { color: getScoreColor(pillar.score) }]}>
                        {pillar.score.toFixed(1)}/10
                      </Text>
                      <Text style={styles.pillarTrend}>{getTrendEmoji(pillar.trend)}</Text>
                    </View>
                  </View>
                  <Text style={styles.pillarMessage}>{pillar.message}</Text>
                </View>
              ))}
            </View>

            {intelligence.smartActions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Smart Actions</Text>
                {intelligence.smartActions.map((action) => (
                  <View key={action.id} style={styles.card}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                    <Text style={styles.actionReasoning}>{action.reasoning}</Text>
                    <View style={styles.actionMetrics}>
                      <Text style={styles.metric}>Impact: {action.impact}/10</Text>
                      <Text style={styles.metric}>Urgency: {action.urgency}/10</Text>
                      <Text style={styles.metric}>Effort: {action.effort}/10</Text>
                    </View>
                    {action.actions.map((subAction) => (
                      <TouchableOpacity
                        key={subAction.id}
                        style={[styles.subActionButton, subAction.completed && styles.completedButton]}
                        onPress={() => completeAction(action.id, subAction.id)}
                        disabled={subAction.completed}
                      >
                        <Text style={[styles.subActionText, subAction.completed && styles.completedText]}>
                          {subAction.completed ? '✓ ' : ''}{subAction.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔮 This Week Forecast</Text>
              <View style={styles.card}>
                <View style={styles.forecastRow}>
                  <Text style={styles.forecastLabel}>Energy:</Text>
                  <Text style={[styles.forecastValue, { color: getScoreColor(intelligence.weekForecast.energy) }]}>
                    {intelligence.weekForecast.energy.toFixed(1)}/10
                  </Text>
                </View>
                <View style={styles.forecastRow}>
                  <Text style={styles.forecastLabel}>Productivity:</Text>
                  <Text style={styles.forecastValue}>
                    {intelligence.weekForecast.productivity.charAt(0).toUpperCase() + intelligence.weekForecast.productivity.slice(1)}
                  </Text>
                </View>
                <View style={styles.forecastRow}>
                  <Text style={styles.forecastLabel}>Mood:</Text>
                  <Text style={[styles.forecastValue, { color: getScoreColor(intelligence.weekForecast.mood) }]}>
                    {intelligence.weekForecast.mood.toFixed(1)}/10
                  </Text>
                </View>
                <View style={styles.forecastRow}>
                  <Text style={styles.forecastLabel}>Career:</Text>
                  <Text style={styles.forecastValue}>
                    {intelligence.weekForecast.career.charAt(0).toUpperCase() + intelligence.weekForecast.career.slice(1)}
                  </Text>
                </View>
                {intelligence.weekForecast.opportunities.length > 0 && (
                  <View style={styles.opportunitiesContainer}>
                    <Text style={styles.opportunitiesTitle}>Opportunities:</Text>
                    {intelligence.weekForecast.opportunities.map((opp, idx) => (
                      <Text key={idx} style={styles.opportunityItem}>✨ {opp}</Text>
                    ))}
                  </View>
                )}
                {intelligence.weekForecast.risks.length > 0 && (
                  <View style={styles.risksContainer}>
                    <Text style={styles.risksTitle}>Risks:</Text>
                    {intelligence.weekForecast.risks.map((risk, idx) => (
                      <Text key={idx} style={styles.riskItem}>⚠️ {risk}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>🧠 Building Your Intelligence</Text>
            <Text style={styles.emptyText}>Use the app for a few days to unlock insights</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  scrollView: { flex: 1 },
  overallSection: { backgroundColor: '#FFFFFF', padding: 24, marginTop: 16, marginHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  overallLabel: { fontSize: 14, color: '#757575', marginBottom: 8 },
  overallScore: { fontSize: 48, fontWeight: 'bold' },
  weeklyChange: { fontSize: 16, marginTop: 8, fontWeight: '600' },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  insightMessage: { fontSize: 16, color: '#212121', fontWeight: '600', marginBottom: 12 },
  actionsContainer: { marginTop: 8 },
  actionItem: { fontSize: 14, color: '#616161', marginTop: 4 },
  pillarCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8 },
  pillarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pillarName: { fontSize: 16, fontWeight: '600', color: '#212121' },
  pillarScoreContainer: { flexDirection: 'row', alignItems: 'center' },
  pillarScore: { fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  pillarTrend: { fontSize: 16 },
  pillarMessage: { fontSize: 14, color: '#616161' },
  actionTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  actionDescription: { fontSize: 14, color: '#616161', marginBottom: 8 },
  actionReasoning: { fontSize: 12, color: '#757575', fontStyle: 'italic', marginBottom: 12 },
  actionMetrics: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, paddingVertical: 8, backgroundColor: '#F5F5F5', borderRadius: 8 },
  metric: { fontSize: 12, color: '#616161' },
  subActionButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginTop: 8 },
  completedButton: { backgroundColor: '#4CAF50' },
  subActionText: { color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
  completedText: { textDecorationLine: 'line-through' },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  forecastLabel: { fontSize: 14, color: '#616161' },
  forecastValue: { fontSize: 14, fontWeight: '600', color: '#212121' },
  opportunitiesContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  opportunitiesTitle: { fontSize: 14, fontWeight: '600', color: '#4CAF50', marginBottom: 8 },
  opportunityItem: { fontSize: 14, color: '#616161', marginTop: 4 },
  risksContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  risksTitle: { fontSize: 14, fontWeight: '600', color: '#FF9800', marginBottom: 8 },
  riskItem: { fontSize: 14, color: '#616161', marginTop: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, marginTop: 100 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#757575', textAlign: 'center' },
});
