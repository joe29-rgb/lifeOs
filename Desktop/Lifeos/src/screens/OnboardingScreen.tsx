/**
 * Onboarding Screen
 * First-time setup flow
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';

export function OnboardingScreen() {
  const { setOnboarded, updateProfile } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [sleepGoal, setSleepGoal] = useState(7.5);
  const [exerciseGoal, setExerciseGoal] = useState(4);
  const [workType, setWorkType] = useState<'remote' | 'hybrid' | 'office'>('hybrid');

  const handleComplete = async () => {
    await updateProfile({
      name,
      sleepGoal,
      exerciseGoal,
      workType,
    });
    await setOnboarded(true);
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.title}>Welcome to Timeline</Text>
          <Text style={styles.subtitle}>Your AI-powered life operating system.</Text>
          <Text style={styles.description}>
            Timeline captures, analyzes, and predicts patterns in your life to help you make better decisions.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Let&apos;s get to know you</Text>
          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#999"
            />
            <Text style={styles.label}>Sleep Goal (hours)</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity onPress={() => setSleepGoal(Math.max(6, sleepGoal - 0.5))}>
                <Text style={styles.sliderButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.sliderValue}>{sleepGoal} hours</Text>
              <TouchableOpacity onPress={() => setSleepGoal(Math.min(9, sleepGoal + 0.5))}>
                <Text style={styles.sliderButton}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Exercise Goal (days/week)</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity onPress={() => setExerciseGoal(Math.max(0, exerciseGoal - 1))}>
                <Text style={styles.sliderButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.sliderValue}>{exerciseGoal} days</Text>
              <TouchableOpacity onPress={() => setExerciseGoal(Math.min(7, exerciseGoal + 1))}>
                <Text style={styles.sliderButton}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Work Type</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.optionButton, workType === 'remote' && styles.optionButtonActive]}
                onPress={() => setWorkType('remote')}
              >
                <Text style={[styles.optionButtonText, workType === 'remote' && styles.optionButtonTextActive]}>
                  Remote
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, workType === 'hybrid' && styles.optionButtonActive]}
                onPress={() => setWorkType('hybrid')}
              >
                <Text style={[styles.optionButtonText, workType === 'hybrid' && styles.optionButtonTextActive]}>
                  Hybrid
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, workType === 'office' && styles.optionButtonActive]}
                onPress={() => setWorkType('office')}
              >
                <Text style={[styles.optionButtonText, workType === 'office' && styles.optionButtonTextActive]}>
                  Office
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>You&apos;re all set!</Text>
        <Text style={styles.description}>
          Timeline will learn your patterns over the next few days and start providing insights.
        </Text>
        <Text style={styles.subtitle}>For best results:</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tip}>• Log your mood daily</Text>
          <Text style={styles.tip}>• Use voice logging</Text>
          <Text style={styles.tip}>• Review your briefing each night</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Start Using Timeline</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#212121', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#616161', textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 16, color: '#757575', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  button: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  form: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#212121', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, color: '#212121' },
  sliderContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  sliderButton: { fontSize: 32, color: '#4CAF50', paddingHorizontal: 24 },
  sliderValue: { fontSize: 20, fontWeight: 'bold', color: '#212121', minWidth: 120, textAlign: 'center' },
  buttonGroup: { flexDirection: 'row', marginTop: 8 },
  optionButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginHorizontal: 4, alignItems: 'center' },
  optionButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  optionButtonText: { fontSize: 14, color: '#616161' },
  optionButtonTextActive: { color: '#FFFFFF', fontWeight: '600' },
  tipsList: { marginTop: 16, marginBottom: 16 },
  tip: { fontSize: 16, color: '#616161', marginBottom: 8 },
});
