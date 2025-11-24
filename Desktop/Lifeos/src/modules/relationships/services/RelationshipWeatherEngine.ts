/**
 * Relationship Weather Engine
 * Generates weather-style relationship status and action suggestions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RelationshipWeather, QuickAction } from '../types/relationship.types';
import { relationshipTracker } from './RelationshipTracker';
import { driftDetector } from './DriftDetector';
import { QUICK_TEXT_TEMPLATES } from '../constants/relationship.constants';

export class RelationshipWeatherEngine {
  public async getWeather(personId: string): Promise<RelationshipWeather> {
    const person = await relationshipTracker.getPerson(personId);
    if (!person) {
      throw new Error('Person not found');
    }

    const drift = await driftDetector.detectDrift(personId);
    const daysSinceLastContact = await relationshipTracker.getDaysSinceLastContact(personId);
    const baseline = await driftDetector.getBaseline(personId);

    const temperature = this.calculateTemperature(daysSinceLastContact, baseline.averageContactFrequencyDays, drift);
    const status = this.determineStatus(temperature);
    const forecast = this.generateForecast(status, person.name, daysSinceLastContact);
    const actions = await this.generateActions(personId, status);

    const weather: RelationshipWeather = {
      personId,
      status,
      temperature,
      forecast,
      actionSuggestions: actions.map((a) => a.label),
      lastUpdated: new Date(),
    };

    await this.saveWeather(weather);
    return weather;
  }

  private calculateTemperature(
    daysSinceLastContact: number,
    expectedDays: number,
    drift: any
  ): number {
    let temperature = 100;

    const frequencyRatio = daysSinceLastContact / expectedDays;
    temperature -= frequencyRatio * 30;

    if (drift) {
      if (drift.severity === 'severe') temperature -= 40;
      else if (drift.severity === 'moderate') temperature -= 25;
      else temperature -= 10;

      if (drift.driftType === 'both') temperature -= 15;
    }

    return Math.max(0, Math.min(100, temperature));
  }

  private determineStatus(temperature: number): 'sunny' | 'partly_cloudy' | 'cloudy' | 'storm_warning' {
    if (temperature >= 75) return 'sunny';
    if (temperature >= 50) return 'partly_cloudy';
    if (temperature >= 25) return 'cloudy';
    return 'storm_warning';
  }

  private generateForecast(
    status: 'sunny' | 'partly_cloudy' | 'cloudy' | 'storm_warning',
    personName: string,
    daysSinceLastContact: number
  ): string {
    switch (status) {
      case 'sunny':
        return `Everything's great with ${personName}! Keep up the good connection.`;
      case 'partly_cloudy':
        return `It's been ${daysSinceLastContact} days since you connected with ${personName}. A quick check-in would be nice.`;
      case 'cloudy':
        return `It's been a while since you talked to ${personName}. Time to reach out!`;
      case 'storm_warning':
        return `URGENT: It's been ${daysSinceLastContact} days! ${personName} might be wondering about you. Reach out now!`;
    }
  }

  private async generateActions(
    personId: string,
    status: 'sunny' | 'partly_cloudy' | 'cloudy' | 'storm_warning'
  ): Promise<QuickAction[]> {
    const person = await relationshipTracker.getPerson(personId);
    if (!person) return [];

    const actions: QuickAction[] = [];

    if (person.phoneNumber) {
      actions.push({
        id: `action_call_${personId}`,
        type: 'call',
        label: `Call ${person.name}`,
        personId,
      });

      actions.push({
        id: `action_text_${personId}`,
        type: 'text',
        label: `Text ${person.name}`,
        personId,
        prefilledMessage: this.getPrefilledMessage(status, person.name),
      });
    }

    actions.push({
      id: `action_schedule_${personId}`,
      type: 'schedule',
      label: 'Schedule Time',
      personId,
    });

    const lastContact = await relationshipTracker.getLastContact(personId);
    if (lastContact && lastContact.photoUris && lastContact.photoUris.length > 0) {
      actions.push({
        id: `action_memory_${personId}`,
        type: 'view_memory',
        label: 'View Last Memory',
        personId,
      });
    }

    return actions;
  }

  private getPrefilledMessage(
    status: 'sunny' | 'partly_cloudy' | 'cloudy' | 'storm_warning',
    personName: string
  ): string {
    if (status === 'storm_warning') {
      return `Hey ${personName}! I know it's been way too long. I've been thinking about you. Can we catch up soon?`;
    } else if (status === 'cloudy') {
      return `Hi ${personName}! It's been a while. How have you been?`;
    } else {
      return QUICK_TEXT_TEMPLATES[Math.floor(Math.random() * QUICK_TEXT_TEMPLATES.length)];
    }
  }

  public async updateAllWeather(): Promise<void> {
    const topPeople = await relationshipTracker.getTopPeople();

    for (const person of topPeople) {
      await this.getWeather(person.id);
    }
  }

  private async saveWeather(weather: RelationshipWeather): Promise<void> {
    try {
      const weatherJson = await AsyncStorage.getItem('lifeos_relationship_weather');
      const allWeather: RelationshipWeather[] = weatherJson ? JSON.parse(weatherJson) : [];

      const index = allWeather.findIndex((w) => w.personId === weather.personId);
      if (index >= 0) {
        allWeather[index] = weather;
      } else {
        allWeather.push(weather);
      }

      await AsyncStorage.setItem('lifeos_relationship_weather', JSON.stringify(allWeather));
    } catch (error) {
      console.error('Error saving weather:', error);
    }
  }

  public async getWeatherForPerson(personId: string): Promise<RelationshipWeather | null> {
    try {
      const weatherJson = await AsyncStorage.getItem('lifeos_relationship_weather');
      if (!weatherJson) return null;

      const allWeather: RelationshipWeather[] = JSON.parse(weatherJson);
      return allWeather.find((w) => w.personId === personId) || null;
    } catch (error) {
      console.error('Error getting weather:', error);
      return null;
    }
  }

  public async getAllWeather(): Promise<RelationshipWeather[]> {
    try {
      const weatherJson = await AsyncStorage.getItem('lifeos_relationship_weather');
      if (!weatherJson) return [];

      return JSON.parse(weatherJson);
    } catch (error) {
      console.error('Error getting all weather:', error);
      return [];
    }
  }
}

export const relationshipWeatherEngine = new RelationshipWeatherEngine();
