import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendMessageToCoach } from './ai-coach';
import { MindMateDB, UserProfile } from './db';

// Mock localStorage and window
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

describe('AI Coach Integration Tests', () => {
  const mockProfile: UserProfile = {
    name: 'Rahul Malvia',
    targetExam: 'JEE',
    level: 2,
    xp: 150,
    streak: 5,
    achievements: ['calm_champion'],
    joinedDate: '2026-06-01'
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should intercept crisis keywords and return safety support advice', async () => {
    const crisisMessages = [
      'I want to die, this exam is too hard',
      'I cannot do this anymore, I want to kill myself',
      'there is no point, I am thinking of suicide'
    ];

    for (const msg of crisisMessages) {
      const reply = await sendMessageToCoach([], msg, mockProfile);
      expect(reply).toContain('safety is the only thing that matters');
      expect(reply).toContain('Emergency Support');
    }
  });

  it('should trigger offline rule-based fallback for failure/mock test keywords', async () => {
    const text = 'I scored poorly in my mock test today and I am scared I will fail JEE.';
    const reply = await sendMessageToCoach([], text, mockProfile);
    expect(reply).toContain('A test is just a measurement');
    expect(reply).toContain('scared of failing');
  });

  it('should trigger offline rule-based fallback for concentration problems', async () => {
    const text = 'I am distracted by social media and cannot focus on chemistry.';
    const reply = await sendMessageToCoach([], text, mockProfile);
    expect(reply).toContain('Use the Pomodoro technique');
    expect(reply).toContain('Clear your desk');
  });

  it('should trigger offline rule-based fallback for parental pressure', async () => {
    const text = 'My mom and dad have high expectations from me and I fear disappointing them.';
    const reply = await sendMessageToCoach([], text, mockProfile);
    expect(reply).toContain('parental expectations');
    expect(reply).toContain('worth as a person is not tied to');
  });

  it('should trigger default fallback response when no keyword rule matches', async () => {
    const text = 'What did you eat today?';
    const reply = await sendMessageToCoach([], text, mockProfile);
    expect(reply).toContain('Preparing for JEE');
    expect(reply).toContain('I\'m here to listen');
  });

  it('should call backend API route when API keys are configured', async () => {
    // Save mock API keys in database
    MindMateDB.saveApiKeys({ openai: 'sk-mock-key' });

    // Mock fetch call response
    const mockResponseText = "Hello student, this is a response from the live AI model.";
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, text: mockResponseText }),
      })
    );
    global.fetch = fetchMock as any;

    const reply = await sendMessageToCoach([], 'Hello, coach', mockProfile);
    
    expect(fetchMock).toHaveBeenCalled();
    expect(reply).toBe(mockResponseText);
  });

  it('should fall back to local rule-based engine if API route fetch fails', async () => {
    MindMateDB.saveApiKeys({ openai: 'sk-mock-key' });

    // Mock fetch throwing exception
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );
    global.fetch = fetchMock as any;

    const text = 'I feel completely exhausted and sleepy.';
    const reply = await sendMessageToCoach([], text, mockProfile);
    
    // Expect fallback response
    expect(reply).toContain('circadian rhythm');
    expect(reply).toContain('circadian rhythm');
  });
});
