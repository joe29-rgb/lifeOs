/**
 * Crisis Screen
 * Main crisis support hub with immediate resources
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { CrisisDetector } from '../modules/crisis/services/CrisisDetector';
import { EmergencyContactManager } from '../modules/crisis/services/EmergencyContactManager';
import { EMERGENCY_HOTLINES, AFFIRMATIONS } from '../modules/crisis/constants/crisis.constants';
import { CrisisDetection } from '../modules/crisis/types/crisis.types';

const crisisDetector = new CrisisDetector();
const contactManager = new EmergencyContactManager();

export function CrisisScreen({ navigation }: { navigation: any }) {
  const [detection, setDetection] = useState<CrisisDetection | null>(null);
  const [affirmation, setAffirmation] = useState('');

  useEffect(() => {
    loadCrisisState();
    setRandomAffirmation();
  }, []);

  const loadCrisisState = async () => {
    const detected = await crisisDetector.detectCrisis();
    setDetection(detected);
  };

  const setRandomAffirmation = () => {
    const random = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setAffirmation(random);
  };

  const callHotline = async (phone: string) => {
    const url = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot make call', 'Phone dialer not available');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#F44336';
      case 'severe': return '#FF9800';
      case 'moderate': return '#FFC107';
      default: return '#2196F3';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🆘 Crisis Support</Text>
        <Text style={styles.subtitle}>You are not alone. Help is available.</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {detection && (
          <View style={[styles.alertCard, { borderLeftColor: getSeverityColor(detection.severity) }]}>
            <Text style={styles.alertTitle}>
              {detection.severity === 'critical' && '❤️ Please Get Help Right Now'}
              {detection.severity === 'severe' && '🧡 I\'m Concerned About You'}
              {detection.severity === 'moderate' && '💛 I Notice Some Patterns'}
              {detection.severity === 'mild' && '💙 Checking In'}
            </Text>
            <Text style={styles.alertMessage}>
              {detection.severity === 'critical' && "I hear you, and I'm worried about your safety. Please reach out for help right now."}
              {detection.severity === 'severe' && "I care about your wellbeing. You don't have to go through this alone."}
              {detection.severity === 'moderate' && "I've noticed some concerning patterns. Let's address them before they escalate."}
              {detection.severity === 'mild' && "Just checking in. I'm here if you need support."}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🆘 Emergency Resources</Text>
          <Text style={styles.sectionSubtitle}>Free, confidential, 24/7 support</Text>
          
          {EMERGENCY_HOTLINES.canada.map((hotline, idx) => (
            <View key={idx} style={styles.hotlineCard}>
              <Text style={styles.hotlineName}>{hotline.name}</Text>
              <Text style={styles.hotlineDescription}>{hotline.description}</Text>
              <Text style={styles.hotlineAvailable}>{hotline.available}</Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => callHotline(hotline.phone)}
              >
                <Text style={styles.callButtonText}>📞 Call {hotline.phone}</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.hotlineCard}>
            <Text style={styles.hotlineName}>{EMERGENCY_HOTLINES.emergency.name}</Text>
            <Text style={styles.hotlineDescription}>{EMERGENCY_HOTLINES.emergency.description}</Text>
            <TouchableOpacity
              style={[styles.callButton, styles.emergencyButton]}
              onPress={() => callHotline(EMERGENCY_HOTLINES.emergency.phone)}
            >
              <Text style={styles.callButtonText}>🚨 Call {EMERGENCY_HOTLINES.emergency.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🫁 Immediate Coping Tools</Text>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('Breathing')}
          >
            <Text style={styles.toolTitle}>Breathing Exercise</Text>
            <Text style={styles.toolDescription}>Calm your nervous system in 2 minutes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('Grounding')}
          >
            <Text style={styles.toolTitle}>5-4-3-2-1 Grounding</Text>
            <Text style={styles.toolDescription}>Connect to the present moment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('CrisisJournal')}
          >
            <Text style={styles.toolTitle}>Crisis Journal</Text>
            <Text style={styles.toolDescription}>Private space to express feelings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Your Support Network</Text>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('EmergencyContacts')}
          >
            <Text style={styles.toolTitle}>Call Someone You Trust</Text>
            <Text style={styles.toolDescription}>Reach out to your emergency contacts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.affirmationCard}>
          <Text style={styles.affirmationText}>{affirmation}</Text>
          <TouchableOpacity onPress={setRandomAffirmation}>
            <Text style={styles.affirmationRefresh}>↻ Another message</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            ⚠️ I'm an AI assistant, not a therapist. If you're in crisis, please contact a professional immediately.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  subtitle: { fontSize: 14, color: '#757575', marginTop: 4 },
  scrollView: { flex: 1 },
  alertCard: { backgroundColor: '#FFF3E0', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12, borderLeftWidth: 4 },
  alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  alertMessage: { fontSize: 14, color: '#616161', lineHeight: 20 },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#757575', marginLeft: 16, marginBottom: 12 },
  hotlineCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  hotlineName: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  hotlineDescription: { fontSize: 14, color: '#616161', marginBottom: 4 },
  hotlineAvailable: { fontSize: 12, color: '#757575', marginBottom: 12 },
  callButton: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center' },
  emergencyButton: { backgroundColor: '#F44336' },
  callButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  toolCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 8 },
  toolTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  toolDescription: { fontSize: 14, color: '#616161' },
  affirmationCard: { backgroundColor: '#E3F2FD', marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 12, alignItems: 'center' },
  affirmationText: { fontSize: 16, color: '#212121', textAlign: 'center', lineHeight: 24, marginBottom: 12 },
  affirmationRefresh: { fontSize: 14, color: '#2196F3', fontWeight: '600' },
  disclaimerCard: { backgroundColor: '#FFEBEE', marginHorizontal: 16, marginTop: 16, marginBottom: 24, padding: 16, borderRadius: 12 },
  disclaimerText: { fontSize: 12, color: '#616161', textAlign: 'center', lineHeight: 18 },
});
