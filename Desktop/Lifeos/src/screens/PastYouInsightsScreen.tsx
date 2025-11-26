/**
 * Past You Insights Screen
 * Timeline, patterns, wisdom library
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MemoryEngine } from '../modules/pastYou/services/MemoryEngine';
import { Memory } from '../modules/pastYou/types/pastYou.types';
import { PATTERN_CATEGORIES, RECURRING_LESSONS } from '../modules/pastYou/constants/pastYou.constants';

const memoryEngine = new MemoryEngine();

export function PastYouInsightsScreen() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState({
    totalMemories: 0,
    decisionCount: 0,
    crisisCount: 0,
    wisdomCount: 0,
  });

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const allMemories = await memoryEngine.getMemories();
    setMemories(allMemories);

    setStats({
      totalMemories: allMemories.length,
      decisionCount: allMemories.filter((m) => m.source === 'decision').length,
      crisisCount: allMemories.filter((m) => m.source === 'crisis').length,
      wisdomCount: allMemories.filter((m) => m.impact >= 8).length,
    });
  };

  const getTopWisdom = (): Memory[] => {
    return memories
      .filter((m) => m.impact >= 7)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Your Journey</Text>
        <Text style={styles.subtitle}>Insights from Past You</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📈 Your Growth</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalMemories}</Text>
              <Text style={styles.statLabel}>Total Memories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.decisionCount}</Text>
              <Text style={styles.statLabel}>Decisions Logged</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.crisisCount}</Text>
              <Text style={styles.statLabel}>Challenges Overcome</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.wisdomCount}</Text>
              <Text style={styles.statLabel}>Wisdom Gained</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎓 Lessons You Keep Re-Learning</Text>
          {RECURRING_LESSONS.map((lesson, idx) => (
            <View key={idx} style={styles.lessonCard}>
              <Text style={styles.lessonIcon}>{lesson.icon}</Text>
              <View style={styles.lessonContent}>
                <Text style={styles.lessonText}>&quot;{lesson.lesson}&quot;</Text>
                <Text style={styles.lessonCategory}>{lesson.category}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Your Patterns</Text>
          {Object.entries(PATTERN_CATEGORIES).map(([key, category]) => (
            <View key={key} style={styles.patternCard}>
              <Text style={styles.patternIcon}>{category.icon}</Text>
              <View style={styles.patternContent}>
                <Text style={styles.patternTitle}>{category.title}</Text>
                {category.patterns.slice(0, 2).map((pattern, idx) => (
                  <Text key={idx} style={styles.patternItem}>• {pattern}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Your Wisest Insights</Text>
          {getTopWisdom().map((memory) => (
            <View key={memory.id} style={styles.wisdomCard}>
              <Text style={styles.wisdomQuote}>&quot;{memory.content.substring(0, 150)}...&quot;</Text>
              <Text style={styles.wisdomMeta}>
                You, {formatDate(memory.timestamp)} • {memory.context}
              </Text>
            </View>
          ))}
          {getTopWisdom().length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Keep logging your experiences. Your wisdom library will grow over time.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Memory Sources</Text>
          <View style={styles.sourcesGrid}>
            <View style={styles.sourceItem}>
              <Text style={styles.sourceIcon}>💭</Text>
              <Text style={styles.sourceLabel}>Decisions</Text>
              <Text style={styles.sourceCount}>{stats.decisionCount}</Text>
            </View>
            <View style={styles.sourceItem}>
              <Text style={styles.sourceIcon}>🆘</Text>
              <Text style={styles.sourceLabel}>Crisis Journal</Text>
              <Text style={styles.sourceCount}>{stats.crisisCount}</Text>
            </View>
            <View style={styles.sourceItem}>
              <Text style={styles.sourceIcon}>🧠</Text>
              <Text style={styles.sourceLabel}>Health Notes</Text>
              <Text style={styles.sourceCount}>
                {memories.filter((m) => m.source === 'health').length}
              </Text>
            </View>
            <View style={styles.sourceItem}>
              <Text style={styles.sourceIcon}>❤️</Text>
              <Text style={styles.sourceLabel}>Relationships</Text>
              <Text style={styles.sourceCount}>
                {memories.filter((m) => m.source === 'relationship').length}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={loadInsights}>
          <Text style={styles.refreshButtonText}>↻ Refresh Insights</Text>
        </TouchableOpacity>
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
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  lessonCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
  lessonIcon: { fontSize: 28, marginRight: 12 },
  lessonContent: { flex: 1 },
  lessonText: { fontSize: 15, color: '#212121', lineHeight: 20, marginBottom: 4 },
  lessonCategory: { fontSize: 12, color: '#757575' },
  patternCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8 },
  patternIcon: { fontSize: 28, marginRight: 12 },
  patternContent: { flex: 1 },
  patternTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  patternItem: { fontSize: 14, color: '#616161', marginBottom: 4 },
  wisdomCard: { backgroundColor: '#E3F2FD', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  wisdomQuote: { fontSize: 15, color: '#212121', lineHeight: 22, marginBottom: 8, fontStyle: 'italic' },
  wisdomMeta: { fontSize: 12, color: '#757575' },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#757575', textAlign: 'center' },
  sourcesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  sourceItem: { width: '50%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
  sourceIcon: { fontSize: 32, marginBottom: 8 },
  sourceLabel: { fontSize: 12, color: '#757575', marginBottom: 4 },
  sourceCount: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  refreshButton: { backgroundColor: '#4CAF50', marginHorizontal: 16, marginVertical: 24, padding: 16, borderRadius: 12, alignItems: 'center' },
  refreshButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
