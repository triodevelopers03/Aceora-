import { useState } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Swords, Zap, Shield, Sparkles } from 'lucide-react';
import { Difficulty, Habit, XP_BY_DIFFICULTY, Category } from '../types';
import { cn } from '../lib/utils';

interface HabitFormProps {
  onClose: () => void;
  onAdd: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates' | 'createdAt'>) => void;
  onUpdate?: (id: string, updates: Partial<Habit>) => void;
  initialData?: Habit;
}

const DIFFICULTY_OPTIONS: { label: Difficulty, icon: any, color: string, activeColor: string }[] = [
  { label: 'Easy', icon: Shield, color: 'text-slate-400', activeColor: 'bg-green-500' },
  { label: 'Medium', icon: Swords, color: 'text-slate-400', activeColor: 'bg-yellow-500' },
  { label: 'Hard', icon: Zap, color: 'text-slate-400', activeColor: 'bg-red-500' },
];

const EMOJI_PICKER = ["🏃", "💧", "📚", "🧘", "🥗", "💻", "🎸", "🍎", "💤", "🧼", "🌱", "🎨", "🚴", "🚶", "⚽", "🧠", "💼", "🎹", "📸"];

const CATEGORIES: Category[] = ['Fitness', 'Study', 'Productivity', 'Health', 'Personal'];

export default function HabitForm({ onClose, onAdd, onUpdate, initialData }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [icon, setIcon] = useState(initialData?.icon || '🏃');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty || 'Easy');
  const [category, setCategory] = useState<Category>(initialData?.category || 'Productivity');
  const [monthlyGoal, setMonthlyGoal] = useState<number>(initialData?.monthlyGoal || 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData && onUpdate) {
      onUpdate(initialData.id, {
        name,
        icon,
        difficulty,
        category,
        monthlyGoal,
        xpReward: XP_BY_DIFFICULTY[difficulty],
      });
    } else {
      onAdd({
        name,
        icon,
        difficulty,
        category,
        monthlyGoal,
        xpReward: XP_BY_DIFFICULTY[difficulty],
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-lg premium-card rounded-t-[32px] sm:rounded-[32px] p-8 pb-12 sm:pb-8 flex flex-col gap-8 relative z-10 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">{initialData ? 'Refine Directive' : 'New Directive'}</h2>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-1">Strategic task setup</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center opacity-30 hover:opacity-100 hover:text-red-500 transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Icon Picker */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4 block">Visual Ident</label>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {EMOJI_PICKER.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={cn(
                    "w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-xl transition-all",
                    icon === e ? "bg-blue-accent text-white shadow-xl scale-110" : "bg-[var(--surface-secondary)] opacity-50 hover:opacity-100"
                  )}
                >
                  <span className={cn(icon === e ? "drop-shadow-sm" : "")}>{e}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest opacity-30 block">Mission Codename</label>
             <input
               autoFocus
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Enter objective..."
               className="w-full bg-[var(--surface-secondary)] border border-transparent px-6 py-4 rounded-2xl text-base font-bold text-[var(--text-main)] placeholder:opacity-20 focus:outline-none focus:bg-[var(--surface)] focus:border-blue-accent/20 transition-all shadow-inner"
             />
          </div>

          {/* Difficulty & Category Grid */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 block">Combat Level</label>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map(({ label, activeColor }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDifficulty(label)}
                    className={cn(
                      "flex-1 h-3 rounded-full transition-all",
                      difficulty === label ? activeColor : "bg-[var(--surface-secondary)]"
                    )}
                    title={label}
                  />
                ))}
              </div>
              <div className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest text-center mt-2">{difficulty}</div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 block">Sector</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-[var(--surface-secondary)] border-none rounded-2xl px-4 py-3 text-xs font-bold text-[var(--text-main)] focus:ring-0 appearance-none shadow-inner"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly Goal */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 block">Strategic Yield (Days)</label>
              <span className="text-xl font-black text-[var(--text-main)]">{monthlyGoal} <span className="text-[10px] opacity-30">Days</span></span>
            </div>
            <input
              type="range"
              min="1"
              max="31"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--surface-secondary)] rounded-lg appearance-none cursor-pointer accent-blue-accent"
            />
          </div>

          {/* Reward Preview */}
          <div className="bg-[var(--surface-secondary)] p-5 rounded-2xl flex items-center justify-between border border-white/5 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-accent/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-accent" />
              </div>
              <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Efficiency Bonus</span>
            </div>
            <div className="text-lg font-black text-[var(--text-main)]">+{XP_BY_DIFFICULTY[difficulty]} <span className="text-[10px] text-blue-accent">XP</span></div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-blue-accent py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white shadow-xl shadow-blue-500/20 active:opacity-90 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            {initialData ? 'Execute Update' : 'Initialize Mission'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
