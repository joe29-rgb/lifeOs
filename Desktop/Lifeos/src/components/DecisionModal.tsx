/**
 * Decision Modal Component
 * Fast modal for logging decisions with minimal input
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Decision } from '../modules/decisions/types/decision.types';
import { DECISION_CATEGORIES, EMOTION_OPTIONS } from '../modules/decisions/constants/decision.constants';

interface DecisionModalProps {
  decision: Decision | null;
  visible: boolean;
  onClose: () => void;
  onCreate: (decision: Partial<Decision>) => Promise<Decision>;
}

export function DecisionModal({ decision, visible, onClose, onCreate }: DecisionModalProps) {
  const [title, setTitle] = useState(decision?.title || '');
  const [description, setDescription] = useState(decision?.description || '');
  const [selectedCategory, setSelectedCategory] = useState<any>(decision?.category || 'other');
  const [selectedEmotions, setSelectedEmotions] = useState<any[]>(decision?.emotions || []);
  const [confidence, setConfidence] = useState(decision?.confidence || 3);

  const handleSave = async () => {
    if (!title.trim()) return;

    await onCreate({
      title,
      description,
      category: selectedCategory,
      emotions: selectedEmotions,
      confidence,
      choices: [],
    });

    onClose();
  };

  const toggleEmotion = (emotion: any) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Log Decision</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>What are you deciding?</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Should I take the new job?"
              placeholderTextColor="#9E9E9E"
            />

            <Text style={styles.label}>Details (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add any context..."
              placeholderTextColor="#9E9E9E"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {Object.entries(DECISION_CATEGORIES).map(([key, cat]: any) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryButton,
                    selectedCategory === key && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(key)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>How are you feeling?</Text>
            <View style={styles.emotionGrid}>
              {EMOTION_OPTIONS.map((emotion) => (
                <TouchableOpacity
                  key={emotion.type}
                  style={[
                    styles.emotionButton,
                    selectedEmotions.includes(emotion.type) && styles.emotionButtonActive,
                  ]}
                  onPress={() => toggleEmotion(emotion.type)}
                >
                  <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                  <Text style={styles.emotionLabel}>{emotion.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Confidence: {confidence}/5</Text>
            <View style={styles.confidenceSlider}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.confidenceButton,
                    confidence === level && styles.confidenceButtonActive,
                  ]}
                  onPress={() => setConfidence(level)}
                >
                  <Text style={styles.confidenceText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Decision</Text>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    fontSize: 24,
    color: '#757575',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emotionButtonActive: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  confidenceSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  confidenceButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  confidenceButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
