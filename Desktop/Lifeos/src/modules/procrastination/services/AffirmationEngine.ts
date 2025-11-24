/**
 * Affirmation Engine
 * Delivers legendary Barney Stinson-style motivational content
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Affirmation } from '../types/procrastination.types';
import { ALL_AFFIRMATIONS } from '../constants/procrastination.constants';

export class AffirmationEngine {
  private userPreferences: {
    style: 'barney' | 'motivational' | 'gentle' | 'mixed';
    userName?: string;
  } = { style: 'barney' };

  constructor() {
    this.loadPreferences();
  }

  /**
   * Load user preferences
   */
  private async loadPreferences(): Promise<void> {
    try {
      const prefsJson = await AsyncStorage.getItem('timeline_affirmation_prefs');
      if (prefsJson) {
        this.userPreferences = JSON.parse(prefsJson);
      }
    } catch (error) {
      console.error('Error loading affirmation preferences:', error);
    }
  }

  /**
   * Get affirmation for specific category
   */
  public getAffirmation(category: 'start' | 'progress' | 'completion' | 'struggle'): Affirmation {
    const style = this.userPreferences.style;
    
    let candidates: Affirmation[];
    
    if (style === 'mixed') {
      // Mix all styles
      candidates = ALL_AFFIRMATIONS.filter((a) => a.category === category);
    } else {
      // Filter by style and category
      candidates = ALL_AFFIRMATIONS.filter(
        (a) => a.style === style && a.category === category
      );
      
      // Fallback to any style if no matches
      if (candidates.length === 0) {
        candidates = ALL_AFFIRMATIONS.filter((a) => a.category === category);
      }
    }

    // Random selection
    const affirmation = candidates[Math.floor(Math.random() * candidates.length)];
    
    // Personalize if possible
    return this.personalizeAffirmation(affirmation);
  }

  /**
   * Personalize affirmation with user's name
   */
  private personalizeAffirmation(affirmation: Affirmation): Affirmation {
    if (!affirmation.personalizable || !this.userPreferences.userName) {
      return affirmation;
    }

    const personalized = { ...affirmation };
    personalized.text = personalized.text.replace(
      /You/g,
      this.userPreferences.userName
    );

    return personalized;
  }

  /**
   * Get random Barney-style pep talk
   */
  public getBarneyPepTalk(): string {
    const pepTalks = [
      "Listen up! You know what's the difference between you and everyone else? You're about to DO this. Right now. That's legendary!",
      "I'm going to let you in on a little secret: Future-you is watching right now, and they're BEGGING you to start. Don't let them down!",
      "You see this task? It's like a beautiful person at a bar. You could sit here all night thinking about it, OR you could suit up and make it happen. What's it gonna be?",
      "Here's the play: Step 1, you start. Step 2, you're awesome. Step 3, you WIN. It's that simple. Now execute!",
      "You know what I love about you? You're reading this instead of doing the thing. But here's the twist—you're about to prove me wrong. GO!",
    ];

    return pepTalks[Math.floor(Math.random() * pepTalks.length)];
  }

  /**
   * Get completion celebration message
   */
  public getCelebrationMessage(pomodoroCount: number, streak: number): string {
    if (pomodoroCount >= 8) {
      return `🔥 EIGHT POMODOROS! You're not just productive, you're a MACHINE! ${streak > 0 ? `${streak}-day streak!` : ''}`;
    } else if (pomodoroCount >= 4) {
      return `⚡ Four pomodoros! That's a full work session of pure awesomeness! ${streak > 0 ? `Streak: ${streak} days!` : ''}`;
    } else if (pomodoroCount >= 2) {
      return `💪 Two down! You're building momentum like a productivity freight train! ${streak > 0 ? `${streak}-day streak!` : ''}`;
    } else {
      return `🎯 First one complete! Every legendary journey starts with a single pomodoro! ${streak > 0 ? `Streak: ${streak} days!` : ''}`;
    }
  }

  /**
   * Get struggle support message
   */
  public getStruggleSupport(): string {
    const messages = [
      "Hey, it's okay. Even legends have tough days. Let's break this down into something smaller.",
      "I see you're struggling. That's actually a good sign—it means you're pushing yourself. Want to make this easier?",
      "Real talk: This is hard. But you know what's harder? Regretting not trying. Let's tackle just ONE small piece.",
      "Struggling is part of the process. Champions don't quit when it's hard—they adjust their strategy. Let's adjust.",
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Set user preferences
   */
  public async setPreferences(
    style: 'barney' | 'motivational' | 'gentle' | 'mixed',
    userName?: string
  ): Promise<void> {
    this.userPreferences = { style, userName };
    
    try {
      await AsyncStorage.setItem(
        'timeline_affirmation_prefs',
        JSON.stringify(this.userPreferences)
      );
    } catch (error) {
      console.error('Error saving affirmation preferences:', error);
    }
  }

  /**
   * Get current style
   */
  public getStyle(): string {
    return this.userPreferences.style;
  }
}

// Singleton instance
export const affirmationEngine = new AffirmationEngine();
