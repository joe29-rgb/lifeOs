/**
 * Job Matching Hook
 * Job API integration, matching logic
 */

import { useState, useEffect } from 'react';
import { JobOpportunity, JobMatchCriteria } from '../modules/simulator/types/simulator.types';
import { JobMarketScanner } from '../modules/simulator/services/JobMarketScanner';
import { CareerAnalyzer } from '../modules/simulator/services/CareerAnalyzer';

const jobScanner = new JobMarketScanner();
const careerAnalyzer = new CareerAnalyzer();

export function useJobMatching() {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const skills = await careerAnalyzer.getSkills();
      const jobs = await jobScanner.matchJobsToSkills(skills);
      
      const skillNames = skills.map((s) => s.name);
      const scoredJobs = jobs.map((job) => ({
        ...job,
        matchScore: jobScanner.calculateMatchScore(job, skillNames),
      }));

      scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
      setOpportunities(scoredJobs);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchJobs = async (criteria: JobMatchCriteria) => {
    setLoading(true);
    try {
      const jobs = await jobScanner.searchJobs(criteria);
      setOpportunities(jobs);
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    opportunities,
    searchJobs,
    refresh: loadOpportunities,
  };
}
