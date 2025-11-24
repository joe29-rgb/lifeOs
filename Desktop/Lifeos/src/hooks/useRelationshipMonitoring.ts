/**
 * useRelationshipMonitoring Hook
 * Manages relationship tracking, drift detection, and weather updates
 */

import { useState, useEffect, useCallback } from 'react';
import { Person, ContactEvent, RelationshipWeather, RelationshipDrift } from '../modules/relationships/types/relationship.types';
import { relationshipTracker } from '../modules/relationships/services/RelationshipTracker';
import { driftDetector } from '../modules/relationships/services/DriftDetector';
import { relationshipWeatherEngine } from '../modules/relationships/services/RelationshipWeatherEngine';
import { relationshipAnalyzer } from '../modules/relationships/services/RelationshipAnalyzer';

export function useRelationshipMonitoring() {
  const [topPeople, setTopPeople] = useState<Person[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [weather, setWeather] = useState<RelationshipWeather[]>([]);
  const [activeDrifts, setActiveDrifts] = useState<RelationshipDrift[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const top = await relationshipTracker.getTopPeople();
      setTopPeople(top);

      const all = await relationshipTracker.getAllPeople();
      setAllPeople(all);

      const weatherData = await relationshipWeatherEngine.getAllWeather();
      setWeather(weatherData);

      const drifts = await driftDetector.getActiveDrifts();
      setActiveDrifts(drifts);
    } catch (error) {
      console.error('Error loading relationship data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      relationshipWeatherEngine.updateAllWeather().then(() => loadData());
    }, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  const createPerson = useCallback(async (
    person: Omit<Person, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Person> => {
    const newPerson = await relationshipTracker.createPerson(person);
    await loadData();
    return newPerson;
  }, [loadData]);

  const updatePerson = useCallback(async (
    personId: string,
    updates: Partial<Person>
  ): Promise<Person> => {
    const updated = await relationshipTracker.updatePerson(personId, updates);
    await loadData();
    return updated;
  }, [loadData]);

  const logContact = useCallback(async (
    contact: Omit<ContactEvent, 'id' | 'userId' | 'createdAt'>
  ): Promise<ContactEvent> => {
    const newContact = await relationshipTracker.logContact(contact);
    await relationshipWeatherEngine.getWeather(contact.personId);
    await loadData();
    return newContact;
  }, [loadData]);

  const setTopPerson = useCallback(async (personId: string, isTop: boolean): Promise<void> => {
    await relationshipTracker.setTopPerson(personId, isTop);
    await loadData();
  }, [loadData]);

  const deletePerson = useCallback(async (personId: string): Promise<void> => {
    await relationshipTracker.deletePerson(personId);
    await loadData();
  }, [loadData]);

  const getWeatherForPerson = useCallback(async (personId: string): Promise<RelationshipWeather | null> => {
    return await relationshipWeatherEngine.getWeatherForPerson(personId);
  }, []);

  const getStatsForPerson = useCallback(async (personId: string) => {
    return await relationshipAnalyzer.getStats(personId);
  }, []);

  const getTimelineForPerson = useCallback(async (personId: string) => {
    return await relationshipAnalyzer.getTimeline(personId);
  }, []);

  return {
    topPeople,
    allPeople,
    weather,
    activeDrifts,
    loading,
    createPerson,
    updatePerson,
    logContact,
    setTopPerson,
    deletePerson,
    getWeatherForPerson,
    getStatsForPerson,
    getTimelineForPerson,
    refresh: loadData,
  };
}
