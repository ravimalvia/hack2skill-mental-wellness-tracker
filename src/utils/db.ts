// Client-side local database manager for MindMate using LocalStorage

export interface UserProfile {
  name: string;
  targetExam: string;
  level: number;
  xp: number;
  achievements: string[];
  streak: number;
  lastActiveDate?: string;
  onboarded: boolean;
  theme?: 'light' | 'dark';
}

export type MoodType = 'excellent' | 'good' | 'okay' | 'sad' | 'stressed' | 'burned_out';

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  mood: MoodType;
  stress: number; // 1-10
  sleep: number; // 0-12
  studyHours: number; // 0-16
  exercise: boolean;
  water: number; // ml
  social: boolean;
  energy: number; // 1-10
  motivation: number; // 1-10
  confidence: number; // 1-10
  screenTime: number; // hours
  selfRating: number; // 1-10
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'anxious' | 'stressed' | 'burned_out';
  emotion: string;
  triggers: string[];
  aiResponse: string;
  tags: string[];
}

export interface HabitLog {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface MockScore {
  id: string;
  examName: string;
  date: string; // YYYY-MM-DD
  score: number;
  total: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface MindMateData {
  profile: UserProfile | null;
  dailyEntries: DailyEntry[];
  journals: JournalEntry[];
  habitLogs: HabitLog[];
  mockScores: MockScore[];
  apiKeys: {
    openai?: string;
    gemini?: string;
  };
}

const STORAGE_KEY = 'mindmate_local_db';

// Static Badge library definition
export const ALL_BADGES: Badge[] = [
  { id: 'streak_7', name: '7-Day Streak', description: 'Maintained 7 consecutive active days.', icon: '🔥', category: 'consistency' },
  { id: 'mood_master', name: 'Mood Master', description: 'Logged mood for 5 consecutive days.', icon: '🌈', category: 'mood' },
  { id: 'journal_hero', name: 'Journal Hero', description: 'Wrote 5 emotional journals.', icon: '✍️', category: 'journal' },
  { id: 'calm_champion', name: 'Calm Champion', description: 'Completed 5 deep breathing sessions.', icon: '🧘', category: 'wellness' },
  { id: 'healthy_sleeper', name: 'Healthy Sleeper', description: 'Slept 7+ hours for 3 days straight.', icon: '😴', category: 'sleep' },
  { id: 'stress_survivor', name: 'Stress Survivor', description: 'Logged high stress and used a coping activity.', icon: '🛡️', category: 'resilience' },
];

export class MindMateDB {
  private static cache: MindMateData | null = null;

  private static getRawData(): MindMateData {
    if (typeof window === 'undefined') {
      return { profile: null, dailyEntries: [], journals: [], habitLogs: [], mockScores: [], apiKeys: {} };
    }
    if (this.cache) {
      return this.cache;
    }
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const initial: MindMateData = {
        profile: null,
        dailyEntries: [],
        journals: [],
        habitLogs: [],
        mockScores: [],
        apiKeys: {},
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      this.cache = initial;
      return initial;
    }
    this.cache = JSON.parse(data);
    return this.cache!;
  }

  private static saveRawData(data: MindMateData) {
    this.cache = data;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }

  static getProfile(): UserProfile | null {
    return this.getRawData().profile;
  }

  static saveProfile(profile: UserProfile) {
    const data = this.getRawData();
    data.profile = profile;
    this.saveRawData(data);
  }

  static getDailyEntries(): DailyEntry[] {
    return this.getRawData().dailyEntries;
  }

  static getDailyEntry(date: string): DailyEntry | undefined {
    return this.getRawData().dailyEntries.find((e) => e.date === date);
  }

  static saveDailyEntry(entry: DailyEntry): UserProfile | null {
    const data = this.getRawData();
    const existingIndex = data.dailyEntries.findIndex((e) => e.date === entry.date);
    if (existingIndex > -1) {
      data.dailyEntries[existingIndex] = entry;
    } else {
      data.dailyEntries.push(entry);
    }

    // Process streak and level up logic
    if (data.profile) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let streakUpdated = false;
      if (entry.date === todayStr) {
        if (data.profile.lastActiveDate === yesterdayStr) {
          data.profile.streak += 1;
          streakUpdated = true;
        } else if (data.profile.lastActiveDate !== todayStr) {
          data.profile.streak = 1;
          streakUpdated = true;
        }
        data.profile.lastActiveDate = todayStr;
      }

      // Add XP for logging
      data.profile.xp += 15;
      
      // Level up checks (100 XP per level)
      const targetLevel = Math.floor(data.profile.xp / 100) + 1;
      if (targetLevel > data.profile.level) {
        data.profile.level = targetLevel;
      }

      // Check achievements
      this.checkAchievements(data);
    }

    this.saveRawData(data);
    return data.profile;
  }

  static getJournals(): JournalEntry[] {
    return this.getRawData().journals;
  }

  static addJournal(entry: Omit<JournalEntry, 'id' | 'date'>): JournalEntry {
    const data = this.getRawData();
    const newEntry: JournalEntry = {
      ...entry,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    data.journals.unshift(newEntry);

    if (data.profile) {
      data.profile.xp += 25; // 25 XP for journaling
      const targetLevel = Math.floor(data.profile.xp / 100) + 1;
      if (targetLevel > data.profile.level) {
        data.profile.level = targetLevel;
      }
      this.checkAchievements(data);
    }

    this.saveRawData(data);
    return newEntry;
  }

  static getHabitLogs(date: string): HabitLog[] {
    return this.getRawData().habitLogs.filter((h) => h.date === date);
  }

  static toggleHabit(id: string, name: string, date: string): HabitLog[] {
    const data = this.getRawData();
    const existingIndex = data.habitLogs.findIndex((h) => h.id === id && h.date === date);

    if (existingIndex > -1) {
      data.habitLogs.splice(existingIndex, 1);
    } else {
      data.habitLogs.push({ id, name, date, completed: true });
      if (data.profile) {
        data.profile.xp += 5; // 5 XP per habit completed
        const targetLevel = Math.floor(data.profile.xp / 100) + 1;
        if (targetLevel > data.profile.level) {
          data.profile.level = targetLevel;
        }
      }
    }
    this.saveRawData(data);
    return this.getHabitLogs(date);
  }

  static getMockScores(): MockScore[] {
    return this.getRawData().mockScores;
  }

  static addMockScore(score: Omit<MockScore, 'id'>) {
    const data = this.getRawData();
    data.mockScores.push({
      ...score,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
    });
    this.saveRawData(data);
  }

  static getApiKeys() {
    return this.getRawData().apiKeys;
  }

  static saveApiKeys(keys: { openai?: string; gemini?: string }) {
    const data = this.getRawData();
    data.apiKeys = keys;
    this.saveRawData(data);
  }

  static clearAll() {
    this.cache = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Calculate stress triggers based on correlations in historical data
  static getDetectedTriggers(): { trigger: string; correlation: string; score: number }[] {
    const entries = this.getDailyEntries();
    if (entries.length < 5) return [];

    const triggers: { trigger: string; correlation: string; score: number }[] = [];

    // Analyze poor sleep vs high stress
    const sleepStressCorr = entries.filter(e => e.sleep < 6 && e.stress > 6).length;
    if (sleepStressCorr >= 2) {
      triggers.push({
        trigger: 'Sleep deprivation (< 6 hrs)',
        correlation: 'Correlates directly with elevated stress scores (avg +3 points)',
        score: Math.min(100, Math.round((sleepStressCorr / entries.filter(e => e.sleep < 6).length) * 100)),
      });
    }

    // Analyze high study hours vs high stress
    const studyStressCorr = entries.filter(e => e.studyHours > 10 && e.stress > 7).length;
    if (studyStressCorr >= 2) {
      triggers.push({
        trigger: 'Excessive study load (> 10 hrs)',
        correlation: 'Causes mental fatigue and drops energy rating by 20%',
        score: Math.min(100, Math.round((studyStressCorr / entries.filter(e => e.studyHours > 10).length) * 100)),
      });
    }

    // Analyze low exercise vs high stress
    const noExerciseStressCorr = entries.filter(e => !e.exercise && e.stress > 6).length;
    if (noExerciseStressCorr >= 3) {
      triggers.push({
        trigger: 'Physical inactivity (Skipping exercise)',
        correlation: 'Reduces stress resilience and emotional coping threshold',
        score: Math.min(100, Math.round((noExerciseStressCorr / entries.filter(e => !e.exercise).length) * 100)),
      });
    }

    // Analyze high screen time
    const screenTimeCorr = entries.filter(e => e.screenTime > 5 && e.stress > 6).length;
    if (screenTimeCorr >= 2) {
      triggers.push({
        trigger: 'Excessive screen time (> 5 hrs)',
        correlation: 'Leads to digital burnout and sleep onset issues',
        score: Math.min(100, Math.round((screenTimeCorr / entries.filter(e => e.screenTime > 5).length) * 100)),
      });
    }

    // Add generic fallback trigger if sample size is good but triggers are low
    if (triggers.length === 0) {
      triggers.push({
        trigger: 'Irregular study-sleep balance',
        correlation: 'Increases exam preparation anxiety and fatigue',
        score: 60,
      });
    }

    return triggers.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  // Pre-populate DB with 14 days of mock student history
  static seedMockData(studentName: string, targetExam: string) {
    const data = this.getRawData();
    data.profile = {
      name: studentName,
      targetExam: targetExam,
      level: 2,
      xp: 145,
      achievements: ['mood_master', 'healthy_sleeper'],
      streak: 5,
      lastActiveDate: new Date().toISOString().split('T')[0],
      onboarded: true,
      theme: 'light',
    };

    const dailyEntries: DailyEntry[] = [];
    const now = Date.now();

    // 14 days of entries
    for (let i = 14; i >= 1; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];

      // Create a student story:
      // Days 14-10: Calm study sessions, good sleep
      // Days 9-6: Mock exam preparation, increasing study hours, decreasing sleep, high stress
      // Days 5-3: Post mock exam relief, exercise, improved mood
      // Days 2-1: Moderate stress, healthy balance

      let mood: MoodType = 'good';
      let stress = 4;
      let sleep = 7.5;
      let studyHours = 7;
      let exercise = true;
      let water = 2000;
      let social = true;
      let energy = 7;
      let motivation = 8;
      let confidence = 7;
      let screenTime = 3;
      let selfRating = 7;

      if (i >= 10) {
        // Calm & Steady
        mood = i % 2 === 0 ? 'excellent' : 'good';
        stress = 3 + (i % 2);
        sleep = 7.5 + (i % 3) * 0.25;
        studyHours = 6 + (i % 3);
        exercise = true;
        water = 2400;
        energy = 8;
        motivation = 8;
        confidence = 7;
        screenTime = 2.5;
        selfRating = 8;
      } else if (i >= 6) {
        // High Mock Exam Pressure
        mood = i === 7 ? 'burned_out' : 'stressed';
        stress = 7 + (i % 3);
        sleep = 5.0 - (i % 2) * 0.5; // Poor sleep
        studyHours = 10 + (i % 3); // High study load
        exercise = false;
        water = 1200;
        social = false;
        energy = 4;
        motivation = 5;
        confidence = 4;
        screenTime = 5.5;
        selfRating = 4;
      } else if (i >= 3) {
        // Post Exam Relief
        mood = 'okay';
        stress = 5;
        sleep = 8.0;
        studyHours = 4;
        exercise = true;
        water = 2200;
        social = true;
        energy = 7;
        motivation = 6;
        confidence = 6;
        screenTime = 3.0;
        selfRating = 6;
      } else {
        // Healthy recovery
        mood = 'good';
        stress = 4;
        sleep = 7.0;
        studyHours = 8;
        exercise = true;
        water = 2000;
        social = true;
        energy = 7;
        motivation = 7;
        confidence = 7;
        screenTime = 3.2;
        selfRating = 7;
      }

      dailyEntries.push({
        date: dateStr,
        mood,
        stress,
        sleep,
        studyHours,
        exercise,
        water,
        social,
        energy,
        motivation,
        confidence,
        screenTime,
        selfRating,
      });
    }

    data.dailyEntries = dailyEntries;

    // Seed mock mock exam results
    data.mockScores = [
      { id: '1', examName: targetExam, date: new Date(now - 12 * 86400000).toISOString().split('T')[0], score: 480, total: 720 },
      { id: '2', examName: targetExam, date: new Date(now - 6 * 86400000).toISOString().split('T')[0], score: 510, total: 720 },
    ];

    // Seed mock journal logs
    data.journals = [
      {
        id: 'j1',
        date: new Date(now - 7 * 86400000).toISOString(),
        content: 'Mock test tomorrow and I feel completely unprepared. The chemistry syllabus is huge and I cannot seem to remember the inorganic reactions. I feel like my heart is racing just thinking about the score.',
        sentiment: 'anxious',
        emotion: 'Anxiety',
        triggers: ['Mock test score', 'Syllabus workload'],
        aiResponse: 'It is completely normal to feel overwhelmed when faced with a huge syllabus. Remember, a mock test is just a diagnostic tool, not the final exam. Take a deep breath, break your inorganic chemistry into 3 small topics today, and study for just 45 minutes, then take a walk. Your value is not defined by one practice test.',
        tags: ['Mock Test', 'Chemistry', 'Anxiety'],
      },
      {
        id: 'j2',
        date: new Date(now - 13 * 86400000).toISOString(),
        content: 'Had a really productive day today. Solved 50 physics problems and went for a run. Feeling confident about the mechanics topics.',
        sentiment: 'positive',
        emotion: 'Joy',
        triggers: ['Healthy exercise', 'Problem solving'],
        aiResponse: 'This is amazing! Celebrating these productive days builds momentum. Balancing study with physical movement is the secret to high performance. Keep this momentum going, and remember this feeling on tougher days.',
        tags: ['Physics', 'Productivity', 'Exercise'],
      },
    ];

    // Seed habit logs
    const habitTypes = ['sleep', 'water', 'breaks', 'exercise', 'meditation'];
    const habitLogs: HabitLog[] = [];
    for (let i = 10; i >= 1; i--) {
      const dateStr = new Date(now - i * 86400000).toISOString().split('T')[0];
      // Seed randomized successful habits
      habitTypes.forEach(h => {
        if (Math.random() > 0.4) {
          habitLogs.push({
            id: h,
            name: h.charAt(0).toUpperCase() + h.slice(1),
            date: dateStr,
            completed: true
          });
        }
      });
    }
    data.habitLogs = habitLogs;

    this.saveRawData(data);
  }

  static checkAchievements(data: MindMateData) {
    if (!data.profile) return;
    const achievements = new Set(data.profile.achievements);

    // 1. Streak check
    if (data.profile.streak >= 7 && !achievements.has('streak_7')) {
      achievements.add('streak_7');
      data.profile.xp += 100;
    }

    // 2. Mood check
    const entries = data.dailyEntries;
    if (entries.length >= 5 && !achievements.has('mood_master')) {
      achievements.add('mood_master');
      data.profile.xp += 100;
    }

    // 3. Journal check
    if (data.journals.length >= 5 && !achievements.has('journal_hero')) {
      achievements.add('journal_hero');
      data.profile.xp += 100;
    }

    data.profile.achievements = Array.from(achievements);
  }
}
