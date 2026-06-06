import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are Manas, a calm, wise, and empathetic senior academic mentor for students preparing for competitive exams (NEET, JEE, UPSC, GATE, etc.) and board exams. 
Your tone is grounding, practical, non-judgmental, and supportive. You sound like a caring older sibling or a calm mentor who has been through these exact struggles.
- NEVER sound overly cheerful, fake, or robotic.
- NEVER diagnose mental or physical illnesses. 
- If a student expresses extreme academic stress, help them break their tasks down, recommend breathing exercises or the Pomodoro technique.
- If a student expresses thoughts of self-harm or deep despair, provide comforting words, state clearly that you care about their safety, and urge them to connect with professionals or their trusted loved ones.
- Give practical suggestions (e.g. sleep schedules, breaks, physical activity).
Keep responses concise, warm, and highly structured (use short paragraphs or bullet points).
`;

export async function POST(request: Request) {
  try {
    const { history, userMessage, examName, customGeminiKey, customOpenaiKey } = await request.json();

    // 1. Validate parameter types and presence
    if (typeof userMessage !== 'string' || !Array.isArray(history)) {
      return NextResponse.json({ success: false, error: 'Invalid payload structure' }, { status: 400 });
    }

    // 2. Enforce strict input truncation (Mitigate Denial of Service / buffer strains)
    const sanitizedMsg = userMessage.slice(0, 5000);
    const sanitizedExam = typeof examName === 'string' ? examName.slice(0, 50) : 'your exams';

    // 3. Prioritize user custom keys, fall back to secure server-side environment variables
    const geminiKey = customGeminiKey || process.env.GEMINI_API_KEY || '';
    const openaiKey = customOpenaiKey || process.env.OPENAI_API_KEY || '';

    // --- Gemini Call Handler ---
    if (geminiKey) {
      try {
        const formattedHistory = history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(msg.content).slice(0, 5000) }],
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `System context: ${SYSTEM_PROMPT}\nStudent Profile: Prep Target is ${sanitizedExam}.\n\nHello, mentor.` }],
                },
                {
                  role: 'model',
                  parts: [{ text: `Understood. I will act as a calm, wise senior mentor. I will support the student preparing for ${sanitizedExam}. How can I support you today?` }],
                },
                ...formattedHistory,
                {
                  role: 'user',
                  parts: [{ text: sanitizedMsg }],
                },
              ],
              generationConfig: {
                maxOutputTokens: 350,
                temperature: 0.7,
              },
            }),
          }
        );

        const resJson = await response.json();
        const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ success: true, text: text.trim() });
        }
      } catch (err) {
        console.error('Gemini API Handler exception:', err);
      }
    }

    // --- OpenAI Call Handler ---
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT + `\nStudent profile: Target is ${sanitizedExam}.` },
              ...history.map((m: any) => ({ role: String(m.role).slice(0, 20), content: String(m.content).slice(0, 5000) })),
              { role: 'user', content: sanitizedMsg },
            ],
            max_tokens: 350,
            temperature: 0.7,
          }),
        });

        const resJson = await response.json();
        const text = resJson?.choices?.[0]?.message?.content;
        if (text) {
          return NextResponse.json({ success: true, text: text.trim() });
        }
      } catch (err) {
        console.error('OpenAI API Handler exception:', err);
      }
    }

    return NextResponse.json({ success: false, error: 'No API configuration active or call failed' });
  } catch (err) {
    console.error('General route handler exception:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
