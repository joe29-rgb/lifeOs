/**
 * Regret History Screen
 * Past regrets and lessons learned
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { RegretAnalyzer } from '../modules/regretMinimizer/services/RegretAnalyzer';
import { Regret, RegretAnalysis } from '../modules/regretMinimizer/types/regretMinimizer.types';

const regretAnalyzer = new RegretAnalyzer();

export function RegretHistoryScreen() {
  const [regrets, setRegrets] = useState<Regret[]>([]);
  const [analysis, setAnalysis] = useState<RegretAnalysis | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadRegrets();
  }, []);

  const loadRegrets = async () => {
    const allRegrets = await regretAnalyzer.getRegrets();
    setRegrets(allRegrets);

    const analysisData = await regretAnalyzer.analyzeRegrets();
    setAnalysis(analysisData);
  };

  const getFilteredRegrets = () => {
    if (selectedCategory === 'all') return regrets;
    return regrets.filter((r) => r.category === selectedCategory);
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return '#F44336';
    if (intensity >= 6) return '#FF9800';
    if (intensity >= 4) return '#FFC107';
    return '#4CAF50';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career': return '🚀';
      case 'relationship': return '❤️';
      case 'financial': return '💰';
      case 'life': return '💭';
      case 'health': return '🧠';
      default: return '📋';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Regret History</Text>
        <Text style={styles.subtitle}>Learn from past decisions</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {analysis && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 Your Patterns</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analysis.totalDecisions}</Text>
                <Text style={styles.statLabel}>Total Decisions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analysis.totalRegrets}</Text>
                <Text style={styles.statLabel}>Regrets</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(analysis.regretRate)}%</Text>
                <Text style={styles.statLabel}>Regret Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analysis.averageRegretIntensity.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Avg Intensity</Text>
              </View>
            </View>
          </View>
        )}

        {analysis && analysis.topRegretReasons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Top Regret Reasons</Text>
            {analysis.topRegretReasons.map((reason, idx) => (
              <View key={idx} style={styles.reasonCard}>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}

        {analysis && analysis.topLessons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎓 Lessons Learned</Text>
            {analysis.topLessons.map((lesson, idx) => (
              <View key={idx} style={styles.lessonCard}>
                <Text style={styles.lessonText}>&quot;{lesson}&quot;</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.filterButtonText, selectedCategory === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {['career', 'relationship', 'financial', 'life', 'health'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterButton, selectedCategory === cat && styles.filterButtonActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.filterButtonText, selectedCategory === cat && styles.filterButtonTextActive]}>
                  {getCategoryIcon(cat)} {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Past Regrets ({getFilteredRegrets().length})</Text>
          {getFilteredRegrets().map((regret) => (
            <View key={regret.id} style={styles.regretCard}>
              <View style={styles.regretHeader}>
                <Text style={styles.regretCategory}>{getCategoryIcon(regret.category)}</Text>
                <View style={styles.regretHeaderText}>
                  <Text style={styles.regretDecision}>{regret.decision}</Text>
                  <Text style={styles.regretDate}>
                    {new Date(regret.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor(regret.regretIntensity) }]}>
                  <Text style={styles.intensityText}>{regret.regretIntensity}/10</Text>
                </View>
              </View>

              {regret.regretReasons.length > 0 && (
                <View style={styles.regretSection}>
                  <Text style={styles.regretSectionTitle}>Why I regret it:</Text>
                  {regret.regretReasons.map((reason, idx) => (
                    <Text key={idx} style={styles.regretReason}>• {reason}</Text>
                  ))}
                </View>
              )}

              {regret.lessons.length > 0 && (
                <View style={styles.regretSection}>
                  <Text style={styles.regretSectionTitle}>What I learned:</Text>
                  {regret.lessons.map((lesson, idx) => (
                    <Text key={idx} style={styles.regretLesson}>✓ {lesson}</Text>
                  ))}
                </View>
              )}

              <Text style={styles.regretWouldDo}>
                Would do again: {regret.wouldDoAgain ? 'Yes' : 'No'}
              </Text>
            </View>
          ))}

          {getFilteredRegrets().length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No regrets in this category yet.
              </Text>
            </View>
          )}
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
  statsCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 12 },
  statsTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', alignItems: 'center', marginBottom: 16 },
  statValue: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: 12, color: '#757575', marginTop: 4, textAlign: 'center' },
  section: { marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  reasonCard: { backgroundColor: '#FFEBEE', marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 8 },
  reasonText: { fontSize: 14, color: '#212121' },
  lessonCard: { backgroundColor: '#E8F5E9', marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 8 },
  lessonText: { fontSize: 14, color: '#212121', fontStyle: 'italic' },
  filterContainer: { paddingHorizontal: 16, marginBottom: 16 },
  filterLabel: { fontSize: 14, color: '#757575', marginBottom: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', marginRight: 8 },
  filterButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  filterButtonText: { fontSize: 14, color: '#616161' },
  filterButtonTextActive: { color: '#FFFFFF', fontWeight: '600' },
  regretCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  regretHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  regretCategory: { fontSize: 28, marginRight: 12 },
  regretHeaderText: { flex: 1 },
  regretDecision: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 2 },
  regretDate: { fontSize: 12, color: '#757575' },
  intensityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  intensityText: { fontSize: 12, color: '#FFFFFF', fontWeight: 'bold' },
  regretSection: { marginBottom: 12 },
  regretSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  regretReason: { fontSize: 14, color: '#F44336', marginBottom: 2 },
  regretLesson: { fontSize: 14, color: '#4CAF50', marginBottom: 2 },
  regretWouldDo: { fontSize: 12, color: '#757575', marginTop: 8 },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#757575', textAlign: 'center' },
});
