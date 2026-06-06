'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  BarChart2, 
  BookOpen, 
  MessageSquare, 
  Activity, 
  Award, 
  AlertTriangle, 
  Settings, 
  Menu, 
  X, 
  User, 
  Sparkles,
  RefreshCw,
  Eye,
  GraduationCap
} from 'lucide-react';
import { MindMateDB, UserProfile } from '../utils/db';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // App States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal States
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Onboarding Form States
  const [onboardName, setOnboardName] = useState('');
  const [onboardExam, setOnboardExam] = useState('JEE');
  
  // API Keys Input State
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  // Load profile and config on mount
  useEffect(() => {
    const prof = MindMateDB.getProfile();
    setProfile(prof);
    
    // Force light mode
    document.documentElement.classList.remove('dark');
    
    // Load Keys
    const keys = MindMateDB.getApiKeys();
    setGeminiKey(keys.gemini || '');
    setOpenaiKey(keys.openai || '');
    
    setLoading(false);
  }, []);

  // Submit Onboarding
  const handleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardName.trim()) return;

    // Seed mock data & create profile
    MindMateDB.seedMockData(onboardName.trim(), onboardExam);
    const prof = MindMateDB.getProfile();
    setProfile(prof);
    
    // Set theme default
    document.documentElement.classList.remove('dark');
    
    // Refresh and navigate
    router.refresh();
    router.push('/dashboard');
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    MindMateDB.saveApiKeys({
      gemini: geminiKey.trim() || undefined,
      openai: openaiKey.trim() || undefined
    });
    setShowSettings(false);
    alert('API Keys Saved Successfully! MindMate will now prioritize your custom keys for AI analysis and coaching.');
  };

  // Reset Application Data
  const handleResetData = () => {
    if (confirm('Are you sure you want to delete all local journals, daily check-ins, achievements, and custom API keys? This cannot be undone.')) {
      MindMateDB.clearAll();
      setProfile(null);
      router.push('/');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // Watch for crisis tags in journals or custom actions
  useEffect(() => {
    const handleCrisisTrigger = () => {
      setShowEmergency(true);
    };
    window.addEventListener('crisis-detected', handleCrisisTrigger);
    return () => window.removeEventListener('crisis-detected', handleCrisisTrigger);
  }, []);

  // Navigation items
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Daily Check-in', path: '/dashboard?checkin=true', icon: Activity },
    { label: 'AI Mood & Analytics', path: '/analytics', icon: BarChart2 },
    { label: 'AI Emotional Journal', path: '/journal', icon: BookOpen },
    { label: 'AI Wellness Coach', path: '/coach', icon: MessageSquare },
    { label: 'Exam & Result Mode', path: '/exam-mode', icon: GraduationCap },
    { label: 'Wellness Hub', path: '/wellness', icon: Award },
    { label: 'Simulated Portals', path: '/dashboards', icon: Eye },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium font-display animate-pulse">Breathe in, breathe out...</p>
        </div>
      </div>
    );
  }

  // If landing page (/) is active, allow bypass layout styling
  if (pathname === '/') {
    return <>{children}</>;
  }

  // Onboarding screen if user is guest and profile is empty
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/40 dark:border-white/5 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-500 rounded-2xl flex items-center justify-center font-display text-3xl shadow-inner animate-pulse">
              🧠
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-800 dark:text-white mt-2">Welcome to MindMate</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your empathetic wellness companion for academic stress management. Let's create your guest profile.
            </p>
          </div>

          <form onSubmit={handleOnboarding} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="onboard-name-input" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Name</label>
              <input
                id="onboard-name-input"
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={onboardName}
                onChange={(e) => setOnboardName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="onboard-exam-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Exam</label>
              <select
                id="onboard-exam-select"
                value={onboardExam}
                onChange={(e) => setOnboardExam(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              >
                <option value="JEE">JEE (Mains & Advanced)</option>
                <option value="NEET">NEET (Medical Entrance)</option>
                <option value="UPSC">UPSC Civil Services</option>
                <option value="GATE">GATE</option>
                <option value="CAT">CAT (Management)</option>
                <option value="CUET">CUET</option>
                <option value="Boards">Class 10 / 12 Board Exams</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] mt-2 font-display flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Start Journey (Guest Mode)
            </button>
          </form>

          <p className="text-xs text-center text-slate-400 dark:text-slate-500 leading-relaxed">
            By choosing Guest Mode, all journal entries are encrypted and saved solely on your device. We prioritize your complete privacy.
          </p>
        </div>
      </div>
    );
  }

  // Sidebar Layout for logged-in students
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0f1524] border-b border-slate-200 dark:border-slate-800 shadow-sm z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-bold text-lg font-display tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">MindMate</span>
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowEmergency(true)}
            aria-label="Emergency Support"
            className="p-1.5 bg-red-100 dark:bg-red-950/50 text-red-500 dark:text-red-400 rounded-lg animate-pulse"
            title="Emergency Support"
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
            className="p-1 text-slate-500 focus:outline-none"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0f1524] border-r border-slate-200 dark:border-slate-800/80 p-5 flex flex-col gap-6 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-display text-lg font-bold shadow-md shadow-indigo-600/20">
              M
            </div>
            <span className="font-bold text-xl font-display tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">MindMate</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Onboarding Badge Info */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-3 shadow-inner">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 rounded-full flex items-center justify-center font-display font-semibold text-sm">
            Lv{profile.level}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Student Profile</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{profile.name}</p>
            {/* XP progress bar */}
            <div className="mt-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${profile.xp % 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{profile.xp % 100}/100 XP to Level {profile.level + 1}</p>
          </div>
        </div>

        {/* Main Menu Links */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path.includes('?checkin') && pathname === '/dashboard');
            return (
              <Link
                key={item.label}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Panel Footer */}
        <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          {/* Quick Stats Banner */}
          <div className="flex items-center justify-between text-xs font-semibold px-2 text-slate-400 mb-1">
            <span className="flex items-center gap-1">🔥 Streak: <b className="text-amber-500">{profile.streak} Days</b></span>
            <span className="flex items-center gap-1">🎯 Exam: <b className="text-violet-500">{profile.targetExam}</b></span>
          </div>

          <button
            onClick={() => setShowEmergency(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold rounded-xl text-sm border border-red-500/20 transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            <AlertTriangle className="w-4.5 h-4.5" />
            <span>Emergency Support</span>
          </button>
          
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Settings"
            >
              <Settings className="w-4.5 h-4.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Content Viewport */}
      <main className="flex-1 flex flex-col md:h-screen md:overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/70 dark:bg-[#0f1524]/60 backdrop-blur border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm sticky top-0 z-20">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
              Hello, {profile.name.split(' ')[0]} <span>👋</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Keep supporting your mental resilience today.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-950/50 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>🔥</span>
              <span>{profile.streak}-Day Streak</span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-950/50 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>🎯</span>
              <span>Target: {profile.targetExam}</span>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all text-sm font-semibold"
            >
              <User className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-12">
          {children}
        </div>
      </main>

      {/* Emergency Support Modal Dialog */}
      {showEmergency && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-red-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-6 bg-red-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
                <h3 className="text-xl font-bold font-display">Crisis Support & Grounding</h3>
              </div>
              <button 
                onClick={() => setShowEmergency(false)} 
                aria-label="Close emergency support dialog"
                className="p-1 rounded-lg hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/40 p-4 rounded-xl text-red-800 dark:text-red-300 text-sm leading-relaxed">
                <b>Please know this:</b> You are not alone, and academic setbacks or prep fatigue do not define your life. There are people who care and want to support you through this.
              </div>

              {/* Grounding Exercise */}
              <div>
                <h4 className="font-bold font-display text-slate-800 dark:text-white mb-2 flex items-center gap-1.5 text-sm">
                  <span>🧘</span> 5-4-3-2-1 Sensory Grounding Exercise (To Calm Panic)
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-xl leading-relaxed">
                  <p>• <b>5: See</b> — Look around and name 5 items in the room (e.g. your book, a pen, a window).</p>
                  <p>• <b>4: Touch</b> — Feel 4 items around you (e.g. your desk texture, your clothing, your hair).</p>
                  <p>• <b>3: Hear</b> — Listen and identify 3 distinct sounds (e.g. a fan humming, birds, traffic outside).</p>
                  <p>• <b>2: Smell</b> — Try to notice 2 scents around you.</p>
                  <p>• <b>1: Taste</b> — Notice 1 taste, or take a slow sip of cold water.</p>
                </div>
              </div>

              {/* Helplines */}
              <div>
                <h4 className="font-bold font-display text-slate-800 dark:text-white mb-2 text-sm">
                  📞 Instant Student Crisis Helplines
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-1 text-xs">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">Tele-MANAS Helpline (Govt of India)</p>
                      <p className="text-slate-400">24/7 Free Academic/Mental Health Helpline</p>
                    </div>
                    <a href="tel:14416" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-center transition-all">
                      Dial 14416
                    </a>
                  </div>

                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-1 text-xs">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">Vandrevala Foundation</p>
                      <p className="text-slate-400">24/7 Professional Counseling Services</p>
                    </div>
                    <a href="tel:18002333330" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-center transition-all">
                      Dial 1800 233 3330
                    </a>
                  </div>

                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-1 text-xs">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">AASRA Suicide Helpline</p>
                      <p className="text-slate-400">Emotional Support & Crisis Counseling</p>
                    </div>
                    <a href="tel:919820466726" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-center transition-all">
                      Dial 9820466726
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowEmergency(false)}
                className="px-5 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-all"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form 
            onSubmit={handleSaveSettings}
            className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scaleIn"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" /> Settings & API Keys
              </h3>
              <button 
                type="button"
                onClick={() => setShowSettings(false)} 
                aria-label="Close settings dialog"
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 p-3.5 rounded-xl text-indigo-800 dark:text-indigo-300 text-xs leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Configure keys below to enable direct client-side integration with OpenAI/Gemini. Leaving them empty defaults to our offline mentor rules.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-gemini-key" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gemini API Key</label>
                <input
                  id="settings-gemini-key"
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-openai-key" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">OpenAI API Key</label>
                <input
                  id="settings-openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2"></div>

              <div>
                <label className="text-[10px] font-semibold text-red-500 uppercase tracking-wider block mb-1">Danger Zone</label>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="w-full py-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset All Application Data
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#0c1018] border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
