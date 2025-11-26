/**
 * Crisis Detector
 * Multi-signal crisis detection and severity assessment
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CrisisDetection, CrisisSignal, CrisisSeverity } from '../types/crisis.types';
import { CRISIS_DETECTION_PHRASES, BEHAVIORAL_THRESHOLDS, SEVERITY_THRESHOLDS } from '../constants/crisis.constants';

export class CrisisDetector {
  private readonly DETECTIONS_KEY = '@crisis_detections';

  public async analyzeText(text: string): Promise<CrisisSignal | null> {
    const lowerText = text.toLowerCase();
    const indicators: string[] = [];
    let maxSeverity: CrisisSeverity = 'mild';

    for (const phrase of CRISIS_DETECTION_PHRASES.self_harm) {
      if (lowerText.includes(phrase)) {
        indicators.push(`self_harm: ${phrase}`);
        maxSeverity = 'critical';
      }
    }

    for (const phrase of CRISIS_DETECTION_PHRASES.hopelessness) {
      if (lowerText.includes(phrase)) {
        indicators.push(`hopelessness: ${phrase}`);
        if (maxSeverity !== 'critical') maxSeverity = 'severe';
      }
    }

    for (const phrase of CRISIS_DETECTION_PHRASES.despair) {
      if (lowerText.includes(phrase)) {
        indicators.push(`despair: ${phrase}`);
        if (maxSeverity === 'mild') maxSeverity = 'moderate';
      }
    }

    for (const phrase of CRISIS_DETECTION_PHRASES.isolation) {
      if (lowerText.includes(phrase)) {
        indicators.push(`isolation: ${phrase}`);
        if (maxSeverity === 'mild') maxSeverity = 'moderate';
      }
    }

    if (indicators.length === 0) return null;

    return {
      id: `signal_${Date.now()}`,
      type: 'voice',
      source: 'text_analysis',
      severity: maxSeverity,
      indicators,
      timestamp: new Date(),
      confidence: indicators.length >= 2 ? 0.9 : 0.7,
    };
  }

  public async analyzeBehavioralPatterns(): Promise<CrisisSignal | null> {
    const indicators: string[] = [];
    let riskScore = 0;

    const sleepData = await AsyncStorage.getItem('@health_sleep_logs');
    if (sleepData) {
      const logs = JSON.parse(sleepData);
      const recentLogs = logs.slice(-3);
      const avgSleep = recentLogs.reduce((sum: number, log: { hours: number }) => sum + log.hours, 0) / recentLogs.length;
      
      if (avgSleep < BEHAVIORAL_THRESHOLDS.sleep_disruption) {
        indicators.push(`severe_sleep_disruption: ${avgSleep.toFixed(1)}hrs avg`);
        riskScore += 2;
      }
    }

    const moodData = await AsyncStorage.getItem('@mental_health_moods');
    if (moodData) {
      const moods = JSON.parse(moodData);
      const recentMoods = moods.slice(-BEHAVIORAL_THRESHOLDS.low_mood_days);
      const lowMoodCount = recentMoods.filter((m: { value: number }) => m.value <= BEHAVIORAL_THRESHOLDS.low_mood_threshold).length;
      
      if (lowMoodCount >= BEHAVIORAL_THRESHOLDS.low_mood_days) {
        indicators.push(`persistent_low_mood: ${lowMoodCount} days`);
        riskScore += 3;
      }
    }

    const relationshipData = await AsyncStorage.getItem('@relationships_people');
    if (relationshipData) {
      const people = JSON.parse(relationshipData);
      const recentContact = people.filter((p: { lastContactDays: number }) => p.lastContactDays <= BEHAVIORAL_THRESHOLDS.communication_drop);
      
      if (recentContact.length === 0 && people.length > 0) {
        indicators.push('communication_drop_off');
        riskScore += 2;
      }
    }

    if (indicators.length === 0) return null;

    let severity: CrisisSeverity = 'mild';
    if (riskScore >= 5) severity = 'severe';
    else if (riskScore >= 3) severity = 'moderate';

    return {
      id: `signal_behavioral_${Date.now()}`,
      type: 'behavioral',
      source: 'pattern_analysis',
      severity,
      indicators,
      timestamp: new Date(),
      confidence: 0.8,
    };
  }

  public async analyzeCrossPillarCorrelation(): Promise<CrisisSignal | null> {
    const indicators: string[] = [];
    let riskScore = 0;

    const healthDecline = await this.checkHealthDecline();
    const relationshipIsolation = await this.checkRelationshipIsolation();
    const decisionParalysis = await this.checkDecisionParalysis();

    if (healthDecline) {
      indicators.push('health_deterioration');
      riskScore += 2;
    }

    if (relationshipIsolation) {
      indicators.push('relationship_isolation');
      riskScore += 2;
    }

    if (decisionParalysis) {
      indicators.push('decision_paralysis');
      riskScore += 1;
    }

    if (riskScore < 3) return null;

    const severity: CrisisSeverity = riskScore >= 5 ? 'severe' : 'moderate';

    return {
      id: `signal_cross_pillar_${Date.now()}`,
      type: 'cross_pillar',
      source: 'integration_analysis',
      severity,
      indicators,
      timestamp: new Date(),
      confidence: 0.85,
    };
  }

  private async checkHealthDecline(): Promise<boolean> {
    const moodData = await AsyncStorage.getItem('@mental_health_moods');
    const sleepData = await AsyncStorage.getItem('@health_sleep_logs');
    
    if (!moodData || !sleepData) return false;

    const moods = JSON.parse(moodData);
    const sleep = JSON.parse(sleepData);

    const recentMoods = moods.slice(-7);
    const recentSleep = sleep.slice(-7);

    const avgMood = recentMoods.reduce((sum: number, m: { value: number }) => sum + m.value, 0) / recentMoods.length;
    const avgSleep = recentSleep.reduce((sum: number, s: { hours: number }) => sum + s.hours, 0) / recentSleep.length;

    return avgMood < 4 && avgSleep < 6;
  }

  private async checkRelationshipIsolation(): Promise<boolean> {
    const contactData = await AsyncStorage.getItem('@relationships_contacts');
    if (!contactData) return false;

    const contacts = JSON.parse(contactData);
    const recentContacts = contacts.filter((c: { timestamp: string }) => {
      const daysSince = (Date.now() - new Date(c.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    return recentContacts.length === 0 && contacts.length > 0;
  }

  private async checkDecisionParalysis(): Promise<boolean> {
    const decisionData = await AsyncStorage.getItem('@decisions');
    if (!decisionData) return false;

    const decisions = JSON.parse(decisionData);
    const recentDecisions = decisions.filter((d: { createdAt: string }) => {
      const daysSince = (Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    return recentDecisions.length === 0;
  }

  public async detectCrisis(): Promise<CrisisDetection | null> {
    const signals: CrisisSignal[] = [];

    const behavioral = await this.analyzeBehavioralPatterns();
    if (behavioral) signals.push(behavioral);

    const crossPillar = await this.analyzeCrossPillarCorrelation();
    if (crossPillar) signals.push(crossPillar);

    if (signals.length === 0) return null;

    const maxSeverity = this.calculateMaxSeverity(signals);
    const riskScore = this.calculateRiskScore(signals);
    const triggers = signals.flatMap((s) => s.indicators);

    const detection: CrisisDetection = {
      severity: maxSeverity,
      signals,
      riskScore,
      detectedAt: new Date(),
      triggers,
    };

    await this.saveDetection(detection);
    return detection;
  }

  private calculateMaxSeverity(signals: CrisisSignal[]): CrisisSeverity {
    const severityOrder: CrisisSeverity[] = ['mild', 'moderate', 'severe', 'critical'];
    let maxIndex = 0;

    for (const signal of signals) {
      const index = severityOrder.indexOf(signal.severity);
      if (index > maxIndex) maxIndex = index;
    }

    return severityOrder[maxIndex];
  }

  private calculateRiskScore(signals: CrisisSignal[]): number {
    let score = 0;

    for (const signal of signals) {
      switch (signal.severity) {
        case 'critical': score += 10; break;
        case 'severe': score += 7; break;
        case 'moderate': score += 4; break;
        case 'mild': score += 2; break;
      }
      score *= signal.confidence;
    }

    return Math.min(10, score);
  }

  private async saveDetection(detection: CrisisDetection): Promise<void> {
    const existing = await this.getDetections();
    existing.push(detection);
    await AsyncStorage.setItem(this.DETECTIONS_KEY, JSON.stringify(existing.slice(-10)));
  }

  public async getDetections(): Promise<CrisisDetection[]> {
    const data = await AsyncStorage.getItem(this.DETECTIONS_KEY);
    if (!data) return [];
    
    const detections: CrisisDetection[] = JSON.parse(data);
    return detections.map((d) => ({
      ...d,
      detectedAt: new Date(d.detectedAt),
      signals: d.signals.map((s) => ({
        ...s,
        timestamp: new Date(s.timestamp),
      })),
    }));
  }
}
