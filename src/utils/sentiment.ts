// Local sentiment analysis, trigger detection, and crisis flagging engine for MindMate

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative' | 'anxious' | 'stressed' | 'burned_out';
  emotion: string;
  triggers: string[];
  crisisFlag: boolean;
  aiResponse: string;
}

const CRISIS_KEYWORDS = [
  'life is over',
  'want to disappear',
  'want to die',
  'cant do this anymore',
  'cannot do this anymore',
  'end it all',
  'better off dead',
  'kill myself',
  'suicide',
  'no point in living',
  'dont want to live',
  'want to end my life',
];

const TRIGGER_MAP = [
  { keywords: ['mock', 'test', 'exam', 'marks', 'score', 'rank'], tag: 'Mock Exam Performance' },
  { keywords: ['sleep', 'night', 'late', 'awake', 'insomnia', 'tired'], tag: 'Sleep Deprivation' },
  { keywords: ['parents', 'family', 'father', 'mother', 'mom', 'dad', 'expectations', 'expecting'], tag: 'Family Pressure' },
  { keywords: ['phone', 'screen', 'instagram', 'distracted', 'youtube', 'social media', 'scrolling'], tag: 'Digital Distraction' },
  { keywords: ['syllabus', 'physics', 'chemistry', 'math', 'maths', 'biology', 'chapters', 'revision'], tag: 'Academic Workload' },
  { keywords: ['compare', 'topper', 'friends', 'coaching', 'better than me', 'ahead of me'], tag: 'Peer Comparison' },
];

const MOCK_MENTOR_RESPONSES = {
  positive: [
    "I'm so glad to hear this! Celebrating these wins—no matter how small—is crucial for maintaining stamina. Academic prep is a marathon, not a sprint. Keep up this healthy momentum, and remember to rest today so you don't overwork yourself.",
    "This is wonderful. Solving problems and feeling confident is a great milestone. Take a second to internalize this feeling; it will serve as your anchor on days when the syllabus feels tougher. Keep moving step-by-step!"
  ],
  neutral: [
    "It sounds like you're steady and working through your checklist today. That's a good place to be. Consistently pushing forward, even in a calm or neutral mood, is what builds long-term success. Make sure you drink some water and take a brief stretch break.",
    "A quiet, balanced day is often the most productive. Keep grinding, but remember that your wellness matters. Keep study sessions to 50-minute blocks with 10-minute breaks to sustain your focus."
  ],
  anxious: [
    "I hear you, and it's completely natural to feel this way. The fear of mock tests or falling behind can make anyone anxious. Remember: mock tests are just diagnostics, they are not your final results. They show you what to fix, not who you are. Take 5 slow deep breaths, plan just one hour of study right now, and then step away for a bit.",
    "Your anxiety is telling you that you care deeply, which is fine, but don't let it convince you that failure is guaranteed. When you feel overwhelmed by the exam date, shrink your timeline. Focus only on what you can study in the next 30 minutes. You can control your current efforts, not the future outcomes."
  ],
  stressed: [
    "It sounds like you are carrying a lot of weight on your shoulders. Stress happens when we feel our challenges exceed our resources. Let's rebuild those resources: pause studying, take a 10-minute walk outside, or stretch. You cannot absorb concepts well when your brain is in threat mode. Let's scale back today's goal just slightly.",
    "Syllabus pressure is real, but studying under heavy stress yields diminishing returns. If you can't solve a problem, it's not a reflection of your intelligence; it just means you are learning. Give yourself permission to shut down the books early tonight and sleep. A rested brain solves things faster."
  ],
  burned_out: [
    "This sounds like burnout. When you feel exhausted, unmotivated, or ready to give up, your mind and body are demanding a shutdown. Please listen to them. Do not push through this. Taking a full half-day off to sleep, talk to a friend, or do something completely unrelated to the exam is not 'wasting time'—it is active recovery. You are more than a study machine.",
    "I want you to stop studying for a moment. Burnout is a sign that your study system is out of balance. Reduce your study targets by half for the next two days, prioritize sleep (at least 8 hours), and force yourself to step outside. Academic achievements mean nothing if they cost you your health. Let's recover first."
  ],
  negative: [
    "I'm sorry things feel so heavy today. Some days are just hard, and it's okay to feel upset, frustrated, or down. You don't have to be a positive warrior all the time. Accept that today was a struggle, write it off, and focus on rest. Tomorrow is a fresh start.",
    "It's frustrating when things don't go as planned, whether it's a study goal or score. Please be kind to yourself. You are working under intense pressure. Speak to a trusted friend or family member, or just take a hot shower and rest. You'll get through this."
  ],
};

export class SentimentAnalyzer {
  static analyze(text: string): SentimentAnalysisResult {
    const cleanText = text.toLowerCase().trim();

    // 1. Scan for crisis keywords
    const crisisFlag = CRISIS_KEYWORDS.some((keyword) => cleanText.includes(keyword));

    // 2. Scan for triggers
    const triggers: string[] = [];
    TRIGGER_MAP.forEach(({ keywords, tag }) => {
      const matches = keywords.some((kw) => cleanText.includes(kw));
      if (matches) {
        triggers.push(tag);
      }
    });

    // Default trigger if none found and text is academic-leaning
    if (triggers.length === 0 && (cleanText.includes('study') || cleanText.includes('learn') || cleanText.includes('score') || cleanText.includes('revision'))) {
      triggers.push('Academic Workload');
    }

    // 3. Sentiment & Emotion Detection
    let sentiment: SentimentAnalysisResult['sentiment'] = 'neutral';
    let emotion = 'Calm';

    // Simple valence counting
    const stressScore = this.countMatches(cleanText, ['stress', 'pressure', 'hard', 'heavy', 'burden', 'overwhelm', 'struggle', 'stuck', 'impossible', 'hard chemistry', 'hard physics']);
    const anxietyScore = this.countMatches(cleanText, ['scared', 'fail', 'mock', 'fear', 'anxious', 'anxiety', 'worry', 'worried', 'nervous', 'heart racing', 'exam', 'marks', 'score', 'results']);
    const burnoutScore = this.countMatches(cleanText, ['tired', 'exhausted', 'burnout', 'burned out', 'give up', 'no energy', 'sleepy', 'fatigue', 'cannot focus', 'done with this']);
    const negativeScore = this.countMatches(cleanText, ['sad', 'bad', 'depressed', 'lonely', 'cry', 'crying', 'hate', 'annoyed', 'frustrated', 'worst']);
    const positiveScore = this.countMatches(cleanText, ['happy', 'good', 'great', 'solved', 'proud', 'confident', 'easy', 'cracked', 'nice', 'awesome', 'excited']);

    const scores = {
      positive: positiveScore,
      anxious: anxietyScore,
      stressed: stressScore,
      burned_out: burnoutScore,
      negative: negativeScore,
    };

    // Find the highest score
    let maxType: keyof typeof scores | 'neutral' = 'neutral';
    let maxVal = 0;

    Object.entries(scores).forEach(([type, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxType = type as keyof typeof scores;
      }
    });

    if (maxVal > 0) {
      sentiment = maxType as SentimentAnalysisResult['sentiment'];
    }

    // Assign detailed emotional labels
    if (sentiment === 'positive') {
      emotion = positiveScore > 2 ? 'Joy / Achievement' : 'Optimism';
    } else if (sentiment === 'anxious') {
      emotion = anxietyScore > 2 ? 'High Anxiety' : 'Apprehension';
    } else if (sentiment === 'stressed') {
      emotion = stressScore > 2 ? 'Overwhelmed' : 'Academic Stress';
    } else if (sentiment === 'burned_out') {
      emotion = burnoutScore > 2 ? 'Severe Burnout' : 'Mental Fatigue';
    } else if (sentiment === 'negative') {
      emotion = negativeScore > 2 ? 'Despair / Sadness' : 'Frustration';
    } else {
      emotion = 'Balanced / Reflective';
    }

    // 4. Generate AI Mentor Response
    const responsesList = MOCK_MENTOR_RESPONSES[sentiment];
    const randomIndex = Math.floor(Math.random() * responsesList.length);
    let aiResponse = responsesList[randomIndex];

    // Customize response slightly if triggers are detected
    if (triggers.includes('Family Pressure') && (sentiment === 'stressed' || sentiment === 'anxious' || sentiment === 'negative')) {
      aiResponse = "I notice you mentioned family or parental expectations. It's incredibly tough to balance your study with the weight of wanting to make them proud or fearing their reaction. Remember, your career is a long path and parents often project their own anxieties because they care, but they don't see the daily struggle. Try to focus on your personal daily progress. You are the one walking this path, and your emotional health comes first.";
    } else if (triggers.includes('Sleep Deprivation') && (sentiment === 'burned_out' || sentiment === 'stressed')) {
      aiResponse = "Your writing shows signs of fatigue linked to sleep issues. Sleep isn't just rest; it's when your brain consolidates what you studied during the day. Pulling all-nighters actually decreases your memory recall by up to 40%. Please close the books early tonight, turn off your screens, and aim for a solid 7-8 hours of sleep. Recovery is part of the work.";
    }

    return {
      sentiment,
      emotion,
      triggers,
      crisisFlag,
      aiResponse,
    };
  }

  private static countMatches(text: string, keywords: string[]): number {
    let count = 0;
    keywords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b|${word}`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        count += matches.length;
      }
    });
    return count;
  }
}
