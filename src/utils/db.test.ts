import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MindMateDB } from './db';

// Mock window and localStorage for testing
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value.toString();
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);
  }),
};

if (typeof window === 'undefined') {
  global.window = { localStorage: localStorageMock } as any;
  global.localStorage = localStorageMock as any;
}

describe('MindMateDB Local Storage Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize empty state if profile does not exist', () => {
    const profile = MindMateDB.getProfile();
    expect(profile).toBeNull();
  });

  it('should seed mock data and initialize user profile', () => {
    MindMateDB.seedMockData('Rahul Sharma', 'NEET');
    
    const profile = MindMateDB.getProfile();
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe('Rahul Sharma');
    expect(profile?.targetExam).toBe('NEET');
    expect(profile?.level).toBeGreaterThanOrEqual(1);

    const entries = MindMateDB.getDailyEntries();
    expect(entries.length).toBe(14); // 14 days of mock data

    const journals = MindMateDB.getJournals();
    expect(journals.length).toBe(2);
  });

  it('should save a new daily check-in and update XP and streak', () => {
    MindMateDB.seedMockData('Rahul Sharma', 'NEET');
    const oldProfile = MindMateDB.getProfile();
    const oldXp = oldProfile?.xp || 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const newProfile = MindMateDB.saveDailyEntry({
      date: todayStr,
      mood: 'excellent',
      stress: 2,
      sleep: 8,
      studyHours: 7,
      exercise: true,
      water: 2500,
      social: true,
      energy: 9,
      motivation: 9,
      confidence: 8,
      screenTime: 2,
      selfRating: 9
    });

    expect(newProfile).not.toBeNull();
    expect(newProfile?.xp).toBe(oldXp + 15); // Adds 15 XP for logging check-in

    const entry = MindMateDB.getDailyEntry(todayStr);
    expect(entry).toBeDefined();
    expect(entry?.mood).toBe('excellent');
    expect(entry?.stress).toBe(2);
  });

  it('should toggle habit logs and award XP', () => {
    MindMateDB.seedMockData('Rahul Sharma', 'NEET');
    const oldXp = MindMateDB.getProfile()?.xp || 0;
    const todayStr = new Date().toISOString().split('T')[0];

    const logs1 = MindMateDB.toggleHabit('water', 'Water Intake', todayStr);
    expect(logs1.length).toBe(1);
    expect(logs1[0].completed).toBe(true);

    const newXp = MindMateDB.getProfile()?.xp || 0;
    expect(newXp).toBe(oldXp + 5); // 5 XP per habit

    // Toggle off
    const logs2 = MindMateDB.toggleHabit('water', 'Water Intake', todayStr);
    expect(logs2.length).toBe(0);
  });
});
