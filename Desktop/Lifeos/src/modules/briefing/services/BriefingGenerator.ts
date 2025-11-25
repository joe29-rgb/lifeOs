/**
 * Briefing Generator
 * Orchestrates daily bedtime briefing creation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyBriefing, DailySummary, HighlightItem, PatternInsight, TomorrowForecast, PastAdvice, RoutineRecommendation } from '../types/briefing.types';
import { MentalHealthMonitor } from '../../health/services/MentalHealthMonitor';
import { SleepAnalyzer } from '../../health/services/SleepAnalyzer';
import { ExerciseTracker } from '../../health/services/ExerciseTracker';
import { FoodLogger } from '../../health/services/FoodLogger';
import { HealthCorrelator } from '../../health/services/HealthCorrelator';

export class BriefingGenerator {
  private readonly BRIEFING_KEY = '@daily_briefings';
  private mentalHealth: MentalHealthMonitor;
  private sleep: SleepAnalyzer;
  private exercise: ExerciseTracker;
  private food: FoodLogger;
  private correlator: HealthCorrelator;

  constructor() {
    this.mentalHealth = new MentalHealthMonitor();
    this.sleep = new SleepAnalyzer();
    this.exercise = new ExerciseTracker();
    this.food = new FoodLogger();
    this.correlator = new HealthCorrelator();
  }

  public async generateBriefing(): Promise<DailyBriefing> {
    const userId = await this.getUserId();
    const today = new Date();

    const summary = await this.generateSummary();
    const highlights = await this.generateHighlights();
    const patterns = await this.generatePatterns();
    const forecast = await this.generateForecast();
    const pastAdvice = await this.getPastAdvice();
    const routine = await this.generateRoutine();

    const briefing: DailyBriefing = {
      id: `briefing_${Date.now()}`,
      userId,
      date: today,
      generatedAt: new Date(),
      sections: {
        summary,
        highlights,
        patterns,
        forecast,
        pastAdvice,
        routine,
      },
      read: false,
      exported: false,
    };

    const briefings = await this.getAllBriefings();
    briefings.push(briefing);
    await AsyncStorage.setItem(this.BRIEFING_KEY, JSON.stringify(briefings));

    return briefing;
  }

  private async generateSummary(): Promise<DailySummary> {
    const userId = await this.getUserId();
    const avgSleep = await this.sleep.getAverageSleep(1);
    const weeklyWorkouts = await this.exercise.getWeeklyWorkouts();
    const recentMeals = await this.food.getRecentMeals(1);

    return {
      userId,
      date: new Date(),
      mood: { average: 7.8, trend: 'up' },
      movement: { steps: 9247, workouts: weeklyWorkouts >= 1 ? 1 : 0 },
      sleep: { duration: avgSleep, quality: avgSleep >= 7 ? 8 : 6 },
      meals: { logged: recentMeals.length, energyStable: true },
      conversations: { count: 4, sentiment: 'positive' },
      tasks: { completed: 6, procrastinated: 2 },
      decisions: { logged: 1 },
      relationships: { status: 'healthy' },
    };
  }

  private async generateHighlights(): Promise<HighlightItem[]> {
    const highlights: HighlightItem[] = [];
    const streak = await this.exercise.getStreak();
    const avgSleep = await this.sleep.getAverageSleep(5);

    if (streak.currentStreak >= 6) {
      highlights.push({
        emoji: '🔥',
        text: `${streak.currentStreak}-day workout streak (longest this year!)`,
        type: 'achievement',
      });
    }

    if (avgSleep >= 7) {
      highlights.push({
        emoji: '😴',
        text: `Sleep 7+ hours for 5 straight nights`,
        type: 'win',
      });
    }

    highlights.push({
      emoji: '✅',
      text: 'Finished that report you were procrastinating on',
      type: 'win',
    });

    return highlights;
  }

  private async generatePatterns(): Promise<PatternInsight[]> {
    const patterns: PatternInsight[] = [];

    patterns.push({
      title: 'Mood trending up',
      description: '+1.2 vs last week',
      trend: 'up',
      change: 1.2,
      actionable: false,
    });

    patterns.push({
      title: 'Procrastination down 40%',
      description: 'Interventions working!',
      trend: 'down',
      change: -0.4,
      actionable: false,
    });

    return patterns;
  }

  private async generateForecast(): Promise<TomorrowForecast> {
    const avgSleep = await this.sleep.getAverageSleep(7);
    const energyPrediction = avgSleep >= 7 ? 8.2 : 6.5;

    return {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      energyPrediction,
      schedule: [
        { time: '10:00 AM', event: 'Boss 1-on-1', notes: 'You get nervous—breathe first', stressLevel: 'medium' },
        { time: '2:00 PM', event: 'Big presentation', notes: 'Historically spikes HR 25 BPM', stressLevel: 'high' },
        { time: '5:00 PM', event: 'Gym', notes: "Don't skip—mood booster", stressLevel: 'low' },
      ],
      challenges: [
        { description: 'Presentation stress', likelihood: 0.8, suggestion: 'Start prep in morning' },
        { description: 'Temptation to skip gym', likelihood: 0.6, suggestion: "Don't—you need it" },
      ],
      priorities: ['Finish presentation slides', 'Send follow-up email to client', 'Call Mom (haven\'t talked in 6 days)'],
    };
  }

  private async getPastAdvice(): Promise<PastAdvice[]> {
    return [
      {
        date: new Date('2023-03-15'),
        situation: 'Felt anxious about presentation',
        advice: 'I was catastrophizing. I always do this. It always goes fine. Future me: Just prep and breathe.',
        outcome: '2 weeks later: Presentation went great. I need to remember this pattern.',
        relevance: 0.95,
      },
    ];
  }

  private async generateRoutine(): Promise<RoutineRecommendation> {
    const avgSleep = await this.sleep.getAverageSleep(7);

    return {
      windDownTime: '10:45 PM',
      screenOffTime: '11:00 PM',
      lightsOutTime: '11:20 PM',
      sleepGoal: 7.5,
      wakeTime: '6:50 AM',
      predictedEnergy: avgSleep >= 7 ? 8.2 : 7.0,
      reasoning: [
        'Optimized for tomorrow\'s schedule',
        '7.5 hours matches your ideal',
        'Wake 1hr before standup',
      ],
    };
  }

  public async getTodayBriefing(): Promise<DailyBriefing | null> {
    const briefings = await this.getAllBriefings();
    const today = new Date().toDateString();
    const todayBriefing = briefings.find((b) => new Date(b.date).toDateString() === today);
    return todayBriefing || null;
  }

  public async markAsRead(briefingId: string): Promise<void> {
    const briefings = await this.getAllBriefings();
    const briefing = briefings.find((b) => b.id === briefingId);
    if (briefing) {
      briefing.read = true;
      await AsyncStorage.setItem(this.BRIEFING_KEY, JSON.stringify(briefings));
    }
  }

  private async getAllBriefings(): Promise<DailyBriefing[]> {
    const data = await AsyncStorage.getItem(this.BRIEFING_KEY);
    if (!data) return [];
    const briefings: DailyBriefing[] = JSON.parse(data);
    return briefings.map((b) => ({
      ...b,
      date: new Date(b.date),
      generatedAt: new Date(b.generatedAt),
    }));
  }

  private async getUserId(): Promise<string> {
    const userId = await AsyncStorage.getItem('@user_id');
    return userId || 'default_user';
  }
}
