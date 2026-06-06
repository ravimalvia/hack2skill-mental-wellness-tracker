'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Heart, 
  EyeOff,
  Sparkles
} from 'lucide-react';
import { MindMateDB, DailyEntry, UserProfile } from '../../utils/db';

export default function Dashboards() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'parent' | 'teacher'>('parent');
  
  // Stats
  const [avgStress, setAvgStress] = useState(4.2);
  const [avgSleep, setAvgSleep] = useState(7.1);
  const [wellnessScore, setWellnessScore] = useState(78);

  useEffect(() => {
    setProfile(MindMateDB.getProfile());
    const logged = MindMateDB.getDailyEntries();
    setEntries(logged);

    if (logged.length > 0) {
      const stressSum = logged.reduce((sum, e) => sum + e.stress, 0);
      const sleepSum = logged.reduce((sum, e) => sum + e.sleep, 0);
      setAvgStress(Math.round((stressSum / logged.length) * 10) / 10);
      setAvgSleep(Math.round((sleepSum / logged.length) * 10) / 10);

      // Wellness Score calculation
      const lastEntries = logged.slice(-5);
      let totalW = 0;
      lastEntries.forEach(e => {
        const moodMap: Record<string, number> = { excellent: 100, good: 85, okay: 70, sad: 50, stressed: 40, burned_out: 25 };
        const m = moodMap[e.mood] || 70;
        const s = (10 - e.stress) * 10;
        const sl = e.sleep >= 7 && e.sleep <= 9 ? 100 : Math.max(0, 100 - Math.abs(8 - e.sleep) * 20);
        totalW += (m + s + sl) / 3;
      });
      setWellnessScore(Math.round(totalW / lastEntries.length));
    }
  }, []);

  if (!profile) return null;

  // Render parent chart (weekly stress and sleep indicators)
  const renderParentChart = () => {
    const last7 = entries.slice(-7);
    if (last7.length === 0) return <p className="text-center text-xs text-slate-400 py-6">No historical metrics logged yet.</p>;

    return (
      <div className="flex flex-col gap-3.5">
        {last7.map((e, idx) => {
          const dateObj = new Date(e.date);
          const formattedDate = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
          
          return (
            <div key={idx} className="flex items-center gap-4 text-xs font-medium">
              <span className="w-16 text-slate-400 font-semibold text-right">{formattedDate}</span>
              <div className="flex-1 flex flex-col gap-1">
                {/* Sleep Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[9px] text-slate-400">Sleep:</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(e.sleep / 12) * 100}%` }}></div>
                  </div>
                  <span className="w-6 text-[9px] font-bold text-slate-500 text-right">{e.sleep}h</span>
                </div>
                {/* Stress Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[9px] text-slate-400">Stress:</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${e.stress >= 7 ? 'bg-red-500' : e.stress >= 5 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${(e.stress / 10) * 100}%` }}></div>
                  </div>
                  <span className="w-6 text-[9px] font-bold text-slate-500 text-right">{e.stress}/10</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-display text-slate-850 dark:text-white">Simulated Support Portals</h1>
        <p className="text-xs text-slate-400 mt-1">Simulated metrics sharing dashboards for schools and parents, emphasizing user confidentiality first.</p>
      </div>

      {/* Primary tab swapper */}
      <div 
        role="tablist"
        aria-label="Simulated Portal Selector"
        className="bg-white dark:bg-[#121824] p-1.5 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex gap-2 w-full max-w-md self-center md:self-start"
      >
        <button
          role="tab"
          id="parent-portal-tab"
          aria-selected={activeTab === 'parent'}
          aria-controls="parent-portal-panel"
          onClick={() => setActiveTab('parent')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all
            ${activeTab === 'parent' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-850'}
          `}
        >
          <ShieldCheck className="w-4 h-4" /> Parent Dashboard
        </button>
        
        <button
          role="tab"
          id="teacher-portal-tab"
          aria-selected={activeTab === 'teacher'}
          aria-controls="teacher-portal-panel"
          onClick={() => setActiveTab('teacher')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all
            ${activeTab === 'teacher' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-850'}
          `}
        >
          <Users className="w-4 h-4" /> Teacher Dashboard
        </button>
      </div>

      {/* PARENT DASHBOARD PORTAL */}
      {activeTab === 'parent' && (
        <div 
          id="parent-portal-panel"
          role="tabpanel"
          aria-labelledby="parent-portal-tab"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn"
        >
          
          {/* Main parent analytics column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Privacy disclaimer */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/35 rounded-2xl flex items-start gap-3 text-xs leading-relaxed text-indigo-755 dark:text-indigo-300">
              <EyeOff className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Privacy Shield Activated:</span> Student journal entries and explicit emotion keywords are completely hidden to create a safe writing environment. Parents can only view general routine averages and stress levels.
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Wellness Index</span>
                <span className="text-2xl font-extrabold font-display text-indigo-500">{wellnessScore}%</span>
                <span className="text-[9px] text-slate-400 mt-1">Overall balance score</span>
              </div>
              <div className="p-4 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Avg Stress Score</span>
                <span className="text-2xl font-extrabold font-display text-amber-500">{avgStress}/10</span>
                <span className="text-[9px] text-slate-400 mt-1">Pacing level: {avgStress >= 6 ? 'High' : 'Moderate'}</span>
              </div>
              <div className="p-4 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Avg Sleep Hours</span>
                <span className="text-2xl font-extrabold font-display text-indigo-500">{avgSleep}h</span>
                <span className="text-[9px] text-slate-400 mt-1">Goal: 7.0h+ to beat exhaustion</span>
              </div>
            </div>

            {/* Parent weekly logs */}
            <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-850 dark:text-white">Weekly Pacing Trends</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Summary of sleep hours and stress indices for the past week.</p>
              </div>

              {renderParentChart()}
            </div>

          </div>

          {/* Right column: Advice for parents */}
          <div className="lg:col-span-1 p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1">
                <Heart className="w-4.5 h-4.5 text-indigo-500" /> Parenting Stress Buffer Tips
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Recommendations to support your child preparing for {profile.targetExam}.</p>
            </div>

            <div className="flex flex-col gap-3.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                <p className="font-extrabold text-slate-700 dark:text-slate-200">❌ Avoid Score Comparisons</p>
                <p className="mt-1 text-[10px]">Comparing mock results with toppers or classmates triggers test anxiety. Celebrate daily effort instead.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                <p className="font-extrabold text-slate-700 dark:text-slate-200">🌙 Support the 11 PM Shutdown</p>
                <p className="mt-1 text-[10px]">Encourage your child to stop studying by 10:30 PM. Memory consolidate happens during restful REM sleep cycles.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                <p className="font-extrabold text-slate-700 dark:text-slate-200">🗣️ Listen Without Judging</p>
                <p className="mt-1 text-[10px]">If they express fear of failure, rephrase: "It is normal to feel nervous. Your value is not defined by one exam."</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TEACHER DASHBOARD PORTAL */}
      {activeTab === 'teacher' && (
        <div 
          id="teacher-portal-panel"
          role="tabpanel"
          aria-labelledby="teacher-portal-tab"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn"
        >
          
          {/* Main classroom statistics */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Classroom description */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/35 rounded-2xl flex items-start gap-3 text-xs leading-relaxed text-indigo-755 dark:text-indigo-300">
              <Users className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Anonymous aggregate insights:</span> Displays aggregate classroom statistics for Class 12 Batch-B (45 students). Individual journals, names, and logs are completely scrubbed for student safety.
              </div>
            </div>

            {/* Class Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Class Stress Average</span>
                <span className="text-2xl font-extrabold font-display text-amber-500">6.2/10</span>
                <span className="text-[9px] text-slate-400 mt-1">Status: Elevated mock strain</span>
              </div>
              <div className="p-4 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Class Sleep Average</span>
                <span className="text-2xl font-extrabold font-display text-red-550">5.9 Hours</span>
                <span className="text-[9px] text-slate-400 mt-1">Status: Deficit detected</span>
              </div>
              <div className="p-4 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Burnout Percentage</span>
                <span className="text-2xl font-extrabold font-display text-red-500">38%</span>
                <span className="text-[9px] text-slate-400 mt-1">Status: 17 students at fatigue risk</span>
              </div>
            </div>

            {/* Anonymous Class mood distribution */}
            <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-850 dark:text-white">Classroom Mood Distribution</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Aggregate breakdown of mood shares reported by students this week.</p>
              </div>

              {/* Progress bars representing mood shares */}
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Good / Excellent</span>
                    <span>32% (14 students)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Okay / Reflective</span>
                    <span>30% (13 students)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Anxious / Stressed</span>
                    <span>25% (11 students)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Burned Out / Sad</span>
                    <span>13% (6 students)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '13%' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right column: Recommendations for teachers */}
          <div className="lg:col-span-1 p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-500" /> School Pacing Interventions
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Recommendations for administration to lower classroom fatigue.</p>
            </div>

            <div className="flex flex-col gap-3.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                <p className="font-extrabold text-slate-700 dark:text-slate-200">📅 Clear Mock Exam Days</p>
                <p className="mt-1 text-[10px]">Avoid scheduling high-weight assignments or homework deadlines on dates immediately adjacent to mock exams.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                <p className="font-extrabold text-slate-700 dark:text-slate-200">🧘 Test-Prep Breathing slot</p>
                <p className="mt-1 text-[10px]">Incorporate 3 minutes of quiet square breathing before mock question papers are handed out to lower initial heart rates.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                <p className="font-extrabold text-slate-700 dark:text-slate-200">🚫 Stop Public Mark Sheets</p>
                <p className="mt-1 text-[10px]">Posting score lists publicly on boards triggers peer competition and shame. Share results individually instead.</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
