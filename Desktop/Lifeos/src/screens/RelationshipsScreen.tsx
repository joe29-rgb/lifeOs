/**
 * Relationships Screen
 * Main screen for relationship monitoring and management
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRelationshipMonitoring } from '../hooks/useRelationshipMonitoring';
import { RelationshipCard } from '../components/RelationshipCard';
import { Person } from '../modules/relationships/types/relationship.types';

export function RelationshipsScreen() {
  const {
    topPeople,
    weather,
    activeDrifts,
    loading,
    logContact,
    refresh,
  } = useRelationshipMonitoring();

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const getWeatherForPerson = (personId: string) => {
    return weather.find((w) => w.personId === personId);
  };

  const handleQuickContact = async (personId: string, type: 'call' | 'text') => {
    await logContact({
      personId,
      type,
      sentiment: 'positive',
      occurredAt: new Date(),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>People</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {activeDrifts.length > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            ⚠️ {activeDrifts.length} relationship{activeDrifts.length > 1 ? 's' : ''} need attention
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Your Top People</Text>
          {topPeople.length === 0 ? (
            <Text style={styles.emptyText}>Add your top 5 people to start tracking</Text>
          ) : (
            topPeople.map((person) => (
              <RelationshipCard
                key={person.id}
                person={person}
                weather={getWeatherForPerson(person.id)}
                onPress={() => setSelectedPerson(person)}
                onQuickContact={(type) => handleQuickContact(person.id, type)}
              />
            ))
          )}
        </View>

        {activeDrifts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌧️ Needs Attention</Text>
            {activeDrifts.map((drift) => {
              const person = topPeople.find((p) => p.id === drift.personId);
              if (!person) return null;

              return (
                <RelationshipCard
                  key={drift.id}
                  person={person}
                  weather={getWeatherForPerson(person.id)}
                  onPress={() => setSelectedPerson(person)}
                  onQuickContact={(type) => handleQuickContact(person.id, type)}
                  showAlert
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  alertBanner: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  alertText: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 16,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
    marginTop: 32,
  },
});
