/**
 * Career Simulation Hook
 * Manages simulation state, runs projections
 */

import { useState, useEffect } from 'react';
import { Simulation, Job, CareerTrajectory, SkillGap } from '../modules/simulator/types/simulator.types';
import { CareerAnalyzer } from '../modules/simulator/services/CareerAnalyzer';
import { TimelineSimulator } from '../modules/simulator/services/TimelineSimulator';
import { SkillGapAnalyzer } from '../modules/simulator/services/SkillGapAnalyzer';

const careerAnalyzer = new CareerAnalyzer();
const timelineSimulator = new TimelineSimulator();
const skillGapAnalyzer = new SkillGapAnalyzer();

export function useCareerSimulation() {
  const [loading, setLoading] = useState(false);
  const [trajectory, setTrajectory] = useState<CareerTrajectory | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [traj, sims] = await Promise.all([
        careerAnalyzer.analyzeCareer(),
        timelineSimulator.getAllSimulations(),
      ]);
      setTrajectory(traj);
      setSimulations(sims);
    } catch (error) {
      console.error('Error loading career data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentJob = async (job: Job) => {
    try {
      await careerAnalyzer.setCurrentJob(job);
      await loadData();
    } catch (error) {
      console.error('Error setting current job:', error);
    }
  };

  const createSimulation = async (name: string, description: string, alternateJob: Job) => {
    setLoading(true);
    try {
      const simulation = await timelineSimulator.createSimulation(name, description, alternateJob);
      setSimulations([...simulations, simulation]);
      return simulation;
    } catch (error) {
      console.error('Error creating simulation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkillGaps = async (targetRole: string) => {
    try {
      const skills = await careerAnalyzer.getSkills();
      const gaps = skillGapAnalyzer.analyzeGaps(skills, targetRole);
      setSkillGaps(gaps);
      return gaps;
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      return [];
    }
  };

  return {
    loading,
    trajectory,
    simulations,
    skillGaps,
    setCurrentJob,
    createSimulation,
    analyzeSkillGaps,
    refresh: loadData,
  };
}
