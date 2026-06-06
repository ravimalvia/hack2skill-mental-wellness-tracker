'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Wind, 
  Play, 
  Pause, 
  RotateCcw
} from 'lucide-react';
import { MindMateDB, UserProfile, HabitLog } from '../../utils/db';

const HABITS_TYPES = [
  { id: 'sleep', name: '7+ Hours Sleep', icon: '😴', desc: 'Restores memory retention and focuses brain power' },
  { id: 'water', name: '2L Water Intake', icon: '💧', desc: 'Maintains physical cellular hydration & beats fatigue' },
  { id: 'breaks', name: 'Academic Study Breaks', icon: '🧘', desc: 'Short walks or stretches to break study posture' },
  { id: 'exercise', name: 'Physical Movement', icon: '🏃', desc: 'Triggers endorphins and decreases stress hormones' },
  { id: 'meditation', name: 'Mindfulness / Breathing', icon: '🍃', desc: 'Calms down overactive exam-related anxiety' },
];

export default function WellnessHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Pomodoro States
  const [pomoTime, setPomoTime] = useState(25 * 60); // 25 mins default
  const [pomoTotal, setPomoTotal] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'study' | 'break'>('study');
  const pomoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing States
  const [breatheState, setBreatheState] = useState<'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('idle');
  const [breatheTimer, setBreatheTimer] = useState(120); // 2 minutes session
  const [breatheCounter, setBreatheCounter] = useState(4); // 4 seconds per state
  const breatheIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const breatheSessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Habits log
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setProfile(MindMateDB.getProfile());
    setHabitLogs(MindMateDB.getHabitLogs(todayStr));
  }, []);

  // --- Pomodoro Code ---
  useEffect(() => {
    if (pomoRunning) {
      pomoTimerRef.current = setInterval(() => {
        setPomoTime((t) => {
          if (t <= 1) {
            clearInterval(pomoTimerRef.current!);
            setPomoRunning(false);
            alert(pomoMode === 'study' ? 'Study block complete! Take a well-deserved break.' : 'Break complete! Time to refocus.');
            
            // Grant XP for completed study block
            if (pomoMode === 'study' && profile) {
              const updated = { ...profile, xp: profile.xp + 20 };
              setProfile(updated);
              MindMateDB.saveProfile(updated);
            }
            
            // Reset timer
            const nextTime = pomoMode === 'study' ? 5 * 60 : 25 * 60;
            setPomoMode(pomoMode === 'study' ? 'break' : 'study');
            setPomoTotal(nextTime);
            return nextTime;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    }

    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, [pomoRunning, pomoMode, profile]);

  const handlePomoStart = () => setPomoRunning(true);
  const handlePomoPause = () => setPomoRunning(false);
  const handlePomoReset = () => {
    setPomoRunning(false);
    setPomoTime(pomoMode === 'study' ? 25 * 60 : 5 * 60);
    setPomoTotal(pomoMode === 'study' ? 25 * 60 : 5 * 60);
  };
  const setPomoDuration = (mins: number) => {
    setPomoRunning(false);
    setPomoTime(mins * 60);
    setPomoTotal(mins * 60);
  };

  const formatPomoTime = () => {
    const m = Math.floor(pomoTime / 60);
    const s = pomoTime % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Breathing Helpers ---
  const handleStartBreathing = () => {
    setBreatheState('inhale');
    setBreatheTimer(120); // 2 minutes
    setBreatheCounter(4);
  };

  const handleStopBreathing = (completed = false) => {
    if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
    if (breatheSessionIntervalRef.current) clearInterval(breatheSessionIntervalRef.current);
    setBreatheState('idle');

    if (completed && profile) {
      // Completed full session: reward XP & track achievement
      const updated = { ...profile, xp: profile.xp + 40 }; // 40 XP for breathing
      
      // Update local storage achievements list
      const data = localStorage.getItem('mindmate_local_db');
      if (data) {
        const db = JSON.parse(data);
        db.profile.xp = updated.xp;
        
        // Count how many sessions completed (stored in local counter)
        const sessions = Number(localStorage.getItem('mindmate_breathing_sessions') || '0') + 1;
        localStorage.setItem('mindmate_breathing_sessions', String(sessions));
        
        if (sessions >= 5 && !db.profile.achievements.includes('calm_champion')) {
          db.profile.achievements.push('calm_champion');
          db.profile.xp += 100;
          alert('Achievement Unlocked: Calm Champion! Unlocked for completing 5 deep breathing sessions.');
        }
        
        // Level up checks
        const targetLevel = Math.floor(db.profile.xp / 100) + 1;
        if (targetLevel > db.profile.level) {
          db.profile.level = targetLevel;
        }

        localStorage.setItem('mindmate_local_db', JSON.stringify(db));
        setProfile(db.profile);
      }
      alert('Well done! You have completed a 2-minute breathing session. 40 XP has been added to your profile.');
    }
  };

  const formatBreatheTime = () => {
    const m = Math.floor(breatheTimer / 60);
    const s = breatheTimer % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Breathing Code ---
  useEffect(() => {
    if (breatheState !== 'idle') {
      // Session timer
      breatheSessionIntervalRef.current = setInterval(() => {
        setBreatheTimer((t) => {
          if (t <= 1) {
            handleStopBreathing(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      // Loop for box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold
      breatheIntervalRef.current = setInterval(() => {
        setBreatheCounter((count) => {
          if (count <= 1) {
            // Transition state
            setBreatheState((current) => {
              switch (current) {
                case 'inhale': return 'hold-in';
                case 'hold-in': return 'exhale';
                case 'exhale': return 'hold-out';
                case 'hold-out': return 'inhale';
                default: return 'idle';
              }
            });
            return 4; // Reset state counter
          }
          return count - 1;
        });
      }, 1000);
    }

    return () => {
      if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
      if (breatheSessionIntervalRef.current) clearInterval(breatheSessionIntervalRef.current);
    };
  }, [breatheState]);

  // --- Habits toggles ---
  const handleHabitToggle = (id: string, name: string) => {
    const updatedLogs = MindMateDB.toggleHabit(id, name, todayStr);
    setHabitLogs(updatedLogs);
    
    // Refresh profile to update XP details
    setProfile(MindMateDB.getProfile());
  };

  if (!profile) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      
      {/* Left Columns: Breathing & Pomodoro */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Deep Breathing Card */}
        <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
              <Wind className="w-5 h-5 text-indigo-500" /> Square Breathing Visualizer
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Use the loop to settle your nervous system, reset mock anxiety, and lower stress markers.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-8 rounded-2xl flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            {breatheState === 'idle' ? (
              <div className="text-center flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-dashed border-indigo-500 flex items-center justify-center text-4xl text-indigo-500">
                  🧘
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Square Breathing Routine</h3>
                  <p className="text-[10px] text-slate-450 leading-relaxed max-w-[280px] mt-1">
                    Looping: Inhale (4s) ➜ Hold (4s) ➜ Exhale (4s) ➜ Hold (4s). Complete the 2-minute cycle to earn 40 XP.
                  </p>
                </div>
                <button
                  onClick={handleStartBreathing}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all"
                >
                  Start Session
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 z-10">
                {/* Visualizer Circle */}
                <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white relative transition-all duration-[4000ms]
                  ${breatheState === 'inhale' ? 'scale-125 bg-gradient-to-br from-indigo-500 to-indigo-600' : ''}
                  ${breatheState === 'hold-in' ? 'scale-125 bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg' : ''}
                  ${breatheState === 'exhale' ? 'scale-95 bg-gradient-to-br from-indigo-400 to-indigo-550' : ''}
                  ${breatheState === 'hold-out' ? 'scale-90 bg-slate-400 dark:bg-slate-800' : ''}
                `}>
                  <span className="text-sm font-extrabold uppercase tracking-widest font-display">
                    {breatheState === 'inhale' && 'Breathe In'}
                    {breatheState === 'hold-in' && 'Hold'}
                    {breatheState === 'exhale' && 'Breathe Out'}
                    {breatheState === 'hold-out' && 'Hold'}
                  </span>
                  <span className="text-2xl font-bold font-display mt-1">{breatheCounter}s</span>
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-450">Remaining time: {formatBreatheTime()}</p>
                  <button
                    onClick={() => handleStopBreathing(false)}
                    className="mt-3 text-[10px] font-bold text-red-500 underline"
                  >
                    Cancel Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pomodoro Timer Card */}
        <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Focus Pomodoro Timer
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Study intensely for 25-50 minutes, then take a short rest to reload mental synapses.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Timer Counter Circle */}
            <div className="w-36 h-36 rounded-full border-8 border-indigo-500/10 flex flex-col items-center justify-center relative shadow-inner">
              <div 
                className="absolute inset-0 rounded-full border-8 border-transparent border-t-indigo-600 transition-all duration-1000"
                style={{ transform: `rotate(${(pomoTime / pomoTotal) * 360}deg)` }}
              ></div>
              <span className="text-3xl font-extrabold font-display leading-none text-slate-850 dark:text-white">{formatPomoTime()}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5 capitalize">{pomoMode} Block</span>
            </div>

            {/* Controls */}
            <div className="flex-1 flex flex-col gap-3.5 w-full">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Set Duration:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 45, 50].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPomoDuration(m)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all
                        ${pomoTotal === m * 60 
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500 font-extrabold' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500'
                        }
                      `}
                    >
                      {m} Min
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                {pomoRunning ? (
                  <button
                    onClick={handlePomoPause}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Pause className="w-4 h-4" /> Pause Focus
                  </button>
                ) : (
                  <button
                    onClick={handlePomoStart}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Play className="w-4 h-4" /> Start Focus
                  </button>
                )}

                <button
                  onClick={handlePomoReset}
                  aria-label="Reset focus timer"
                  className="p-2.5 bg-slate-200 dark:bg-slate-850 hover:bg-slate-300 rounded-xl text-slate-600 dark:text-slate-350 transition-all border border-slate-250 dark:border-slate-800"
                  title="Reset timer"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Right Column: Habits Checklist */}
      <div className="lg:col-span-1 p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-850 dark:text-white">Daily Habit Builder</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Toggle health inputs daily. Maintain consistency to unlock locked achievements.</p>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {HABITS_TYPES.map((h) => {
            const isCompleted = habitLogs.some((hl) => hl.id === h.id);
            return (
              <button
                key={h.id}
                type="button"
                role="checkbox"
                aria-checked={isCompleted}
                onClick={() => handleHabitToggle(h.id, h.name)}
                className={`
                  p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all group
                  ${isCompleted 
                    ? 'border-green-500 bg-green-500/5 dark:bg-green-500/10 text-slate-800 dark:text-white' 
                    : 'border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                  }
                `}
              >
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center text-lg border border-slate-200/40 dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                  {h.icon}
                </div>
                
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold">{h.name}</span>
                    {isCompleted && <span className="text-[10px] font-bold text-green-500 flex items-center gap-0.5">✓ Done</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{h.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
