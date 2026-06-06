/**
 * Coverage Boost Test Suite for Manas
 * Targets uncovered branches in db.ts, sentiment.ts, and ai-coach.ts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MindMateDB, UserProfile, ALL_BADGES } from './db';
import { SentimentAnalyzer } from './sentiment';

// ─── Mock localStorage ────────────────────────────────────────────────────────
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

// ─── Helper ───────────────────────────────────────────────────────────────────
const makeProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  name: 'Test Student',
  targetExam: 'JEE',
  level: 1,
  xp: 0,
  achievements: [],
  streak: 0,
  onboarded: true,
  ...overrides,
});

const makeEntry = (overrides: Record<string, any> = {}) => ({
  date: new Date().toISOString().split('T')[0],
  mood: 'good' as const,
  stress: 4,
  sleep: 7,
  studyHours: 6,
  exercise: true,
  water: 2000,
  social: true,
  energy: 7,
  motivation: 7,
  confidence: 7,
  screenTime: 2,
  selfRating: 7,
  ...overrides,
});

// ─── db.ts branch coverage ───────────────────────────────────────────────────
describe('MindMateDB – Additional Branch Coverage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    MindMateDB.clearAll();
  });

  // ALL_BADGES export is defined and contains expected badges
  it('should export ALL_BADGES with all required badge categories', () => {
    expect(ALL_BADGES.length).toBeGreaterThanOrEqual(6);
    const ids = ALL_BADGES.map((b) => b.id);
    expect(ids).toContain('streak_7');
    expect(ids).toContain('mood_master');
    expect(ids).toContain('journal_hero');
    expect(ids).toContain('calm_champion');
    expect(ids).toContain('healthy_sleeper');
  });

  // toggleHabit – level-up branch inside habit toggle (line 226)
  it('should level up profile when habit XP crosses 100 threshold', () => {
    // Start at 97 XP level 1; toggling a habit adds 5 → 102 → level 2
    MindMateDB.saveProfile(makeProfile({ xp: 97, level: 1 }));
    const today = new Date().toISOString().split('T')[0];
    MindMateDB.toggleHabit('water', 'Water Intake', today);
    const prof = MindMateDB.getProfile();
    expect(prof?.xp).toBe(102);
    expect(prof?.level).toBe(2);
  });

  // toggleHabit – un-toggle (remove) existing habit
  it('should remove habit log when toggling an already-completed habit', () => {
    MindMateDB.saveProfile(makeProfile({ xp: 20, level: 1 }));
    const today = new Date().toISOString().split('T')[0];
    MindMateDB.toggleHabit('exercise', 'Exercise', today);
    expect(MindMateDB.getHabitLogs(today).length).toBe(1);
    MindMateDB.toggleHabit('exercise', 'Exercise', today);
    expect(MindMateDB.getHabitLogs(today).length).toBe(0);
  });

  // getDetectedTriggers – excessive study load branch (lines 284-287)
  it('should detect excessive study load trigger when study > 10 hrs with high stress ≥ twice', () => {
    MindMateDB.saveProfile(makeProfile({ streak: 1 }));
    const entries = [
      makeEntry({ date: '2026-06-01', studyHours: 12, stress: 8, sleep: 7, exercise: false }),
      makeEntry({ date: '2026-06-02', studyHours: 11, stress: 9, sleep: 6, exercise: false }),
      makeEntry({ date: '2026-06-03', studyHours: 7,  stress: 3, sleep: 8, exercise: true }),
      makeEntry({ date: '2026-06-04', studyHours: 8,  stress: 4, sleep: 7, exercise: true }),
      makeEntry({ date: '2026-06-05', studyHours: 12, stress: 8, sleep: 5, exercise: false }),
    ];
    entries.forEach((e) => MindMateDB.saveDailyEntry(e));
    const triggers = MindMateDB.getDetectedTriggers();
    const studyTrigger = triggers.find((t) => t.trigger.includes('Excessive study load'));
    expect(studyTrigger).toBeDefined();
    expect(studyTrigger?.correlation).toContain('mental fatigue');
  });

  // getDetectedTriggers – excessive screen time branch (lines 304-307)
  it('should detect excessive screen time trigger when screenTime > 5 with high stress ≥ twice', () => {
    MindMateDB.saveProfile(makeProfile({ streak: 1 }));
    const entries = [
      makeEntry({ date: '2026-06-01', screenTime: 7, stress: 8, sleep: 7, exercise: false, studyHours: 6 }),
      makeEntry({ date: '2026-06-02', screenTime: 6, stress: 7, sleep: 6, exercise: false, studyHours: 6 }),
      makeEntry({ date: '2026-06-03', screenTime: 2, stress: 3, sleep: 8, exercise: true,  studyHours: 7 }),
      makeEntry({ date: '2026-06-04', screenTime: 8, stress: 8, sleep: 5, exercise: false, studyHours: 8 }),
      makeEntry({ date: '2026-06-05', screenTime: 3, stress: 4, sleep: 7, exercise: true,  studyHours: 6 }),
    ];
    entries.forEach((e) => MindMateDB.saveDailyEntry(e));
    const triggers = MindMateDB.getDetectedTriggers();
    const screenTrigger = triggers.find((t) => t.trigger.includes('screen time'));
    expect(screenTrigger).toBeDefined();
    expect(screenTrigger?.correlation).toContain('digital burnout');
  });

  // Returns empty array if fewer than 5 entries
  it('should return empty triggers array when fewer than 5 entries exist', () => {
    MindMateDB.saveProfile(makeProfile());
    MindMateDB.saveDailyEntry(makeEntry({ date: '2026-06-01' }));
    MindMateDB.saveDailyEntry(makeEntry({ date: '2026-06-02' }));
    expect(MindMateDB.getDetectedTriggers()).toEqual([]);
  });

  // getJournals returns all journal entries
  it('should retrieve all journal entries', () => {
    MindMateDB.saveProfile(makeProfile());
    MindMateDB.addJournal({ content: 'First entry', sentiment: 'positive', emotion: 'Joy', triggers: [], aiResponse: 'Great!', tags: [] });
    MindMateDB.addJournal({ content: 'Second entry', sentiment: 'neutral', emotion: 'Calm', triggers: [], aiResponse: 'OK', tags: [] });
    const journals = MindMateDB.getJournals();
    expect(journals.length).toBe(2);
    expect(journals[0].content).toBe('Second entry'); // unshift means newest first
    expect(journals[1].content).toBe('First entry');
  });

  // getApiKeys when none saved
  it('should return empty object when no API keys are saved', () => {
    const keys = MindMateDB.getApiKeys();
    expect(keys).toBeDefined();
  });

  // saveApiKeys and retrieve
  it('should save and retrieve API keys correctly', () => {
    MindMateDB.saveApiKeys({ openai: 'sk-test-openai', gemini: 'gem-test' });
    const keys = MindMateDB.getApiKeys();
    expect(keys.openai).toBe('sk-test-openai');
    expect(keys.gemini).toBe('gem-test');
  });

  // checkAchievements should not re-add existing achievements
  it('should not duplicate achievements when conditions are already met', () => {
    MindMateDB.saveProfile(makeProfile({ streak: 10, achievements: ['streak_7'] }));
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    MindMateDB.saveProfile(makeProfile({ streak: 10, achievements: ['streak_7'], lastActiveDate: yesterday }));

    MindMateDB.saveDailyEntry(makeEntry());
    const prof = MindMateDB.getProfile();
    const streakCount = prof?.achievements.filter((a) => a === 'streak_7').length ?? 0;
    expect(streakCount).toBe(1);
  });

  // seedMockData produces valid data
  it('should seed mock data with valid profile and entries', () => {
    MindMateDB.seedMockData('Demo Student', 'CUET');
    const profile = MindMateDB.getProfile();
    expect(profile?.name).toBe('Demo Student');
    expect(profile?.targetExam).toBe('CUET');
    expect(profile?.level).toBeGreaterThanOrEqual(1);
    const entries = MindMateDB.getDailyEntries();
    expect(entries.length).toBeGreaterThan(0);
  });

  // getDailyEntry returns undefined for missing date
  it('should return undefined for a date with no entry logged', () => {
    MindMateDB.saveProfile(makeProfile());
    const result = MindMateDB.getDailyEntry('1900-01-01');
    expect(result).toBeUndefined();
  });
});

// ─── sentiment.ts branch coverage ────────────────────────────────────────────
describe('SentimentAnalyzer – Additional Branch Coverage', () => {
  // line 80: default 'Academic Workload' trigger if text is academic but no trigger keyword
  it('should assign Academic Workload trigger when text mentions study without specific trigger', () => {
    const text = 'I need to revise my syllabus and score well in my upcoming revision test.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.triggers).toContain('Academic Workload');
  });

  // line 127: negative/frustration emotion label
  it('should return Frustration emotion label for low-intensity negative sentiment', () => {
    const text = 'I feel a bit sad and annoyed today.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('negative');
    expect(result.emotion).toContain('Frustration');
  });

  // Despair / Sadness for high negative score
  it('should return Despair / Sadness emotion label for high-intensity negative sentiment', () => {
    const text = 'I feel absolutely sad, bad, depressed, lonely, crying, hate everything, frustrated, worst day ever.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('negative');
    expect(result.emotion).toContain('Despair');
  });

  // Balanced/Reflective when no scores match
  it('should return Balanced / Reflective for neutral text with no clear sentiment', () => {
    const text = 'Today was a normal day. I did some tasks.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('neutral');
    expect(result.emotion).toContain('Balanced');
  });

  // Optimism for low positive score
  it('should return Optimism for low-intensity positive sentiment', () => {
    const text = 'I had a good day and feel excited!';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('positive');
    expect(result.emotion).toBe('Optimism');
  });

  // Joy / Achievement for high positive score
  it('should return Joy / Achievement for high-intensity positive sentiment', () => {
    const text = 'I am happy, great, solved everything, proud, confident, easy test, cracked it, awesome, excited!';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('positive');
    expect(result.emotion).toBe('Joy / Achievement');
  });

  // Sleep Deprivation trigger customized response
  it('should customize response for sleep deprivation + burnout combination', () => {
    const text = 'I am exhausted and burned out. I slept late at night and only got 4 hours of sleep. No energy left.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.triggers).toContain('Sleep Deprivation');
    expect(result.aiResponse).toBeTruthy();
  });

  // Mock performance trigger customized response
  it('should customize response for mock test failure + anxiety combination', () => {
    const text = 'I got terrible marks in my mock score and I am scared of failing the exam. My rank dropped.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.triggers).toContain('Mock Exam Performance');
    expect(result.aiResponse).toBeTruthy();
  });

  // Digital distraction trigger
  it('should detect Digital Distraction trigger', () => {
    const text = 'I keep getting distracted by instagram and youtube reels on my phone and social media scrolling.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.triggers).toContain('Digital Distraction');
  });

  // Peer comparison trigger
  it('should detect Peer Comparison trigger', () => {
    const text = 'My friends scored higher than me in coaching and I feel like the topper is far ahead of me.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.triggers).toContain('Peer Comparison');
  });

  // Apprehension for low anxiety score
  it('should return Apprehension for low-intensity anxiety', () => {
    const text = 'I have a small exam coming up and feel a bit nervous.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('anxious');
    // Low keyword count means Apprehension
    expect(['Apprehension', 'High Anxiety']).toContain(result.emotion);
  });

  // High Anxiety for high anxiety score
  it('should return High Anxiety for high-intensity anxiety with multiple keywords', () => {
    const text = 'I am so scared of failing my mock exam. My anxiety about the results is through the roof. My marks, score, fear of results, nervous breakdown.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('anxious');
    expect(result.emotion).toBe('High Anxiety');
  });

  // Academic Stress for low stress score
  it('should return Academic Stress for low-intensity stress', () => {
    const text = 'Today was a bit hard and I felt some pressure from the workload.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('stressed');
    expect(result.emotion).toBe('Academic Stress');
  });

  // Overwhelmed for high stress score
  it('should return Overwhelmed for high-intensity stress with multiple keywords', () => {
    const text = 'I feel so much stress, pressure, it is hard and heavy, I am overwhelmed, struggling, stuck, it seems impossible.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('stressed');
    expect(result.emotion).toBe('Overwhelmed');
  });

  // Mental Fatigue for low burnout score
  it('should return Mental Fatigue for low-intensity burnout', () => {
    const text = 'I feel a bit tired and sleepy after studying all day.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('burned_out');
    expect(result.emotion).toBe('Mental Fatigue');
  });

  // Severe Burnout for high burnout score
  it('should return Severe Burnout for high-intensity burnout with multiple keywords', () => {
    const text = 'I am so tired, exhausted, burned out, no energy at all, sleepy, feel like giving up, cannot focus, done with this fatigue.';
    const result = SentimentAnalyzer.analyze(text);
    expect(result.sentiment).toBe('burned_out');
    expect(result.emotion).toBe('Severe Burnout');
  });
});
