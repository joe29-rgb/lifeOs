/**
 * Timeline Simulator
 * Generates "what if" scenarios and projects 5-year outcomes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Simulation, SimulationResults, Job, PathProjection, ComparisonMetrics, Milestone, YearlyMetric } from '../types/simulator.types';
import { SIMULATION_PARAMETERS, CAREER_MILESTONES } from '../constants/simulator.constants';
import { CareerAnalyzer } from './CareerAnalyzer';

export class TimelineSimulator {
  private readonly SIMULATIONS_KEY = '@simulator_simulations';
  private careerAnalyzer: CareerAnalyzer;

  constructor() {
    this.careerAnalyzer = new CareerAnalyzer();
  }

  public async createSimulation(name: string, description: string, alternateJob: Job): Promise<Simulation> {
    const userId = await this.getUserId();
    const career = await this.careerAnalyzer.getCareer();
    
    if (!career) {
      throw new Error('No career data found. Please set current job first.');
    }

    const baselineJob = career.currentJob;
    const results = await this.runSimulation(baselineJob, alternateJob);

    const simulation: Simulation = {
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name,
      description,
      baselineJob,
      alternateJob,
      projectionYears: SIMULATION_PARAMETERS.projectionYears,
      createdAt: new Date(),
      results,
    };

    const simulations = await this.getAllSimulations();
    simulations.push(simulation);
    await AsyncStorage.setItem(this.SIMULATIONS_KEY, JSON.stringify(simulations));

    return simulation;
  }

  private async runSimulation(baselineJob: Job, alternateJob: Job): Promise<SimulationResults> {
    const baseline = this.projectPath(baselineJob, 'baseline');
    const alternate = this.projectPath(alternateJob, 'alternate');
    const comparison = this.compareProjections(baseline, alternate);
    const regretProbability = this.calculateRegretProbability(alternateJob, comparison);
    const recommendation = this.generateRecommendation(comparison, regretProbability);

    return {
      baseline,
      alternate,
      comparison,
      recommendation,
      regretProbability,
      confidenceScore: 0.75,
    };
  }

  private projectPath(job: Job, type: 'baseline' | 'alternate'): PathProjection {
    const salaryTrajectory = this.projectSalaryPath(job);
    const satisfactionTrajectory = this.projectSatisfactionPath(job);
    const skillDevelopment = this.projectSkillDevelopment(job);
    const careerMilestones = this.projectMilestones(job);
    const healthImpact = this.projectHealthImpact(job);
    const relationshipImpact = this.projectRelationshipImpact(job);
    const workLifeBalance = this.calculateWorkLifeBalance(job);

    return {
      salaryTrajectory,
      satisfactionTrajectory,
      skillDevelopment,
      careerMilestones,
      healthImpact,
      relationshipImpact,
      workLifeBalance,
    };
  }

  private projectSalaryPath(job: Job): YearlyMetric[] {
    const trajectory: YearlyMetric[] = [];
    const currentSalary = job.salary;
    const growthRate = job.title.toLowerCase().includes('senior') 
      ? SIMULATION_PARAMETERS.salaryGrowthRate.high 
      : SIMULATION_PARAMETERS.salaryGrowthRate.average;

    for (let year = 0; year <= SIMULATION_PARAMETERS.projectionYears; year++) {
      const value = currentSalary * Math.pow(1 + growthRate, year);
      const confidence = Math.max(0.5, 1 - year * 0.1);
      trajectory.push({ year, value: Math.round(value), confidence });
    }

    return trajectory;
  }

  private projectSatisfactionPath(job: Job): YearlyMetric[] {
    const trajectory: YearlyMetric[] = [];
    const initialSatisfaction = job.satisfaction || 7.5;

    for (let year = 0; year <= SIMULATION_PARAMETERS.projectionYears; year++) {
      const decay = Math.pow(SIMULATION_PARAMETERS.satisfactionDecay, year);
      const value = Math.max(5, initialSatisfaction * decay);
      const confidence = Math.max(0.4, 1 - year * 0.12);
      trajectory.push({ year, value: parseFloat(value.toFixed(1)), confidence });
    }

    return trajectory;
  }

  private projectSkillDevelopment(job: Job): string[] {
    const skills = job.skills || [];
    const newSkills: string[] = [];

    if (job.title.toLowerCase().includes('senior')) {
      newSkills.push('System Design', 'Mentorship', 'Architecture');
    }
    if (job.title.toLowerCase().includes('lead') || job.title.toLowerCase().includes('manager')) {
      newSkills.push('Team Leadership', 'Project Management', 'Hiring');
    }
    if (job.workMode === 'remote') {
      newSkills.push('Remote Collaboration', 'Async Communication');
    }

    return [...new Set([...skills, ...newSkills])];
  }

  private projectMilestones(job: Job): Milestone[] {
    const milestones: Milestone[] = [];

    milestones.push({
      year: 0,
      title: `Start at ${job.company}`,
      description: `Begin as ${job.title}`,
      impact: 'positive',
    });

    milestones.push({
      year: 2,
      title: 'Promotion Opportunity',
      description: 'Likely promotion based on performance',
      impact: 'positive',
    });

    if (job.workMode === 'onsite' && job.location !== 'Current Location') {
      milestones.push({
        year: 0,
        title: 'Relocation',
        description: `Move to ${job.location}`,
        impact: 'neutral',
      });
    }

    milestones.push({
      year: 4,
      title: 'Senior Role',
      description: 'Advance to senior position',
      impact: 'positive',
    });

    return milestones;
  }

  private projectHealthImpact(job: Job): { sleepHours: number; stressLevel: number; exerciseFrequency: number; overallHealth: number; risks: string[] } {
    const baseStress = job.stressLevel || 5;
    const sleepHours = Math.max(6, 7.5 - (baseStress - 5) * 0.2);
    const exerciseFrequency = job.workMode === 'remote' ? 4 : 3;
    const overallHealth = Math.max(5, 8 - (baseStress - 5) * 0.3);

    const risks: string[] = [];
    if (baseStress >= 7) risks.push('High stress may impact sleep quality');
    if (job.workMode === 'onsite' && job.location !== 'Current Location') {
      risks.push('Relocation adjustment period (3-6 months)');
    }

    return {
      sleepHours: parseFloat(sleepHours.toFixed(1)),
      stressLevel: baseStress,
      exerciseFrequency,
      overallHealth: parseFloat(overallHealth.toFixed(1)),
      risks,
    };
  }

  private projectRelationshipImpact(job: Job): { socialImpact: number; relocationStrain: number; workScheduleImpact: number; overallRelationships: number; risks: string[] } {
    const relocationStrain = job.location !== 'Current Location' ? SIMULATION_PARAMETERS.relocationStrain * 10 : 0;
    const workScheduleImpact = job.type === 'full-time' ? 5 : 3;
    const socialImpact = job.workMode === 'remote' ? 6 : 7;
    const overallRelationships = Math.max(5, 8 - relocationStrain / 10);

    const risks: string[] = [];
    if (relocationStrain > 0) {
      risks.push('Distance from current social network');
      risks.push('6-month social rebuilding period');
    }

    return {
      socialImpact,
      relocationStrain,
      workScheduleImpact,
      overallRelationships: parseFloat(overallRelationships.toFixed(1)),
      risks,
    };
  }

  private calculateWorkLifeBalance(job: Job): number {
    let balance = 7;
    if (job.workMode === 'remote') balance += 1;
    if (job.type === 'part-time') balance += 2;
    if (job.stressLevel && job.stressLevel > 7) balance -= 2;
    return Math.max(1, Math.min(10, balance));
  }

  private compareProjections(baseline: PathProjection, alternate: PathProjection): ComparisonMetrics {
    const salaryDiff = alternate.salaryTrajectory[SIMULATION_PARAMETERS.projectionYears].value - 
                       baseline.salaryTrajectory[SIMULATION_PARAMETERS.projectionYears].value;
    const satisfactionDiff = alternate.satisfactionTrajectory[SIMULATION_PARAMETERS.projectionYears].value - 
                             baseline.satisfactionTrajectory[SIMULATION_PARAMETERS.projectionYears].value;
    const healthDiff = alternate.healthImpact.overallHealth - baseline.healthImpact.overallHealth;
    const relationshipDiff = alternate.relationshipImpact.overallRelationships - baseline.relationshipImpact.overallRelationships;

    const overallScore = (salaryDiff / 10000) + satisfactionDiff + healthDiff + relationshipDiff;
    const winner = overallScore > 1 ? 'alternate' : overallScore < -1 ? 'baseline' : 'tie';

    return {
      salaryDifference: Math.round(salaryDiff),
      satisfactionDifference: parseFloat(satisfactionDiff.toFixed(1)),
      healthDifference: parseFloat(healthDiff.toFixed(1)),
      relationshipDifference: parseFloat(relationshipDiff.toFixed(1)),
      overallScore: parseFloat(overallScore.toFixed(1)),
      winner,
    };
  }

  private calculateRegretProbability(job: Job, comparison: ComparisonMetrics): number {
    let regretScore = 0.3;

    if (comparison.satisfactionDifference < -1) regretScore += 0.2;
    if (comparison.healthDifference < -1) regretScore += 0.15;
    if (comparison.relationshipDifference < -1) regretScore += 0.15;
    if (job.location !== 'Current Location') regretScore += 0.1;

    return Math.min(0.95, Math.max(0.05, regretScore));
  }

  private generateRecommendation(comparison: ComparisonMetrics, regretProbability: number): string {
    if (regretProbability > 0.6) {
      return `⚠️ High regret risk (${Math.round(regretProbability * 100)}%). Recommend declining or negotiating better terms.`;
    }

    if (comparison.winner === 'alternate' && comparison.overallScore > 2) {
      return `✅ Strong recommendation to take alternate path. Overall improvement score: ${comparison.overallScore.toFixed(1)}/10`;
    }

    if (comparison.winner === 'baseline') {
      return `❌ Current path appears better. Overall score favors staying: ${Math.abs(comparison.overallScore).toFixed(1)}/10`;
    }

    return `🤔 Close call. Regret probability: ${Math.round(regretProbability * 100)}%. Consider your priorities carefully.`;
  }

  public async getAllSimulations(): Promise<Simulation[]> {
    const data = await AsyncStorage.getItem(this.SIMULATIONS_KEY);
    if (!data) return [];
    const simulations: Simulation[] = JSON.parse(data);
    return simulations.map((s) => ({ ...s, createdAt: new Date(s.createdAt) }));
  }

  public async getSimulation(id: string): Promise<Simulation | null> {
    const simulations = await this.getAllSimulations();
    return simulations.find((s) => s.id === id) || null;
  }

  private async getUserId(): Promise<string> {
    const userId = await AsyncStorage.getItem('@user_id');
    return userId || 'default_user';
  }
}
