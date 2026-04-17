import React, { useEffect, useState } from 'react';
import { format, isSameDay, subDays } from 'date-fns';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Plus, 
  Calendar, 
  BarChart3, 
  Clock, 
  Settings, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  Timer,
  LayoutGrid,
  TrendingUp,
  BrainCircuit,
  Dumbbell,
  Target,
  Sparkles,
  User as UserIcon,
  X,
  History,
  Lock,
  Bell,
  Trash,
  LogOut,
  Globe,
  ShieldCheck,
  CreditCard,
  PenTool,
  Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ComposedChart,
  Bar, 
  Line,
  XAxis, 
  YAxis,
  ResponsiveContainer, 
  Cell,
  Tooltip,
  Area
} from 'recharts';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { 
  Habit, 
  UserProgress, 
  Difficulty, 
  XP_BY_DIFFICULTY, 
  calculateXpForLevel, 
  getWeeklyGrid 
} from './types';

// Components
import HabitList from './components/HabitList';
import HabitDashboard from './components/HabitDashboard';
import DiaryView from './components/DiaryView';
import HabitForm from './components/HabitForm';
import Onboarding from './components/Onboarding';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'diary' | 'settings'>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  
  const [user, setUser] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('aceora_user');
    const defaultUser = {
      level: 1,
      xp: 0,
      coins: 0,
      dailyScore: 0,
      lastActive: new Date().toISOString(),
      email: 'triodevelopers003@gmail.com',
      userId: `ACE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    };
    
    if (!saved) return defaultUser;
    
    try {
      const parsed = JSON.parse(saved);
      return {
        ...defaultUser,
        ...parsed,
        level: isNaN(parsed.level) ? 1 : Math.max(1, parsed.level),
        xp: isNaN(parsed.xp) ? 0 : Math.max(0, parsed.xp),
        coins: isNaN(parsed.coins) ? 0 : Math.max(0, parsed.coins),
        dailyScore: isNaN(parsed.dailyScore) ? 0 : parsed.dailyScore
      };
    } catch {
      return defaultUser;
    }
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('aceora_habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      const isFirstTime = !localStorage.getItem('aceora_initialized');
      if (isFirstTime) {
        setShowOnboarding(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('aceora_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aceora_habits', JSON.stringify(habits));
    updateDailyScore();
  }, [habits]);

  const updateDailyScore = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const totalToday = habits.length;
    if (totalToday === 0) return;
    const completedToday = habits.filter(h => h.completedDates.some(d => d.startsWith(todayStr))).length;
    const score = Math.round((completedToday / totalToday) * 100);
    setUser(prev => ({ ...prev, dailyScore: score }));
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'streak' | 'completedDates' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString()
    };
    setHabits([...habits, newHabit]);
    setShowHabitForm(false);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    setEditingHabit(null);
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const toggleHabit = (id: string) => {
    toggleHabitDate(id, new Date());
  };

  const toggleHabitDate = (id: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let gainedXp = 0;

    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isCompleted = h.completedDates.some(d => d.startsWith(dateStr));
        if (isCompleted) {
          return {
            ...h,
            completedDates: h.completedDates.filter(d => !d.startsWith(dateStr)),
            streak: isSameDay(date, new Date()) ? Math.max(0, h.streak - 1) : h.streak
          };
        } else {
          gainedXp = h.xpReward;
          
          if (isSameDay(date, new Date())) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#3b82f6', '#1e293b', '#dbeafe']
            });
          }

          return {
            ...h,
            completedDates: [...h.completedDates, date.toISOString()],
            streak: isSameDay(date, new Date()) ? h.streak + 1 : h.streak
          };
        }
      }
      return h;
    }));

    if (gainedXp > 0) {
      addXp(gainedXp);
    }
  };

  const addXp = (amount: number) => {
    setUser(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let xpToNext = calculateXpForLevel(newLevel);
      
      while (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel += 1;
        xpToNext = calculateXpForLevel(newLevel);
        
        // Level up celebration
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.5 },
          colors: ['#3b82f6', '#FFFFFF']
        });
      }
      
      return { ...prev, xp: newXp, level: newLevel, coins: prev.coins + Math.floor(amount / 5) };
    });
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-navy-primary flex flex-col items-center justify-center z-[100]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-24 h-24 bg-transparent rounded-[32px] flex items-center justify-center shadow-2xl">
            <img src="https://www.image2url.com/r2/default/images/1776417266042-ee3d77bc-d776-466c-ad77-47799ee3d728.png" alt="Logo" className="w-20 h-20 object-contain" />
          </div>
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 20px rgba(59,130,246,0.2)", "0 0 50px rgba(59,130,246,0.4)", "0 0 20px rgba(59,130,246,0.2)"] 
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-[32px]"
          />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-black mt-10 tracking-[0.1em] text-white uppercase italic"
        >
          ACEORA
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] mt-3 font-black text-white uppercase tracking-[0.4em] translate-x-1"
        >
          Operational Excellence
        </motion.p>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => {
      localStorage.setItem('aceora_initialized', 'true');
      setShowOnboarding(false);
    }} />;
  }

  const xpToNext = calculateXpForLevel(user.level || 1);
  const xpProgress = xpToNext > 0 ? (user.xp / xpToNext) * 100 : 0;

  // Safety utility for rendering numbers
  const safe = (val: any) => (isNaN(val) || val === null || val === undefined) ? 0 : val;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] font-sans antialiased relative overflow-hidden">
      {/* Dynamic Background Blobs for Glassmorphism Refraction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-accent/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-blue-accent/10 rounded-full blur-[140px]" 
        />
      </div>

      {/* Premium Header */}
      <header className="bg-navy-primary pt-12 pb-8 px-6 relative overflow-hidden shadow-[0_10px_40px_rgba(11,31,58,0.2)]">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-accent/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 p-0.5 bg-navy-soft shadow-lg"
              >
                 <img src="https://www.image2url.com/r2/default/images/1776417266042-ee3d77bc-d776-466c-ad77-47799ee3d728.png" alt="User avatar" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  Master Ace
                  <span className="text-[10px] font-black bg-blue-accent text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Lvl {user.level}
                  </span>
                </h1>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest tracking-tight">Grand Achiever</p>
              </div>
            </div>
            
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-blue-accent fill-blue-accent" />
              <span className="text-sm font-black text-white">{user.coins}</span>
            </motion.div>
          </div>

          {/* XP Progress Section */}
          <div className="bg-white/10 border border-white/10 p-4 rounded-[24px] backdrop-blur-xl shadow-inner">
            <div className="flex justify-between items-end mb-2.5">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.15em]">Evolution Status</span>
              <span className="text-[10px] font-black text-blue-accent uppercase tracking-widest">{Math.floor(safe(user.xp))} / {safe(xpToNext)} XP</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-blue-accent shadow-[0_0_12px_rgba(59,130,246,0.6)]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mt-8 mb-4 flex items-center justify-between px-2">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[11px] font-black opacity-40 uppercase tracking-[0.2em] flex items-center gap-2">
                    Daily Directives
                    <span className="inline-flex w-5 h-5 bg-blue-accent/10 text-blue-accent text-[10px] font-black rounded-full items-center justify-center border border-blue-accent/20">
                      {habits.length}
                    </span>
                  </h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsManageMode(!isManageMode)}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all",
                      isManageMode ? "bg-blue-accent text-white shadow-lg shadow-blue-400/20" : "opacity-30 hover:opacity-100 bg-white/5"
                    )}
                  >
                    {isManageMode ? 'Done' : 'Adjust'}
                  </button>
                </div>
              </div>
              
              <HabitList 
                habits={habits} 
                onToggle={toggleHabit} 
                onDelete={deleteHabit} 
                onEdit={(h) => setEditingHabit(h)}
                isManageMode={isManageMode}
              />
              
              <div className="mt-12">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-4 flex items-center gap-2">
                  Momentum Analysis
                </h3>
                <div className="premium-card p-6 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={(() => {
                      return Array.from({ length: 7 }).map((_, i) => {
                        const date = subDays(new Date(), 6 - i);
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const completed = habits.filter(h => h.completedDates.some(d => d.startsWith(dateStr))).length;
                        const total = habits.length || 0;
                        return {
                          name: format(date, 'EEE'),
                          completed,
                          total,
                          rate: total > 0 ? (completed / total) * 100 : 0
                        };
                      });
                    })()}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-navy-primary border border-white/10 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">{payload[0].payload.name}</p>
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-sm font-black text-white">{payload[0].value} / {payload[0].payload.total} Goals</p>
                                  <p className="text-[10px] font-black text-blue-accent uppercase tracking-tighter">{Math.round(payload[0].payload.rate)}% Success Rate</p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 8 }}
                      />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }}
                        dy={12}
                      />
                      <Bar 
                        dataKey="completed" 
                        radius={[8, 8, 8, 8]}
                        barSize={24}
                        fill="url(#barGradient)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 4, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-[11px] font-black opacity-30 uppercase tracking-[0.2em] px-2 mb-4 flex items-center gap-2">
                  System Grid
                </h3>
                <div className="premium-card p-6">
                  <div className="grid grid-cols-7 gap-2">
                    {getWeeklyGrid().map((date, idx) => {
                      const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const allHabitsCompleted = habits.length > 0 && habits.every(h => h.completedDates.some(d => d.startsWith(dateStr)));
                      const partialCompleted = habits.some(h => h.completedDates.some(d => d.startsWith(dateStr)));
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-tighter",
                            isToday ? "text-blue-accent" : "opacity-30"
                          )}>
                            {format(date, 'EEE').charAt(0)}
                          </span>
                          <motion.div 
                            initial={false}
                            animate={{ 
                              scale: allHabitsCompleted ? 1.05 : 1,
                              backgroundColor: allHabitsCompleted ? '#3b82f6' : (partialCompleted ? '#dbeafe' : '#f1f5f9')
                            }}
                            className={cn(
                              "w-full aspect-square rounded-[6px] transition-all duration-300",
                              allHabitsCompleted && "shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                            )} 
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Developer Credit Watermark */}
                <div className="mt-16 pb-32 flex flex-col items-center justify-center opacity-20">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Made by Trio developers</p>
                  <div className="w-8 h-px bg-white/50 mt-2" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <div className="flex flex-col min-h-full">
              <HabitDashboard habits={habits} onToggleDate={toggleHabitDate} />
              <div className="mt-auto pb-32 flex flex-col items-center justify-center opacity-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Made by Trio developers</p>
                <div className="w-8 h-px bg-white/50 mt-2" />
              </div>
            </div>
          )}

          {activeTab === 'diary' && (
            <div className="flex flex-col min-h-full">
              <DiaryView />
              <div className="mt-auto pb-32 flex flex-col items-center justify-center opacity-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Made by Trio developers</p>
                <div className="w-8 h-px bg-white/50 mt-2" />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 flex flex-col gap-8 pb-32"
            >
              {/* Profile Card */}
              <div className="premium-card p-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 opacity-20" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">{user.userId || 'Master Ace'}</h2>
                  <p className="text-blue-accent text-[10px] font-black tracking-[0.2em] uppercase">Executive Tier</p>
                </div>
              </div>
 
              {/* Account Section */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.25em] px-2">Identity Core</h3>
                <div className="premium-card overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex items-center justify-between group cursor-default hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center opacity-40 group-hover:text-blue-accent transition-colors">
                        <Globe size={16} />
                      </div>
                      <span className="text-sm font-bold opacity-80">User ID</span>
                    </div>
                    <span className="text-xs font-mono font-black text-blue-accent">{user.userId || 'ACE-HQ77-X'}</span>
                  </div>
                  <div className="p-5 border-b border-white/5 flex items-center justify-between group cursor-default hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center opacity-40 group-hover:text-blue-accent transition-colors">
                        <UserIcon size={16} />
                      </div>
                      <span className="text-sm font-bold opacity-80">Internal Email</span>
                    </div>
                    <span className="text-xs font-bold opacity-40">{user.email || 'developer@trio.io'}</span>
                  </div>
                  <div className="p-5 flex items-center justify-between group cursor-default hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center opacity-40 group-hover:text-blue-accent transition-colors">
                        <Lock size={16} />
                      </div>
                      <span className="text-sm font-bold opacity-80">Access Code</span>
                    </div>
                    <span className="text-sm font-medium opacity-20">••••••••••••</span>
                  </div>
                </div>
              </div>
 
              {/* Support & Social Section - NEW */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.25em] px-2">Support & Social</h3>
                <div className="premium-card overflow-hidden">
                  <a 
                    href="https://www.instagram.com/trio_developers_00/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                        <Instagram size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-bold opacity-80 block">Follow Us</span>
                        <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">trio_developers_00</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
 
              {/* Security & Access */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.25em] px-2">Security Protocols</h3>
                <div className="premium-card overflow-hidden">
                  <button className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center opacity-40">
                        <ShieldCheck size={16} />
                      </div>
                      <span className="text-sm font-bold opacity-80">2FA Verification</span>
                    </div>
                    <span className="text-[10px] font-black opacity-20 uppercase">Inactive</span>
                  </button>
                  <button className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-blue-accent/10 flex items-center justify-center text-blue-accent">
                        <CreditCard size={16} />
                      </div>
                      <span className="text-sm font-bold opacity-80">Elite Status</span>
                    </div>
                    <span className="text-[10px] font-black text-blue-accent uppercase tracking-widest">Upgrade</span>
                  </button>
                </div>
              </div>
 
              {/* Danger Zone */}
              <div className="mt-8">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (confirm("WARNING: Permanent data purge protocol. Continue?")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full p-6 rounded-[24px] bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-3 text-red-500 hover:bg-red-500/20 transition-all group"
                >
                  <Trash size={18} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Purge Environment</span>
                </motion.button>
              </div>

              {/* Footer Watermark */}
              <div className="mt-12 flex flex-col items-center justify-center opacity-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Developer Edition v1.0</p>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] mt-1">Made by Trio developers</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Premium Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 px-6 pb-8 z-50">
        <div className="glass-nav p-2.5 rounded-[32px] flex items-center justify-between px-8 max-w-md mx-auto relative">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutGrid />} label="Guild" />
          <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 />} label="Journal" />
          
          {/* Central FAB - Elevated Blue */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHabitForm(true)}
            className="w-16 h-16 bg-blue-accent rounded-[24px] -mt-14 border-[6px] border-bg-page shadow-2xl flex items-center justify-center transition-all glow-blue group relative overflow-hidden"
          >
            <Plus className="w-8 h-8 text-white relative z-10 transition-transform group-active:rotate-90" strokeWidth={3} />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
 
          <NavButton active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} icon={<PenTool />} label="Diary" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings />} label="Settings" />
        </div>
      </nav>

      {/* Habit Creation/Edit Modal */}
      <AnimatePresence>
        {(showHabitForm || editingHabit) && (
          <HabitForm 
            onClose={() => {
              setShowHabitForm(false);
              setEditingHabit(null);
            }} 
            onAdd={addHabit}
            onUpdate={updateHabit}
            initialData={editingHabit || undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button onClick={onClick} className={cn(
      "flex flex-col items-center gap-1.5 transition-all group",
      active ? "text-blue-accent" : "text-white/30 hover:text-white/50"
    )}>
      <motion.div 
        animate={{ y: active ? -2 : 0 }}
        className={cn(
          "transition-all duration-300",
          active ? "scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" : "scale-100"
        )}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 22 })}
      </motion.div>
      <span className={cn(
        "text-[9px] font-black uppercase tracking-[0.1em] transition-opacity",
        active ? "opacity-100" : "opacity-30 group-hover:opacity-50"
      )}>
        {label}
      </span>
    </button>
  );
}
