/**
 * Career Analyzer
 * Analyzes current career trajectory, skill inventory, market positioning
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Career, Job, Skill, CareerTrajectory, CareerStage } from '../types/simulator.types';
import { SIMULATION_PARAMETERS } from '../constants/simulator.constants';

export class CareerAnalyzer {
  private readonly CAREER_KEY = '@simulator_career';
  private readonly SKILLS_KEY = '@simulator_skills';

  public async analyzeCareer(): Promise<CareerTrajectory> {
    const career = await this.getCareer();
    if (!career) {
      return this.getDefaultTrajectory();
    }

    const projectedSalary = this.projectSalary(career);
    const satisfactionTrend = this.analyzeSatisfactionTrend(career);
    const skillVelocity = this.calculateSkillVelocity(career.skills);
    const marketPosition = this.calculateMarketPosition(career);

    return {
      userId: career.userId,
      currentSalary: career.currentJob.salary,
      projectedSalary,
      satisfactionTrend,
      skillVelocity,
      marketPosition,
      opportunities: 0,
    };
  }

  public async setCurrentJob(job: Job): Promise<void> {
    const userId = await this.getUserId();
    let career = await this.getCareer();

    if (!career) {
      career = {
        id: `career_${Date.now()}`,
        userId,
        currentJob: job,
        jobHistory: [],
        skills: [],
        careerStage: this.determineCareerStage(job),
        baselineSalary: job.salary,
        satisfactionTrend: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      if (career.currentJob.id !== job.id) {
        career.jobHistory.push(career.currentJob);
      }
      career.currentJob = job;
      career.updatedAt = new Date();
    }

    await AsyncStorage.setItem(this.CAREER_KEY, JSON.stringify(career));
  }

  public async addSkill(skill: Skill): Promise<void> {
    const career = await this.getCareer();
    if (!career) return;

    const existingIndex = career.skills.findIndex((s) => s.name === skill.name);
    if (existingIndex >= 0) {
      career.skills[existingIndex] = skill;
    } else {
      career.skills.push(skill);
    }

    career.updatedAt = new Date();
    await AsyncStorage.setItem(this.CAREER_KEY, JSON.stringify(career));
  }

  public async getCareer(): Promise<Career | null> {
    const data = await AsyncStorage.getItem(this.CAREER_KEY);
    if (!data) return null;
    const career: Career = JSON.parse(data);
    return {
      ...career,
      createdAt: new Date(career.createdAt),
      updatedAt: new Date(career.updatedAt),
      currentJob: { ...career.currentJob, startDate: new Date(career.currentJob.startDate) },
    };
  }

  public async getSkills(): Promise<Skill[]> {
    const career = await this.getCareer();
    return career?.skills || [];
  }

  private projectSalary(career: Career): { year: number; value: number; confidence: number }[] {
    const projections = [];
    const currentSalary = career.currentJob.salary;
    const growthRate = this.estimateGrowthRate(career);

    for (let year = 0; year <= SIMULATION_PARAMETERS.projectionYears; year++) {
      const value = currentSalary * Math.pow(1 + growthRate, year);
      const confidence = Math.max(0.5, 1 - year * 0.1);
      projections.push({ year, value: Math.round(value), confidence });
    }

    return projections;
  }

  private estimateGrowthRate(career: Career): number {
    if (career.jobHistory.length < 2) {
      return SIMULATION_PARAMETERS.salaryGrowthRate.average;
    }

    const recentJobs = career.jobHistory.slice(-3);
    const salaries = recentJobs.map((j) => j.salary);
    const avgGrowth = salaries.reduce((acc, sal, idx) => {
      if (idx === 0) return acc;
      return acc + (sal - salaries[idx - 1]) / salaries[idx - 1];
    }, 0) / (salaries.length - 1);

    if (avgGrowth > 0.12) return SIMULATION_PARAMETERS.salaryGrowthRate.exceptional;
    if (avgGrowth > 0.08) return SIMULATION_PARAMETERS.salaryGrowthRate.high;
    if (avgGrowth > 0.03) return SIMULATION_PARAMETERS.salaryGrowthRate.average;
    return SIMULATION_PARAMETERS.salaryGrowthRate.low;
  }

  private analyzeSatisfactionTrend(career: Career): 'improving' | 'stable' | 'declining' {
    const recentJobs = [career.currentJob, ...career.jobHistory.slice(-2)];
    const satisfactions = recentJobs.filter((j) => j.satisfaction).map((j) => j.satisfaction!);

    if (satisfactions.length < 2) return 'stable';

    const trend = satisfactions[0] - satisfactions[satisfactions.length - 1];
    if (trend > 1) return 'improving';
    if (trend < -1) return 'declining';
    return 'stable';
  }

  private calculateSkillVelocity(skills: Skill[]): number {
    if (skills.length === 0) return 0;

    const recentSkills = skills.filter((s) => {
      const monthsSinceUsed = (Date.now() - s.lastUsed.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsSinceUsed < 12;
    });

    return recentSkills.length / 12;
  }

  private calculateMarketPosition(career: Career): number {
    const skillCount = career.skills.length;
    const inDemandSkills = career.skills.filter((s) => s.inDemand).length;
    const avgMarketValue = career.skills.reduce((sum, s) => sum + s.marketValue, 0) / skillCount || 0;

    const skillScore = Math.min(100, (skillCount / 20) * 100);
    const demandScore = Math.min(100, (inDemandSkills / 10) * 100);
    const valueScore = Math.min(100, (avgMarketValue / 10000) * 100);

    return Math.round((skillScore + demandScore + valueScore) / 3);
  }

  private determineCareerStage(job: Job): CareerStage {
    const title = job.title.toLowerCase();
    if (title.includes('junior') || title.includes('entry')) return 'early';
    if (title.includes('senior') || title.includes('lead')) return 'senior';
    if (title.includes('principal') || title.includes('director') || title.includes('vp')) return 'executive';
    return 'mid';
  }

  private getDefaultTrajectory(): CareerTrajectory {
    return {
      userId: 'default',
      currentSalary: 0,
      projectedSalary: [],
      satisfactionTrend: 'stable',
      skillVelocity: 0,
      marketPosition: 0,
      opportunities: 0,
    };
  }

  private async getUserId(): Promise<string> {
    const userId = await AsyncStorage.getItem('@user_id');
    return userId || 'default_user';
  }
}
