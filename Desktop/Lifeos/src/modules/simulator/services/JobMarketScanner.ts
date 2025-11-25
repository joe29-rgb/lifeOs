/**
 * Job Market Scanner
 * Integrates with job APIs, matches opportunities, caches results
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobOpportunity, JobMatchCriteria, Skill } from '../types/simulator.types';
import { MATCH_SCORE_WEIGHTS } from '../constants/simulator.constants';

export class JobMarketScanner {
  private readonly OPPORTUNITIES_KEY = '@simulator_opportunities';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000;

  public async searchJobs(criteria: JobMatchCriteria): Promise<JobOpportunity[]> {
    const cached = await this.getCachedOpportunities();
    if (cached.length > 0) {
      return this.filterOpportunities(cached, criteria);
    }

    const opportunities = await this.fetchFromAPIs(criteria);
    await this.cacheOpportunities(opportunities);
    return opportunities;
  }

  public async matchJobsToSkills(skills: Skill[]): Promise<JobOpportunity[]> {
    const skillNames = skills.map((s) => s.name);
    const criteria: JobMatchCriteria = { skills: skillNames };
    return this.searchJobs(criteria);
  }

  public calculateMatchScore(opportunity: JobOpportunity, userSkills: string[]): number {
    const requiredMatch = this.calculateSkillMatch(opportunity.requiredSkills, userSkills);
    const preferredMatch = this.calculateSkillMatch(opportunity.preferredSkills, userSkills);
    
    const skillScore = (requiredMatch * 0.7 + preferredMatch * 0.3) * 100;
    return Math.round(Math.min(100, skillScore));
  }

  private async fetchFromAPIs(criteria: JobMatchCriteria): Promise<JobOpportunity[]> {
    const mockOpportunities: JobOpportunity[] = [
      {
        id: 'job_1',
        title: 'Senior React Developer',
        company: 'Shopify',
        location: 'Remote',
        salary: { min: 140000, max: 180000 },
        workMode: 'remote',
        type: 'full-time',
        description: 'Build world-class e-commerce experiences with React and TypeScript',
        requiredSkills: ['React', 'TypeScript', 'JavaScript'],
        preferredSkills: ['Node.js', 'GraphQL', 'Testing'],
        postedDate: new Date(),
        url: 'https://shopify.com/careers',
        source: 'mock',
        matchScore: 0,
      },
      {
        id: 'job_2',
        title: 'Staff Engineer',
        company: 'Stripe',
        location: 'San Francisco, CA',
        salary: { min: 200000, max: 280000 },
        workMode: 'hybrid',
        type: 'full-time',
        description: 'Lead technical initiatives across payments infrastructure',
        requiredSkills: ['System Design', 'Python', 'Distributed Systems'],
        preferredSkills: ['Kubernetes', 'AWS', 'Team Leadership'],
        postedDate: new Date(),
        url: 'https://stripe.com/jobs',
        source: 'mock',
        matchScore: 0,
      },
      {
        id: 'job_3',
        title: 'Engineering Manager',
        company: 'Netflix',
        location: 'Los Angeles, CA',
        salary: { min: 180000, max: 250000 },
        workMode: 'hybrid',
        type: 'full-time',
        description: 'Lead a team building next-generation streaming experiences',
        requiredSkills: ['Team Leadership', 'JavaScript', 'React'],
        preferredSkills: ['Hiring', 'Project Management', 'Agile'],
        postedDate: new Date(),
        url: 'https://netflix.com/jobs',
        source: 'mock',
        matchScore: 0,
      },
    ];

    return mockOpportunities.filter((opp) => {
      if (criteria.skills && criteria.skills.length > 0) {
        return opp.requiredSkills.some((skill) => 
          criteria.skills!.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
        );
      }
      return true;
    });
  }

  private calculateSkillMatch(requiredSkills: string[], userSkills: string[]): number {
    if (requiredSkills.length === 0) return 1;
    
    const matches = requiredSkills.filter((req) =>
      userSkills.some((user) => 
        user.toLowerCase() === req.toLowerCase() || 
        user.toLowerCase().includes(req.toLowerCase())
      )
    );
    
    return matches.length / requiredSkills.length;
  }

  private filterOpportunities(opportunities: JobOpportunity[], criteria: JobMatchCriteria): JobOpportunity[] {
    return opportunities.filter((opp) => {
      if (criteria.location && !opp.location.toLowerCase().includes(criteria.location.toLowerCase())) {
        return false;
      }
      if (criteria.minSalary && opp.salary.max < criteria.minSalary) {
        return false;
      }
      if (criteria.workMode && opp.workMode !== criteria.workMode) {
        return false;
      }
      return true;
    });
  }

  private async getCachedOpportunities(): Promise<JobOpportunity[]> {
    const data = await AsyncStorage.getItem(this.OPPORTUNITIES_KEY);
    if (!data) return [];
    
    const cached = JSON.parse(data);
    const age = Date.now() - cached.timestamp;
    
    if (age > this.CACHE_DURATION) {
      await AsyncStorage.removeItem(this.OPPORTUNITIES_KEY);
      return [];
    }
    
    return cached.opportunities.map((o: JobOpportunity) => ({
      ...o,
      postedDate: new Date(o.postedDate),
    }));
  }

  private async cacheOpportunities(opportunities: JobOpportunity[]): Promise<void> {
    const cache = {
      timestamp: Date.now(),
      opportunities,
    };
    await AsyncStorage.setItem(this.OPPORTUNITIES_KEY, JSON.stringify(cache));
  }
}
