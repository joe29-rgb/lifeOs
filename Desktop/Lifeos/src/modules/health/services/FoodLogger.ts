/**
 * Food Logger
 * Voice, photo, and manual food logging with AI extraction
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry, MealType, EnergyLevel, MoodLevel, MealPattern } from '../types/health.types';
import { FOOD_CATEGORIES, MEAL_TIMING_WINDOWS } from '../constants/health.constants';

export class FoodLogger {
  private readonly FOOD_KEY = '@health_food_entries';
  private readonly PATTERNS_KEY = '@health_meal_patterns';

  public async logFood(
    foods: string[],
    mealType: MealType,
    source: 'voice' | 'photo' | 'manual',
    energyAfter?: EnergyLevel,
    photoUri?: string
  ): Promise<FoodEntry> {
    const userId = await this.getUserId();
    const entry: FoodEntry = {
      id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      mealType,
      foods,
      calories: this.estimateCalories(foods),
      protein: this.estimateMacro(foods, 'protein'),
      carbs: this.estimateMacro(foods, 'carbs'),
      fat: this.estimateMacro(foods, 'fat'),
      energyAfter,
      timestamp: new Date(),
      source,
      photoUri,
    };

    const entries = await this.getAllEntries();
    entries.push(entry);
    await AsyncStorage.setItem(this.FOOD_KEY, JSON.stringify(entries));

    await this.analyzePatterns();

    return entry;
  }

  public async extractFoodsFromVoice(transcript: string): Promise<{ foods: string[]; mealType: MealType }> {
    const lowerTranscript = transcript.toLowerCase();
    const extractedFoods: string[] = [];

    Object.values(FOOD_CATEGORIES).forEach((category) => {
      category.forEach((food) => {
        if (lowerTranscript.includes(food)) {
          extractedFoods.push(food);
        }
      });
    });

    const mealType = this.detectMealType(lowerTranscript);

    return { foods: extractedFoods.length > 0 ? extractedFoods : ['meal'], mealType };
  }

  public async updateEnergyAfter(entryId: string, energy: EnergyLevel, mood?: MoodLevel): Promise<void> {
    const entries = await this.getAllEntries();
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      entry.energyAfter = energy;
      entry.moodAfter = mood;
      await AsyncStorage.setItem(this.FOOD_KEY, JSON.stringify(entries));
      await this.analyzePatterns();
    }
  }

  public async getMealPatterns(): Promise<MealPattern[]> {
    const data = await AsyncStorage.getItem(this.PATTERNS_KEY);
    if (!data) return [];
    const patterns: MealPattern[] = JSON.parse(data);
    return patterns.map((p) => ({ ...p, createdAt: new Date(p.createdAt) }));
  }

  public async getRecentMeals(days: number = 7): Promise<FoodEntry[]> {
    const entries = await this.getAllEntries();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entries.filter((e) => e.timestamp >= cutoff);
  }

  private async analyzePatterns(): Promise<void> {
    const entries = await this.getAllEntries();
    if (entries.length < 10) return;

    const patterns: MealPattern[] = [];
    const userId = await this.getUserId();

    const heavyLunchCrashes = entries.filter(
      (e) =>
        e.mealType === 'lunch' &&
        e.carbs &&
        e.carbs > 50 &&
        (e.energyAfter === 'sluggish' || e.energyAfter === 'exhausted')
    );

    if (heavyLunchCrashes.length >= 3) {
      patterns.push({
        id: `pattern_heavy_lunch_${Date.now()}`,
        userId,
        pattern: 'heavy_lunch_crash',
        description: 'Heavy lunch → 2pm crash',
        frequency: heavyLunchCrashes.length,
        impact: 'negative',
        examples: heavyLunchCrashes.slice(0, 3).map((e) => e.foods.join(', ')),
        createdAt: new Date(),
      });
    }

    const lateDinners = entries.filter((e) => {
      const hour = e.timestamp.getHours();
      return e.mealType === 'dinner' && hour >= 20;
    });

    if (lateDinners.length >= 5) {
      patterns.push({
        id: `pattern_late_dinner_${Date.now()}`,
        userId,
        pattern: 'late_dinner',
        description: 'Late dinner (after 8pm)',
        frequency: lateDinners.length,
        impact: 'negative',
        examples: lateDinners.slice(0, 3).map((e) => `${e.timestamp.getHours()}:00 - ${e.foods.join(', ')}`),
        createdAt: new Date(),
      });
    }

    const proteinBreakfasts = entries.filter(
      (e) => e.mealType === 'breakfast' && e.protein && e.protein > 20 && e.energyAfter === 'energized'
    );

    if (proteinBreakfasts.length >= 3) {
      patterns.push({
        id: `pattern_protein_breakfast_${Date.now()}`,
        userId,
        pattern: 'protein_breakfast_energy',
        description: 'Protein breakfast = stable energy',
        frequency: proteinBreakfasts.length,
        impact: 'positive',
        examples: proteinBreakfasts.slice(0, 3).map((e) => e.foods.join(', ')),
        createdAt: new Date(),
      });
    }

    await AsyncStorage.setItem(this.PATTERNS_KEY, JSON.stringify(patterns));
  }

  private estimateCalories(foods: string[]): number {
    const calorieEstimates: Record<string, number> = {
      chicken: 200,
      beef: 250,
      fish: 180,
      rice: 200,
      pasta: 220,
      bread: 80,
      salad: 50,
      burrito: 500,
      pizza: 300,
      burger: 400,
      sandwich: 350,
    };

    let total = 0;
    foods.forEach((food) => {
      const lowerFood = food.toLowerCase();
      Object.entries(calorieEstimates).forEach(([key, cal]) => {
        if (lowerFood.includes(key)) total += cal;
      });
    });

    return total > 0 ? total : 400;
  }

  private estimateMacro(foods: string[], macro: 'protein' | 'carbs' | 'fat'): number {
    const estimates: Record<string, Record<string, number>> = {
      chicken: { protein: 30, carbs: 0, fat: 5 },
      beef: { protein: 25, carbs: 0, fat: 15 },
      rice: { protein: 4, carbs: 45, fat: 1 },
      pasta: { protein: 7, carbs: 43, fat: 2 },
      bread: { protein: 3, carbs: 15, fat: 1 },
    };

    let total = 0;
    foods.forEach((food) => {
      const lowerFood = food.toLowerCase();
      Object.entries(estimates).forEach(([key, macros]) => {
        if (lowerFood.includes(key)) total += macros[macro];
      });
    });

    return total;
  }

  private detectMealType(transcript: string): MealType {
    const hour = new Date().getHours();

    if (transcript.includes('breakfast')) return 'breakfast';
    if (transcript.includes('lunch')) return 'lunch';
    if (transcript.includes('dinner')) return 'dinner';
    if (transcript.includes('snack')) return 'snack';

    if (hour >= MEAL_TIMING_WINDOWS.breakfast.start && hour <= MEAL_TIMING_WINDOWS.breakfast.end) return 'breakfast';
    if (hour >= MEAL_TIMING_WINDOWS.lunch.start && hour <= MEAL_TIMING_WINDOWS.lunch.end) return 'lunch';
    if (hour >= MEAL_TIMING_WINDOWS.dinner.start && hour <= MEAL_TIMING_WINDOWS.dinner.end) return 'dinner';

    return 'snack';
  }

  private async getAllEntries(): Promise<FoodEntry[]> {
    const data = await AsyncStorage.getItem(this.FOOD_KEY);
    if (!data) return [];
    const entries: FoodEntry[] = JSON.parse(data);
    return entries.map((e) => ({ ...e, timestamp: new Date(e.timestamp) }));
  }

  private async getUserId(): Promise<string> {
    const userId = await AsyncStorage.getItem('@user_id');
    return userId || 'default_user';
  }
}
