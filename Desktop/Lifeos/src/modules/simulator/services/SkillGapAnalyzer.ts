/**
 * Skill Gap Analyzer
 * Compares user skills to market demand, generates learning roadmaps
 */

import { Skill, SkillGap, LearningStep } from '../types/simulator.types';
import { LEARNING_RESOURCES } from '../constants/simulator.constants';

export class SkillGapAnalyzer {
  public analyzeGaps(currentSkills: Skill[], targetRole: string): SkillGap[] {
    const requiredSkills = this.getRequiredSkillsForRole(targetRole);
    const gaps: SkillGap[] = [];

    requiredSkills.forEach(({ skill, importance }) => {
      const hasSkill = currentSkills.some((s) => 
        s.name.toLowerCase() === skill.toLowerCase() && s.level !== 'beginner'
      );

      if (!hasSkill) {
        const learningPath = this.generateLearningPath(skill);
        gaps.push({
          skill,
          importance,
          marketDemand: this.getMarketDemand(skill),
          learningPath,
          estimatedTime: learningPath.reduce((sum, step) => sum + step.duration, 0),
          salaryImpact: this.estimateSalaryImpact(skill, importance),
        });
      }
    });

    return gaps.sort((a, b) => {
      const importanceOrder = { critical: 3, important: 2, useful: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
  }

  private getRequiredSkillsForRole(role: string): Array<{ skill: string; importance: 'critical' | 'important' | 'useful' }> {
    const roleLower = role.toLowerCase();

    if (roleLower.includes('senior') && roleLower.includes('engineer')) {
      return [
        { skill: 'System Design', importance: 'critical' },
        { skill: 'Mentorship', importance: 'important' },
        { skill: 'Architecture', importance: 'critical' },
        { skill: 'Code Review', importance: 'important' },
      ];
    }

    if (roleLower.includes('manager')) {
      return [
        { skill: 'Team Leadership', importance: 'critical' },
        { skill: 'Project Management', importance: 'critical' },
        { skill: 'Hiring', importance: 'important' },
        { skill: 'Budget Management', importance: 'important' },
        { skill: 'Public Speaking', importance: 'useful' },
      ];
    }

    if (roleLower.includes('staff') || roleLower.includes('principal')) {
      return [
        { skill: 'System Design', importance: 'critical' },
        { skill: 'Technical Strategy', importance: 'critical' },
        { skill: 'Cross-team Collaboration', importance: 'important' },
        { skill: 'Mentorship', importance: 'important' },
      ];
    }

    return [
      { skill: 'React', importance: 'important' },
      { skill: 'TypeScript', importance: 'important' },
    ];
  }

  private generateLearningPath(skill: string): LearningStep[] {
    const resource = LEARNING_RESOURCES[skill as keyof typeof LEARNING_RESOURCES];

    if (resource) {
      return [{
        title: `Learn ${skill}`,
        description: `Complete ${resource.provider} course`,
        duration: resource.duration,
        cost: resource.cost,
        provider: resource.provider,
        url: resource.url,
      }];
    }

    return [{
      title: `Learn ${skill}`,
      description: 'Self-study and practice',
      duration: 60,
      cost: 0,
      provider: 'Self-paced',
    }];
  }

  private getMarketDemand(skill: string): number {
    const highDemand = ['React', 'TypeScript', 'Python', 'AWS', 'Kubernetes', 'System Design'];
    const mediumDemand = ['Vue', 'Angular', 'Docker', 'PostgreSQL', 'Node.js'];
    
    if (highDemand.some((s) => s.toLowerCase() === skill.toLowerCase())) return 9;
    if (mediumDemand.some((s) => s.toLowerCase() === skill.toLowerCase())) return 7;
    return 5;
  }

  private estimateSalaryImpact(skill: string, importance: 'critical' | 'important' | 'useful'): number {
    const baseImpact = { critical: 30000, important: 15000, useful: 5000 };
    const multipliers: Record<string, number> = {
      'System Design': 1.5,
      'Team Leadership': 1.3,
      'Kubernetes': 1.2,
      'Machine Learning': 1.4,
    };

    const base = baseImpact[importance];
    const multiplier = multipliers[skill] || 1;
    return Math.round(base * multiplier);
  }
}
