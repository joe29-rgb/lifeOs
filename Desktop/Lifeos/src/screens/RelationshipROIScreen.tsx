/**
 * Relationship ROI Screen
 * Main ROI dashboard
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ROICalculator } from '../modules/relationshipROI/services/ROICalculator';
import { EnergyVampireDetector } from '../modules/relationshipROI/services/EnergyVampireDetector';
import { SupportTracker } from '../modules/relationshipROI/services/SupportTracker';
import { InvestmentAdvisor } from '../modules/relationshipROI/services/InvestmentAdvisor';
import { ROIScore, EnergyVampire } from '../modules/relationshipROI/types/relationshipROI.types';

const roiCalculator = new ROICalculator();
const vampireDetector = new EnergyVampireDetector();
const supportTracker = new SupportTracker();
const investmentAdvisor = new InvestmentAdvisor();

export function RelationshipROIScreen({ navigation }: any) {
  const [highROI, setHighROI] = useState<ROIScore[]>([]);
  const [mediumROI, setMediumROI] = useState<ROIScore[]>([]);
  const [lowROI, setLowROI] = useState<ROIScore[]>([]);
  const [vampires, setVampires] = useState<EnergyVampire[]>([]);
  const [portfolioScore, setPortfolioScore] = useState(0);

  useEffect(() => {
    loadROIData();
  }, []);

  const loadROIData = async () => {
    const allScores = await roiCalculator.getRankedRelationships();

    const high = allScores.filter((s) => s.category === 'high');
    const medium = allScores.filter((s) => s.category === 'good' || s.category === 'medium');
    const low = allScores.filter((s) => s.category === 'low' || s.category === 'negative');

    setHighROI(high);
    setMediumROI(medium);
    setLowROI(low);

    const detectedVampires: EnergyVampire[] = [];
    for (const score of allScores) {
      const balance = await supportTracker.getSupportBalance(score.personId);
      if (balance && score.energyImpact < -10) {
        const energyImpact = {
          personId: score.personId,
          personName: score.personName,
          impact: score.energyImpact,
          moodChange: score.energyImpact / 10,
          interactions: 10,
          avoidanceCount: Math.floor(Math.random() * 5),
          pattern: 'drainer' as const,
          evidence: [],
        };

        const vampire = vampireDetector.detectVampire(
          score.personId,
          score.personName,
          score.joy,
          energyImpact,
          balance.ratio
        );

        if (vampire) {
          detectedVampires.push(vampire);
        }
      }
    }
    setVampires(detectedVampires);

    const avgROI = allScores.reduce((sum, s) => sum + s.overall, 0) / Math.max(1, allScores.length);
    setPortfolioScore(Math.round(avgROI));
  };

  const getROIColor = (roi: number) => {
    if (roi >= 80) return '#4CAF50';
    if (roi >= 60) return '#8BC34A';
    if (roi >= 40) return '#FFC107';
    if (roi >= 20) return '#FF9800';
    return '#F44336';
  };

  const getROIIcon = (category: ROIScore['category']) => {
    switch (category) {
      case 'high': return '⭐';
      case 'good': return '✅';
      case 'medium': return '⚠️';
      case 'low': return '⬇️';
      case 'negative': return '🚨';
    }
  };

  const handlePersonPress = (personId: string) => {
    navigation.navigate('PersonROI', { personId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💎 Relationship ROI</Text>
        <Text style={styles.subtitle}>Your Relationship Portfolio</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioTitle}>Portfolio Health</Text>
          <Text style={styles.portfolioScore}>{portfolioScore}/100</Text>
          <View style={styles.portfolioMeter}>
            <View
              style={[
                styles.portfolioFill,
                { width: `${portfolioScore}%`, backgroundColor: getROIColor(portfolioScore) },
              ]}
            />
          </View>
          <Text style={styles.portfolioStats}>
            High ROI: {highROI.length} • Medium: {mediumROI.length} • Low: {lowROI.length}
          </Text>
        </View>

        {vampires.length > 0 && (
          <View style={styles.vampireSection}>
            <Text style={styles.vampireTitle}>🧛 Energy Vampire Alert</Text>
            {vampires.map((vampire) => (
              <TouchableOpacity
                key={vampire.personId}
                style={styles.vampireCard}
                onPress={() => handlePersonPress(vampire.personId)}
              >
                <Text style={styles.vampireName}>{vampire.personName}</Text>
                <Text style={styles.vampireSeverity}>
                  Severity: {vampire.severity.toUpperCase()}
                </Text>
                <Text style={styles.vampireImpact}>Energy: {vampire.energyImpact}%</Text>
                <Text style={styles.vampireEvidence}>
                  {vampire.evidence.slice(0, 2).join(' • ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {highROI.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HIGH ROI (Invest More!) ⭐</Text>
            {highROI.map((score) => (
              <TouchableOpacity
                key={score.personId}
                style={styles.roiCard}
                onPress={() => handlePersonPress(score.personId)}
              >
                <View style={styles.roiHeader}>
                  <Text style={styles.roiName}>{score.personName}</Text>
                  <Text style={[styles.roiScore, { color: getROIColor(score.overall) }]}>
                    {score.overall}%
                  </Text>
                </View>
                <View style={styles.roiMeter}>
                  <View
                    style={[
                      styles.roiFill,
                      { width: `${score.overall}%`, backgroundColor: getROIColor(score.overall) },
                    ]}
                  />
                </View>
                <Text style={styles.roiStats}>
                  Joy: {score.joy}/10 • Energy: {score.energyImpact > 0 ? '+' : ''}{score.energyImpact}%
                </Text>
                <View style={styles.roiActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Schedule Time</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Send Thanks</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {mediumROI.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MEDIUM ROI (Maintain)</Text>
            {mediumROI.map((score) => (
              <TouchableOpacity
                key={score.personId}
                style={styles.roiCard}
                onPress={() => handlePersonPress(score.personId)}
              >
                <View style={styles.roiHeader}>
                  <Text style={styles.roiName}>{score.personName}</Text>
                  <Text style={[styles.roiScore, { color: getROIColor(score.overall) }]}>
                    {score.overall}%
                  </Text>
                </View>
                <View style={styles.roiMeter}>
                  <View
                    style={[
                      styles.roiFill,
                      { width: `${score.overall}%`, backgroundColor: getROIColor(score.overall) },
                    ]}
                  />
                </View>
                <Text style={styles.roiStats}>
                  Joy: {score.joy}/10 • Energy: {score.energyImpact > 0 ? '+' : ''}{score.energyImpact}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {lowROI.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LOW ROI (Reconsider) ⚠️</Text>
            {lowROI.map((score) => (
              <TouchableOpacity
                key={score.personId}
                style={[styles.roiCard, styles.lowROICard]}
                onPress={() => handlePersonPress(score.personId)}
              >
                <View style={styles.roiHeader}>
                  <Text style={styles.roiName}>{score.personName}</Text>
                  <Text style={[styles.roiScore, { color: getROIColor(score.overall) }]}>
                    {score.overall}%
                  </Text>
                </View>
                <View style={styles.roiMeter}>
                  <View
                    style={[
                      styles.roiFill,
                      { width: `${score.overall}%`, backgroundColor: getROIColor(score.overall) },
                    ]}
                  />
                </View>
                <Text style={styles.roiStats}>
                  Joy: {score.joy}/10 • Energy: {score.energyImpact}%
                </Text>
                <View style={styles.roiActions}>
                  <TouchableOpacity style={[styles.actionButton, styles.warningButton]}>
                    <Text style={styles.actionButtonText}>Reduce Time</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.warningButton]}>
                    <Text style={styles.actionButtonText}>Set Boundaries</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.investmentButton}
          onPress={() => navigation.navigate('Investment')}
        >
          <Text style={styles.investmentButtonText}>📊 View Investment Recommendations</Text>
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
  portfolioCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 12, alignItems: 'center' },
  portfolioTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  portfolioScore: { fontSize: 48, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  portfolioMeter: { width: '100%', height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  portfolioFill: { height: '100%', borderRadius: 6 },
  portfolioStats: { fontSize: 14, color: '#757575' },
  vampireSection: { marginHorizontal: 16, marginBottom: 16 },
  vampireTitle: { fontSize: 18, fontWeight: 'bold', color: '#F44336', marginBottom: 12 },
  vampireCard: { backgroundColor: '#FFEBEE', padding: 16, borderRadius: 12, marginBottom: 12 },
  vampireName: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  vampireSeverity: { fontSize: 14, color: '#F44336', fontWeight: 'bold', marginBottom: 4 },
  vampireImpact: { fontSize: 14, color: '#616161', marginBottom: 8 },
  vampireEvidence: { fontSize: 12, color: '#757575' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginLeft: 16, marginBottom: 12 },
  roiCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  lowROICard: { borderLeftWidth: 4, borderLeftColor: '#F44336' },
  roiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  roiName: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  roiScore: { fontSize: 18, fontWeight: 'bold' },
  roiMeter: { width: '100%', height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  roiFill: { height: '100%', borderRadius: 4 },
  roiStats: { fontSize: 14, color: '#757575', marginBottom: 12 },
  roiActions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, backgroundColor: '#2196F3', padding: 10, borderRadius: 8, alignItems: 'center' },
  warningButton: { backgroundColor: '#FF9800' },
  actionButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  investmentButton: { backgroundColor: '#4CAF50', marginHorizontal: 16, marginBottom: 24, padding: 16, borderRadius: 12, alignItems: 'center' },
  investmentButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
