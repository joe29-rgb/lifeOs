/**
 * Data Hub
 * Central data aggregation and unified API for all pillars
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataPoint, PillarType } from '../types/integration.types';

export class DataHub {
  private readonly DATA_KEY = '@integration_data_hub';

  public async addDataPoint(pillar: PillarType, type: string, value: number, metadata: Record<string, unknown> = {}): Promise<void> {
    const dataPoint: DataPoint = {
      id: `dp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pillar,
      timestamp: new Date(),
      type,
      value,
      metadata,
    };

    const allData = await this.getAllData();
    allData.push(dataPoint);
    await AsyncStorage.setItem(this.DATA_KEY, JSON.stringify(allData));
  }

  public async getDataByPillar(pillar: PillarType, limit?: number): Promise<DataPoint[]> {
    const allData = await this.getAllData();
    const pillarData = allData.filter((dp) => dp.pillar === pillar);
    
    if (limit) {
      return pillarData.slice(-limit);
    }
    
    return pillarData;
  }

  public async getDataByType(pillar: PillarType, type: string, limit?: number): Promise<DataPoint[]> {
    const pillarData = await this.getDataByPillar(pillar);
    const typeData = pillarData.filter((dp) => dp.type === type);
    
    if (limit) {
      return typeData.slice(-limit);
    }
    
    return typeData;
  }

  public async getDataInTimeRange(pillar: PillarType, startDate: Date, endDate: Date): Promise<DataPoint[]> {
    const pillarData = await this.getDataByPillar(pillar);
    return pillarData.filter((dp) => {
      const timestamp = new Date(dp.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    });
  }

  public async getRecentData(days: number = 30): Promise<DataPoint[]> {
    const allData = await this.getAllData();
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return allData.filter((dp) => new Date(dp.timestamp) >= cutoff);
  }

  public async getAllData(): Promise<DataPoint[]> {
    const data = await AsyncStorage.getItem(this.DATA_KEY);
    if (!data) return [];
    
    const parsed: DataPoint[] = JSON.parse(data);
    return parsed.map((dp) => ({
      ...dp,
      timestamp: new Date(dp.timestamp),
    }));
  }

  public async clearOldData(daysToKeep: number = 90): Promise<void> {
    const allData = await this.getAllData();
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const recentData = allData.filter((dp) => new Date(dp.timestamp) >= cutoff);
    await AsyncStorage.setItem(this.DATA_KEY, JSON.stringify(recentData));
  }

  public async syncFromPillars(): Promise<void> {
    const healthData = await AsyncStorage.getItem('@mental_health_moods');
    if (healthData) {
      const moods = JSON.parse(healthData);
      for (const mood of moods.slice(-30)) {
        await this.addDataPoint('health', 'mood', mood.value, { timestamp: mood.timestamp });
      }
    }

    const sleepData = await AsyncStorage.getItem('@health_sleep_logs');
    if (sleepData) {
      const logs = JSON.parse(sleepData);
      for (const log of logs.slice(-30)) {
        await this.addDataPoint('health', 'sleep', log.hours, { quality: log.quality });
      }
    }

    const decisionsData = await AsyncStorage.getItem('@decisions');
    if (decisionsData) {
      const decisions = JSON.parse(decisionsData);
      for (const decision of decisions.slice(-30)) {
        const quality = decision.outcome === 'good' ? 8 : decision.outcome === 'bad' ? 3 : 5;
        await this.addDataPoint('decisions', 'decision_quality', quality, { 
          category: decision.category,
          confidence: decision.confidence,
        });
      }
    }

    const procrastData = await AsyncStorage.getItem('@procrastination_tasks');
    if (procrastData) {
      const tasks = JSON.parse(procrastData);
      const avoidedTasks = tasks.filter((t: { status: string }) => t.status === 'avoided');
      await this.addDataPoint('procrastination', 'avoidance_rate', avoidedTasks.length / Math.max(1, tasks.length) * 10, {});
    }
  }

  public async getAggregateStats(pillar: PillarType, type: string, days: number = 7): Promise<{ avg: number; min: number; max: number; trend: number }> {
    const data = await this.getDataByType(pillar, type);
    const recent = data.slice(-days);
    
    if (recent.length === 0) {
      return { avg: 0, min: 0, max: 0, trend: 0 };
    }

    const values = recent.map((dp) => dp.value);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const halfPoint = Math.floor(recent.length / 2);
    const firstHalf = values.slice(0, halfPoint);
    const secondHalf = values.slice(halfPoint);
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    const trend = secondAvg - firstAvg;

    return { avg, min, max, trend };
  }
}
