/**
 * Insights Hook
 * Pattern mining results and insights management
 */

import { useState, useEffect } from 'react';
import { Insight, Pattern } from '../modules/integration/types/integration.types';
import { IntelligenceEngine } from '../modules/integration/services/IntelligenceEngine';
import { PatternMiner } from '../modules/integration/services/PatternMiner';

const intelligenceEngine = new IntelligenceEngine();
const patternMiner = new PatternMiner();

export function useInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [insightsData, patternsData] = await Promise.all([
        intelligenceEngine.getInsights(),
        patternMiner.getPatterns(),
      ]);
      setInsights(insightsData);
      setPatterns(patternsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const provideFeedback = async (patternId: string, feedback: 'helpful' | 'not_helpful') => {
    try {
      await patternMiner.updatePatternFeedback(patternId, feedback);
      await loadInsights();
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  };

  return {
    loading,
    insights,
    patterns,
    provideFeedback,
    refresh: loadInsights,
  };
}
