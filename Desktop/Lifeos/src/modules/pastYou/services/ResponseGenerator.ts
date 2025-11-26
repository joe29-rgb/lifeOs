/**
 * Response Generator
 * Constructs "Past You" responses from real data
 */

import { Memory, SearchResult } from '../types/pastYou.types';
import { RESPONSE_TEMPLATES } from '../constants/pastYou.constants';

export class ResponseGenerator {
  public generateResponse(query: string, searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return this.generateNoMemoriesResponse(query);
    }

    const topResult = searchResults[0];
    const response: string[] = [];

    response.push(this.generateGreeting(topResult.memory));
    response.push('');
    response.push(this.generateSimilarSituation(topResult.memory));
    response.push('');
    response.push(this.generateQuotedMemory(topResult.memory));

    if (searchResults.length > 1) {
      response.push('');
      response.push(this.generateAdditionalContext(searchResults.slice(1, 3)));
    }

    response.push('');
    response.push(this.generateAdvice(searchResults));

    return response.join('\n');
  }

  private generateGreeting(memory: Memory): string {
    const date = this.formatDate(memory.timestamp);
    const templates = RESPONSE_TEMPLATES.greeting;
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{date}', date);
  }

  private generateSimilarSituation(memory: Memory): string {
    const templates = RESPONSE_TEMPLATES.similar_situation;
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{context}', memory.context.toLowerCase());
  }

  private generateQuotedMemory(memory: Memory): string {
    const preview = memory.content.length > 200
      ? memory.content.substring(0, 200) + '...'
      : memory.content;

    return `"${preview}"\n\n${this.formatDate(memory.timestamp)}`;
  }

  private generateAdditionalContext(results: SearchResult[]): string {
    const lines: string[] = ['Also, remember:'];

    for (const result of results) {
      const date = this.formatDate(result.memory.timestamp);
      const preview = result.memory.content.substring(0, 100);
      lines.push(`\n${date}: "${preview}..."`);
    }

    return lines.join('\n');
  }

  private generateAdvice(results: SearchResult[]): string {
    const lines: string[] = ['What I learned:'];

    const hasOutcome = results.filter((r) => r.memory.outcome);
    if (hasOutcome.length > 0) {
      lines.push(`• ${hasOutcome[0].memory.outcome}`);
    }

    const patterns = this.identifyPatterns(results);
    if (patterns.length > 0) {
      lines.push(`• ${patterns[0]}`);
    }

    lines.push('');
    lines.push('What would help you decide this time?');

    return lines.join('\n');
  }

  private identifyPatterns(results: SearchResult[]): string[] {
    const patterns: string[] = [];

    const decisionMemories = results.filter((r) => r.memory.source === 'decision');
    if (decisionMemories.length >= 2) {
      patterns.push('You tend to make good decisions when you take time to reflect');
    }

    const crisisMemories = results.filter((r) => r.memory.source === 'crisis');
    if (crisisMemories.length > 0) {
      patterns.push('Reaching out for support has helped you before');
    }

    return patterns;
  }

  private generateNoMemoriesResponse(query: string): string {
    return `I don't have any past experiences quite like this yet.

This might be new territory for you. That's okay—every experience adds to your wisdom.

What are you thinking about ${query.toLowerCase()}?`;
  }

  private formatDate(date: Date): string {
    const now = new Date();
    const timestamp = new Date(date);
    const diffDays = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      return timestamp.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

  public generateEmotionalSupport(emotion: string, memories: Memory[]): string {
    const response: string[] = [];

    response.push(`I know this feeling. I've been here before.`);
    response.push('');

    if (memories.length > 0) {
      const recent = memories[0];
      response.push(`Last time I felt like this (${this.formatDate(recent.timestamp)}):`);
      response.push(`"${recent.content.substring(0, 150)}..."`);
      response.push('');
    }

    response.push('What helped:');
    const helpfulStrategies = this.extractHelpfulStrategies(memories);
    for (const strategy of helpfulStrategies.slice(0, 3)) {
      response.push(`• ${strategy}`);
    }

    response.push('');
    response.push('You always find a way through. Always.');

    return response.join('\n');
  }

  private extractHelpfulStrategies(memories: Memory[]): string[] {
    const strategies: string[] = [];

    for (const memory of memories) {
      if (memory.outcome) {
        strategies.push(memory.outcome);
      }
    }

    if (strategies.length === 0) {
      strategies.push('Talking to someone you trust');
      strategies.push('Taking it one step at a time');
      strategies.push('Being gentle with yourself');
    }

    return [...new Set(strategies)];
  }
}
