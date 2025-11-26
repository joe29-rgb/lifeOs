/**
 * Emergency Contacts Screen
 * Quick-dial emergency contacts
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { EmergencyContactManager } from '../modules/crisis/services/EmergencyContactManager';
import { EmergencyContact } from '../modules/crisis/types/crisis.types';

const contactManager = new EmergencyContactManager();

export function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const loaded = await contactManager.getContacts();
    setContacts(loaded.sort((a, b) => a.priority - b.priority));
  };

  const handleCall = async (contact: EmergencyContact) => {
    Alert.alert(
      `Call ${contact.name}?`,
      contact.description || `Call ${contact.relationship}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: async () => {
            await contactManager.callContact(contact.phone);
          },
        },
      ]
    );
  };

  const handleText = async (contact: EmergencyContact) => {
    await contactManager.textContact(contact.phone);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📞 Emergency Contacts</Text>
        <Text style={styles.subtitle}>Your support network</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {contacts.length > 0 ? (
          <>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.autoNotify && (
                    <View style={styles.autoNotifyBadge}>
                      <Text style={styles.autoNotifyText}>Auto-notify</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                {contact.description && (
                  <Text style={styles.contactDescription}>&quot;{contact.description}&quot;</Text>
                )}
                <View style={styles.contactButtons}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(contact)}
                  >
                    <Text style={styles.callButtonText}>📞 Call Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.textButton}
                    onPress={() => handleText(contact)}
                  >
                    <Text style={styles.textButtonText}>💬 Text</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptyText}>
              Add trusted people who can support you during difficult times.
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💙 About Emergency Contacts</Text>
          <Text style={styles.infoText}>
            These are people you trust who can provide support during a crisis.
            You can enable auto-notify to have Timeline send them a message if it detects you&apos;re in distress.
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
  contactCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12 },
  contactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  contactName: { fontSize: 20, fontWeight: 'bold', color: '#212121' },
  autoNotifyBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  autoNotifyText: { fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' },
  contactRelationship: { fontSize: 14, color: '#757575', marginBottom: 8 },
  contactDescription: { fontSize: 14, color: '#616161', fontStyle: 'italic', marginBottom: 12 },
  contactButtons: { flexDirection: 'row' },
  callButton: { flex: 1, backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  callButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  textButton: { flex: 1, backgroundColor: '#2196F3', padding: 12, borderRadius: 8, alignItems: 'center' },
  textButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', padding: 32, marginTop: 50 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#757575', textAlign: 'center', marginBottom: 24 },
  addButton: { backgroundColor: '#4CAF50', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  infoCard: { backgroundColor: '#E3F2FD', marginHorizontal: 16, marginTop: 16, marginBottom: 24, padding: 16, borderRadius: 12 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#616161', lineHeight: 20 },
});
