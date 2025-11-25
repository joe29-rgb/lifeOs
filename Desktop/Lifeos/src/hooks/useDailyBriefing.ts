/**
 * Daily Briefing Hook
 * Manages briefing generation and state
 */

import { useState, useEffect } from 'react';
import { DailyBriefing } from '../modules/briefing/types/briefing.types';
import { BriefingGenerator } from '../modules/briefing/services/BriefingGenerator';

const briefingGenerator = new BriefingGenerator();

export function useDailyBriefing() {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);

  useEffect(() => {
    loadTodayBriefing();
  }, []);

  const loadTodayBriefing = async () => {
    setLoading(true);
    try {
      const todayBriefing = await briefingGenerator.getTodayBriefing();
      setBriefing(todayBriefing);
    } catch (error) {
      console.error('Error loading briefing:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewBriefing = async () => {
    setLoading(true);
    try {
      const newBriefing = await briefingGenerator.generateBriefing();
      setBriefing(newBriefing);
    } catch (error) {
      console.error('Error generating briefing:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!briefing) return;
    try {
      await briefingGenerator.markAsRead(briefing.id);
      setBriefing({ ...briefing, read: true });
    } catch (error) {
      console.error('Error marking briefing as read:', error);
    }
  };

  return {
    loading,
    briefing,
    generateNewBriefing,
    markAsRead,
    refresh: loadTodayBriefing,
  };
}
