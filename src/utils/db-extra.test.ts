import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MindMateDB, DailyEntry, UserProfile, JournalEntry } from './db';

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

describe('MindMateDB Expanded Test Suite', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    MindMateDB.clearAll();
  });

  it('should save and retrieve user profile details correctly', () => {
    const mockProfile: UserProfile = {
      name: 'Test Student',
      targetExam: 'GATE',
      level: 1,
      xp: 45,
      achievements: [],
      streak: 2,
      lastActiveDate: '2026-06-05',
      onboarded: true
    };

    MindMateDB.saveProfile(mockProfile);
    const retrieved = MindMateDB.getProfile();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Test Student');
    expect(retrieved?.targetExam).toBe('GATE');
    expect(retrieved?.xp).toBe(45);
  });

  it('should handle level calculation and level up user when XP crosses a threshold', () => {
    const mockProfile: UserProfile = {
      name: 'Exp Student',
      targetExam: 'UPSC',
      level: 1,
      xp: 90, // 90 XP, logging entry adds 15 XP -> 105 XP -> Level 2
      achievements: [],
      streak: 1,
      lastActiveDate: '2026-06-04',
      onboarded: true
    };
    MindMateDB.saveProfile(mockProfile);

    const todayStr = new Date().toISOString().split('T')[0];
    const newProfile = MindMateDB.saveDailyEntry({
      date: todayStr,
      mood: 'good',
      stress: 3,
      sleep: 8,
      studyHours: 7,
      exercise: true,
      water: 2000,
      social: true,
      energy: 8,
      motivation: 8,
      confidence: 8,
      screenTime: 2,
      selfRating: 8
    });

    expect(newProfile?.xp).toBe(105);
    expect(newProfile?.level).toBe(2);
  });

  it('should increment streak when daily entry is logged on the next consecutive day', () => {
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const mockProfile: UserProfile = {
      name: 'Streak Student',
      targetExam: 'JEE',
      level: 1,
      xp: 10,
      achievements: [],
      streak: 3,
      lastActiveDate: yesterdayStr,
      onboarded: true
    };
    MindMateDB.saveProfile(mockProfile);

    const todayStr = new Date().toISOString().split('T')[0];
    const newProfile = MindMateDB.saveDailyEntry({
      date: todayStr,
      mood: 'excellent',
      stress: 2,
      sleep: 8,
      studyHours: 9,
      exercise: true,
      water: 2500,
      social: true,
      energy: 9,
      motivation: 9,
      confidence: 8,
      screenTime: 1,
      selfRating: 9
    });

    expect(newProfile?.streak).toBe(4);
    expect(newProfile?.lastActiveDate).toBe(todayStr);
  });

  it('should reset streak to 1 if daily entry is logged after a gap day', () => {
    const twoDaysAgoStr = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    const mockProfile: UserProfile = {
      name: 'Gap Student',
      targetExam: 'NEET',
      level: 1,
      xp: 20,
      achievements: [],
      streak: 5,
      lastActiveDate: twoDaysAgoStr,
      onboarded: true
    };
    MindMateDB.saveProfile(mockProfile);

    const todayStr = new Date().toISOString().split('T')[0];
    const newProfile = MindMateDB.saveDailyEntry({
      date: todayStr,
      mood: 'okay',
      stress: 4,
      sleep: 7,
      studyHours: 8,
      exercise: false,
      water: 1500,
      social: true,
      energy: 6,
      motivation: 6,
      confidence: 6,
      screenTime: 3,
      selfRating: 6
    });

    expect(newProfile?.streak).toBe(1);
    expect(newProfile?.lastActiveDate).toBe(todayStr);
  });

  it('should award streak_7 achievement when streak reaches 7', () => {
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const mockProfile: UserProfile = {
      name: 'Loyal Student',
      targetExam: 'JEE',
      level: 1,
      xp: 50,
      achievements: [],
      streak: 6,
      lastActiveDate: yesterdayStr,
      onboarded: true
    };
    MindMateDB.saveProfile(mockProfile);

    const todayStr = new Date().toISOString().split('T')[0];
    const newProfile = MindMateDB.saveDailyEntry({
      date: todayStr,
      mood: 'good',
      stress: 3,
      sleep: 8,
      studyHours: 8,
      exercise: true,
      water: 2000,
      social: true,
      energy: 8,
      motivation: 8,
      confidence: 8,
      screenTime: 2,
      selfRating: 8
    });

    expect(newProfile?.streak).toBe(7);
    expect(newProfile?.achievements).toContain('streak_7');
  });

  it('should award mood_master achievement when 5 daily entries are logged', () => {
    const mockProfile: UserProfile = {
      name: 'Checkin Student',
      targetExam: 'JEE',
      level: 1,
      xp: 50,
      achievements: [],
      streak: 1,
      lastActiveDate: '2026-06-01',
      onboarded: true
    };
    MindMateDB.saveProfile(mockProfile);

    // Save 5 entries
    for (let i = 1; i <= 5; i++) {
      MindMateDB.saveDailyEntry({
        date: `2026-06-0${i}`,
        mood: 'good',
        stress: 4,
        sleep: 7,
        studyHours: 8,
        exercise: true,
        water: 2000,
        social: true,
        energy: 7,
        motivation: 7,
        confidence: 7,
        screenTime: 2,
        selfRating: 7
      });
    }

    const currentProfile = MindMateDB.getProfile();
    expect(currentProfile?.achievements).toContain('mood_master');
  });

  it('should award journal_hero achievement when 5 journal logs are written', () => {
    const mockProfile: UserProfile = {
      name: 'Writer Student',
      targetExam: 'Boards',
      level: 1,
      xp: 10,
      achievements: [],
      streak: 1,
      onboarded: true
    };
    MindMateDB.saveProfile(mockProfile);

    for (let i = 1; i <= 5; i++) {
      MindMateDB.addJournal({
        content: `My entry number ${i}`,
        sentiment: 'neutral',
        emotion: 'Quiet Focus',
        triggers: [],
        aiResponse: 'Supportive mentor feedback text',
        tags: ['Reflections']
      });
    }

    const currentProfile = MindMateDB.getProfile();
    expect(currentProfile?.achievements).toContain('journal_hero');
    expect(MindMateDB.getJournals().length).toBe(5);
  });

  it('should calculate triggers and return correlation lists correctly', () => {
    const mockProfile: UserProfile = {
      name: 'Correlation Student',
      targetExam: 'UPSC',
      level: 2,
      xp: 200,
      achievements: [],
      streak: 5,
      onboarded: true
    };
    MindMateDB.saveProfile(mockProfile);

    // Seed data with poor sleep (< 6) and high stress (> 6) at least twice
    // And low exercise and high stress at least thrice
    const sampleEntries: DailyEntry[] = [
      { date: '2026-06-01', mood: 'sad', stress: 8, sleep: 5, studyHours: 8, exercise: false, water: 1000, social: false, energy: 4, motivation: 4, confidence: 5, screenTime: 2, selfRating: 4 },
      { date: '2026-06-02', mood: 'stressed', stress: 7, sleep: 5.5, studyHours: 8, exercise: false, water: 1500, social: true, energy: 5, motivation: 5, confidence: 5, screenTime: 3, selfRating: 5 },
      { date: '2026-06-03', mood: 'good', stress: 3, sleep: 8, studyHours: 7, exercise: true, water: 2500, social: true, energy: 8, motivation: 8, confidence: 8, screenTime: 1, selfRating: 8 },
      { date: '2026-06-04', mood: 'okay', stress: 7, sleep: 7, studyHours: 6, exercise: false, water: 2000, social: false, energy: 5, motivation: 5, confidence: 5, screenTime: 2, selfRating: 5 },
      { date: '2026-06-05', mood: 'burned_out', stress: 9, sleep: 4.5, studyHours: 12, exercise: false, water: 1000, social: false, energy: 3, motivation: 3, confidence: 3, screenTime: 6, selfRating: 3 },
    ];

    sampleEntries.forEach(e => MindMateDB.saveDailyEntry(e));

    const triggers = MindMateDB.getDetectedTriggers();
    expect(triggers.length).toBeGreaterThan(0);

    const sleepTrigger = triggers.find(t => t.trigger.includes('Sleep deprivation'));
    expect(sleepTrigger).toBeDefined();
    expect(sleepTrigger?.correlation).toContain('elevated stress scores');

    const exerciseTrigger = triggers.find(t => t.trigger.includes('Physical inactivity'));
    expect(exerciseTrigger).toBeDefined();
  });

  it('should fall back to generic balance trigger if no specific triggers match and entries >= 5', () => {
    const mockProfile: UserProfile = {
      name: 'Balanced Student',
      targetExam: 'JEE',
      level: 1,
      xp: 10,
      achievements: [],
      streak: 1,
      onboarded: true
    };
    MindMateDB.saveProfile(mockProfile);

    // Save 5 very healthy entries with no stress or sleep deprivation issues
    for (let i = 1; i <= 5; i++) {
      MindMateDB.saveDailyEntry({
        date: `2026-06-0${i}`,
        mood: 'excellent',
        stress: 2,
        sleep: 8,
        studyHours: 7,
        exercise: true,
        water: 2500,
        social: true,
        energy: 9,
        motivation: 9,
        confidence: 9,
        screenTime: 2,
        selfRating: 9
      });
    }

    const triggers = MindMateDB.getDetectedTriggers();
    expect(triggers.length).toBe(1);
    expect(triggers[0].trigger).toBe('Irregular study-sleep balance');
  });

  it('should save and retrieve mock test scores correctly', () => {
    MindMateDB.addMockScore({
      examName: 'NEET',
      date: '2026-06-01',
      score: 580,
      total: 720
    });

    const scores = MindMateDB.getMockScores();
    expect(scores.length).toBe(1);
    expect(scores[0].score).toBe(580);
    expect(scores[0].total).toBe(720);
    expect(scores[0].examName).toBe('NEET');
  });
});
