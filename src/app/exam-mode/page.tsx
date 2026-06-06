'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles,
  Heart,
  TrendingUp,
  Smile
} from 'lucide-react';
import { MindMateDB, UserProfile } from '../../utils/db';

const MOCK_CHECKLIST = [
  { id: 'c1', text: 'Constructed a realistic daily revision timetable' },
  { id: 'c2', text: 'Set a strict 11 PM cutoff time (no late night cramming)' },
  { id: 'c3', text: 'Attempted at least 3 diagnostic mock tests' },
  { id: 'c4', text: 'Prepared a mistake journal to review formulas' },
  { id: 'c5', text: 'Identified a trusted friend or mentor to call during panic' },
  { id: 'c6', text: 'Learned the 5-4-3-2-1 grounding exercise for panic' }
];

export default function ExamMode() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // States
  const [targetExam, setTargetExam] = useState('JEE');
  const [confidence, setConfidence] = useState(6);
  const [revisionStress, setRevisionStress] = useState(5);
  
  // Checklist State
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  
  // Result Mode State
  const [resultPhase, setResultPhase] = useState<'before' | 'after'>('before');
  const [resultOutcome, setResultOutcome] = useState<'cleared' | 'failed' | null>(null);

  useEffect(() => {
    const prof = MindMateDB.getProfile();
    if (prof) {
      setProfile(prof);
      setTargetExam(prof.targetExam);
    }
    
    // Load checklist from LocalStorage
    const saved = localStorage.getItem('mindmate_exam_checklist');
    if (saved) {
      setCheckedIds(JSON.parse(saved));
    }
  }, []);

  const handleExamChange = (val: string) => {
    setTargetExam(val);
    if (profile) {
      const updated = { ...profile, targetExam: val };
      setProfile(updated);
      MindMateDB.saveProfile(updated);
    }
  };

  const handleChecklistToggle = (id: string) => {
    let updated: string[];
    if (checkedIds.includes(id)) {
      updated = checkedIds.filter((cid) => cid !== id);
    } else {
      updated = [...checkedIds, id];
    }
    setCheckedIds(updated);
    localStorage.setItem('mindmate_exam_checklist', JSON.stringify(updated));
    
    // Grant tiny XP for completed checklist
    if (profile && !checkedIds.includes(id)) {
      const updatedProfile = { ...profile, xp: profile.xp + 5 };
      setProfile(updatedProfile);
      MindMateDB.saveProfile(updatedProfile);
    }
  };

  const handleSaveStressConfidence = () => {
    // Saves values to today's daily entry if it exists
    const todayStr = new Date().toISOString().split('T')[0];
    const today = MindMateDB.getDailyEntry(todayStr);
    
    if (today) {
      today.confidence = confidence;
      today.stress = Math.max(today.stress, revisionStress);
      MindMateDB.saveDailyEntry(today);
      alert('Revision stats logged successfully! Checked-in wellness parameters updated.');
    } else {
      // Create partial entry
      MindMateDB.saveDailyEntry({
        date: todayStr,
        mood: 'okay',
        stress: revisionStress,
        sleep: 7,
        studyHours: 8,
        exercise: true,
        water: 2000,
        social: true,
        energy: 6,
        motivation: 6,
        confidence: confidence,
        screenTime: 3,
        selfRating: 6
      });
      alert('Stats saved. Since you hadn\'t checked in today, a default daily check-in has been initialized.');
    }
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-850 dark:text-white">Exam & Result Mode</h1>
          <p className="text-xs text-slate-400 mt-1">Special tools to buffer emotional pressure during countdown weeks and outcome releases.</p>
        </div>

        {/* Swapper dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target exam:</span>
          <select
            value={targetExam}
            onChange={(e) => handleExamChange(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="UPSC">UPSC</option>
            <option value="GATE">GATE</option>
            <option value="CAT">CAT</option>
            <option value="CUET">CUET</option>
            <option value="Boards">Boards</option>
          </select>
        </div>
      </div>

      {/* Main Grid blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Countdown + Stress meters */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Action Countdown card */}
          <div className="p-6 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl shadow-md flex flex-col items-center text-center gap-3 relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-150">Days Remaining</span>
            <h2 className="text-6xl font-extrabold font-display leading-none">
              {targetExam === 'JEE' ? 45 : targetExam === 'NEET' ? 35 : targetExam === 'UPSC' ? 112 : targetExam === 'GATE' ? 150 : targetExam === 'CAT' ? 90 : targetExam === 'CUET' ? 75 : 60}
            </h2>
            <p className="text-xs font-bold uppercase text-indigo-100">Countdown to {targetExam} exam</p>
            <div className="w-16 h-[2px] bg-white/20 mt-1"></div>
            <p className="text-[11px] text-indigo-200 max-w-[200px] leading-relaxed italic">
              "Focus on the immediate study block. Do not carry the weight of tomorrow."
            </p>
          </div>

          {/* Double revision slider */}
          <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Revision Parameters</h3>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Confidence Index</span>
                <span className="font-bold text-indigo-500">{confidence}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Revision Strain</span>
                <span className="font-bold text-indigo-500">{revisionStress}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={revisionStress}
                onChange={(e) => setRevisionStress(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <button
              onClick={handleSaveStressConfidence}
              className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs transition-all active:scale-[0.98]"
            >
              Log Parameters
            </button>
          </div>

        </div>

        {/* Middle column: Anxiety checklists */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Exam Anxiety Checklist</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Tick off items to prepare emotionally for mock and exam dates.</p>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {MOCK_CHECKLIST.map((c) => {
              const isChecked = checkedIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleChecklistToggle(c.id)}
                  className={`
                    p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all
                    ${isChecked 
                      ? 'border-indigo-500/35 bg-indigo-500/5 dark:bg-indigo-500/10 text-slate-800 dark:text-white' 
                      : 'border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }
                  `}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5
                    ${isChecked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'}
                  `}>
                    {isChecked ? '✓' : ''}
                  </span>
                  <span className="text-xs leading-tight font-medium">{c.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Result Mode panel */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
          
          {/* Double Tab Toggler */}
          <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 border border-slate-200/50 dark:border-slate-800/80 rounded-xl grid grid-cols-2 text-center text-xs font-bold select-none mb-1">
            <button
              onClick={() => setResultPhase('before')}
              className={`py-1.5 rounded-lg transition-all ${resultPhase === 'before' ? 'bg-white dark:bg-slate-850 text-indigo-500 shadow-sm' : 'text-slate-400'}`}
            >
              Anxiety Management
            </button>
            <button
              onClick={() => setResultPhase('after')}
              className={`py-1.5 rounded-lg transition-all ${resultPhase === 'after' ? 'bg-white dark:bg-slate-850 text-indigo-500 shadow-sm' : 'text-slate-400'}`}
            >
              Post Results
            </button>
          </div>

          {/* Tab 1 Content: Before Results */}
          {resultPhase === 'before' && (
            <div className="flex flex-col gap-4 text-xs animate-fadeIn leading-relaxed">
              <div className="p-3.5 bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/10 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-slate-500 dark:text-slate-350">
                  Waiting for result outputs causes high levels of panic. Rephrase your predictions: whatever the outcome, alternative paths are mapped.
                </span>
              </div>
              
              <div>
                <h4 className="font-bold font-display text-slate-800 dark:text-white mb-1.5">Action Plan:</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-450 dark:text-slate-400">
                  <li>Keep study-free rest slots (watch movies, step out).</li>
                  <li>Avoid exam-discussions on forums or topper videos.</li>
                  <li>If panic spikes, execute the 5-4-3-2-1 grounding exercise.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2 Content: After Results */}
          {resultPhase === 'after' && (
            <div className="flex flex-col gap-4 text-xs animate-fadeIn">
              
              {/* Outcome Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Choose Outcome:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResultOutcome('cleared')}
                    className={`py-2 px-3 border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all
                      ${resultOutcome === 'cleared' 
                        ? 'border-green-500 bg-green-500/5 dark:bg-green-500/10 text-green-700 dark:text-green-400' 
                        : 'border-slate-150 dark:border-slate-850 text-slate-550'
                      }
                    `}
                  >
                    🎉 Cleared
                  </button>
                  <button
                    onClick={() => setResultOutcome('failed')}
                    className={`py-2 px-3 border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all
                      ${resultOutcome === 'failed' 
                        ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                        : 'border-slate-150 dark:border-slate-850 text-slate-550'
                      }
                    `}
                  >
                    🕊️ Low Score
                  </button>
                </div>
              </div>

              {/* Cleared Outcome Content */}
              {resultOutcome === 'cleared' && (
                <div className="p-4 bg-green-500/5 dark:bg-green-950/20 border border-green-500/10 rounded-xl leading-relaxed animate-fadeIn">
                  <h4 className="font-bold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                    <span>🎉</span> Congratulations!
                  </h4>
                  <p className="text-slate-500 dark:text-slate-350 italic">
                    "Academic success is wonderful. Be sure to celebrate with your loved ones who stood by you. Stay humble, and remember: keep supporting your mental health as you enter the next stage. One success is just the beginning."
                  </p>
                </div>
              )}

              {/* Failed Outcome Content */}
              {resultOutcome === 'failed' && (
                <div className="p-4 bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/10 rounded-xl flex flex-col gap-3 animate-fadeIn">
                  <div>
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <span>🕊️</span> Recovery Plan
                    </h4>
                    <p className="text-slate-400 mt-0.5">Disappointments happen, but they are not endpoints.</p>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 dark:text-slate-405 leading-relaxed space-y-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2.5 rounded-lg">
                    <p><b>1. Let yourself feel:</b> Cry, write, vent. Don't bottle up frustration.</p>
                    <p><b>2. Sleep:</b> Your brain needs 8 hours of sleep today to recover from strain.</p>
                    <p><b>3. Plan alternatives:</b> There are always duplicate options (alternate fields, coaching, second attempts). Discuss with parents.</p>
                    <p><b>4. Focus on values:</b> You are worth more than an admissions sheet.</p>
                  </div>
                </div>
              )}

              {resultOutcome === null && (
                <p className="text-center text-slate-400 py-6 italic">Select an outcome option to review coping recommendations.</p>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
