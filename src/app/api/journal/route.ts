import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are an expert student counselor and emotional journal analyzer for MindMate.
Your task is to analyze the student's daily journal entry.
Identify:
1. Sentiment: strictly one of "positive", "neutral", "negative", "anxious", "stressed", "burned_out".
2. Emotion: a 1-3 word specific emotional description (e.g., "Overwhelmed", "Quiet Focus", "Result Panic", "Deep Fatigue", "Frustration", "Joy").
3. Triggers: a subset of these specific categories if mentioned in the text: ["Mock Exam Performance", "Sleep Deprivation", "Family Pressure", "Digital Distraction", "Academic Workload", "Peer Comparison"].
4. AI Response: A warm, empathetic, practical response from a supportive senior mentor. Keep it concise (1-2 short paragraphs), constructive, and grounded.

Your response MUST be a valid JSON object matching this schema:
{
  "sentiment": "positive" | "neutral" | "negative" | "anxious" | "stressed" | "burned_out",
  "emotion": "string",
  "triggers": ["string"],
  "aiResponse": "string"
}
Output ONLY the raw JSON string. Do not include markdown code block formatting (such as \`\`\`json).
`;

export async function POST(request: Request) {
  try {
    const { userMessage, examName, customGeminiKey, customOpenaiKey } = await request.json();

    // 1. Validate parameter types and presence
    if (typeof userMessage !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid payload structure' }, { status: 400 });
    }

    // 2. Enforce strict input truncation
    const sanitizedMsg = userMessage.slice(0, 5000);
    const sanitizedExam = typeof examName === 'string' ? examName.slice(0, 50) : 'your exams';

    // 3. Prioritize user custom keys, fall back to secure server-side environment variables
    const geminiKey = customGeminiKey || process.env.GEMINI_API_KEY || '';
    const openaiKey = customOpenaiKey || process.env.OPENAI_API_KEY || '';

    // --- Gemini Call Handler ---
    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${SYSTEM_PROMPT}\nStudent Profile target exam: ${sanitizedExam}.\nAnalyze this journal entry:\n"${sanitizedMsg}"` }],
                }
              ],
              generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
              },
            }),
          }
        );

        const resJson = await response.json();
        const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          return NextResponse.json({
            success: true,
            sentiment: parsed.sentiment || 'neutral',
            emotion: parsed.emotion || 'Balanced / Reflective',
            triggers: Array.isArray(parsed.triggers) ? parsed.triggers : [],
            aiResponse: parsed.aiResponse || ''
          });
        }
      } catch (err) {
        console.error('Gemini Journal API Handler exception:', err);
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
              { role: 'system', content: SYSTEM_PROMPT + `\nStudent Profile target exam: ${sanitizedExam}.` },
              { role: 'user', content: sanitizedMsg },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        const resJson = await response.json();
        const text = resJson?.choices?.[0]?.message?.content;
        if (text) {
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          return NextResponse.json({
            success: true,
            sentiment: parsed.sentiment || 'neutral',
            emotion: parsed.emotion || 'Balanced / Reflective',
            triggers: Array.isArray(parsed.triggers) ? parsed.triggers : [],
            aiResponse: parsed.aiResponse || ''
          });
        }
      } catch (err) {
        console.error('OpenAI Journal API Handler exception:', err);
      }
    }

    return NextResponse.json({ success: false, error: 'No API configuration active or call failed' });
  } catch (err) {
    console.error('General route handler exception:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
