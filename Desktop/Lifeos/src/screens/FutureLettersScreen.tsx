/**
 * Future Letters Screen
 * Write and view letters to future self
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FutureLetter } from '../modules/pastYou/types/pastYou.types';
import { FUTURE_LETTER_DURATIONS } from '../modules/pastYou/constants/pastYou.constants';

export function FutureLettersScreen() {
  const [letters, setLetters] = useState<FutureLetter[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(30);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    const data = await AsyncStorage.getItem('@future_letters');
    if (data) {
      const parsed: FutureLetter[] = JSON.parse(data);
      setLetters(
        parsed.map((l) => ({
          ...l,
          writtenAt: new Date(l.writtenAt),
          deliverAt: new Date(l.deliverAt),
        }))
      );
    }
  };

  const saveLetter = async () => {
    if (!letterContent.trim()) {
      Alert.alert('Empty Letter', 'Please write something to your future self.');
      return;
    }

    const newLetter: FutureLetter = {
      id: `letter_${Date.now()}`,
      content: letterContent,
      writtenAt: new Date(),
      deliverAt: new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000),
      delivered: false,
    };

    const updated = [...letters, newLetter];
    await AsyncStorage.setItem('@future_letters', JSON.stringify(updated));
    setLetters(updated);
    setLetterContent('');
    setIsWriting(false);

    Alert.alert(
      'Letter Scheduled',
      `Your letter will be delivered on ${newLetter.deliverAt.toLocaleDateString()}`
    );
  };

  const deleteLetter = async (id: string) => {
    Alert.alert('Delete Letter?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = letters.filter((l) => l.id !== id);
          await AsyncStorage.setItem('@future_letters', JSON.stringify(updated));
          setLetters(updated);
        },
      },
    ]);
  };

  const markDelivered = async (id: string) => {
    const updated = letters.map((l) => (l.id === id ? { ...l, delivered: true } : l));
    await AsyncStorage.setItem('@future_letters', JSON.stringify(updated));
    setLetters(updated);
  };

  const getPendingLetters = () => letters.filter((l) => !l.delivered);
  const getDeliveredLetters = () => letters.filter((l) => l.delivered);

  if (isWriting) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsWriting(false)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>✉️ Letter to Future You</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.writeCard}>
            <Text style={styles.writeLabel}>When should this be delivered?</Text>
            <View style={styles.durationButtons}>
              {FUTURE_LETTER_DURATIONS.map((duration) => (
                <TouchableOpacity
                  key={duration.days}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration.days && styles.durationButtonActive,
                  ]}
                  onPress={() => setSelectedDuration(duration.days)}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      selectedDuration === duration.days && styles.durationButtonTextActive,
                    ]}
                  >
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.writeLabel}>Dear Future Me,</Text>
            <TextInput
              style={styles.letterInput}
              value={letterContent}
              onChangeText={setLetterContent}
              placeholder="What do you want to tell your future self?&#10;&#10;Today I'm deciding about...&#10;I'm scared because...&#10;But I'm going for it because...&#10;&#10;Future Me: Remember..."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.deliveryNote}>
              Delivery date: {new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </Text>

            <TouchableOpacity style={styles.saveButton} onPress={saveLetter}>
              <Text style={styles.saveButtonText}>Schedule Delivery</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✉️ Future Letters</Text>
        <Text style={styles.subtitle}>Messages to your future self</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <TouchableOpacity style={styles.writeNewButton} onPress={() => setIsWriting(true)}>
          <Text style={styles.writeNewButtonText}>+ Write New Letter</Text>
        </TouchableOpacity>

        {getPendingLetters().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📬 Pending Delivery</Text>
            {getPendingLetters().map((letter) => (
              <View key={letter.id} style={styles.letterCard}>
                <View style={styles.letterHeader}>
                  <Text style={styles.letterDate}>
                    Delivers: {letter.deliverAt.toLocaleDateString()}
                  </Text>
                  <TouchableOpacity onPress={() => deleteLetter(letter.id)}>
                    <Text style={styles.deleteButton}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.letterPreview} numberOfLines={3}>
                  {letter.content}
                </Text>
                <Text style={styles.letterMeta}>
                  Written {letter.writtenAt.toLocaleDateString()}
                </Text>
                {new Date() >= letter.deliverAt && (
                  <TouchableOpacity
                    style={styles.readButton}
                    onPress={() => markDelivered(letter.id)}
                  >
                    <Text style={styles.readButtonText}>Mark as Read</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {getDeliveredLetters().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📭 Delivered</Text>
            {getDeliveredLetters().map((letter) => (
              <View key={letter.id} style={[styles.letterCard, styles.deliveredCard]}>
                <Text style={styles.letterDate}>
                  Delivered: {letter.deliverAt.toLocaleDateString()}
                </Text>
                <Text style={styles.letterContent}>{letter.content}</Text>
                <Text style={styles.letterMeta}>
                  Written {letter.writtenAt.toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {letters.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Letters Yet</Text>
            <Text style={styles.emptyText}>
              Write a letter to your future self. It will be delivered on the date you choose.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { fontSize: 16, color: '#4CAF50', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  subtitle: { fontSize: 14, color: '#757575', marginTop: 4 },
  scrollView: { flex: 1 },
  writeNewButton: { backgroundColor: '#4CAF50', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  writeNewButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  writeCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 12 },
  writeLabel: { fontSize: 16, fontWeight: '600', color: '#212121', marginBottom: 12 },
  durationButtons: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  durationButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', marginRight: 8, marginBottom: 8 },
  durationButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  durationButtonText: { fontSize: 14, color: '#616161' },
  durationButtonTextActive: { color: '#FFFFFF', fontWeight: '600' },
  letterInput: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, minHeight: 200, fontSize: 15, lineHeight: 22, marginBottom: 12 },
  deliveryNote: { fontSize: 12, color: '#757575', marginBottom: 16 },
  saveButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  letterCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  deliveredCard: { backgroundColor: '#E8F5E9' },
  letterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  letterDate: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  deleteButton: { fontSize: 14, color: '#F44336' },
  letterPreview: { fontSize: 15, color: '#212121', lineHeight: 22, marginBottom: 8 },
  letterContent: { fontSize: 15, color: '#212121', lineHeight: 22, marginBottom: 12 },
  letterMeta: { fontSize: 12, color: '#757575' },
  readButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  readButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', padding: 32, marginTop: 50 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#757575', textAlign: 'center' },
});
