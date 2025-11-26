/**
 * Breathing Screen
 * Guided breathing exercises with animation
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BREATHING_PATTERNS } from '../modules/crisis/constants/crisis.constants';

export function BreathingScreen() {
  const [selectedPattern, setSelectedPattern] = useState<keyof typeof BREATHING_PATTERNS>('calm_478');
  const [isActive, setIsActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const scaleAnim = useState(new Animated.Value(0.5))[0];

  const pattern = BREATHING_PATTERNS[selectedPattern];

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          advancePhase();
          return getNextPhaseDuration();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  useEffect(() => {
    if (isActive) {
      animateCircle();
    }
  }, [phase, isActive]);

  const getNextPhaseDuration = (): number => {
    switch (phase) {
      case 'inhale': return pattern.hold1;
      case 'hold1': return pattern.exhale;
      case 'exhale': return pattern.hold2;
      case 'hold2': return pattern.inhale;
      default: return 0;
    }
  };

  const advancePhase = () => {
    if (phase === 'inhale') {
      setPhase(pattern.hold1 > 0 ? 'hold1' : 'exhale');
    } else if (phase === 'hold1') {
      setPhase('exhale');
    } else if (phase === 'exhale') {
      setPhase(pattern.hold2 > 0 ? 'hold2' : 'inhale');
    } else {
      if (currentRound >= pattern.rounds) {
        completeSession();
      } else {
        setCurrentRound((prev) => prev + 1);
        setPhase('inhale');
      }
    }
  };

  const animateCircle = () => {
    const targetScale = phase === 'inhale' ? 1 : phase === 'exhale' ? 0.5 : scaleAnim._value;
    const duration = (phase === 'inhale' ? pattern.inhale : phase === 'exhale' ? pattern.exhale : 0) * 1000;

    if (duration > 0) {
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration,
        useNativeDriver: true,
      }).start();
    }
  };

  const startSession = () => {
    setIsActive(true);
    setCurrentRound(1);
    setPhase('inhale');
    setTimeLeft(pattern.inhale);
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const completeSession = () => {
    setIsActive(false);
    setCurrentRound(1);
    setPhase('inhale');
    setTimeLeft(0);
    scaleAnim.setValue(0.5);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe IN';
      case 'hold1': return 'HOLD';
      case 'exhale': return 'Breathe OUT';
      case 'hold2': return 'HOLD';
      default: return '';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return '#4CAF50';
      case 'hold1': return '#2196F3';
      case 'exhale': return '#FF9800';
      case 'hold2': return '#2196F3';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🫁 Breathing Exercise</Text>
        <Text style={styles.subtitle}>Follow the circle and breathe</Text>
      </View>

      {!isActive && (
        <View style={styles.patternSelector}>
          <TouchableOpacity
            style={[styles.patternButton, selectedPattern === 'calm_478' && styles.patternButtonActive]}
            onPress={() => setSelectedPattern('calm_478')}
          >
            <Text style={[styles.patternButtonText, selectedPattern === 'calm_478' && styles.patternButtonTextActive]}>
              4-7-8 Calm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.patternButton, selectedPattern === 'box' && styles.patternButtonActive]}
            onPress={() => setSelectedPattern('box')}
          >
            <Text style={[styles.patternButtonText, selectedPattern === 'box' && styles.patternButtonTextActive]}>
              Box Breathing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.patternButton, selectedPattern === 'simple' && styles.patternButtonActive]}
            onPress={() => setSelectedPattern('simple')}
          >
            <Text style={[styles.patternButtonText, selectedPattern === 'simple' && styles.patternButtonTextActive]}>
              Simple Deep
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: getPhaseColor(),
            },
          ]}
        >
          {isActive && (
            <>
              <Text style={styles.phaseText}>{getPhaseText()}</Text>
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </>
          )}
        </Animated.View>
      </View>

      {isActive && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Round {currentRound} of {pattern.rounds}
          </Text>
          <Text style={styles.encouragement}>You&apos;re doing great. Keep going.</Text>
        </View>
      )}

      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startSession}>
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity style={styles.pauseButton} onPress={pauseSession}>
              <Text style={styles.pauseButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endButton} onPress={completeSession}>
              <Text style={styles.endButtonText}>End</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{pattern.name}</Text>
        <Text style={styles.infoText}>
          Inhale: {pattern.inhale}s
          {pattern.hold1 > 0 && ` • Hold: ${pattern.hold1}s`}
          {' • '}Exhale: {pattern.exhale}s
          {pattern.hold2 > 0 && ` • Hold: ${pattern.hold2}s`}
        </Text>
        <Text style={styles.infoText}>{pattern.rounds} rounds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  subtitle: { fontSize: 14, color: '#757575', marginTop: 4 },
  patternSelector: { flexDirection: 'row', padding: 16, justifyContent: 'space-around' },
  patternButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginHorizontal: 4, alignItems: 'center' },
  patternButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  patternButtonText: { fontSize: 14, color: '#616161' },
  patternButtonTextActive: { color: '#FFFFFF', fontWeight: '600' },
  circleContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  breathingCircle: { width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
  phaseText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  timerText: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF' },
  progressContainer: { alignItems: 'center', marginBottom: 24 },
  progressText: { fontSize: 18, fontWeight: '600', color: '#212121', marginBottom: 8 },
  encouragement: { fontSize: 14, color: '#757575' },
  controls: { paddingHorizontal: 16, marginBottom: 16 },
  startButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center' },
  startButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  activeControls: { flexDirection: 'row' },
  pauseButton: { flex: 1, backgroundColor: '#2196F3', padding: 16, borderRadius: 12, marginRight: 8, alignItems: 'center' },
  pauseButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  endButton: { flex: 1, backgroundColor: '#F44336', padding: 16, borderRadius: 12, marginLeft: 8, alignItems: 'center' },
  endButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  infoCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#616161', marginBottom: 4 },
});
