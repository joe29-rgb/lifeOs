/**
 * Insights Screen
 * Discovered patterns and correlations across pillars
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useInsights } from '../hooks/useInsights';

export function InsightsScreen() {
  const { loading, insights, patterns, provideFeedback, refresh } = useInsights();

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'very_high': return '#4CAF50';
      case 'high': return '#8BC34A';
      case 'medium': return '#FF9800';
      default: return '#757575';
    }
  };

  const getPatternTypeIcon = (type: string) => {
    switch (type) {
      case 'causal': return '⚡';
      case 'predictive': return '🔮';
      case 'correlational': return '🔗';
      default: return '📊';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 Insights</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {insights.length > 0 ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Discovered Insights</Text>
              {insights.map((insight) => (
                <View key={insight.id} style={styles.card}>
                  <View style={styles.insightHeader}>
                    <Text style={styles.insightMessage}>{insight.message}</Text>
                    <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(insight.pattern.confidence) }]}>
                      <Text style={styles.confidenceText}>{insight.pattern.confidence}</Text>
                    </View>
                  </View>
                  <View style={styles.patternInfo}>
                    <Text style={styles.patternType}>
                      {getPatternTypeIcon(insight.pattern.type)} {insight.pattern.type}
                    </Text>
                    <Text style={styles.occurrences}>
                      {insight.pattern.occurrences} occurrences
                    </Text>
                  </View>
                  {insight.actions && insight.actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                      <Text style={styles.actionsTitle}>Actions:</Text>
                      {insight.actions.map((action, idx) => (
                        <Text key={idx} style={styles.actionItem}>• {action}</Text>
                      ))}
                    </View>
                  )}
                  <View style={styles.feedbackContainer}>
                    <TouchableOpacity
                      style={[styles.feedbackButton, insight.pattern.userFeedback === 'helpful' && styles.feedbackActive]}
                      onPress={() => provideFeedback(insight.pattern.id, 'helpful')}
                    >
                      <Text style={styles.feedbackText}>👍 Helpful</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.feedbackButton, insight.pattern.userFeedback === 'not_helpful' && styles.feedbackActive]}
                      onPress={() => provideFeedback(insight.pattern.id, 'not_helpful')}
                    >
                      <Text style={styles.feedbackText}>👎 Not Helpful</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 All Patterns</Text>
              {patterns.map((pattern) => (
                <View key={pattern.id} style={styles.patternCard}>
                  <Text style={styles.patternDescription}>{pattern.description}</Text>
                  <View style={styles.patternDetails}>
                    <Text style={styles.patternDetail}>
                      {pattern.pillarA} → {pattern.pillarB}
                    </Text>
                    <Text style={styles.patternDetail}>
                      Strength: {(pattern.strength * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>💡 No Insights Yet</Text>
            <Text style={styles.emptyText}>
              Keep using the app to discover patterns across your life
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
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
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  insightMessage: { flex: 1, fontSize: 16, fontWeight: '600', color: '#212121', marginRight: 12 },
  confidenceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  confidenceText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  patternInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  patternType: { fontSize: 14, color: '#616161' },
  occurrences: { fontSize: 14, color: '#757575' },
  actionsContainer: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginBottom: 12 },
  actionsTitle: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 8 },
  actionItem: { fontSize: 14, color: '#616161', marginTop: 4 },
  feedbackContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  feedbackButton: { flex: 1, padding: 10, borderRadius: 8, marginHorizontal: 4, backgroundColor: '#E0E0E0', alignItems: 'center' },
  feedbackActive: { backgroundColor: '#4CAF50' },
  feedbackText: { fontSize: 14, color: '#212121' },
  patternCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8 },
  patternDescription: { fontSize: 14, color: '#212121', marginBottom: 8 },
  patternDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  patternDetail: { fontSize: 12, color: '#757575' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, marginTop: 100 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#757575', textAlign: 'center', marginBottom: 24 },
  refreshButton: { backgroundColor: '#4CAF50', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  refreshButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
