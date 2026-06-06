'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles
} from 'lucide-react';
import { MindMateDB, DailyEntry, MoodType } from '../../utils/db';

const MOOD_COLORS: Record<MoodType, { bg: string; label: string; emoji: string }> = {
  excellent: { bg: 'bg-green-500/20 border-green-500/30 text-green-700', label: 'Excellent', emoji: '😊' },
  good: { bg: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-700', label: 'Good', emoji: '🙂' },
  okay: { bg: 'bg-slate-300/30 border-slate-300/40 text-slate-700', label: 'Okay', emoji: '😐' },
  sad: { bg: 'bg-blue-500/20 border-blue-500/30 text-blue-700', label: 'Sad', emoji: '😔' },
  stressed: { bg: 'bg-amber-500/20 border-amber-500/30 text-amber-700', label: 'Stressed', emoji: '😣' },
  burned_out: { bg: 'bg-red-500/20 border-red-500/30 text-red-700', label: 'Burned Out', emoji: '😫' },
};

export default function Analytics() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  
  // Averages states
  const [avgStress, setAvgStress] = useState(0);
  const [avgSleep, setAvgSleep] = useState(0);
  const [avgStudy, setAvgStudy] = useState(0);
  const [wellnessScore, setWellnessScore] = useState(80);
  const [riskTier, setRiskTier] = useState<'Low' | 'Moderate' | 'High' | 'Critical'>('Low');

  useEffect(() => {

    const loggedEntries = MindMateDB.getDailyEntries();
    setEntries(loggedEntries);

    if (loggedEntries.length > 0) {
      const totalEntries = loggedEntries.length;
      const stressSum = loggedEntries.reduce((sum, e) => sum + e.stress, 0);
      const sleepSum = loggedEntries.reduce((sum, e) => sum + e.sleep, 0);
      const studySum = loggedEntries.reduce((sum, e) => sum + e.studyHours, 0);

      const aStress = Math.round((stressSum / totalEntries) * 10) / 10;
      const aSleep = Math.round((sleepSum / totalEntries) * 10) / 10;
      const aStudy = Math.round((studySum / totalEntries) * 10) / 10;

      setAvgStress(aStress);
      setAvgSleep(aSleep);
      setAvgStudy(aStudy);

      // Risk level assessment
      if (aStress >= 7.5 || (aSleep < 5.5 && aStudy > 11)) {
        setRiskTier('Critical');
      } else if (aStress >= 5.5 || aSleep < 6.5) {
        setRiskTier('High');
      } else if (aStress >= 3.5) {
        setRiskTier('Moderate');
      } else {
        setRiskTier('Low');
      }

      // Mental wellness calculation (average of metrics)
      const lastEntries = loggedEntries.slice(-5);
      let totalW = 0;
      lastEntries.forEach(e => {
        const moodMap: Record<string, number> = { excellent: 100, good: 85, okay: 70, sad: 50, stressed: 40, burned_out: 25 };
        const m = moodMap[e.mood] || 70;
        const s = (10 - e.stress) * 10;
        const sl = e.sleep >= 7 && e.sleep <= 9 ? 100 : Math.max(0, 100 - Math.abs(8 - e.sleep) * 20);
        const st = e.studyHours >= 6 && e.studyHours <= 10 ? 100 : Math.max(0, 100 - Math.abs(8 - e.studyHours) * 12);
        totalW += (m + s + sl + st) / 4;
      });
      setWellnessScore(Math.round(totalW / lastEntries.length));
    }
  }, []);

  // AI behavioral triggers logic from local DB
  const detectedTriggers = MindMateDB.getDetectedTriggers();

  // Generate 30 days calendar array for Mood Heatmap
  const renderHeatmap = () => {
    const calendarBlocks = [];
    const now = Date.now();
    
    // Create grids for last 28 days
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateStr);
      
      calendarBlocks.push({
        dateStr,
        dayNum: d.getDate(),
        month: d.toLocaleDateString(undefined, { month: 'short' }),
        entry
      });
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {calendarBlocks.map((block, idx) => {
          const colorClass = block.entry 
            ? MOOD_COLORS[block.entry.mood].bg 
            : 'bg-slate-100 dark:bg-slate-900 border-slate-200/40 dark:border-slate-800 opacity-20';
          
          const title = block.entry 
            ? `${block.month} ${block.dayNum}: Mood was ${MOOD_COLORS[block.entry.mood].label}, Stress: ${block.entry.stress}/10`
            : `${block.month} ${block.dayNum}: No check-in`;

          return (
            <div
              key={idx}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative group cursor-default transition-all hover:scale-105 ${colorClass}`}
              title={title}
            >
              <span className="text-[10px] text-slate-400 font-semibold absolute top-1 left-1.5">{block.dayNum}</span>
              <span className="text-sm mt-1.5">{block.entry ? MOOD_COLORS[block.entry.mood].emoji : ''}</span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1.5 hidden group-hover:block w-32 bg-slate-900 dark:bg-slate-950 text-white text-[9px] p-1.5 rounded-lg text-center leading-normal shadow z-30 pointer-events-none">
                <p className="font-bold">{block.month} {block.dayNum}</p>
                {block.entry ? (
                  <>
                    <p className="text-indigo-400 mt-0.5">Mood: {MOOD_COLORS[block.entry.mood].label}</p>
                    <p className="text-amber-400">Stress: {block.entry.stress}/10</p>
                  </>
                ) : (
                  <p className="text-slate-400">Unlogged</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render SVG correlation bars (study, sleep, stress)
  const renderCorrelationBars = () => {
    const last7 = entries.slice(-7);
    if (last7.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-xs text-slate-400">
          Complete daily entries to view comparison graph.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3.5">
        {last7.map((e, idx) => {
          // Format date YYYY-MM-DD to "Mon, 6"
          const dateObj = new Date(e.date);
          const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
          const dayNum = dateObj.getDate();
          
          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-slate-400 font-semibold text-right shrink-0">{dayName} {dayNum}</span>
              
              <div className="flex-1 flex flex-col gap-1">
                {/* Study hours bar */}
                <div className="flex items-center gap-1.5">
                  <div className="w-8 text-[9px] text-slate-450 dark:text-slate-400 font-semibold shrink-0">Study:</div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(e.studyHours / 16) * 100}%` }}></div>
                  </div>
                  <span className="w-8 text-[9px] font-bold text-slate-500 text-right shrink-0">{e.studyHours}h</span>
                </div>

                {/* Sleep hours bar */}
                <div className="flex items-center gap-1.5">
                  <div className="w-8 text-[9px] text-slate-450 dark:text-slate-400 font-semibold shrink-0">Sleep:</div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-violet-500 h-full rounded-full" style={{ width: `${(e.sleep / 12) * 100}%` }}></div>
                  </div>
                  <span className="w-8 text-[9px] font-bold text-slate-500 text-right shrink-0">{e.sleep}h</span>
                </div>

                {/* Stress rating bar */}
                <div className="flex items-center gap-1.5">
                  <div className="w-8 text-[9px] text-slate-450 dark:text-slate-400 font-semibold shrink-0">Stress:</div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full ${e.stress >= 7 ? 'bg-red-500' : e.stress >= 5 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${(e.stress / 10) * 100}%` }}></div>
                  </div>
                  <span className="w-8 text-[9px] font-bold text-slate-500 text-right shrink-0">{e.stress}/10</span>
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
        <h1 className="text-2xl font-extrabold font-display text-slate-800 dark:text-white">AI Stress & Mood Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Cross-referencing study routines, sleep deficits, and emotional triggers to calculate your stress index.</p>
      </div>

      {/* Analytics Summary Score Panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Wellness Score Card */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Wellness Score</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold font-display text-indigo-500">{wellnessScore}%</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">Derived from mood logs, habits, and work-sleep limits.</p>
        </div>

        {/* Avg Stress */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Daily Stress</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold font-display ${avgStress >= 7 ? 'text-red-500' : avgStress >= 5 ? 'text-amber-500' : 'text-green-500'}`}>
              {avgStress}/10
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">Goal: Maintain below 5.0 throughout revision weeks.</p>
        </div>

        {/* Avg Study */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Study Hours</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold font-display text-violet-500">{avgStudy}h</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">Optimally between 6 to 9 hours to prevent fatigue.</p>
        </div>

        {/* Avg Sleep */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Sleep Hours</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold font-display ${avgSleep < 6.5 ? 'text-red-500' : 'text-green-500'}`}>
              {avgSleep}h
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">Recommended minimum: 7.0 hours for consolidation.</p>
        </div>

      </div>

      {/* Main Analytics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mood Heatmap */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">30-Day Mood Heatmap</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Logs over the last 4 weeks showing emotional trends.</p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {entries.length > 0 ? (
              renderHeatmap()
            ) : (
              <p className="text-xs text-slate-400 py-10">Check-in daily to view calendar blocks.</p>
            )}
          </div>

          {/* Legend */}
          <div className="h-[1px] bg-slate-100 dark:bg-slate-800/80"></div>
          <div className="flex flex-wrap gap-2 text-[8px] font-bold uppercase text-slate-400">
            <span className="flex items-center gap-1">😊 Excellent</span>
            <span className="flex items-center gap-1">🙂 Good</span>
            <span className="flex items-center gap-1">😐 Okay</span>
            <span className="flex items-center gap-1">😔 Sad</span>
            <span className="flex items-center gap-1">😣 Stressed</span>
            <span className="flex items-center gap-1">😫 Burned Out</span>
          </div>
        </div>

        {/* Correlation Bars Chart */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Daily Correlation Matrix</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Monitoring study loads against sleep and stress.</p>
          </div>
          
          <div className="flex-1">
            {renderCorrelationBars()}
          </div>
        </div>

        {/* Burnout Risk Card */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Burnout Risk Assessment</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Calculated risk of academic fatigue onset.</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            {/* HSL speed gauge */}
            <div className="w-28 h-28 rounded-full border-8 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative shadow-inner">
              {/* Colored ring slice representation */}
              <div className={`absolute inset-0 rounded-full border-8 border-transparent transition-all duration-500
                ${riskTier === 'Critical' ? 'border-t-red-500 border-r-red-500' : riskTier === 'High' ? 'border-t-amber-500 border-r-amber-500' : riskTier === 'Moderate' ? 'border-t-indigo-500' : 'border-t-green-500'}
              `}></div>
              
              <span className="text-2xl">
                {riskTier === 'Critical' ? '🚨' : riskTier === 'High' ? '⚠️' : riskTier === 'Moderate' ? '⏳' : '✅'}
              </span>
              <span className="font-display font-extrabold text-sm mt-1">{riskTier} Risk</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-3.5 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px]">
              {riskTier === 'Critical' && 'Syllabus strain is high and rest is critical. Take an immediate rest block.'}
              {riskTier === 'High' && 'High stress markers. Reduce evening screen logs and prioritize sleep.'}
              {riskTier === 'Moderate' && 'Active academic routine. Maintain study breaks and stay hydrated.'}
              {riskTier === 'Low' && 'Healthy lifestyle indicators. Your preparation pacing is optimal.'}
            </div>
          </div>
        </div>

      </div>

      {/* AI Behavioral Insights list */}
      <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI-Generated Behavioral Triggers</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detectedTriggers.length > 0 ? (
            detectedTriggers.map((t, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-850 rounded-xl flex items-start gap-3.5 group hover:border-indigo-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  {idx + 1}
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-extrabold text-slate-800 dark:text-white">{t.trigger}</p>
                  <p className="text-slate-400 mt-1 leading-relaxed">{t.correlation}</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correlation confidence:</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden max-w-[100px]">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${t.score}%` }}></div>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-500">{t.score}%</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
              Complete at least 5 daily check-ins with varied study levels to unlock correlation analysis.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
