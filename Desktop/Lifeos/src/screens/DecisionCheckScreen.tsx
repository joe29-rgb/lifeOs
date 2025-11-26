/**
 * Decision Check Screen
 * Pre-decision analysis and warnings
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RedFlagDetector } from '../modules/regretMinimizer/services/RedFlagDetector';
import { RegretCalculator } from '../modules/regretMinimizer/services/RegretCalculator';
import { RegretAnalyzer } from '../modules/regretMinimizer/services/RegretAnalyzer';
import { RedFlag, SimilarDecision } from '../modules/regretMinimizer/types/regretMinimizer.types';
import { ESSENTIAL_QUESTIONS } from '../modules/regretMinimizer/constants/regretMinimizer.constants';

const redFlagDetector = new RedFlagDetector();
const regretCalculator = new RegretCalculator();
const regretAnalyzer = new RegretAnalyzer();

interface DecisionCheckScreenProps {
  route: {
    params: {
      decision: string;
      category: string;
      confidence: number;
    };
  };
  navigation: any;
}

export function DecisionCheckScreen({ route, navigation }: DecisionCheckScreenProps) {
  const { decision, category, confidence } = route.params;
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [similarDecisions, setSimilarDecisions] = useState<SimilarDecision[]>([]);
  const [regretProbability, setRegretProbability] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [recommendation, setRecommendation] = useState<'proceed' | 'caution' | 'delay' | 'decline'>('proceed');
  const [checklistCompleted, setChecklistCompleted] = useState(0);
  const [gutAccuracy, setGutAccuracy] = useState(0);

  useEffect(() => {
    analyzeDecision();
  }, []);

  const analyzeDecision = async () => {
    const context = {
      salaryIncrease: 35,
      askedAboutCulture: false,
      askedAboutWorkLife: false,
      timeConsidering: 2,
      deadline: 24,
    };

    const flags = await redFlagDetector.detectRedFlags(decision, category, context);
    setRedFlags(flags);

    const similar = await redFlagDetector.findSimilarDecisions(decision, category);
    setSimilarDecisions(similar);

    const riskFactors = {
      rushing: context.deadline < 48,
      moneyMotivated: context.salaryIncrease > 30,
      ignoringGut: false,
      vagueAnswers: !context.askedAboutCulture,
      stressed: false,
      poorSleep: false,
    };

    const protectiveFactors = {
      goodSleep: true,
      talkedToSomeone: false,
      didResearch: true,
      completedChecklist: false,
      trustedGut: false,
    };

    const probability = regretCalculator.calculateRegretProbability(riskFactors, protectiveFactors);
    setRegretProbability(probability);

    const risk = regretCalculator.calculateRiskScore(
      flags.length,
      similar.length > 0 ? similar[0].matchScore : 0,
      false
    );
    setRiskScore(risk);

    const rec = regretCalculator.getRecommendation(probability, flags.length);
    setRecommendation(rec);

    const gutStats = await regretAnalyzer.getGutCheckAccuracy();
    setGutAccuracy(gutStats.trustAccuracy);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      default: return '#2196F3';
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 85) return '#F44336';
    if (prob >= 70) return '#FF9800';
    if (prob >= 50) return '#FFC107';
    return '#4CAF50';
  };

  const getRecommendationText = () => {
    switch (recommendation) {
      case 'decline':
        return '🚨 RECOMMENDATION: DECLINE\nThis decision has the highest regret risk.';
      case 'delay':
        return '⏰ RECOMMENDATION: DELAY\nThis needs more time and consideration.';
      case 'caution':
        return '⚠️ RECOMMENDATION: PROCEED WITH CAUTION\nAddress red flags before committing.';
      default:
        return '✅ RECOMMENDATION: PROCEED\nLow risk detected.';
    }
  };

  const handleProceedAnyway = () => {
    Alert.alert(
      'Are you sure?',
      `Regret probability: ${regretProbability}%\n${redFlags.length} red flags detected`,
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🚨 Decision Analysis</Text>
        <Text style={styles.subtitle}>&quot;{decision}&quot;</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.probabilityCard, { borderLeftColor: getProbabilityColor(regretProbability) }]}>
          <Text style={styles.probabilityTitle}>Regret Probability</Text>
          <Text style={[styles.probabilityValue, { color: getProbabilityColor(regretProbability) }]}>
            {regretProbability}%
          </Text>
          <Text style={styles.probabilityLabel}>Risk Score: {riskScore}/100</Text>
        </View>

        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationText}>{getRecommendationText()}</Text>
        </View>

        {redFlags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Red Flags Detected ({redFlags.length})</Text>
            {redFlags.map((flag) => (
              <View key={flag.id} style={[styles.flagCard, { borderLeftColor: getSeverityColor(flag.severity) }]}>
                <Text style={styles.flagDescription}>{flag.description}</Text>
                <Text style={styles.flagSeverity}>{flag.severity.toUpperCase()}</Text>
                {flag.basedOnRegret && (
                  <Text style={styles.flagNote}>Based on past regret</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {similarDecisions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Similar Past Decisions</Text>
            {similarDecisions.map((similar) => (
              <View key={similar.id} style={styles.similarCard}>
                <Text style={styles.similarDecision}>{similar.decision}</Text>
                <Text style={styles.similarDate}>
                  {new Date(similar.date).toLocaleDateString()}
                </Text>
                <Text style={styles.similarOutcome}>
                  Outcome: {similar.outcome.toUpperCase()}
                  {similar.regretIntensity && ` (${similar.regretIntensity}/10)`}
                </Text>
                {similar.whatWentWrong && (
                  <Text style={styles.similarWrong}>What went wrong: {similar.whatWentWrong}</Text>
                )}
                <Text style={styles.similarMatch}>Match: {Math.round(similar.matchScore * 100)}%</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Essential Questions</Text>
          <Text style={styles.checklistNote}>
            Based on past regrets, you should ask:
          </Text>
          {ESSENTIAL_QUESTIONS[category as keyof typeof ESSENTIAL_QUESTIONS]?.slice(0, 6).map((item, idx) => (
            <View key={idx} style={styles.checklistItem}>
              <Text style={styles.checklistQuestion}>☐ {item.question}</Text>
              <Text style={styles.checklistImportance}>{item.importance}</Text>
            </View>
          ))}
          <Text style={styles.checklistScore}>
            Completed: {checklistCompleted}/{ESSENTIAL_QUESTIONS[category as keyof typeof ESSENTIAL_QUESTIONS]?.length || 0}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Gut Check</Text>
          <View style={styles.gutCard}>
            <Text style={styles.gutText}>
              Your gut feeling accuracy: {Math.round(gutAccuracy)}%
            </Text>
            <Text style={styles.gutNote}>
              You tend to make better decisions when you trust your gut.
            </Text>
            <Text style={styles.gutQuestion}>What does your gut say about this?</Text>
            <View style={styles.gutButtons}>
              <TouchableOpacity style={styles.gutButton}>
                <Text style={styles.gutButtonText}>Something feels off</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.gutButton}>
                <Text style={styles.gutButtonText}>I&apos;m excited</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.delayButton}
            onPress={() => Alert.alert('Sleep On It', 'Decision delayed for 24 hours')}
          >
            <Text style={styles.delayButtonText}>🌙 Sleep On It</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pastYouButton}
            onPress={() => navigation.navigate('PastYou')}
          >
            <Text style={styles.pastYouButtonText}>💭 Ask Past You</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceedAnyway}
          >
            <Text style={styles.proceedButtonText}>Proceed Anyway</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { fontSize: 16, color: '#4CAF50', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  subtitle: { fontSize: 14, color: '#757575', marginTop: 4 },
  scrollView: { flex: 1 },
  probabilityCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 12, borderLeftWidth: 4, alignItems: 'center' },
  probabilityTitle: { fontSize: 16, color: '#757575', marginBottom: 8 },
  probabilityValue: { fontSize: 48, fontWeight: 'bold', marginBottom: 4 },
  probabilityLabel: { fontSize: 14, color: '#757575' },
  recommendationCard: { backgroundColor: '#FFF3E0', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12 },
  recommendationText: { fontSize: 15, color: '#212121', lineHeight: 22, textAlign: 'center' },
  section: { marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  flagCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8, borderLeftWidth: 4 },
  flagDescription: { fontSize: 15, color: '#212121', marginBottom: 4 },
  flagSeverity: { fontSize: 12, fontWeight: 'bold', color: '#F44336', marginBottom: 4 },
  flagNote: { fontSize: 12, color: '#757575', fontStyle: 'italic' },
  similarCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  similarDecision: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  similarDate: { fontSize: 12, color: '#757575', marginBottom: 8 },
  similarOutcome: { fontSize: 14, color: '#616161', marginBottom: 4 },
  similarWrong: { fontSize: 14, color: '#F44336', marginBottom: 4 },
  similarMatch: { fontSize: 12, color: '#4CAF50', fontWeight: 'bold' },
  checklistNote: { fontSize: 14, color: '#757575', marginHorizontal: 16, marginBottom: 12 },
  checklistItem: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 8 },
  checklistQuestion: { fontSize: 14, color: '#212121', marginBottom: 4 },
  checklistImportance: { fontSize: 12, color: '#757575', textTransform: 'uppercase' },
  checklistScore: { fontSize: 14, color: '#757575', marginHorizontal: 16, marginTop: 8 },
  gutCard: { backgroundColor: '#E3F2FD', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  gutText: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  gutNote: { fontSize: 14, color: '#616161', marginBottom: 12 },
  gutQuestion: { fontSize: 14, color: '#212121', marginBottom: 12 },
  gutButtons: { flexDirection: 'row', flexWrap: 'wrap' },
  gutButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  gutButtonText: { fontSize: 14, color: '#616161' },
  actions: { padding: 16 },
  delayButton: { backgroundColor: '#2196F3', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  delayButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  pastYouButton: { backgroundColor: '#9C27B0', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  pastYouButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  proceedButton: { backgroundColor: '#F44336', padding: 16, borderRadius: 12, alignItems: 'center' },
  proceedButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
