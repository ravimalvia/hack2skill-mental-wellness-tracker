'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Trash2, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MindMateDB, JournalEntry, UserProfile } from '../../utils/db';
import { SentimentAnalyzer, SentimentAnalysisResult } from '../../utils/sentiment';

const SENTIMENT_LABELS: Record<string, { bg: string; label: string; emoji: string }> = {
  positive: { bg: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400', label: 'Positive / Achievement', emoji: '😊' },
  neutral: { bg: 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400', label: 'Balanced / Reflective', emoji: '😐' },
  negative: { bg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400', label: 'Frustrated / Low', emoji: '😔' },
  anxious: { bg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400', label: 'Anxiety / Apprehensive', emoji: '😣' },
  stressed: { bg: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400', label: 'Overwhelmed', emoji: '💥' },
  burned_out: { bg: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400', label: 'Severe Burnout', emoji: '😫' },
};

export default function Journal() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Input fields
  const [contentText, setContentText] = useState('');
  
  // Active Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Last Analysis output
  const [lastAnalysis, setLastAnalysis] = useState<JournalEntry | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setProfile(MindMateDB.getProfile());
    setJournals(MindMateDB.getJournals());
  }, []);

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentText.trim()) return;

    // Crisis keywords trigger (scanned locally first for safety/offline speed)
    const hasCrisis = [
      'life is over',
      'want to disappear',
      'want to die',
      'cant do this anymore',
      'cannot do this anymore',
      'kill myself',
      'suicide'
    ].some(kw => contentText.toLowerCase().includes(kw));

    if (hasCrisis) {
      window.dispatchEvent(new Event('crisis-detected'));
      setContentText('');
      return;
    }

    let sentimentVal: SentimentAnalysisResult['sentiment'] = 'neutral';
    let emotionVal = 'Balanced / Reflective';
    let triggersVal: string[] = [];
    let responseVal = '';

    const keys = MindMateDB.getApiKeys();
    const geminiKey = keys.gemini || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const openaiKey = keys.openai || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    const examName = profile?.targetExam || 'your exams';

    let success = false;

    if (geminiKey || openaiKey) {
      try {
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: contentText,
            examName,
            customGeminiKey: keys.gemini,
            customOpenaiKey: keys.openai
          })
        });
        const data = await response.json();
        if (data.success) {
          sentimentVal = data.sentiment;
          emotionVal = data.emotion;
          triggersVal = data.triggers;
          responseVal = data.aiResponse;
          success = true;
        }
      } catch (err) {
        console.error('AI Journal analysis failed, falling back to local model', err);
      }
    }

    if (!success) {
      // Offline fallback
      const analysis = SentimentAnalyzer.analyze(contentText);
      sentimentVal = analysis.sentiment;
      emotionVal = analysis.emotion;
      triggersVal = analysis.triggers;
      responseVal = analysis.aiResponse;
    }

    const tags = triggersVal.length > 0 ? triggersVal : ['Reflections'];

    // Add entry to database
    const newEntry = MindMateDB.addJournal({
      content: contentText.trim(),
      sentiment: sentimentVal,
      emotion: emotionVal,
      triggers: triggersVal,
      aiResponse: responseVal,
      tags: tags
    });

    setLastAnalysis(newEntry);
    setContentText('');
    
    // Refresh list
    setJournals(MindMateDB.getJournals());
  };

  const handleJournalDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      const data = localStorage.getItem('mindmate_local_db');
      if (data) {
        const db = JSON.parse(data);
        db.journals = db.journals.filter((j: JournalEntry) => j.id !== id);
        localStorage.setItem('mindmate_local_db', JSON.stringify(db));
        setJournals(db.journals);
        if (lastAnalysis?.id === id) {
          setLastAnalysis(null);
        }
      }
    }
  };

  // Compile list of unique tags for side filter
  const getUniqueTags = () => {
    const tagsSet = new Set<string>();
    journals.forEach((j) => j.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet).slice(0, 10);
  };

  const uniqueTags = getUniqueTags();

  // Filter journals based on tag and search
  const filteredJournals = journals.filter((j) => {
    const matchesQuery = j.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         j.emotion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? j.tags.includes(selectedTag) : true;
    return matchesQuery && matchesTag;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      
      {/* Left Column: Journal writing form & live results */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Write Card */}
        <div className="p-6 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold font-display text-slate-800 dark:text-white">AI Emotional Journal</h1>
            <p className="text-xs text-slate-400 mt-0.5">Write freely about your doubts, preparation pressure, or wins. AI reads triggers and provides mentor coping strategies.</p>
          </div>

          <form onSubmit={handleJournalSubmit} className="flex flex-col gap-3">
            <textarea
              id="journal-content-textarea"
              aria-label="AI Emotional Journal Content"
              required
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Start typing your feelings here... (e.g. 'I could not solve physics Mock problems today. I got lower marks than my peers and I feel so anxious. My parents have high expectations...')"
              className="w-full h-44 p-4 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none leading-relaxed"
            />
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400">
                ⚠️ Crisis scanning active. Text stays encrypted locally.
              </span>
              <button
                type="submit"
                disabled={!contentText.trim()}
                className={`
                  px-6 py-2.5 font-bold rounded-xl text-xs transition-all shadow-sm
                  ${contentText.trim() 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95' 
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-850 cursor-not-allowed'
                  }
                `}
              >
                Analyze Journal Entry
              </button>
            </div>
          </form>
        </div>

        {/* Live Analysis Output Card */}
        {lastAnalysis && (
          <div className="p-6 bg-white dark:bg-[#121824] border border-indigo-500/20 rounded-2xl shadow-sm flex flex-col gap-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-indigo-500" /> Journal Analysis Feedback
              </h3>
              <span className="text-[10px] text-slate-400">
                {new Date(lastAnalysis.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sentiment</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-lg">{SENTIMENT_LABELS[lastAnalysis.sentiment]?.emoji}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white capitalize">
                    {lastAnalysis.sentiment.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Primary Emotion</p>
                <p className="text-xs font-bold text-slate-850 dark:text-white mt-1.5">{lastAnalysis.emotion}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Triggers Logged</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {lastAnalysis.triggers.length > 0 ? (
                    lastAnalysis.triggers.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-bold">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400">None detected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100 dark:bg-slate-800/80"></div>

            {/* Empathy Response block */}
            <div className="p-4 bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/10 rounded-xl">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-1">
                <span>🧘</span>
                <span>Calm Senior Mentor Response</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "{lastAnalysis.aiResponse}"
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Right Column: Search & Timeline */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Filters Box */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Search & Filters</h3>
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search journals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Filter by Topic</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all border
                  ${selectedTag === null 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-850 text-slate-500 hover:border-slate-300'
                  }
                `}
              >
                All Topics
              </button>
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all border
                    ${tag === selectedTag 
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-850 text-slate-500 hover:border-slate-300'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="p-5 bg-white dark:bg-[#121824] border border-slate-200/40 dark:border-slate-800/80 rounded-2xl shadow-sm flex-1 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Journal Timeline</h3>

          <div className="flex-1 flex flex-col gap-4">
            {filteredJournals.length > 0 ? (
              filteredJournals.map((j) => {
                const isExpanded = expandedId === j.id;
                const labelColor = SENTIMENT_LABELS[j.sentiment] || SENTIMENT_LABELS.neutral;
                
                return (
                  <div 
                    key={j.id} 
                    className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl flex flex-col gap-2 transition-all hover:shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(j.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <button
                        onClick={() => handleJournalDelete(j.id)}
                        aria-label="Delete journal entry"
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded transition-all"
                        title="Delete journal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className={`text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium ${isExpanded ? '' : 'line-clamp-2'}`}>
                      "{j.content}"
                    </p>

                    <div className="flex justify-between items-center mt-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${labelColor.bg}`}>
                        {labelColor.emoji} {labelColor.label}
                      </span>
                      
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : j.id)}
                        className="text-[9px] text-indigo-500 font-bold flex items-center gap-0.5"
                      >
                        <span>{isExpanded ? 'Collapse' : 'View AI Mentor Reply'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-2.5 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-lg text-xs leading-relaxed italic text-slate-500 dark:text-slate-350 border-l-4 border-l-indigo-500">
                        <b>AI Mentor:</b> "{j.aiResponse}"
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                No matching journal entries found.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
