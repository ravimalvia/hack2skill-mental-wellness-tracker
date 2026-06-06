'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  Info,
  Clock,
  RotateCcw
} from 'lucide-react';
import { MindMateDB, UserProfile } from '../../utils/db';
import { sendMessageToCoach, ChatMessage } from '../../utils/ai-coach';

const QUICK_PROMPTS = [
  { label: "I'm scared I will fail", text: "I'm feeling so anxious that I might fail my exam. The syllabus is huge and I don't feel ready." },
  { label: "My mock score was low", text: "I worked so hard but scored poorly in my mock test today. I feel like my efforts are useless." },
  { label: "Can't concentrate", text: "I have been trying to study physics for hours but I can't concentrate. My focus is completely gone." },
  { label: "Parent expectations", text: "My parents expect me to get a top rank, and the pressure is making it impossible to study." },
  { label: "Feeling exhausted", text: "I feel completely exhausted, sleepy, and burned out. Should I study or sleep?" }
];

export default function Coach() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Load chat history & profile
  useEffect(() => {
    setProfile(MindMateDB.getProfile());
    
    // Load initial greeting
    setMessages([
      {
        role: 'assistant',
        content: `Hello there. I am MindMate, your senior mentor. I'm here to listen, share practical study advice, and help you keep your well-being in check. 

Competitive preparation is a massive emotional test. You can talk to me about exam anxiety, concentration blocks, sleep fatigue, or pressure from home.

How are you holding up today? What has been on your mind?`
      }
    ]);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Scan for crisis keywords manually in page to sync popups
    const hasCrisis = [
      'life is over',
      'want to disappear',
      'want to die',
      'cant do this anymore',
      'cannot do this anymore',
      'kill myself',
      'suicide'
    ].some(kw => textToSend.toLowerCase().includes(kw));

    if (hasCrisis) {
      window.dispatchEvent(new Event('crisis-detected'));
    }

    try {
      const historyForAPI = messages.slice(1); // Exclude initial greeting
      const reply = await sendMessageToCoach(historyForAPI, textToSend, profile);
      
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I apologize, my systems took a bit long to respond. Take a deep breath. Try to shrink your timeline and focus on one simple step today." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([
        {
          role: 'assistant',
          content: `Chat history reset. How can I support your studies and emotional resilience today?`
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] animate-fadeIn">
      
      {/* Top Disclaimer Banner */}
      <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 rounded-2xl text-[10px] text-indigo-755 dark:text-indigo-300 flex items-start gap-2 mb-4">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b>Disclaimer:</b> I am an AI supportive companion and mentor. I can help with study balance, routines, and exams anxiety. I do not provide psychiatric diagnoses or replace clinical mental health therapy.
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧘</span>
            <div>
              <h3 className="text-xs font-extrabold text-slate-850 dark:text-white leading-none">MindMate Wellness Coach</h3>
              <span className="text-[9px] text-slate-400">Offline Senior Mentor Personality Active</span>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-slate-800 transition-all flex items-center gap-1 text-[10px] font-bold"
            title="Reset Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {/* Chat Thread messages window */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={index} 
                className={`flex ${isUser ? 'justify-end animate-slideInRight' : 'justify-start animate-slideInLeft'}`}
              >
                <div 
                  className={`
                    max-w-md px-4 py-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm border
                    ${isUser 
                      ? 'bg-indigo-600 border-indigo-700 text-white rounded-br-none' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-850 text-slate-700 dark:text-slate-250 rounded-bl-none'
                    }
                  `}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            );
          })}
          
          {/* Typing visualizer indicator */}
          {isTyping && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 text-slate-400 text-xs px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                <span className="text-[10px] ml-1 font-semibold">Mentor is writing...</span>
              </div>
            </div>
          )}
          
          <div ref={threadEndRef} />
        </div>

        {/* Bottom Input & Quick Prompts Panel */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col gap-3">
          
          {/* Quick prompt chips (displayed when chat is empty or fresh) */}
          {messages.length <= 2 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Common Student Struggles:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(p.text)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 border border-slate-200/60 dark:border-slate-800 text-[10px] font-semibold rounded-xl text-slate-600 dark:text-slate-350 transition-all hover:border-indigo-500/20 active:scale-95"
                  >
                    💬 {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }} 
            className="flex items-center gap-2"
          >
            <input
              type="text"
              required
              disabled={isTyping}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about your stress or study routine..."
              className="flex-1 px-4 py-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`
                p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center shrink-0
                ${(!inputValue.trim() || isTyping) ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
              `}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
