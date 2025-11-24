/**
 * Decision Card Component
 * Displays a decision summary with status and actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Decision } from '../modules/decisions/types/decision.types';
import { DECISION_CATEGORIES } from '../modules/decisions/constants/decision.constants';

interface DecisionCardProps {
  decision: Decision;
  onPress: () => void;
}

export function DecisionCard({ decision, onPress }: DecisionCardProps) {
  const category = DECISION_CATEGORIES[decision.category];
  const statusColor = decision.status === 'reviewed' ? '#4CAF50' : decision.status === 'made' ? '#2196F3' : '#FF9800';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryLabel}>{category.label}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{decision.status}</Text>
        </View>
      </View>

      <Text style={styles.title}>{decision.title}</Text>
      
      {decision.description && (
        <Text style={styles.description} numberOfLines={2}>
          {decision.description}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {decision.choices.length} options • Confidence: {decision.confidence}/5
        </Text>
        {decision.decidedAt && (
          <Text style={styles.dateText}>
            {new Date(decision.decidedAt).toLocaleDateString()}
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#616161',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  dateText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});
