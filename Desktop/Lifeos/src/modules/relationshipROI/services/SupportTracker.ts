/**
 * Support Tracker
 * Tracks give/receive balance
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportBalance, SupportEvent } from '../types/relationshipROI.types';
import { SUPPORT_THRESHOLDS } from '../constants/relationshipROI.constants';

export class SupportTracker {
  private readonly SUPPORT_KEY = '@support_balance';

  public async logSupport(
    personId: string,
    personName: string,
    type: 'given' | 'received',
    category: SupportEvent['category'],
    description: string
  ): Promise<void> {
    const event: SupportEvent = {
      id: `support_${Date.now()}`,
      personId,
      type,
      category,
      description,
      timestamp: new Date(),
    };

    const balances = await this.getAllBalances();
    const personBalance = balances.find((b) => b.personId === personId);

    if (personBalance) {
      personBalance.history.push(event);
      if (type === 'given') {
        personBalance.given++;
      } else {
        personBalance.received++;
      }
      personBalance.ratio = personBalance.received > 0 ? personBalance.given / personBalance.received : personBalance.given;
      personBalance.status = this.determineStatus(personBalance.ratio);
    } else {
      const newBalance: SupportBalance = {
        personId,
        personName,
        given: type === 'given' ? 1 : 0,
        received: type === 'received' ? 1 : 0,
        ratio: type === 'given' ? 1 : 0,
        status: 'reciprocal',
        history: [event],
      };
      newBalance.ratio = newBalance.received > 0 ? newBalance.given / newBalance.received : newBalance.given;
      newBalance.status = this.determineStatus(newBalance.ratio);
      balances.push(newBalance);
    }

    await AsyncStorage.setItem(this.SUPPORT_KEY, JSON.stringify(balances));
  }

  private determineStatus(ratio: number): SupportBalance['status'] {
    if (ratio >= SUPPORT_THRESHOLDS.reciprocal.min && ratio <= SUPPORT_THRESHOLDS.reciprocal.max) {
      return 'reciprocal';
    }
    if (ratio >= SUPPORT_THRESHOLDS.give_more.min) {
      return 'give_more';
    }
    if (ratio <= SUPPORT_THRESHOLDS.receive_more.max && ratio >= SUPPORT_THRESHOLDS.receive_more.min) {
      return 'receive_more';
    }
    return 'imbalanced';
  }

  public async getSupportBalance(personId: string): Promise<SupportBalance | null> {
    const balances = await this.getAllBalances();
    return balances.find((b) => b.personId === personId) || null;
  }

  public async getAllBalances(): Promise<SupportBalance[]> {
    const data = await AsyncStorage.getItem(this.SUPPORT_KEY);
    if (!data) return [];

    const balances: SupportBalance[] = JSON.parse(data);
    return balances.map((b) => ({
      ...b,
      history: b.history.map((h) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      })),
    }));
  }

  public async getOverallBalance(): Promise<number> {
    const balances = await this.getAllBalances();
    if (balances.length === 0) return 1.0;

    const totalGiven = balances.reduce((sum, b) => sum + b.given, 0);
    const totalReceived = balances.reduce((sum, b) => sum + b.received, 0);

    return totalReceived > 0 ? totalGiven / totalReceived : totalGiven;
  }

  public async getImbalancedRelationships(): Promise<SupportBalance[]> {
    const balances = await this.getAllBalances();
    return balances.filter((b) => b.status === 'imbalanced' || b.status === 'give_more');
  }

  public async getRecentSupport(personId: string, days: number = 30): Promise<SupportEvent[]> {
    const balance = await this.getSupportBalance(personId);
    if (!balance) return [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return balance.history.filter((e) => new Date(e.timestamp) > cutoff);
  }

  public async getSupportStats(): Promise<{
    totalGiven: number;
    totalReceived: number;
    overallRatio: number;
    reciprocalCount: number;
    imbalancedCount: number;
  }> {
    const balances = await this.getAllBalances();

    const totalGiven = balances.reduce((sum, b) => sum + b.given, 0);
    const totalReceived = balances.reduce((sum, b) => sum + b.received, 0);
    const overallRatio = totalReceived > 0 ? totalGiven / totalReceived : totalGiven;
    const reciprocalCount = balances.filter((b) => b.status === 'reciprocal').length;
    const imbalancedCount = balances.filter((b) => b.status === 'imbalanced' || b.status === 'give_more').length;

    return {
      totalGiven,
      totalReceived,
      overallRatio,
      reciprocalCount,
      imbalancedCount,
    };
  }
}
