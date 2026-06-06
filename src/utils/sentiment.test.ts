import { describe, it, expect } from 'vitest';
import { SentimentAnalyzer } from './sentiment';

describe('SentimentAnalyzer Tests', () => {
  it('should detect positive sentiment and achievements', () => {
    const text = 'I had a really good day. I solved all my physics homework problems and feel confident!';
    const result = SentimentAnalyzer.analyze(text);
    
    expect(result.sentiment).toBe('positive');
    expect(result.emotion).toContain('Joy');
    expect(result.crisisFlag).toBe(false);
    expect(result.aiResponse).toBeTruthy();
  });

  it('should detect mock test anxiety and tags', () => {
    const text = 'I am so scared of my mock test tomorrow. I feel like my mock score will be terrible and I will fail.';
    const result = SentimentAnalyzer.analyze(text);
    
    expect(result.sentiment).toBe('anxious');
    expect(result.triggers).toContain('Mock Exam Performance');
    expect(result.crisisFlag).toBe(false);
  });

  it('should detect sleep deprivation and workload issues', () => {
    const text = 'I studied till 3 AM last night and only slept for 4 hours. Feeling extremely tired and exhausted today.';
    const result = SentimentAnalyzer.analyze(text);
    
    expect(result.sentiment).toBe('burned_out');
    expect(result.triggers).toContain('Sleep Deprivation');
    expect(result.crisisFlag).toBe(false);
  });

  it('should flag severe crisis keywords for safety overrides', () => {
    const texts = [
      'I want to disappear from this world, my life is over',
      'I can not do this anymore, I just want to end it all',
      'there is no point in living, I want to kill myself'
    ];

    texts.forEach(text => {
      const result = SentimentAnalyzer.analyze(text);
      expect(result.crisisFlag).toBe(true);
    });
  });

  it('should analyze parent and family pressure triggers', () => {
    const text = 'My parents expect me to get a top rank in NEET and the pressure is overwhelming.';
    const result = SentimentAnalyzer.analyze(text);
    
    expect(result.triggers).toContain('Family Pressure');
  });
});
