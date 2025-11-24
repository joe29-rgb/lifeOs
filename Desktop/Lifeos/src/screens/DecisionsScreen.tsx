/**
 * Decisions Screen
 * Main screen for decision tracking and review
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useDecisionTracking } from '../hooks/useDecisionTracking';
import { DecisionCard } from '../components/DecisionCard';
import { DecisionModal } from '../components/DecisionModal';
import { Decision } from '../modules/decisions/types/decision.types';

export function DecisionsScreen() {
  const {
    decisions,
    pendingDecisions,
    reviewDue,
    stats,
    loading,
    createDecision,
    refresh,
  } = useDecisionTracking();

  const [showModal, setShowModal] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

  const handleNewDecision = () => {
    setSelectedDecision(null);
    setShowModal(true);
  };

  const handleDecisionPress = (decision: Decision) => {
    setSelectedDecision(decision);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Decisions</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNewDecision}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Decision Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalDecisions}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageSatisfaction.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.patternsIdentified}</Text>
              <Text style={styles.statLabel}>Patterns</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {reviewDue.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Ready for Review</Text>
            {reviewDue.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onPress={() => handleDecisionPress(decision)}
              />
            ))}
          </View>
        )}

        {pendingDecisions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤔 Pending Decisions</Text>
            {pendingDecisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onPress={() => handleDecisionPress(decision)}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 All Decisions</Text>
          {decisions.length === 0 ? (
            <Text style={styles.emptyText}>No decisions yet. Start tracking your choices!</Text>
          ) : (
            decisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onPress={() => handleDecisionPress(decision)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {showModal && (
        <DecisionModal
          decision={selectedDecision}
          visible={showModal}
          onClose={() => setShowModal(false)}
          onCreate={createDecision}
        />
      )}
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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
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
