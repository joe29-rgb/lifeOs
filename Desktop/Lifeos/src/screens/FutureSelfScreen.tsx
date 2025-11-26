/**
 * Future Self Screen
 * 5-year life projection dashboard
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { FutureSelfProjector } from '../modules/futureSelf/services/FutureSelfProjector';
import { ScenarioSimulator } from '../modules/futureSelf/services/ScenarioSimulator';
import { FutureProjection, LifeScenario } from '../modules/futureSelf/types/futureSelf.types';

const projector = new FutureSelfProjector();
const simulator = new ScenarioSimulator();

export function FutureSelfScreen({ navigation }: any) {
  const [projection, setProjection] = useState<FutureProjection | null>(null);
  const [scenarios, setScenarios] = useState<LifeScenario[]>([]);

  useEffect(() => {
    loadProjection();
  }, []);

  const loadProjection = async () => {
    const currentScores = {
      career: 7.2,
      health: 7.0,
      relationships: 8.2,
      mentalHealth: 7.0,
    };

    const futureProjection = await projector.generateProjection('user-id', currentScores);
    setProjection(futureProjection);

    const lifeScenarios = simulator.generateScenarios(currentScores);
    setScenarios(lifeScenarios);
  };

  const getTrajectoryIcon = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#F44336';
      default: return '#757575';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return '#4CAF50';
    if (score >= 7.0) return '#8BC34A';
    if (score >= 5.5) return '#FFC107';
    return '#F44336';
  };

  if (!projection) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔮 Your 5-Year Future</Text>
        <Text style={styles.subtitle}>Life projection based on current trajectory</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.projectionCard}>
          <Text style={styles.projectionTitle}>
            {getTrajectoryIcon(projection.trajectory)} Your 5-Year Future Self Preview
          </Text>
          <Text style={styles.projectionDate}>
            November {new Date().getFullYear() + 5}
          </Text>

          <View style={styles.scoreComparison}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>NOW</Text>
              <Text style={styles.scoreValue}>{projection.currentScore.toFixed(1)}/10</Text>
            </View>
            <Text style={styles.scoreArrow}>→</Text>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>5 YEARS</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(projection.projectedScore) }]}>
                {projection.projectedScore.toFixed(1)}/10
              </Text>
            </View>
          </View>

          <Text style={[styles.trajectoryText, { color: getTrajectoryColor(projection.trajectory) }]}>
            Trajectory: {projection.trajectory.toUpperCase()}
          </Text>
        </View>

        <View style={styles.pillarsSection}>
          <Text style={styles.sectionTitle}>📊 Pillar Projections</Text>

          {Object.entries(projection.pillars).map(([key, pillar]) => (
            <View key={key} style={styles.pillarCard}>
              <View style={styles.pillarHeader}>
                <Text style={styles.pillarName}>{pillar.pillarName}</Text>
                <Text style={[styles.pillarTrend, { color: getTrajectoryColor(pillar.trend) }]}>
                  {getTrajectoryIcon(pillar.trend)} {pillar.trend}
                </Text>
              </View>
              <View style={styles.pillarScores}>
                <Text style={styles.pillarScore}>
                  Current: {pillar.currentScore.toFixed(1)}/10
                </Text>
                <Text style={[styles.pillarScore, { color: getScoreColor(pillar.projectedScore) }]}>
                  Projected: {pillar.projectedScore.toFixed(1)}/10
                </Text>
              </View>
              {pillar.details.map((detail, idx) => (
                <Text key={idx} style={styles.pillarDetail}>• {detail}</Text>
              ))}
            </View>
          ))}
        </View>

        {projection.warnings.length > 0 && (
          <View style={styles.warningsSection}>
            <Text style={styles.sectionTitle}>⚠️ Warning Signs</Text>
            {projection.warnings.map((warning) => (
              <View key={warning.id} style={styles.warningCard}>
                <Text style={styles.warningTitle}>{warning.title}</Text>
                <Text style={styles.warningDescription}>{warning.description}</Text>
                <Text style={styles.warningConsequence}>If ignored: {warning.consequence}</Text>
                <View style={styles.preventionSection}>
                  <Text style={styles.preventionTitle}>Prevention:</Text>
                  {warning.preventionSteps.map((step, idx) => (
                    <Text key={idx} style={styles.preventionStep}>✓ {step}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {projection.opportunities.length > 0 && (
          <View style={styles.opportunitiesSection}>
            <Text style={styles.sectionTitle}>✨ Opportunities</Text>
            {projection.opportunities.map((opp) => (
              <View key={opp.id} style={styles.opportunityCard}>
                <Text style={styles.opportunityTitle}>{opp.title}</Text>
                <Text style={styles.opportunityDescription}>{opp.description}</Text>
                <Text style={styles.opportunityImpact}>
                  Potential impact: +{opp.potentialImpact.toFixed(1)} points
                </Text>
                <View style={styles.stepsSection}>
                  <Text style={styles.stepsTitle}>Action steps:</Text>
                  {opp.steps.map((step, idx) => (
                    <Text key={idx} style={styles.step}>• {step}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.scenariosSection}>
          <Text style={styles.sectionTitle}>🎮 Life Scenario Simulator</Text>
          <Text style={styles.scenariosSubtitle}>Explore alternative futures</Text>

          {scenarios.map((scenario) => (
            <View key={scenario.id} style={styles.scenarioCard}>
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioName}>{scenario.name}</Text>
                <Text style={[styles.scenarioScore, { color: getScoreColor(scenario.projectedScore) }]}>
                  {scenario.projectedScore}/10
                </Text>
              </View>
              <Text style={styles.scenarioDescription}>{scenario.description}</Text>

              <View style={styles.scenarioPillars}>
                {Object.entries(scenario.pillars).map(([key, value]) => (
                  <View key={key} style={styles.scenarioPillar}>
                    <Text style={styles.scenarioPillarName}>{key}</Text>
                    <Text style={styles.scenarioPillarValue}>{value.toFixed(1)}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.prosConsSection}>
                <View style={styles.prosSection}>
                  <Text style={styles.prosTitle}>Pros:</Text>
                  {scenario.pros.map((pro, idx) => (
                    <Text key={idx} style={styles.proText}>✓ {pro}</Text>
                  ))}
                </View>
                <View style={styles.consSection}>
                  <Text style={styles.consTitle}>Cons:</Text>
                  {scenario.cons.map((con, idx) => (
                    <Text key={idx} style={styles.conText}>✗ {con}</Text>
                  ))}
                </View>
              </View>

              <Text style={styles.scenarioRecommendation}>{scenario.recommendation}</Text>
            </View>
          ))}
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
  projectionCard: { backgroundColor: '#E3F2FD', margin: 16, padding: 20, borderRadius: 12, alignItems: 'center' },
  projectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 8, textAlign: 'center' },
  projectionDate: { fontSize: 14, color: '#757575', marginBottom: 16 },
  scoreComparison: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  scoreCol: { alignItems: 'center' },
  scoreLabel: { fontSize: 12, color: '#757575', marginBottom: 4 },
  scoreValue: { fontSize: 32, fontWeight: 'bold', color: '#212121' },
  scoreArrow: { fontSize: 32, marginHorizontal: 20, color: '#757575' },
  trajectoryText: { fontSize: 16, fontWeight: 'bold' },
  pillarsSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginLeft: 16, marginBottom: 12 },
  pillarCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  pillarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pillarName: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  pillarTrend: { fontSize: 14, fontWeight: 'bold' },
  pillarScores: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  pillarScore: { fontSize: 14, color: '#616161' },
  pillarDetail: { fontSize: 14, color: '#757575', marginBottom: 4 },
  warningsSection: { marginBottom: 16 },
  warningCard: { backgroundColor: '#FFEBEE', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  warningTitle: { fontSize: 16, fontWeight: 'bold', color: '#D32F2F', marginBottom: 8 },
  warningDescription: { fontSize: 14, color: '#616161', marginBottom: 8 },
  warningConsequence: { fontSize: 14, color: '#F44336', fontStyle: 'italic', marginBottom: 12 },
  preventionSection: { marginTop: 8 },
  preventionTitle: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  preventionStep: { fontSize: 14, color: '#616161', marginBottom: 2 },
  opportunitiesSection: { marginBottom: 16 },
  opportunityCard: { backgroundColor: '#E8F5E9', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  opportunityTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  opportunityDescription: { fontSize: 14, color: '#616161', marginBottom: 8 },
  opportunityImpact: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  stepsSection: { marginTop: 8 },
  stepsTitle: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  step: { fontSize: 14, color: '#616161', marginBottom: 2 },
  scenariosSection: { marginBottom: 24 },
  scenariosSubtitle: { fontSize: 14, color: '#757575', marginLeft: 16, marginBottom: 12 },
  scenarioCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  scenarioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  scenarioName: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  scenarioScore: { fontSize: 20, fontWeight: 'bold' },
  scenarioDescription: { fontSize: 14, color: '#616161', marginBottom: 12 },
  scenarioPillars: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  scenarioPillar: { alignItems: 'center' },
  scenarioPillarName: { fontSize: 12, color: '#757575', marginBottom: 4 },
  scenarioPillarValue: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  prosConsSection: { flexDirection: 'row', marginBottom: 12 },
  prosSection: { flex: 1, marginRight: 8 },
  consSection: { flex: 1, marginLeft: 8 },
  prosTitle: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4 },
  consTitle: { fontSize: 14, fontWeight: 'bold', color: '#F44336', marginBottom: 4 },
  proText: { fontSize: 12, color: '#616161', marginBottom: 2 },
  conText: { fontSize: 12, color: '#616161', marginBottom: 2 },
  scenarioRecommendation: { fontSize: 14, fontWeight: 'bold', color: '#2196F3', fontStyle: 'italic' },
});
