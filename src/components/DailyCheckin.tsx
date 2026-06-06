'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { MindMateDB, DailyEntry, MoodType, UserProfile } from '../utils/db';

interface DailyCheckinProps {
  onClose: (updatedProfile?: UserProfile | null) => void;
}

const MOODS: { type: MoodType; emoji: string; label: string; desc: string }[] = [
  { type: 'excellent', emoji: '😊', label: 'Excellent', desc: 'Feeling energetic, productive, and balanced' },
  { type: 'good', emoji: '🙂', label: 'Good', desc: 'Positive state, steady study focus' },
  { type: 'okay', emoji: '😐', label: 'Okay', desc: 'Neutral, getting through tasks, quiet energy' },
  { type: 'sad', emoji: '😔', label: 'Sad', desc: 'Low mood, struggling to find motivation' },
  { type: 'stressed', emoji: '😣', label: 'Stressed', desc: 'Overwhelmed by mock tests or syllabus size' },
  { type: 'burned_out', emoji: '😫', label: 'Burned Out', desc: 'Severe exhaust, dreading study, need recovery' },
];

export default function DailyCheckin({ onClose }: DailyCheckinProps) {
  const [step, setStep] = useState(1);
  const dateStr = new Date().toISOString().split('T')[0];

  // Form states
  const [mood, setMood] = useState<MoodType>('good');
  const [stress, setStress] = useState(4);
  const [sleep, setSleep] = useState(7);
  const [studyHours, setStudyHours] = useState(8);
  const [exercise, setExercise] = useState(true);
  const [water, setWater] = useState(2000); // in ml
  const [social, setSocial] = useState(true);
  const [energy, setEnergy] = useState(7);
  const [motivation, setMotivation] = useState(7);
  const [confidence, setConfidence] = useState(7);
  const [screenTime, setScreenTime] = useState(3);
  const [selfRating, setSelfRating] = useState(7);

  // Load existing entry if completed today
  useEffect(() => {
    const existing = MindMateDB.getDailyEntry(dateStr);
    if (existing) {
      setMood(existing.mood);
      setStress(existing.stress);
      setSleep(existing.sleep);
      setStudyHours(existing.studyHours);
      setExercise(existing.exercise);
      setWater(existing.water);
      setSocial(existing.social);
      setEnergy(existing.energy);
      setMotivation(existing.motivation);
      setConfidence(existing.confidence);
      setScreenTime(existing.screenTime || 3);
      setSelfRating(existing.selfRating || 7);
    }
  }, [dateStr]);

  const handleSave = () => {
    const entry: DailyEntry = {
      date: dateStr,
      mood,
      stress,
      sleep,
      studyHours,
      exercise,
      water,
      social,
      energy,
      motivation,
      confidence,
      screenTime,
      selfRating,
    };

    const updatedProfile = MindMateDB.saveDailyEntry(entry);
    
    // Check for high-stress crisis alert triggers
    if (stress >= 8) {
      // Dispatches a state check helper if stress is critical
      alert('Your stress is logged as high today. We suggest you try our guided 5-minute breathing exercise in the Wellness Hub or chat with our Coach to unwind.');
    }

    onClose(updatedProfile);
  };

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-scaleIn flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> Daily Wellness Check-in
            </h3>
            <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
          <button 
            onClick={() => onClose()}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Section {step} of 3</span>
            <span>{step === 1 ? 'Emotional State' : step === 2 ? 'Academic Logs' : 'Habits & Self Rating'}</span>
          </div>
          <div className="w-full bg-slate-150 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Modal Form Scrollable Viewport */}
        <div className="p-6 overflow-y-auto max-h-[60vh] flex-1 flex flex-col gap-6">
          
          {/* STEP 1: Emotion & Energy States */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              
              {/* Mood emojis grid */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">How are you feeling today?</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {MOODS.map((m) => (
                    <button
                      key={m.type}
                      type="button"
                      aria-pressed={mood === m.type}
                      onClick={() => setMood(m.type)}
                      className={`
                        p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center group
                        ${mood === m.type 
                          ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }
                      `}
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{m.emoji}</span>
                      <span className={`text-[10px] font-bold ${mood === m.type ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-400'}`}>{m.label}</span>
                    </button>
                  ))}
                </div>
                {/* Mood Description box */}
                <p className="text-[11px] text-slate-400 leading-normal italic mt-1 text-center bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                  {MOODS.find(m => m.type === mood)?.desc}
                </p>
              </div>

              {/* Stress Slider */}
              <div className="flex flex-col gap-2">
                <label htmlFor="checkin-stress-range" className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                  <span>Stress Level</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${stress > 7 ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' : stress > 4 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400'}`}>
                    {stress}/10 — {stress > 7 ? 'Severe Risk' : stress > 4 ? 'Moderate Stress' : 'Relaxed'}
                  </span>
                </label>
                <input
                  id="checkin-stress-range"
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={(e) => setStress(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 - Completely Calm</span>
                  <span>5 - Normal Strain</span>
                  <span>10 - Extreme Burnout</span>
                </div>
              </div>

              {/* Motivation & Energy Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="checkin-energy-range" className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                    <span>Energy Level</span>
                    <span className="font-bold text-indigo-500">{energy}/10</span>
                  </label>
                  <input
                    id="checkin-energy-range"
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value))}
                    className="w-full h-2 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="checkin-motivation-range" className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                    <span>Motivation</span>
                    <span className="font-bold text-indigo-500">{motivation}/10</span>
                  </label>
                  <input
                    id="checkin-motivation-range"
                    type="range"
                    min="1"
                    max="10"
                    value={motivation}
                    onChange={(e) => setMotivation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Academic Logs */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              
              {/* Study hours slider */}
              <div className="flex flex-col gap-2">
                <label htmlFor="checkin-study-range" className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                  <span>Daily Study Hours</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${studyHours > 10 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-indigo-500/10 text-indigo-500'}`}>
                    {studyHours} Hours
                  </span>
                </label>
                <input
                  id="checkin-study-range"
                  type="range"
                  min="0"
                  max="16"
                  step="0.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 hrs (Rest Day)</span>
                  <span>8 hrs (Ideal)</span>
                  <span>16 hrs (Warning Zone)</span>
                </div>
              </div>

              {/* Sleep hours slider */}
              <div className="flex flex-col gap-2">
                <label htmlFor="checkin-sleep-range" className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                  <span>Sleep Duration</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${sleep < 6 ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400'}`}>
                    {sleep} Hours
                  </span>
                </label>
                <input
                  id="checkin-sleep-range"
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={sleep}
                  onChange={(e) => setSleep(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 hrs (No sleep)</span>
                  <span>7.5 hrs (Recommended)</span>
                  <span>12 hrs</span>
                </div>
              </div>

              {/* Digital screen time slider */}
              <div className="flex flex-col gap-2">
                <label htmlFor="checkin-screen-range" className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                  <span>Digital Screen Time (Non-Study)</span>
                  <span className="font-bold text-indigo-500">{screenTime} Hours</span>
                </label>
                <input
                  id="checkin-screen-range"
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={screenTime}
                  onChange={(e) => setScreenTime(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 hrs</span>
                  <span>3 hrs (Average)</span>
                  <span>12+ hrs</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: Habits & Self Ratings */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              
              {/* Checkboxes grid */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={exercise}
                  onClick={() => setExercise(!exercise)}
                  className={`
                    p-4 rounded-xl border flex flex-col items-start gap-1 text-left transition-all
                    ${exercise 
                      ? 'border-green-500 bg-green-500/5 dark:bg-green-500/10 text-green-700 dark:text-green-400' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                    }
                  `}
                >
                  <span className="text-lg">🏃</span>
                  <span className="text-xs font-bold mt-1">Exercise / Movement</span>
                  <span className="text-[10px] text-slate-400">Walked, ran, stretched, or worked out</span>
                </button>

                <button
                  type="button"
                  role="checkbox"
                  aria-checked={social}
                  onClick={() => setSocial(!social)}
                  className={`
                    p-4 rounded-xl border flex flex-col items-start gap-1 text-left transition-all
                    ${social 
                      ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                    }
                  `}
                >
                  <span className="text-lg">💬</span>
                  <span className="text-xs font-bold mt-1">Social Interaction</span>
                  <span className="text-[10px] text-slate-400">Spoke to a friend, classmate, or family</span>
                </button>
              </div>

              {/* Water intake slider */}
              <div className="flex flex-col gap-2">
                <label htmlFor="checkin-water-range" className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                  <span>Water Intake</span>
                  <span className="font-bold text-indigo-500">{(water / 1000).toFixed(1)} Liters ({Math.round(water / 250)} Cups)</span>
                </label>
                <input
                  id="checkin-water-range"
                  type="range"
                  min="0"
                  max="4000"
                  step="250"
                  value={water}
                  onChange={(e) => setWater(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Confidence & Self Rating sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="checkin-confidence-range" className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                    <span>Preparation Confidence</span>
                    <span className="font-bold text-indigo-500">{confidence}/10</span>
                  </label>
                  <input
                    id="checkin-confidence-range"
                    type="range"
                    min="1"
                    max="10"
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full h-2 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="checkin-rating-range" className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                    <span>Overall Self Rating</span>
                    <span className="font-bold text-indigo-500">{selfRating}/10</span>
                  </label>
                  <input
                    id="checkin-rating-range"
                    type="range"
                    min="1"
                    max="10"
                    value={selfRating}
                    onChange={(e) => setSelfRating(Number(e.target.value))}
                    className="w-full h-2 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Wizard Controls Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0c1018] border-t border-slate-100 dark:border-slate-800 flex justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={prevStep}
            className={`
              px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all border
              ${step === 1 
                ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400' 
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all shadow-sm"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all shadow-md shadow-green-600/10 hover:shadow-green-600/20 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Daily Entry
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
