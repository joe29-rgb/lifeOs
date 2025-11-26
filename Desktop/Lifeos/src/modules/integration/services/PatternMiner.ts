/**
 * Pattern Miner
 * Discovers cross-pillar correlations and patterns
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pattern, DataPoint, PillarType, PatternType, ConfidenceLevel } from '../types/integration.types';
import { CORRELATION_THRESHOLDS, PATTERN_TIME_WINDOW, MIN_OCCURRENCES, CONFIDENCE_LEVELS, CROSS_PILLAR_PATTERNS } from '../constants/integration.constants';
import { DataHub } from './DataHub';

export class PatternMiner {
  private readonly PATTERNS_KEY = '@integration_patterns';
  private dataHub: DataHub;

  constructor() {
    this.dataHub = new DataHub();
  }

  public async minePatterns(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    for (const config of CROSS_PILLAR_PATTERNS) {
      const pattern = await this.findPattern(
        config.pillarA,
        config.pillarB,
        config.eventA,
        config.eventB
      );
      
      if (pattern) {
        patterns.push(pattern);
      }
    }

    await this.savePatterns(patterns);
    return patterns;
  }

  private async findPattern(
    pillarA: PillarType,
    pillarB: PillarType,
    eventA: string,
    eventB: string
  ): Promise<Pattern | null> {
    const dataA = await this.dataHub.getDataByType(pillarA, eventA, 100);
    const dataB = await this.dataHub.getDataByType(pillarB, eventB, 100);

    if (dataA.length === 0 || dataB.length === 0) {
      return null;
    }

    const correlations = this.calculateCorrelations(dataA, dataB);
    
    if (correlations.occurrences < MIN_OCCURRENCES) {
      return null;
    }

    if (correlations.correlation < CORRELATION_THRESHOLDS.moderate) {
      return null;
    }

    const confidence = this.determineConfidence(correlations.correlation, correlations.occurrences);
    const patternType = this.determinePatternType(correlations.avgTimeDiff);

    return {
      id: `pattern_${pillarA}_${pillarB}_${Date.now()}`,
      type: patternType,
      pillarA,
      pillarB,
      eventA,
      eventB,
      correlation: correlations.correlation,
      occurrences: correlations.occurrences,
      confidence,
      strength: correlations.correlation,
      description: this.generateDescription(pillarA, pillarB, eventA, eventB, correlations.correlation),
      createdAt: new Date(),
      lastSeen: new Date(),
    };
  }

  private calculateCorrelations(dataA: DataPoint[], dataB: DataPoint[]): {
    correlation: number;
    occurrences: number;
    avgTimeDiff: number;
  } {
    let matches = 0;
    let totalTimeDiff = 0;

    for (const pointA of dataA) {
      for (const pointB of dataB) {
        const timeDiff = Math.abs(new Date(pointB.timestamp).getTime() - new Date(pointA.timestamp).getTime());
        
        if (timeDiff <= PATTERN_TIME_WINDOW) {
          matches++;
          totalTimeDiff += timeDiff;
        }
      }
    }

    const correlation = matches / Math.max(dataA.length, dataB.length);
    const avgTimeDiff = matches > 0 ? totalTimeDiff / matches : 0;

    return {
      correlation,
      occurrences: matches,
      avgTimeDiff,
    };
  }

  private determineConfidence(correlation: number, occurrences: number): ConfidenceLevel {
    if (correlation >= CONFIDENCE_LEVELS.very_high.min && occurrences >= CONFIDENCE_LEVELS.very_high.occurrences) {
      return 'very_high';
    }
    if (correlation >= CONFIDENCE_LEVELS.high.min && occurrences >= CONFIDENCE_LEVELS.high.occurrences) {
      return 'high';
    }
    if (correlation >= CONFIDENCE_LEVELS.medium.min && occurrences >= CONFIDENCE_LEVELS.medium.occurrences) {
      return 'medium';
    }
    return 'low';
  }

  private determinePatternType(avgTimeDiff: number): PatternType {
    const hoursDiff = avgTimeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      return 'causal';
    } else if (hoursDiff < 72) {
      return 'predictive';
    }
    return 'correlational';
  }

  private generateDescription(pillarA: PillarType, pillarB: PillarType, eventA: string, eventB: string, correlation: number): string {
    const eventAReadable = eventA.replace(/_/g, ' ');
    const eventBReadable = eventB.replace(/_/g, ' ');
    const multiplier = (1 + correlation).toFixed(1);
    
    return `${eventAReadable} in ${pillarA} → ${multiplier}× ${eventBReadable} in ${pillarB}`;
  }

  public async getPatterns(): Promise<Pattern[]> {
    const data = await AsyncStorage.getItem(this.PATTERNS_KEY);
    if (!data) return [];
    
    const patterns: Pattern[] = JSON.parse(data);
    return patterns.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      lastSeen: new Date(p.lastSeen),
    }));
  }

  private async savePatterns(patterns: Pattern[]): Promise<void> {
    const existing = await this.getPatterns();
    
    const merged = [...existing];
    for (const newPattern of patterns) {
      const existingIndex = merged.findIndex(
        (p) => p.pillarA === newPattern.pillarA && 
               p.pillarB === newPattern.pillarB && 
               p.eventA === newPattern.eventA && 
               p.eventB === newPattern.eventB
      );
      
      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          correlation: newPattern.correlation,
          occurrences: newPattern.occurrences,
          confidence: newPattern.confidence,
          lastSeen: new Date(),
        };
      } else {
        merged.push(newPattern);
      }
    }

    await AsyncStorage.setItem(this.PATTERNS_KEY, JSON.stringify(merged));
  }

  public async updatePatternFeedback(patternId: string, feedback: 'helpful' | 'not_helpful'): Promise<void> {
    const patterns = await this.getPatterns();
    const pattern = patterns.find((p) => p.id === patternId);
    
    if (pattern) {
      pattern.userFeedback = feedback;
      await AsyncStorage.setItem(this.PATTERNS_KEY, JSON.stringify(patterns));
    }
  }
}
