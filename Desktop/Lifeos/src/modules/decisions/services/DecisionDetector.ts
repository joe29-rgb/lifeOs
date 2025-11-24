/**
 * Decision Detector
 * Detects decision moments from audio/text transcripts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Decision, DecisionChoice } from '../types/decision.types';
import { DECISION_DETECTION_PHRASES } from '../constants/decision.constants';

export class DecisionDetector {
  private detectionCallbacks: Array<(decision: Partial<Decision>) => void> = [];
  private confidenceThreshold = 0.7;

  public onDetection(callback: (decision: Partial<Decision>) => void): void {
    this.detectionCallbacks.push(callback);
  }

  public offDetection(callback: (decision: Partial<Decision>) => void): void {
    this.detectionCallbacks = this.detectionCallbacks.filter((cb) => cb !== callback);
  }

  public async detectFromTranscript(transcript: string): Promise<boolean> {
    const lowerTranscript = transcript.toLowerCase();
    let detected = false;

    for (const phrase of DECISION_DETECTION_PHRASES) {
      if (lowerTranscript.includes(phrase)) {
        detected = true;
        break;
      }
    }

    if (detected) {
      const partialDecision = await this.extractDecisionData(transcript);
      this.notifyCallbacks(partialDecision);
      return true;
    }

    return false;
  }

  private async extractDecisionData(transcript: string): Promise<Partial<Decision>> {
    const choices = this.extractChoices(transcript);
    const emotions = this.detectEmotions(transcript);
    
    const userId = await this.getUserId();

    return {
      userId,
      title: this.extractTitle(transcript),
      description: transcript,
      choices,
      emotions,
      voiceTranscript: transcript,
      detectedFromAudio: true,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  private extractTitle(transcript: string): string {
    const sentences = transcript.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim() || 'New Decision';
    return firstSentence.length > 60 
      ? firstSentence.substring(0, 57) + '...' 
      : firstSentence;
  }

  private extractChoices(transcript: string): DecisionChoice[] {
    const choices: DecisionChoice[] = [];
    const lowerTranscript = transcript.toLowerCase();

    const betweenMatch = lowerTranscript.match(/between\s+(.+?)\s+(?:and|or)\s+(.+?)(?:\.|$)/);
    if (betweenMatch) {
      choices.push({
        id: `choice_${Date.now()}_1`,
        description: betweenMatch[1].trim(),
        pros: [],
        cons: [],
        excitement: 3,
        concerns: [],
      });
      choices.push({
        id: `choice_${Date.now()}_2`,
        description: betweenMatch[2].trim(),
        pros: [],
        cons: [],
        excitement: 3,
        concerns: [],
      });
    }

    const shouldMatch = lowerTranscript.match(/should\s+i\s+(.+?)(?:\.|$|\?)/);
    if (shouldMatch && choices.length === 0) {
      choices.push({
        id: `choice_${Date.now()}_1`,
        description: shouldMatch[1].trim(),
        pros: [],
        cons: [],
        excitement: 3,
        concerns: [],
      });
      choices.push({
        id: `choice_${Date.now()}_2`,
        description: 'Don\'t ' + shouldMatch[1].trim(),
        pros: [],
        cons: [],
        excitement: 3,
        concerns: [],
      });
    }

    if (choices.length === 0) {
      choices.push({
        id: `choice_${Date.now()}_1`,
        description: 'Option A',
        pros: [],
        cons: [],
        excitement: 3,
        concerns: [],
      });
      choices.push({
        id: `choice_${Date.now()}_2`,
        description: 'Option B',
        pros: [],
        cons: [],
        excitement: 3,
        concerns: [],
      });
    }

    return choices;
  }

  private detectEmotions(transcript: string): any[] {
    const emotions: any[] = [];
    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.match(/excit|eager|can't wait/)) emotions.push('excited');
    if (lowerTranscript.match(/anxious|nervous|worried|scared/)) emotions.push('anxious');
    if (lowerTranscript.match(/confident|sure|certain/)) emotions.push('confident');
    if (lowerTranscript.match(/uncertain|unsure|don't know/)) emotions.push('uncertain');
    if (lowerTranscript.match(/hope|hopeful|optimistic/)) emotions.push('hopeful');
    if (lowerTranscript.match(/worry|concern|afraid/)) emotions.push('worried');

    return emotions.length > 0 ? emotions : ['uncertain'];
  }

  private notifyCallbacks(decision: Partial<Decision>): void {
    this.detectionCallbacks.forEach((callback) => callback(decision));
  }

  private async getUserId(): Promise<string> {
    try {
      const userId = await AsyncStorage.getItem('timeline_user_id');
      return userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  public setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = threshold;
  }
}

export const decisionDetector = new DecisionDetector();
