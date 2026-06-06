// AI Wellness Coach personality engine for Manas
import { MindMateDB, UserProfile } from './db';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}



// Local fallback responses for offline/keyless mode
const MOCK_COACH_RULES = [
  {
    keywords: ['fail', 'scared', 'lose', 'marks', 'exam', 'boards', 'score', 'rank'],
    response: `I understand that fear. When you are preparing for an exam like {EXAM}, it feels like your entire future is on the line. It's completely normal to feel scared of failing.

Here are a few things to keep in mind:
• **A test is just a measurement of a specific day's output**, not a measurement of your potential.
• **Shrink your horizon.** When you think about the exam date, you panic. Instead, ask yourself: *"What can I study in the next 45 minutes?"* Just focus on that single block.
• **Action kills anxiety.** When you feel paralyzed by fear, open your book and solve just one simple problem. Action builds momentum.

Would you like to try a 5-minute breathing exercise right now to settle your heart rate?`
  },
  {
    keywords: ['focus', 'concentrate', 'distract', 'phone', 'instagram', 'screen', 'attention', 'procrastin'],
    response: `Concentration isn't a superpower; it's just a habit. When your mind is cluttered with screen time or syllabus anxiety, focus becomes impossible.

Try this simple 'Reset' method:
1. **Clear your desk.** Keep only the book you are studying and a sheet of rough paper. Put your phone in another room.
2. **Use the Pomodoro technique.** Set a timer for 25 minutes. Study with 100% effort, knowing a break is coming.
3. **Use the 'Brain Dump' sheet.** When an anxious thought or distraction pops up, write it down on the rough paper to look at later, and return to studying.
4. **Take a 5-minute physical break.** Stand up, stretch, or drink water.

Let's commit to one 25-minute study block. You can do this.`
  },
  {
    keywords: ['parents', 'family', 'father', 'mother', 'mom', 'dad', 'expectations', 'disappoint'],
    response: `Carrying parental expectations is a very heavy burden. You want to make them proud, and the fear of letting them down can feel paralyzing.

Remember:
• **Their anxiety comes from care, even if it feels like pressure.** Often, parents don't know how to show support other than asking about marks.
• **You are the one walking the path.** Your worth as a person is not tied to their reactions to your mock scores.
• **Focus on your inputs.** You cannot control how they react, but you can control your effort, your sleep, and your self-compassion.

If it feels safe, try having a calm conversation with them during a relaxed moment. Tell them: *"I am working hard, but the pressure is making it difficult. I need your encouragement right now."*`
  },
  {
    keywords: ['tired', 'exhausted', 'sleep', 'sleepy', 'burnout', 'insomnia', 'night', 'fatigue'],
    response: `It sounds like your battery is running on empty. In competitive prep, students often sacrifice sleep to study more. But did you know a sleep-deprived brain retains 40% less information?

Let's try a small reset:
• **Establish a hard shutdown time.** Stop studying by 10:30 PM. No screens after 10:45 PM.
• **Sleep is active recovery.** Do not view sleep as a waste of time. It's when your brain solidifies the facts you studied.
• **Take a walk.** A 15-minute walk in natural light helps reset your circadian rhythm.

If you are feeling burned out right now, close your books. Go drink a large glass of water, step away, and let yourself rest for the next 2 hours. You cannot build a structure on a cracked foundation.`
  },
  {
    keywords: ['hello', 'hi', 'hey', 'who are you', 'help'],
    response: `Hello! I am Manas, your senior mentor. I'm here to listen, help you manage exam stress, and give you practical tools to stay healthy and focused. 

Preparing for exams like {EXAM} can get incredibly lonely and stressful. You can talk to me about:
• Exam anxiety and fear of failure
• Concentration and time management
• Managing parent or coaching institute pressure
• Building better sleep, water, and exercise habits

How are you feeling today? What's on your mind?`
  }
];

export async function sendMessageToCoach(
  history: ChatMessage[],
  userMessage: string,
  profile: UserProfile | null
): Promise<string> {
  const cleanMsg = userMessage.toLowerCase().trim();
  const keys = MindMateDB.getApiKeys();
  const geminiKey = keys.gemini || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  const openaiKey = keys.openai || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  const examName = profile?.targetExam || 'your exams';

  // 1. Check for extreme safety keywords in user message
  const hasCrisis = [
    'life is over',
    'want to disappear',
    'want to die',
    'cant do this anymore',
    'cannot do this anymore',
    'kill myself',
    'suicide'
  ].some(kw => cleanMsg.includes(kw));

  if (hasCrisis) {
    return `Please hear me: your life and well-being are worth infinitely more than any exam score, mock test, or college admission. 

You are going through an incredibly difficult period, and you do not have to carry this alone. Please take a deep breath and let's get you some support:
• **Reach out to a trusted loved one or friend immediately.** Tell them how heavy things are.
• **Contact a professional counselor or crisis line.** (You can find emergency contact numbers in the Emergency Support button in the sidebar).
• **Please take a break from studies.** Your safety is the only thing that matters right now.

I am here to support you, but please reach out to someone who can help you in person.`;
  }

  // 2. Call secure server-side API proxy route
  if (geminiKey || openaiKey) {
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history,
          userMessage: userMessage,
          examName,
          customGeminiKey: keys.gemini,
          customOpenaiKey: keys.openai
        })
      });
      const data = await response.json();
      if (data.success && data.text) {
        return data.text;
      }
    } catch (err) {
      console.error('Server-side AI Route Error, falling back to local model', err);
    }
  }

  // 4. Fallback to Local Rule-Based Chat
  for (const rule of MOCK_COACH_RULES) {
    const matched = rule.keywords.some((kw) => cleanMsg.includes(kw));
    if (matched) {
      return rule.response.replace('{EXAM}', examName);
    }
  }

  // Generic calm response
  return `I hear you. Preparing for ${examName} comes with a lot of unseen emotional fatigue. What you're experiencing is something thousands of students feel, but that doesn't make it any less challenging.

To help you get through this block:
• Can you describe specifically what's stressing you out? (Is it a particular subject, a test score, or just general exhaustion?)
• Have you taken a break or had water in the last 2 hours?
• If you need to step away, let me know, and we can do a quick breathing exercise.

I'm here to listen. Tell me more.`;
}
