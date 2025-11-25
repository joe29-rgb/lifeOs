/**
 * Mood Selector Component
 * Emoji + slider for mood input
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MoodLevel } from '../modules/health/types/health.types';
import { MOOD_EMOJIS } from '../modules/health/constants/health.constants';

interface MoodSelectorProps {
  selectedMood: MoodLevel | null;
  onSelect: (mood: MoodLevel) => void;
}

export function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.moodGrid}>
        {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as MoodLevel[]).map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[styles.moodButton, selectedMood === mood && styles.moodButtonSelected]}
            onPress={() => onSelect(mood)}
          >
            <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood]}</Text>
            <Text style={styles.moodNumber}>{mood}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodNumber: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
  },
});
