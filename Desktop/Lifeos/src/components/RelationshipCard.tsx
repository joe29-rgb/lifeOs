/**
 * Relationship Card Component
 * Displays person info with weather status and quick actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Person, RelationshipWeather } from '../modules/relationships/types/relationship.types';
import { RelationshipWeatherBadge } from './RelationshipWeatherBadge';

interface RelationshipCardProps {
  person: Person;
  weather?: RelationshipWeather | null;
  onPress: () => void;
  onQuickContact: (type: 'call' | 'text') => void;
  showAlert?: boolean;
}

export function RelationshipCard({ person, weather, onPress, onQuickContact, showAlert }: RelationshipCardProps) {
  return (
    <TouchableOpacity style={[styles.card, showAlert && styles.alertCard]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {person.photoUri ? (
            <Image source={{ uri: person.photoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{person.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.relationship}>{person.relationshipType}</Text>
          </View>
        </View>

        {weather && <RelationshipWeatherBadge weather={weather} />}
      </View>

      <View style={styles.actions}>
        {person.phoneNumber && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onQuickContact('call');
              }}
            >
              <Text style={styles.actionText}>📞 Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onQuickContact('text');
              }}
            >
              <Text style={styles.actionText}>💬 Text</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  relationship: {
    fontSize: 14,
    color: '#757575',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
});
