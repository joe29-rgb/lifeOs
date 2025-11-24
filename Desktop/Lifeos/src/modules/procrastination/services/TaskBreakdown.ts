/**
 * Task Breakdown Service
 * AI-powered task splitting with GPT-4 for mobile-optimized "just one step" UX
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Subtask } from '../types/procrastination.types';

export class TaskBreakdown {
  private apiKey: string = '';

  constructor() {
    this.loadApiKey();
  }

  /**
   * Load OpenAI API key
   */
  private async loadApiKey(): Promise<void> {
    try {
      const key = await AsyncStorage.getItem('timeline_openai_key');
      if (key) {
        this.apiKey = key;
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  }

  /**
   * Break down task into 2-5 microsteps using GPT-4
   */
  public async breakdownTask(task: Task): Promise<Subtask[]> {
    if (!this.apiKey) {
      // Fallback to simple breakdown
      return this.simpleBreakdown(task);
    }

    try {
      const prompt = this.createBreakdownPrompt(task);
      const response = await this.callOpenAI(prompt);
      return this.parseBreakdownResponse(response);
    } catch (error) {
      console.error('Error breaking down task:', error);
      return this.simpleBreakdown(task);
    }
  }

  /**
   * Create GPT-4 prompt for task breakdown
   */
  private createBreakdownPrompt(task: Task): string {
    return `Break down this task into 2-5 small, actionable microsteps that take 5-15 minutes each.
Make each step concrete and easy to start.

Task: ${task.title}
Description: ${task.description || 'No description'}
Priority: ${task.priority}
Estimated time: ${task.estimatedMinutes || 'Unknown'} minutes

Provide ONLY the steps as a numbered list, one per line. Be specific and actionable.`;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity assistant that breaks down tasks into small, actionable steps.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Parse GPT-4 response into subtasks
   */
  private parseBreakdownResponse(response: string): Subtask[] {
    const lines = response.split('\n').filter((line) => line.trim());
    const subtasks: Subtask[] = [];

    lines.forEach((line, index) => {
      // Remove numbering (1., 2., etc.)
      const cleaned = line.replace(/^\d+\.\s*/, '').trim();
      
      if (cleaned) {
        subtasks.push({
          id: `subtask_${Date.now()}_${index}`,
          title: cleaned,
          completed: false,
          order: index,
        });
      }
    });

    return subtasks.slice(0, 5); // Max 5 subtasks
  }

  /**
   * Simple fallback breakdown (no AI)
   */
  private simpleBreakdown(task: Task): Subtask[] {
    const estimatedMinutes = task.estimatedMinutes || 60;
    const stepCount = Math.min(5, Math.max(2, Math.ceil(estimatedMinutes / 15)));
    const subtasks: Subtask[] = [];

    for (let i = 0; i < stepCount; i++) {
      subtasks.push({
        id: `subtask_${Date.now()}_${i}`,
        title: `Step ${i + 1}: Work on ${task.title}`,
        completed: false,
        order: i,
      });
    }

    return subtasks;
  }

  /**
   * Get "just one step" - the next actionable microstep
   */
  public getNextStep(task: Task): Subtask | null {
    if (!task.subtasks || task.subtasks.length === 0) {
      return null;
    }

    // Find first incomplete subtask
    return task.subtasks.find((subtask) => !subtask.completed) || null;
  }

  /**
   * Mark subtask as complete
   */
  public async completeSubtask(task: Task, subtaskId: string): Promise<Task> {
    if (!task.subtasks) {
      return task;
    }

    const subtask = task.subtasks.find((s) => s.id === subtaskId);
    if (subtask) {
      subtask.completed = true;
    }

    // Check if all subtasks are complete
    const allComplete = task.subtasks.every((s) => s.completed);
    if (allComplete) {
      task.status = 'completed';
      task.completedAt = new Date();
    }

    // Save task
    await this.saveTask(task);

    return task;
  }

  /**
   * Save task
   */
  private async saveTask(task: Task): Promise<void> {
    try {
      const tasksJson = await AsyncStorage.getItem('timeline_tasks');
      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
      
      const index = tasks.findIndex((t) => t.id === task.id);
      if (index >= 0) {
        tasks[index] = task;
      } else {
        tasks.push(task);
      }
      
      await AsyncStorage.setItem('timeline_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }
}

// Singleton instance
export const taskBreakdown = new TaskBreakdown();
