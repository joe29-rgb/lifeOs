/**
 * Recommendation Engine
 * Generates proactive coaching suggestions based on cross-pillar data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recommendation, Action, PillarType } from '../types/integration.types';
import { RECOMMENDATION_PRIORITIES } from '../constants/integration.constants';
import { DataHub } from './DataHub';

export class RecommendationEngine {
  private readonly RECOMMENDATIONS_KEY = '@integration_recommendations';
  private dataHub: DataHub;

  constructor() {
    this.dataHub = new DataHub();
  }

  public async generateRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const sleepRec = await this.checkSleepRecommendation();
    if (sleepRec) recommendations.push(sleepRec);

    const procrastRec = await this.checkProcrastinationRecommendation();
    if (procrastRec) recommendations.push(procrastRec);

    const relationshipRec = await this.checkRelationshipRecommendation();
    if (relationshipRec) recommendations.push(relationshipRec);

    recommendations.sort((a, b) => b.priority - a.priority);
    await AsyncStorage.setItem(this.RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
    
    return recommendations.slice(0, 3);
  }

  private async checkSleepRecommendation(): Promise<Recommendation | null> {
    const sleepData = await this.dataHub.getDataByType('health', 'sleep', 7);
    if (sleepData.length === 0) return null;

    const avgSleep = sleepData.reduce((sum, d) => sum + d.value, 0) / sleepData.length;
    
    if (avgSleep < 7) {
      return {
        id: `rec_sleep_${Date.now()}`,
        title: 'Improve Sleep Quality',
        description: `Your sleep (${avgSleep.toFixed(1)} hrs avg) impacts procrastination and decision quality`,
        pillars: ['health', 'procrastination', 'decisions'],
        priority: RECOMMENDATION_PRIORITIES.urgent_high_impact,
        impact: 8,
        urgency: 9,
        effort: 3,
        confidence: 0.85,
        actions: [
          {
            id: 'action_sleep_1',
            title: 'Set bedtime alarm for 10:30 PM',
            pillar: 'health',
            description: 'Consistent bedtime improves sleep quality',
            completed: false,
          },
          {
            id: 'action_sleep_2',
            title: 'No screens 30 min before bed',
            pillar: 'health',
            description: 'Blue light disrupts sleep',
            completed: false,
          },
        ],
        reasoning: 'Historical data shows sleep <7hrs → 3× procrastination rate and worse decisions',
        createdAt: new Date(),
        completed: false,
      };
    }

    return null;
  }

  private async checkProcrastinationRecommendation(): Promise<Recommendation | null> {
    const procrastData = await this.dataHub.getDataByType('procrastination', 'avoidance_rate', 7);
    if (procrastData.length === 0) return null;

    const avgAvoidance = procrastData.reduce((sum, d) => sum + d.value, 0) / procrastData.length;
    
    if (avgAvoidance > 5) {
      return {
        id: `rec_procrast_${Date.now()}`,
        title: 'Break Procrastination Cycle',
        description: 'High task avoidance detected - time to intervene',
        pillars: ['procrastination', 'health'],
        priority: RECOMMENDATION_PRIORITIES.important_high_impact,
        impact: 7,
        urgency: 7,
        effort: 4,
        confidence: 0.75,
        actions: [
          {
            id: 'action_procrast_1',
            title: 'Time-box 25 minutes today',
            pillar: 'procrastination',
            description: 'Pomodoro technique breaks resistance',
            completed: false,
          },
          {
            id: 'action_procrast_2',
            title: 'Break task into smaller steps',
            pillar: 'procrastination',
            description: 'Reduce overwhelm',
            completed: false,
          },
        ],
        reasoning: 'Avoidance rate is high. Small wins build momentum.',
        createdAt: new Date(),
        completed: false,
      };
    }

    return null;
  }

  private async checkRelationshipRecommendation(): Promise<Recommendation | null> {
    return {
      id: `rec_relationship_${Date.now()}`,
      title: 'Relationship Check-In',
      description: 'Maintain important connections',
      pillars: ['relationships'],
      priority: RECOMMENDATION_PRIORITIES.important_medium_impact,
      impact: 6,
      urgency: 5,
      effort: 2,
      confidence: 0.8,
      actions: [
        {
          id: 'action_rel_1',
          title: 'Schedule call this week',
          pillar: 'relationships',
          description: 'Stay connected with key people',
          completed: false,
        },
      ],
      reasoning: 'Regular contact prevents relationship drift',
      createdAt: new Date(),
      completed: false,
    };
  }

  public async getRecommendations(): Promise<Recommendation[]> {
    const data = await AsyncStorage.getItem(this.RECOMMENDATIONS_KEY);
    if (!data) return [];
    
    const recs: Recommendation[] = JSON.parse(data);
    return recs.map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
    }));
  }

  public async completeAction(recommendationId: string, actionId: string): Promise<void> {
    const recommendations = await this.getRecommendations();
    const rec = recommendations.find((r) => r.id === recommendationId);
    
    if (rec) {
      const action = rec.actions.find((a) => a.id === actionId);
      if (action) {
        action.completed = true;
        
        const allCompleted = rec.actions.every((a) => a.completed);
        if (allCompleted) {
          rec.completed = true;
        }
        
        await AsyncStorage.setItem(this.RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
      }
    }
  }
}
