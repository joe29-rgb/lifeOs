/**
 * Social Type Screen
 * Profile and patterns
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SocialTypeDetector } from '../modules/socialBattery/services/SocialTypeDetector';
import { DepletionDetector } from '../modules/socialBattery/services/DepletionDetector';
import { SocialProfile } from '../modules/socialBattery/types/socialBattery.types';

const typeDetector = new SocialTypeDetector();
const depletionDetector = new DepletionDetector();

export function SocialTypeScreen() {
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [balance, setBalance] = useState<{ socialHours: number; soloHours: number; ratio: number } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const socialProfile = await typeDetector.detectSocialType();
    setProfile(socialProfile);

    const socialBalance = await depletionDetector.getSocialBalance();
    setBalance(socialBalance);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'introvert': return '🧘';
      case 'extrovert': return '🎉';
      case 'ambivert': return '⚖️';
      default: return '🧠';
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'introvert':
        return 'Social when energized, needs recharge after';
      case 'extrovert':
        return 'Energized by social interaction, drains in solitude';
      case 'ambivert':
        return 'Balanced between social and solo preferences';
      default:
        return 'Still learning your patterns';
    }
  };

  if (!profile || !balance) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Your Social Profile</Text>
        <Text style={styles.subtitle}>Based on your patterns</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileCard}>
          <Text style={styles.typeIcon}>{getTypeIcon(profile.type)}</Text>
          <Text style={styles.typeTitle}>
            {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)}
          </Text>
          <Text style={styles.typeDescription}>{getTypeDescription(profile.type)}</Text>
          <Text style={styles.confidence}>Confidence: {profile.confidence}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Evidence</Text>
          {profile.evidence.map((item, idx) => (
            <View key={idx} style={styles.evidenceCard}>
              <Text style={styles.evidenceText}>✓ {item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Energy Pattern</Text>
          <View style={styles.patternCard}>
            <Text style={styles.patternLabel}>Recharge Speed:</Text>
            <Text style={styles.patternValue}>{profile.rechargeSpeed.toUpperCase()}</Text>
          </View>
          <View style={styles.patternCard}>
            <Text style={styles.patternLabel}>Optimal Solo Time:</Text>
            <Text style={styles.patternValue}>{profile.optimalSoloTime} hours/week minimum</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Preferred Social Formats</Text>
          {profile.preferredFormats.map((format, idx) => (
            <View key={idx} style={styles.formatCard}>
              <Text style={styles.formatText}>{format}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Weekly Balance</Text>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Social Time: {balance.socialHours.toFixed(1)} hours</Text>
            <Text style={styles.balanceTitle}>Solo Time: {balance.soloHours.toFixed(1)} hours</Text>
            <Text style={styles.balanceRatio}>
              Ratio: 1:{balance.ratio.toFixed(1)} (Social:Solo)
            </Text>
            <Text style={styles.balanceNote}>
              {balance.ratio > 10
                ? '✅ Healthy for introvert'
                : balance.ratio < 3
                ? '⚠️ May need more solo time'
                : '✅ Balanced'}
            </Text>
          </View>
        </View>

        {Object.keys(profile.energyImpactByPerson).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Energy Impact by Person</Text>
            {Object.entries(profile.energyImpactByPerson).map(([person, impact]) => (
              <View key={person} style={styles.personCard}>
                <Text style={styles.personName}>{person}</Text>
                <Text
                  style={[
                    styles.personImpact,
                    { color: impact > 0 ? '#4CAF50' : impact < 0 ? '#F44336' : '#757575' },
                  ]}
                >
                  {impact > 0 ? '+' : ''}{impact}% energy
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>💡 Personalized Recommendations</Text>
          <Text style={styles.recommendationText}>
            • Schedule weekly 1:1s with energizing friends
          </Text>
          <Text style={styles.recommendationText}>
            • Limit group events to 1-2 per month
          </Text>
          <Text style={styles.recommendationText}>
            • Block {profile.optimalSoloTime}+ hours/week for solo time
          </Text>
          <Text style={styles.recommendationText}>
            • Avoid back-to-back social days
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
  profileCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 24, borderRadius: 12, alignItems: 'center' },
  typeIcon: { fontSize: 64, marginBottom: 12 },
  typeTitle: { fontSize: 28, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  typeDescription: { fontSize: 14, color: '#616161', textAlign: 'center', marginBottom: 8 },
  confidence: { fontSize: 12, color: '#757575' },
  section: { marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  evidenceCard: { backgroundColor: '#E8F5E9', marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 8 },
  evidenceText: { fontSize: 14, color: '#212121' },
  patternCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patternLabel: { fontSize: 14, color: '#757575' },
  patternValue: { fontSize: 14, fontWeight: 'bold', color: '#212121' },
  formatCard: { backgroundColor: '#E3F2FD', marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 8 },
  formatText: { fontSize: 14, color: '#212121' },
  balanceCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  balanceTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  balanceRatio: { fontSize: 14, color: '#616161', marginTop: 8, marginBottom: 8 },
  balanceNote: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold' },
  personCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  personName: { fontSize: 14, color: '#212121' },
  personImpact: { fontSize: 14, fontWeight: 'bold' },
  recommendationsCard: { backgroundColor: '#FFF3E0', marginHorizontal: 16, marginBottom: 24, padding: 16, borderRadius: 12 },
  recommendationsTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  recommendationText: { fontSize: 14, color: '#616161', marginBottom: 8 },
});
