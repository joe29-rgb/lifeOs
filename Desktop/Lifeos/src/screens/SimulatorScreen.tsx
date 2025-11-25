/**
 * Simulator Screen
 * Main career simulator dashboard
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { useCareerSimulation } from '../hooks/useCareerSimulation';
import { useJobMatching } from '../hooks/useJobMatching';
import { Job } from '../modules/simulator/types/simulator.types';

export function SimulatorScreen() {
  const { loading, trajectory, simulations, skillGaps, setCurrentJob, createSimulation, analyzeSkillGaps } = useCareerSimulation();
  const { opportunities } = useJobMatching();
  const [showJobModal, setShowJobModal] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', salary: '', location: '' });

  const handleSetCurrentJob = async () => {
    const job: Job = {
      id: `job_${Date.now()}`,
      title: newJob.title,
      company: newJob.company,
      salary: parseInt(newJob.salary) || 0,
      location: newJob.location,
      workMode: 'hybrid',
      type: 'full-time',
      startDate: new Date(),
      skills: [],
    };
    await setCurrentJob(job);
    setShowJobModal(false);
    setNewJob({ title: '', company: '', salary: '', location: '' });
  };

  const handleSimulateJob = async (opportunity: typeof opportunities[0]) => {
    const alternateJob: Job = {
      id: opportunity.id,
      title: opportunity.title,
      company: opportunity.company,
      salary: (opportunity.salary.min + opportunity.salary.max) / 2,
      location: opportunity.location,
      workMode: opportunity.workMode,
      type: opportunity.type,
      startDate: new Date(),
      skills: opportunity.requiredSkills,
      satisfaction: 7.5,
      stressLevel: 6,
    };

    try {
      await createSimulation(
        `${opportunity.title} at ${opportunity.company}`,
        `Simulation of ${opportunity.title} opportunity`,
        alternateJob
      );
      alert('Simulation created! Check the simulations list.');
    } catch (error) {
      alert('Please set your current job first');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Career Simulator</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {!trajectory || trajectory.currentSalary === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>🚀 Start Your Career Journey</Text>
            <Text style={styles.emptyText}>Set your current job to unlock career simulations</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowJobModal(true)}>
              <Text style={styles.primaryButtonText}>Set Current Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Your Trajectory</Text>
              <View style={styles.card}>
                <Text style={styles.metricLabel}>Current Salary</Text>
                <Text style={styles.metricValue}>${trajectory.currentSalary.toLocaleString()}</Text>
                <Text style={styles.metricLabel}>5-Year Projection</Text>
                <Text style={styles.metricValue}>
                  ${trajectory.projectedSalary[trajectory.projectedSalary.length - 1]?.value.toLocaleString() || '0'}
                </Text>
                <Text style={styles.metricLabel}>Market Position</Text>
                <Text style={styles.metricValue}>{trajectory.marketPosition}/100</Text>
                <Text style={styles.trendText}>
                  Trend: {trajectory.satisfactionTrend === 'improving' ? '📈' : trajectory.satisfactionTrend === 'declining' ? '📉' : '➡️'} {trajectory.satisfactionTrend}
                </Text>
              </View>
            </View>

            {simulations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔮 Your Simulations</Text>
                {simulations.slice(0, 3).map((sim) => (
                  <View key={sim.id} style={styles.card}>
                    <Text style={styles.simTitle}>{sim.name}</Text>
                    <Text style={styles.simDesc}>{sim.description}</Text>
                    <View style={styles.simResults}>
                      <Text style={styles.simMetric}>
                        Salary Δ: {sim.results.comparison.salaryDifference > 0 ? '+' : ''}
                        ${sim.results.comparison.salaryDifference.toLocaleString()}
                      </Text>
                      <Text style={styles.simMetric}>
                        Regret Risk: {Math.round(sim.results.regretProbability * 100)}%
                      </Text>
                    </View>
                    <Text style={styles.recommendation}>{sim.results.recommendation}</Text>
                  </View>
                ))}
              </View>
            )}

            {opportunities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💼 Job Opportunities</Text>
                {opportunities.slice(0, 3).map((opp) => (
                  <View key={opp.id} style={styles.card}>
                    <View style={styles.oppHeader}>
                      <View style={styles.oppInfo}>
                        <Text style={styles.oppTitle}>{opp.title}</Text>
                        <Text style={styles.oppCompany}>{opp.company}</Text>
                      </View>
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchScore}>{opp.matchScore}%</Text>
                      </View>
                    </View>
                    <Text style={styles.oppSalary}>
                      ${opp.salary.min.toLocaleString()} - ${opp.salary.max.toLocaleString()}
                    </Text>
                    <Text style={styles.oppLocation}>📍 {opp.location} • {opp.workMode}</Text>
                    <TouchableOpacity
                      style={styles.simulateButton}
                      onPress={() => handleSimulateJob(opp)}
                    >
                      <Text style={styles.simulateButtonText}>Simulate This Job</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {skillGaps.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📚 Skill Gaps</Text>
                {skillGaps.slice(0, 3).map((gap, idx) => (
                  <View key={idx} style={styles.card}>
                    <Text style={styles.gapSkill}>{gap.skill}</Text>
                    <Text style={styles.gapImportance}>{gap.importance.toUpperCase()}</Text>
                    <Text style={styles.gapImpact}>Salary Impact: +${gap.salaryImpact.toLocaleString()}</Text>
                    <Text style={styles.gapTime}>{gap.estimatedTime} days to learn</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={() => analyzeSkillGaps('Senior Engineering Manager')}
            >
              <Text style={styles.analyzeButtonText}>Analyze Skill Gaps</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal visible={showJobModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Set Current Job</Text>
            <TextInput
              style={styles.input}
              placeholder="Job Title"
              value={newJob.title}
              onChangeText={(text) => setNewJob({ ...newJob, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Company"
              value={newJob.company}
              onChangeText={(text) => setNewJob({ ...newJob, company: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Salary"
              keyboardType="numeric"
              value={newJob.salary}
              onChangeText={(text) => setNewJob({ ...newJob, salary: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={newJob.location}
              onChangeText={(text) => setNewJob({ ...newJob, location: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowJobModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSetCurrentJob}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121' },
  scrollView: { flex: 1 },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#212121', marginLeft: 16, marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 12 },
  metricLabel: { fontSize: 12, color: '#757575', marginTop: 8 },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: '#212121' },
  trendText: { fontSize: 14, color: '#4CAF50', marginTop: 8 },
  simTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  simDesc: { fontSize: 14, color: '#616161', marginTop: 4 },
  simResults: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  simMetric: { fontSize: 14, color: '#212121' },
  recommendation: { fontSize: 14, color: '#4CAF50', marginTop: 8, fontStyle: 'italic' },
  oppHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  oppInfo: { flex: 1 },
  oppTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  oppCompany: { fontSize: 14, color: '#616161', marginTop: 2 },
  matchBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  matchScore: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  oppSalary: { fontSize: 16, fontWeight: '600', color: '#212121', marginTop: 8 },
  oppLocation: { fontSize: 14, color: '#757575', marginTop: 4 },
  simulateButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  simulateButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  gapSkill: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  gapImportance: { fontSize: 12, color: '#FF9800', marginTop: 4 },
  gapImpact: { fontSize: 14, color: '#4CAF50', marginTop: 8 },
  gapTime: { fontSize: 12, color: '#757575', marginTop: 4 },
  analyzeButton: { backgroundColor: '#4CAF50', marginHorizontal: 16, marginVertical: 24, padding: 16, borderRadius: 12, alignItems: 'center' },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, marginTop: 100 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#757575', textAlign: 'center', marginBottom: 24 },
  primaryButton: { backgroundColor: '#4CAF50', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 16 },
  modal: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  cancelButton: { flex: 1, padding: 12, borderRadius: 8, marginRight: 8, backgroundColor: '#E0E0E0', alignItems: 'center' },
  cancelButtonText: { color: '#212121', fontWeight: '600' },
  saveButton: { flex: 1, padding: 12, borderRadius: 8, marginLeft: 8, backgroundColor: '#4CAF50', alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: '600' },
});
