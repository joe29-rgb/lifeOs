/**
 * Relationship Weather Badge Component
 * Displays weather-style relationship status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RelationshipWeather } from '../modules/relationships/types/relationship.types';
import { WEATHER_STATUS } from '../modules/relationships/constants/relationship.constants';

interface RelationshipWeatherBadgeProps {
  weather: RelationshipWeather;
}

export function RelationshipWeatherBadge({ weather }: RelationshipWeatherBadgeProps) {
  const statusInfo = WEATHER_STATUS[weather.status];

  return (
    <View style={[styles.badge, { backgroundColor: statusInfo.color + '20' }]}>
      <Text style={styles.emoji}>{statusInfo.emoji}</Text>
      <View style={styles.info}>
        <Text style={styles.label}>{statusInfo.label}</Text>
        <Text style={styles.forecast} numberOfLines={1}>
          {weather.forecast}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: 180,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  forecast: {
    fontSize: 10,
    color: '#757575',
  },
});
