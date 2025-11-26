/**
 * Life Screen
 * Combines Decisions + Relationships
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useDecisionTracking } from '../hooks/useDecisionTracking';
import { useRelationshipMonitoring } from '../hooks/useRelationshipMonitoring';

export function LifeScreen() {
  const { decisions } = useDecisionTracking();
  const { topPeople, weather } = useRelationshipMonitoring();

  const getWeatherEmoji = (status: string) => {
    switch (status) {
      case 'sunny': return '☀️';
      case 'partly_cloudy': return '⛅';
      case 'cloudy': return '☁️';
      case 'stormy': return '⛈️';
      default: return '☀️';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💭 Your Life</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Decisions</Text>
          {decisions.slice(0, 3).map((decision) => (
            <View key={decision.id} style={styles.decisionCard}>
              <Text style={styles.decisionTitle}>{decision.title}</Text>
              <Text style={styles.decisionMeta}>
                Decided: {new Date(decision.timestamp).toLocaleDateString()}
              </Text>
              <Text style={styles.decisionMeta}>
                Confidence: {decision.confidence}/10
              </Text>
              <View style={styles.decisionButtons}>
                <TouchableOpacity style={styles.decisionButton}>
                  <Text style={styles.decisionButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.decisionButton}>
                  <Text style={styles.decisionButtonText}>Add Notes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Log New Decision</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❤️ Important People</Text>
          {topPeople.slice(0, 5).map((person) => {
            const personWeather = weather.find((w) => w.personId === person.id);
            return (
              <View key={person.id} style={styles.personCard}>
                <View style={styles.personHeader}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personWeather}>
                    {getWeatherEmoji(personWeather?.status || 'sunny')} {personWeather?.status || 'Sunny'}
                  </Text>
                </View>
                <Text style={styles.personMeta}>
                  Last contact: {person.lastContact ? new Date(person.lastContact).toLocaleDateString() : 'Never'}
                </Text>
                <View style={styles.personButtons}>
                  <TouchableOpacity style={styles.personButton}>
                    <Text style={styles.personButtonText}>Call Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.personButton}>
                    <Text style={styles.personButtonText}>Text</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.personButton}>
                    <Text style={styles.personButtonText}>View History</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>✅ Best decisions after 7+ hrs sleep (your pattern)</Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>❤️ Relationship quality → mood correlation: 0.82</Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>⚠️ You regret decisions made when tired (4/5 times)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  scrollView: { flex: 1 },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  decisionCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  decisionTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  decisionMeta: { fontSize: 14, color: '#757575', marginBottom: 4 },
  decisionButtons: { flexDirection: 'row', marginTop: 12 },
  decisionButton: { flex: 1, backgroundColor: '#2196F3', padding: 10, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  decisionButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  addButton: { backgroundColor: '#4CAF50', marginHorizontal: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  personCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  personHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  personName: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  personWeather: { fontSize: 14, color: '#616161' },
  personMeta: { fontSize: 14, color: '#757575', marginBottom: 12 },
  personButtons: { flexDirection: 'row' },
  personButton: { flex: 1, backgroundColor: '#2196F3', padding: 10, borderRadius: 8, marginHorizontal: 2, alignItems: 'center' },
  personButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  insightCard: { backgroundColor: '#E3F2FD', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8 },
  insightText: { fontSize: 14, color: '#212121' },
});
