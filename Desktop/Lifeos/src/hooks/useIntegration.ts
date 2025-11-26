/**
 * Integration Hook
 * Manages integrated data state and life intelligence
 */

import { useState, useEffect } from 'react';
import { LifeIntelligence } from '../modules/integration/types/integration.types';
import { IntelligenceEngine } from '../modules/integration/services/IntelligenceEngine';
import { DataHub } from '../modules/integration/services/DataHub';
import { PatternMiner } from '../modules/integration/services/PatternMiner';
import { RecommendationEngine } from '../modules/integration/services/RecommendationEngine';

const intelligenceEngine = new IntelligenceEngine();
const dataHub = new DataHub();
const patternMiner = new PatternMiner();
const recommendationEngine = new RecommendationEngine();

export function useIntegration() {
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<LifeIntelligence | null>(null);

  useEffect(() => {
    loadIntelligence();
  }, []);

  const loadIntelligence = async () => {
    setLoading(true);
    try {
      await dataHub.syncFromPillars();
      await patternMiner.minePatterns();
      const recommendations = await recommendationEngine.generateRecommendations();
      const lifeIntel = await intelligenceEngine.generateLifeIntelligence();
      lifeIntel.smartActions = recommendations;
      setIntelligence(lifeIntel);
    } catch (error) {
      console.error('Error loading intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeAction = async (recommendationId: string, actionId: string) => {
    try {
      await recommendationEngine.completeAction(recommendationId, actionId);
      await loadIntelligence();
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };

  return {
    loading,
    intelligence,
    refresh: loadIntelligence,
    completeAction,
  };
}
