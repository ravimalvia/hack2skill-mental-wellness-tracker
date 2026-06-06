'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Brain, 
  Activity, 
  BookOpen, 
  MessageSquare, 
  LineChart, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Heart
} from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is my journal text private?",
      a: "Yes, completely. MindMate values your privacy above all else. Your daily journal entries, check-in data, and mental analytics are stored directly inside your browser's local storage. No data is sent to external servers unless you choose to configure your own private API keys."
    },
    {
      q: "How does the AI Wellness Coach work?",
      a: "The coach operates on two levels. By default, it uses a localized rule-based sentiment engine configured with a supportive, 'calm senior mentor' personality. If you enter your own OpenAI or Gemini API keys in the settings page, the app safely calls those models directly on the client, giving you deeper LLM-based feedback."
    },
    {
      q: "What is the 'Mental Weather Forecast'?",
      a: "It's a unique predictive feature. MindMate analyzes your logged sleep, study hours, and mood trends over the past week to forecast tomorrow's likely stress risk (e.g., 🌤 Calm Day, ⛅ Moderate Stress, 🌧 High Anxiety). It then gives you actionable recommendations like sleeping earlier or doing a breathing exercise."
    },
    {
      q: "Does this app replace professional mental health therapy?",
      a: "No. MindMate is a peer-like supportive companion designed to help manage daily academic stress, burnout, and habits. It does not diagnose mental conditions or offer medical treatments. If you are experiencing severe distress, please use the red 'Emergency Support' panel to connect with certified professional hotlines."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
      
      {/* Background ambient light gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 dark:purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">🧠</span>
          <span className="font-bold text-2xl font-display tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            MindMate
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 flex items-center gap-1.5"
          >
            Start Journey <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Supportive AI Wellness Companion for Students</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold font-display leading-[1.15] tracking-tight text-slate-800 dark:text-white max-w-4xl">
          Your Mental Health Matters <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
            More Than Your Marks.
          </span>
        </h1>
        
        <p className="mt-6 text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Preparing for competitive exams like JEE, NEET, UPSC, GATE, or Board Exams is a massive emotional marathon. MindMate helps you track moods, predict burnout, identify triggers, and cope with exam anxiety.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:translate-y-[-2px] active:translate-y-0 text-center flex items-center justify-center gap-2"
          >
            <span>Begin Free Journey</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-800 transition-all text-center"
          >
            Explore Features
          </a>
        </div>

        {/* Dashboard Preview mockup panel */}
        <div className="mt-16 w-full max-w-4xl glass-panel p-3.5 rounded-2xl border border-white/40 dark:border-white/5 shadow-2xl relative">
          <div className="bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden aspect-video border border-slate-200/40 dark:border-slate-900 flex flex-col">
            {/* Simulated app header */}
            <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200/50 dark:border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                <span className="ml-2 font-display text-slate-500 dark:text-slate-300">MindMate Student Dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-0.5">🔥 5 Day Streak</span>
                <span className="flex items-center gap-0.5 text-indigo-500">🎯 NEET Prep</span>
              </div>
            </div>
            
            {/* Mock Dashboard content */}
            <div className="flex-1 p-6 grid grid-cols-3 gap-4 text-left overflow-hidden select-none">
              
              {/* Left Column widget */}
              <div className="col-span-2 flex flex-col gap-4">
                <div className="p-4 bg-white dark:bg-[#121824] rounded-xl border border-slate-200/40 dark:border-slate-800/80 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Today's Wellness Weather</span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-bold">🌤 Calm Day</span>
                  </div>
                  <p className="text-lg font-extrabold font-display dark:text-white">Mental Sky is Clear</p>
                  <p className="text-xs text-slate-400 leading-normal">Mock scores are stable and sleep is average. Take a 15-minute screen break after this physics session.</p>
                </div>

                <div className="p-4 bg-white dark:bg-[#121824] rounded-xl border border-slate-200/40 dark:border-slate-800/80 shadow-sm flex-1 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Weekly Analytics Trends</span>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-850 flex items-end justify-between p-4 gap-2">
                    <div className="w-full bg-indigo-400/30 h-1/2 rounded-t"></div>
                    <div className="w-full bg-indigo-400/40 h-2/3 rounded-t"></div>
                    <div className="w-full bg-indigo-400/60 h-3/4 rounded-t"></div>
                    <div className="w-full bg-indigo-500 h-1/3 rounded-t"></div>
                    <div className="w-full bg-indigo-400 h-4/5 rounded-t"></div>
                  </div>
                </div>
              </div>

              {/* Right Column widgets */}
              <div className="col-span-1 flex flex-col gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl shadow-md flex flex-col gap-2 justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">AI Wellness Coach</span>
                  <p className="text-xs italic font-medium leading-relaxed">"You sleep less on the nights before mock exams. Try setting a hard shutdown time at 11 PM."</p>
                  <span className="text-[10px] font-bold text-right text-indigo-200">— MindMate Mentor</span>
                </div>
                
                <div className="p-4 bg-white dark:bg-[#121824] rounded-xl border border-slate-200/40 dark:border-slate-800/80 shadow-sm flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Daily Check-in</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['😊', '🙂', '😐'].map((emoji, index) => (
                      <div key={index} className="py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-lg flex items-center justify-center text-sm">
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Features Grid Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-200/50 dark:border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold font-display text-slate-800 dark:text-white">
            Comprehensive Support Built for Students
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm md:text-base">
            No clinical jargon or toxic positivity. Just practical, evidence-based coping tools to help you navigate mock prep, family expectations, and result anxiety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md transition-all group hover:translate-y-[-4px]">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-850 dark:text-white">Mood & Stress Tracking</h3>
            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Log your mood, sleep, study hours, and exercise in seconds. MindMate calculates your daily Stress and Wellness scores to find your health threshold.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md transition-all group hover:translate-y-[-4px]">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-850 dark:text-white">AI Emotional Journal</h3>
            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Write freely about study roadblocks, mock exams, or family friction. The system runs sentiment analysis to highlight emotional triggers and tag trends.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md transition-all group hover:translate-y-[-4px]">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-850 dark:text-white">AI Wellness Coach</h3>
            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Chat in real-time with an empathetic chatbot modeled as a calm senior mentor. Get advice on test fear, screen addiction, and concentration blocks.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md transition-all group hover:translate-y-[-4px]">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-850 dark:text-white">Burnout Prediction</h3>
            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              The AI highlights correlations like *"Physics sessions increase stress"* or *"Poor sleep correlates with 40% higher anxiety"* so you can pivot.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md transition-all group hover:translate-y-[-4px]">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-850 dark:text-white">Guided Breathing & Habits</h3>
            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete wellness tasks: 5-minute visually guided square breathing circles, customizable study Pomodoro blocks, hydration checklists, and streak levels.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md transition-all group hover:translate-y-[-4px]">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-850 dark:text-white">100% Student Privacy First</h3>
            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              All logs are saved browser-locally. Even the simulated Parent & Teacher dashboards are aggregate-only, meaning your private text remains private.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-100/50 dark:bg-slate-900/30 py-20 relative z-10 border-t border-b border-slate-200/40 dark:border-slate-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-display text-slate-800 dark:text-white">
              Student-Tested Coping Stories
            </h2>
            <p className="mt-2 text-xs md:text-sm text-slate-400">
              Thousands of students experience the pressure. Here is what survivors say about maintaining sanity during preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-white dark:bg-[#121824] rounded-2xl border border-slate-200/30 dark:border-slate-850 shadow-sm leading-relaxed">
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm italic">
                "During my NEET preparation, mock score anxiety was paralyzing. I would study 12 hours straight but score poorly due to panic. Using MindMate's breathing tool before entering mock tests and using the AI Journal to vent helped me reframe mock exams as diagnostic diagnostics, not final judgment."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Anjali S.</h4>
                  <p className="text-[10px] text-slate-400">NEET Aspirant (Score: 645/720)</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-[#121824] rounded-2xl border border-slate-200/30 dark:border-slate-850 shadow-sm leading-relaxed">
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm italic">
                "I was studying till 3 AM for JEE Mains, skipping exercise, and drinking energy drinks. I hit severe burnout 2 months before the test. The Mental Weather Forecast predicted high anxiety and suggested a strict 11 PM cutoff. Setting that boundary literally saved my exam performance."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-bold text-xs">
                  V
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Vikram K.</h4>
                  <p className="text-[10px] text-slate-400">JEE IIT-Delhi Class of 2029</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display text-slate-800 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-xs md:text-sm text-slate-400 mt-2">Everything you need to know about the tracker.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-850 rounded-xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all"
              >
                <span className="font-bold text-sm md:text-base font-display">{faq.q}</span>
                {activeFaq === i ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              
              {activeFaq === i && (
                <div className="px-5 pb-5 pt-1 text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-900">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0c1018] border-t border-slate-200/50 dark:border-slate-900 py-12 relative z-10 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="font-bold font-display text-slate-600 dark:text-slate-300">MindMate</span>
          </div>
          <p className="max-w-md leading-relaxed">
            Designed to reassure and support students through academic stress. Keep study consistent, sleep healthy, and celebrate your persistence.
          </p>
          <div className="flex items-center gap-1.5 text-indigo-500 font-semibold mt-2">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
            <span>for students worldwide</span>
          </div>
          <div className="h-[1px] w-32 bg-slate-100 dark:bg-slate-800/80 my-2"></div>
          <p className="text-[10px] text-slate-500">&copy; {new Date().getFullYear()} MindMate. All Rights Reserved. Saved Locally.</p>
        </div>
      </footer>

    </div>
  );
}
