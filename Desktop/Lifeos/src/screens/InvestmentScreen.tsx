/**
 * Investment Screen
 * Time allocation recommendations
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { InvestmentAdvisor } from '../modules/relationshipROI/services/InvestmentAdvisor';
import { InvestmentRecommendation, TimeAllocation } from '../modules/relationshipROI/types/relationshipROI.types';
import { INVESTMENT_ACTIONS } from '../modules/relationshipROI/constants/relationshipROI.constants';

const investmentAdvisor = new InvestmentAdvisor();

export function InvestmentScreen() {
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([]);
  const [allocations, setAllocations] = useState<TimeAllocation[]>([]);
  const [potentialImprovement, setPotentialImprovement] = useState(0);

  useEffect(() => {
    loadInvestmentData();
  }, []);

  const loadInvestmentData = async () => {
    const recs = await investmentAdvisor.generateRecommendations();
    setRecommendations(recs);

    const allocs = await investmentAdvisor.getTimeAllocations();
    setAllocations(allocs);

    const improvement = await investmentAdvisor.calculatePortfolioImprovement();
    setPotentialImprovement(improvement);
  };

  const getActionIcon = (action: InvestmentRecommendation['action']) => {
    return INVESTMENT_ACTIONS[action].icon;
  };

  const getActionColor = (action: InvestmentRecommendation['action']) => {
    switch (action) {
      case 'increase': return '#4CAF50';
      case 'maintain': return '#2196F3';
      case 'decrease': return '#FF9800';
    }
  };

  const increaseRecs = recommendations.filter((r) => r.action === 'increase');
  const maintainRecs = recommendations.filter((r) => r.action === 'maintain');
  const decreaseRecs = recommendations.filter((r) => r.action === 'decrease');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Investment Recommendations</Text>
        <Text style={styles.subtitle}>Based on ROI analysis</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.improvementCard}>
          <Text style={styles.improvementTitle}>Potential Improvement</Text>
          <Text style={styles.improvementValue}>+{potentialImprovement}%</Text>
          <Text style={styles.improvementNote}>
            By following these recommendations, you could improve your overall relationship satisfaction by ~{potentialImprovement}%
          </Text>
        </View>

        {increaseRecs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getActionIcon('increase')} INCREASE Investment
            </Text>
            {increaseRecs.map((rec) => (
              <View key={rec.personId} style={[styles.recCard, { borderLeftColor: getActionColor('increase') }]}>
                <Text style={styles.recName}>{rec.personName}</Text>
                <Text style={styles.recROI}>ROI: {rec.currentROI}%</Text>
                <Text style={styles.recTime}>
                  {rec.currentHours}hrs → {rec.suggestedHours}hrs (+{rec.suggestedHours - rec.currentHours}hrs)
                </Text>
                <View style={styles.reasoningSection}>
                  <Text style={styles.reasoningTitle}>Why:</Text>
                  {rec.reasoning.map((reason, idx) => (
                    <Text key={idx} style={styles.reasoningText}>• {reason}</Text>
                  ))}
                </View>
                <Text style={styles.recImpact}>Potential impact: +{rec.potentialImpact}%</Text>
              </View>
            ))}
          </View>
        )}

        {maintainRecs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getActionIcon('maintain')} MAINTAIN Investment
            </Text>
            {maintainRecs.map((rec) => (
              <View key={rec.personId} style={[styles.recCard, { borderLeftColor: getActionColor('maintain') }]}>
                <Text style={styles.recName}>{rec.personName}</Text>
                <Text style={styles.recROI}>ROI: {rec.currentROI}%</Text>
                <Text style={styles.recTime}>
                  Current: {rec.currentHours}hrs/week (keep it)
                </Text>
                <View style={styles.reasoningSection}>
                  <Text style={styles.reasoningTitle}>Why:</Text>
                  {rec.reasoning.map((reason, idx) => (
                    <Text key={idx} style={styles.reasoningText}>• {reason}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {decreaseRecs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getActionIcon('decrease')} DECREASE Investment
            </Text>
            {decreaseRecs.map((rec) => (
              <View key={rec.personId} style={[styles.recCard, { borderLeftColor: getActionColor('decrease') }]}>
                <Text style={styles.recName}>{rec.personName}</Text>
                <Text style={styles.recROI}>ROI: {rec.currentROI}%</Text>
                <Text style={styles.recTime}>
                  {rec.currentHours}hrs → {rec.suggestedHours}hrs (-{rec.currentHours - rec.suggestedHours}hrs)
                </Text>
                <View style={styles.reasoningSection}>
                  <Text style={styles.reasoningTitle}>Why:</Text>
                  {rec.reasoning.map((reason, idx) => (
                    <Text key={idx} style={styles.reasoningText}>• {reason}</Text>
                  ))}
                </View>
                <Text style={styles.recImpact}>Potential impact: +{rec.potentialImpact}%</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Weekly Time Allocation</Text>
          <View style={styles.allocationCard}>
            <Text style={styles.allocationTitle}>Suggested Weekly Hours:</Text>
            {allocations.map((alloc) => (
              <View key={alloc.personId} style={styles.allocationRow}>
                <Text style={styles.allocationName}>{alloc.personName}</Text>
                <Text style={styles.allocationHours}>
                  {alloc.suggestedHours}hrs
                  {alloc.change !== 0 && (
                    <Text style={[styles.allocationChange, { color: alloc.change > 0 ? '#4CAF50' : '#FF9800' }]}>
                      {' '}({alloc.change > 0 ? '+' : ''}{alloc.change}hrs)
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>✅ Apply Suggestions</Text>
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
  improvementCard: { backgroundColor: '#E8F5E9', margin: 16, padding: 20, borderRadius: 12, alignItems: 'center' },
  improvementTitle: { fontSize: 16, color: '#757575', marginBottom: 8 },
  improvementValue: { fontSize: 48, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  improvementNote: { fontSize: 14, color: '#616161', textAlign: 'center' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginLeft: 16, marginBottom: 12 },
  recCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4 },
  recName: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  recROI: { fontSize: 14, color: '#757575', marginBottom: 4 },
  recTime: { fontSize: 16, fontWeight: 'bold', color: '#2196F3', marginBottom: 12 },
  reasoningSection: { marginBottom: 12 },
  reasoningTitle: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  reasoningText: { fontSize: 14, color: '#616161', marginBottom: 2 },
  recImpact: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold' },
  allocationCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  allocationTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  allocationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  allocationName: { fontSize: 14, color: '#212121' },
  allocationHours: { fontSize: 14, fontWeight: 'bold', color: '#212121' },
  allocationChange: { fontSize: 14, fontWeight: 'bold' },
  applyButton: { backgroundColor: '#4CAF50', marginHorizontal: 16, marginBottom: 24, padding: 16, borderRadius: 12, alignItems: 'center' },
  applyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
