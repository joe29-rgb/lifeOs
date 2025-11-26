/**
 * Person ROI Screen
 * Individual relationship analysis
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ROICalculator } from '../modules/relationshipROI/services/ROICalculator';
import { SupportTracker } from '../modules/relationshipROI/services/SupportTracker';
import { TrendAnalyzer } from '../modules/relationshipROI/services/TrendAnalyzer';
import { GratitudeEngine } from '../modules/relationshipROI/services/GratitudeEngine';
import { ROIScore, SupportBalance, RelationshipTrend } from '../modules/relationshipROI/types/relationshipROI.types';
import { ROI_INSIGHTS } from '../modules/relationshipROI/constants/relationshipROI.constants';

const roiCalculator = new ROICalculator();
const supportTracker = new SupportTracker();
const trendAnalyzer = new TrendAnalyzer();
const gratitudeEngine = new GratitudeEngine();

export function PersonROIScreen({ route }: any) {
  const { personId } = route.params;
  const [roi, setROI] = useState<ROIScore | null>(null);
  const [support, setSupport] = useState<SupportBalance | null>(null);
  const [trend, setTrend] = useState<RelationshipTrend | null>(null);

  useEffect(() => {
    loadPersonData();
  }, [personId]);

  const loadPersonData = async () => {
    const roiScore = await roiCalculator.getROIForPerson(personId);
    setROI(roiScore);

    const supportBalance = await supportTracker.getSupportBalance(personId);
    setSupport(supportBalance);

    const relationshipTrend = await trendAnalyzer.getTrend(personId);
    setTrend(relationshipTrend);
  };

  const handleSendGratitude = async () => {
    if (!roi || !support) return;

    const recentMoments = support.history
      .filter((e) => e.type === 'received')
      .slice(-3)
      .map((e) => e.description);

    const prompt = await gratitudeEngine.checkForGratitudePrompt(roi, support, recentMoments);
    
    if (prompt) {
      await gratitudeEngine.markAppreciationSent(personId);
      alert(`Message sent: ${prompt.suggestedMessage}`);
    }
  };

  if (!roi) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const insight = ROI_INSIGHTS[roi.category];
  const getROIColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    if (score >= 20) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>❤️ {roi.personName}</Text>
        <Text style={styles.subtitle}>Relationship Analysis</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.overallCard}>
          <Text style={styles.overallTitle}>Overall ROI: {roi.overall}%</Text>
          <Text style={[styles.overallCategory, { color: getROIColor(roi.overall) }]}>
            {insight.title}
          </Text>
          <View style={styles.overallMeter}>
            <View
              style={[
                styles.overallFill,
                { width: `${roi.overall}%`, backgroundColor: getROIColor(roi.overall) },
              ]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Metrics Breakdown</Text>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Joy Score</Text>
            <Text style={styles.metricValue}>{roi.joy}/10</Text>
            <Text style={styles.metricNote}>
              {roi.joy >= 8 ? '✓ Consistently happy after talking' : roi.joy >= 6 ? 'Generally positive' : 'Low joy from interactions'}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Energy Impact</Text>
            <Text style={[styles.metricValue, { color: roi.energyImpact > 0 ? '#4CAF50' : '#F44336' }]}>
              {roi.energyImpact > 0 ? '+' : ''}{roi.energyImpact}%
            </Text>
            <Text style={styles.metricNote}>
              {roi.energyImpact > 20 ? '✓ Always leaves you energized' : roi.energyImpact > 0 ? 'Slightly energizing' : 'Drains your energy'}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Support Balance</Text>
            <Text style={styles.metricValue}>{support?.ratio.toFixed(1) || 'N/A'}</Text>
            <Text style={styles.metricNote}>
              Given: {support?.given || 0} • Received: {support?.received || 0}
            </Text>
            <Text style={styles.metricStatus}>
              {support?.status === 'reciprocal' ? '✅ Healthy, nearly equal' : 
               support?.status === 'give_more' ? '⚠️ You give more' : 
               support?.status === 'receive_more' ? '✅ You receive more' : 
               '🚨 Severely imbalanced'}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Growth Impact</Text>
            <Text style={styles.metricValue}>{roi.growthImpact}/10</Text>
            <Text style={styles.metricNote}>
              {roi.growthImpact >= 7 ? '✓ Challenges you intellectually' : roi.growthImpact >= 5 ? 'Some growth' : 'Limited growth impact'}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Reliability</Text>
            <Text style={styles.metricValue}>{roi.reliability}/10</Text>
            <Text style={styles.metricNote}>
              {roi.reliability >= 8 ? '✓ Shows up when needed: 95%' : roi.reliability >= 6 ? 'Generally reliable' : 'Inconsistent'}
            </Text>
          </View>
        </View>

        {trend && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Trend Analysis</Text>
            <View style={styles.trendCard}>
              <Text style={styles.trendLabel}>6-Month Trend:</Text>
              <Text style={[
                styles.trendValue,
                { color: trend.trend === 'improving' ? '#4CAF50' : trend.trend === 'declining' ? '#F44336' : '#757575' }
              ]}>
                {trend.trend === 'improving' ? '↑ Improving' : trend.trend === 'declining' ? '↓ Declining' : '→ Stable'}
              </Text>
              <Text style={styles.trendInsight}>{trend.insight}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>{insight.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {insight.recommendations.map((rec, idx) => (
            <View key={idx} style={styles.recommendationCard}>
              <Text style={styles.recommendationText}>• {rec}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSendGratitude}>
            <Text style={styles.actionButtonText}>💝 Send Appreciation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📅 Schedule Time</Text>
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
  overallCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 12, alignItems: 'center' },
  overallTitle: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  overallCategory: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  overallMeter: { width: '100%', height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, overflow: 'hidden' },
  overallFill: { height: '100%', borderRadius: 6 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginLeft: 16, marginBottom: 12 },
  metricCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  metricLabel: { fontSize: 14, color: '#757575', marginBottom: 4 },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  metricNote: { fontSize: 14, color: '#616161', marginBottom: 4 },
  metricStatus: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold' },
  trendCard: { backgroundColor: '#E3F2FD', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  trendLabel: { fontSize: 14, color: '#757575', marginBottom: 4 },
  trendValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  trendInsight: { fontSize: 14, color: '#616161' },
  insightCard: { backgroundColor: '#FFF3E0', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  insightText: { fontSize: 14, color: '#616161', lineHeight: 20 },
  recommendationCard: { backgroundColor: '#E8F5E9', marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 8 },
  recommendationText: { fontSize: 14, color: '#212121' },
  actions: { padding: 16, gap: 12 },
  actionButton: { backgroundColor: '#2196F3', padding: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
