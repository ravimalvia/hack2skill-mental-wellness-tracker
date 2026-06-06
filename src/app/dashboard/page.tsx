'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Award,
  ChevronRight,
  CheckSquare
} from 'lucide-react';
import { MindMateDB, DailyEntry, UserProfile, ALL_BADGES } from '../../utils/db';
import { SentimentAnalyzer } from '../../utils/sentiment';
import DailyCheckin from '../../components/DailyCheckin';

// Mock exam countdown dates mapping
const EXAM_DATES: Record<string, number> = {
  'JEE': 45,
  'NEET': 35,
  'UPSC': 112,
  'GATE': 150,
  'CAT': 90,
  'CUET': 75,
  'Boards': 60
};

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Modals & States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | undefined>(undefined);
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([]);
  const [wellnessScore, setWellnessScore] = useState(80);
  
  // Quick Journal State
  const [quickJournalText, setQuickJournalText] = useState('');
  const [quickJournalResponse, setQuickJournalResponse] = useState<string | null>(null);
  const [quickJournalSentiment, setQuickJournalSentiment] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Load dashboard data
  const loadDashboardData = () => {
    const prof = MindMateDB.getProfile();
    setProfile(prof);

    const entries = MindMateDB.getDailyEntries();
    setRecentEntries(entries.slice(-7)); // Last 7 days

    const today = MindMateDB.getDailyEntry(todayStr);
    setTodayEntry(today);

    // Calculate wellness score
    const targetEntry = today || entries[entries.length - 1];
    if (targetEntry) {
      // Calculate individual metrics (0-100)
      const moodMap: Record<string, number> = { excellent: 100, good: 85, okay: 70, sad: 50, stressed: 40, burned_out: 25 };
      const moodScore = moodMap[targetEntry.mood] || 70;
      const stressScore = (10 - targetEntry.stress) * 10;
      const sleepScore = targetEntry.sleep >= 7 && targetEntry.sleep <= 9 ? 100 : Math.max(0, 100 - Math.abs(8 - targetEntry.sleep) * 20);
      const studyScore = targetEntry.studyHours >= 6 && targetEntry.studyHours <= 10 ? 100 : Math.max(0, 100 - Math.abs(8 - targetEntry.studyHours) * 12);
      const habitsScore = (targetEntry.exercise ? 50 : 0) + (targetEntry.social ? 50 : 0);
      
      const avg = Math.round((moodScore + stressScore + sleepScore + studyScore + habitsScore) / 5);
      setWellnessScore(avg);
    } else {
      setWellnessScore(80);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Check if query param includes checkin=true
    if (searchParams.get('checkin') === 'true') {
      setShowCheckin(true);
    }
  }, [searchParams]);

  // Handle saving daily check-in
  const handleCheckinClose = (updatedProfile?: UserProfile | null) => {
    setShowCheckin(false);
    loadDashboardData();
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
    // Clean query param
    router.replace('/dashboard');
  };

  // Submit quick journal
  const handleQuickJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickJournalText.trim()) return;

    // Run local sentiment analysis
    const analysis = SentimentAnalyzer.analyze(quickJournalText);
    
    // If self-harm / crisis flagged, dispatch event to layout to pop emergency support
    if (analysis.crisisFlag) {
      window.dispatchEvent(new Event('crisis-detected'));
      setQuickJournalText('');
      return;
    }

    // Add to DB
    MindMateDB.addJournal({
      content: quickJournalText.trim(),
      sentiment: analysis.sentiment,
      emotion: analysis.emotion,
      triggers: analysis.triggers,
      aiResponse: analysis.aiResponse,
      tags: analysis.triggers.length > 0 ? analysis.triggers : ['Quick Journal']
    });

    setQuickJournalSentiment(analysis.sentiment);
    setQuickJournalResponse(analysis.aiResponse);
    setQuickJournalText('');
    
    // Reload profile / stats (XP increases)
    loadDashboardData();
  };

  if (!profile) return null;

  // Mental Weather Forecast Prediction Logic
  const getMentalWeather = () => {
    const baseEntry = todayEntry || recentEntries[recentEntries.length - 1];
    if (!baseEntry) {
      return { 
        emoji: '🌤', 
        label: 'Calm Day', 
        desc: 'Academic workload is steady. Maintain your routine.', 
        color: 'text-green-500 bg-green-500/10 border-green-500/20',
        tips: ['Review formulas', 'Drink 2L water', 'Take a 15-min walk']
      };
    }

    if (baseEntry.sleep < 6 && baseEntry.studyHours > 10) {
      return {
        emoji: '⛈',
        label: 'Burnout Warning',
        desc: 'High study load + sleep deprivation increases risk of exhaustion.',
        color: 'text-red-500 bg-red-500/10 border-red-500/20',
        tips: ['Sleep before 11 PM', 'Reduce study goals by 20%', 'Do a breathing check-in']
      };
    } else if (baseEntry.stress >= 7) {
      return {
        emoji: '🌧',
        label: 'High Anxiety Risk',
        desc: 'Elevated stress logs. Watch out for mock test performance pressure.',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        tips: ['Practice 5-min Box Breathing', 'Discuss pressure with a friend', 'Take a 10-minute walk']
      };
    } else if (baseEntry.studyHours >= 9 || baseEntry.sleep <= 6.5) {
      return {
        emoji: '⛅',
        label: 'Moderate Strain',
        desc: 'Moderate workload. Watch your screens and stretch between blocks.',
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        tips: ['Pomodoro breaks (50m/10m)', 'Shut down screens early', 'Stretch your neck and back']
      };
    } else {
      return {
        emoji: '🌤',
        label: 'Calm Day Ahead',
        desc: 'Good balance of study and sleep. Wellness index is stable.',
        color: 'text-green-500 bg-green-500/10 border-green-500/20',
        tips: ['Keep up current pace', 'Log a gratitude journal', 'Maintain 8 cups hydration']
      };
    }
  };

  const weather = getMentalWeather();

  // Daily task based on mood/stress
  const getDailyTask = () => {
    if (!todayEntry) return 'Log today\'s Mood and Stress levels to set your goal.';
    if (todayEntry.stress >= 7) return 'Complete a 5-minute deep breathing session in the Wellness Hub.';
    if (todayEntry.mood === 'sad' || todayEntry.mood === 'burned_out') return 'Write down your stress triggers in the AI Journal.';
    if (todayEntry.sleep < 6.5) return 'Shut down all screens by 10:30 PM and sleep at least 7.5 hours.';
    return 'Complete today\'s study targets with a 50-10 Pomodoro block.';
  };

  const dailyTask = getDailyTask();

  // Custom SVG Area Chart Data calculations
  const renderSVGChart = () => {
    if (recentEntries.length === 0) return null;
    
    const width = 500;
    const height = 150;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Map entries to wellness scores
    const scores = recentEntries.map(e => {
      const moodMap: Record<string, number> = { excellent: 10, good: 8, okay: 6, sad: 4, stressed: 3, burned_out: 2 };
      const moodScore = moodMap[e.mood] || 6;
      const stressScore = 10 - e.stress;
      return Math.round((moodScore + stressScore + e.sleep + (e.exercise ? 8 : 4)) / 4 * 10);
    });

    const maxScore = 100;
    const minScore = 0;

    const points = scores.map((score, index) => {
      const x = padding + (index / (scores.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight;
      return { x, y, score, date: recentEntries[index].date.slice(-5) };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.00" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3" className="dark:stroke-slate-800" />
        <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3" className="dark:stroke-slate-800" />
        <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="#E2E8F0" strokeWidth="0.5" className="dark:stroke-slate-800" />

        {/* Gradient fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Chart Line */}
        <path d={linePath} fill="none" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points and Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2.5" />
            <text x={p.x} y={height - 2} fill="#94A3B8" fontSize="8" textAnchor="middle" className="font-semibold">{p.date}</text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Daily Onboarding/Log callout widget */}
      {!todayEntry ? (
        <div className="p-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 rounded-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-indigo-500/10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl shadow-inner">
              📝
            </div>
            <div>
              <h3 className="font-bold font-display text-lg">Log Today's Mental Weather</h3>
              <p className="text-xs text-indigo-100 leading-relaxed mt-0.5 max-w-md">
                Tracking your mood, sleep, and study habits daily unlocks trigger analytics, weather forecasts, and streak rewards.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCheckin(true)}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-indigo-600 font-bold rounded-xl text-xs tracking-wide shadow-md transition-all active:scale-[0.98] shrink-0"
          >
            Check-in Now
          </button>
        </div>
      ) : (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-950/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-green-800 dark:text-green-300">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div className="text-xs">
              <span className="font-bold">Daily Check-in Complete!</span> Logged mood as <b className="capitalize">{todayEntry.mood.replace('_', ' ')}</b> and stress score as <b>{todayEntry.stress}/10</b>. Keep up the consistency.
            </div>
          </div>
          <button
            onClick={() => setShowCheckin(true)}
            className="text-xs font-bold underline hover:text-green-600 dark:hover:text-green-400"
          >
            Update Entry
          </button>
        </div>
      )}

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Wellness Score Card */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex items-center gap-4 group">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-full flex items-center justify-center font-display font-extrabold text-lg shadow-inner group-hover:scale-105 transition-transform">
            {wellnessScore}%
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wellness Index</p>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
              {wellnessScore >= 80 ? 'Optimal resilience' : wellnessScore >= 60 ? 'Moderate balance' : 'Rest recommended'}
            </h4>
          </div>
        </div>

        {/* Stress score */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex items-center gap-4 group">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-extrabold text-lg shadow-inner group-hover:scale-105 transition-transform
            ${todayEntry && todayEntry.stress >= 7 
              ? 'bg-red-50 dark:bg-red-950/30 text-red-500' 
              : todayEntry && todayEntry.stress >= 5 
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500' 
                : 'bg-green-50 dark:bg-green-950/30 text-green-500'
            }
          `}>
            {todayEntry ? `${todayEntry.stress}/10` : '--'}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stress Score</p>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
              {todayEntry ? (todayEntry.stress >= 8 ? 'Critical strain' : todayEntry.stress >= 5 ? 'Elevated levels' : 'Calm / Steady') : 'No logs logged'}
            </h4>
          </div>
        </div>

        {/* Study hours */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex items-center gap-4 group">
          <div className="w-14 h-14 bg-violet-50 dark:bg-violet-950/40 text-violet-500 rounded-full flex items-center justify-center font-display font-extrabold text-lg shadow-inner group-hover:scale-105 transition-transform">
            {todayEntry ? `${todayEntry.studyHours}h` : '--'}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Study Load</p>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
              {todayEntry ? (todayEntry.studyHours > 10 ? 'Overwork warning' : 'Balanced targets') : 'No logs logged'}
            </h4>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex items-center gap-4 group">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-extrabold text-lg shadow-inner group-hover:scale-105 transition-transform
            ${todayEntry && todayEntry.sleep < 6 
              ? 'bg-red-50 dark:bg-red-950/30 text-red-500' 
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500'
            }
          `}>
            {todayEntry ? `${todayEntry.sleep}h` : '--'}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sleep Hours</p>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
              {todayEntry ? (todayEntry.sleep < 6 ? 'Sleep deprived' : 'Healthy repair') : 'No logs logged'}
            </h4>
          </div>
        </div>

      </div>

      {/* Grid Layout Core widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column widgets: Weather & Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Mental Weather Forecast Widget */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Predictive System</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">Tomorrow's Mental Weather</h3>
              </div>
              <div className={`px-3.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${weather.color}`}>
                <span>{weather.emoji}</span>
                <span>{weather.label}</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{weather.desc}</p>
            
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800"></div>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actionable Recommendations</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {weather.tips.map((tip, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300">
                    💡 {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SVG Weekly Summary Chart */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Historical Analysis</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">Weekly Wellness Curve</h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Past 7 logs</span>
            </div>
            
            <div className="h-[150px] w-full flex items-center justify-center">
              {recentEntries.length > 0 ? (
                renderSVGChart()
              ) : (
                <p className="text-xs text-slate-400">Complete 3 daily check-ins to build details.</p>
              )}
            </div>
          </div>

          {/* Inline Quick Journal */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Venting Space</span>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">Quick Emotional Journal</h3>
            </div>

            <form onSubmit={handleQuickJournalSubmit} className="flex flex-col gap-3">
              <textarea
                id="quick-journal-textarea"
                aria-label="Quick Emotional Journal Entry"
                placeholder="How was study today? Vent freely here... (e.g. 'Struggled with physical chemistry mock problems, feeling lost...')"
                value={quickJournalText}
                onChange={(e) => setQuickJournalText(e.target.value)}
                className="w-full h-20 p-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Text analysis scans for triggers & anxiety levels.</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow active:scale-95 transition-all"
                >
                  Analyze & Save
                </button>
              </div>
            </form>

            {/* Quick Journal Response Panel */}
            {quickJournalResponse && (
              <div className="p-4 bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/10 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-indigo-500">MindMate AI Mentor reply</span>
                  <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-500 rounded-full uppercase tracking-wider">
                    {quickJournalSentiment}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed italic">
                  "{quickJournalResponse}"
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column widgets: Targets, Tasks, Gamification */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Exam Countdown Widget */}
          <div className="p-5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl shadow-md flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-150">Countdown Target</span>
              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur rounded-full text-[10px] font-bold">Active</span>
            </div>
            
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-extrabold font-display">{EXAM_DATES[profile.targetExam] || 45}</span>
              <span className="text-sm font-semibold text-indigo-200">Days</span>
            </div>

            <p className="text-xs text-indigo-100 leading-normal">
              Days remaining till your <b className="text-white">{profile.targetExam}</b> examination target. Stay grounded and consistent.
            </p>

            <div className="h-[1px] bg-white/10 mt-1"></div>

            <button 
              onClick={() => router.push('/exam-mode')}
              className="text-xs font-bold text-white flex items-center justify-between hover:translate-x-1 transition-transform group"
            >
              <span>Access Exam Stress checklists</span>
              <ChevronRight className="w-4 h-4 group-hover:scale-110" />
            </button>
          </div>

          {/* Today's Wellness task */}
          <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> Today's Wellness Task
            </span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-3 rounded-xl">
              🎯 {dailyTask}
            </h4>
            <button
              onClick={() => {
                if (dailyTask.includes('breathing')) router.push('/wellness');
                else if (dailyTask.includes('Journal')) router.push('/journal');
                else setShowCheckin(true);
              }}
              className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-[10px] transition-all tracking-wider uppercase mt-1"
            >
              Go to Task
            </button>
          </div>

          {/* Gamified Achievements Badge list */}
          <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Award className="w-4 h-4 text-indigo-500" /> Unlocked Badges
              </h3>
              <span className="text-[10px] font-bold text-indigo-500">{profile.achievements.length}/{ALL_BADGES.length}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {ALL_BADGES.map((b) => {
                const isUnlocked = profile.achievements.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`
                      aspect-square rounded-xl flex items-center justify-center text-xl relative group border cursor-default
                      ${isUnlocked 
                        ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20 text-slate-800' 
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-100 dark:border-slate-850 opacity-30'
                      }
                    `}
                    title={`${b.name}: ${b.description}`}
                  >
                    <span>{b.icon}</span>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block w-36 bg-slate-900 dark:bg-slate-950 text-white text-[9px] p-2 rounded-lg text-center leading-normal shadow z-30 pointer-events-none">
                      <p className="font-bold">{b.name}</p>
                      <p className="text-slate-400 mt-0.5">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-slate-400 text-center">Completing check-ins and journals rewards XP to level up!</p>
          </div>

        </div>

      </div>

      {/* Daily Check-in Modal overlay */}
      {showCheckin && <DailyCheckin onClose={handleCheckinClose} />}

    </div>
  );
}
