/**
 * Health Alert Component
 * Early warning pop-ups for mental/physical health
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MentalHealthAlert } from '../modules/health/types/health.types';

interface HealthAlertProps {
  alert: MentalHealthAlert;
  visible: boolean;
  onDismiss: () => void;
  onAction: (action: string) => void;
}

export function HealthAlert({ alert, visible, onDismiss, onAction }: HealthAlertProps) {
  const severityColor = alert.severity === 'critical' ? '#F44336' : alert.severity === 'warning' ? '#FF9800' : '#2196F3';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { borderTopColor: severityColor }]}>
          <Text style={styles.title}>{alert.title}</Text>
          <Text style={styles.message}>{alert.message}</Text>

          {alert.signals.length > 0 && (
            <View style={styles.signalsSection}>
              <Text style={styles.signalsTitle}>Signals:</Text>
              {alert.signals.map((signal, idx) => (
                <Text key={idx} style={styles.signalText}>
                  • {signal}
                </Text>
              ))}
            </View>
          )}

          {alert.suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Suggested actions:</Text>
              {alert.suggestions.map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionButton}
                  onPress={() => onAction(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 4,
    padding: 24,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#616161',
    marginBottom: 16,
    lineHeight: 24,
  },
  signalsSection: {
    marginBottom: 16,
  },
  signalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  signalText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    marginLeft: 8,
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  suggestionButton: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
