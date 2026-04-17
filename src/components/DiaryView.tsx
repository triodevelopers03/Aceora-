import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenTool, 
  Calendar as CalendarIcon, 
  History as HistoryIcon, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen,
  Smile,
  Meh,
  Frown,
  Lock,
  Search,
  Check
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { DiaryEntry } from '../types';
import { cn } from '../lib/utils';

// Notebook Paper Component
const NotebookPaper = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("relative w-full h-full bg-[var(--bg-page)] transition-all overflow-hidden", className)}>
      {/* Horizontal Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ 
             backgroundImage: 'linear-gradient(white 1px, transparent 1px)', 
             backgroundSize: '100% 32px',
             marginTop: '32px'
           }} 
      />
      {/* Vertical Margin Line */}
      <div className="absolute left-14 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

const MOODS = [
  { emoji: '😊', label: 'Vibrant' },
  { emoji: '😌', label: 'Centered' },
  { emoji: '🤔', label: 'Dynamic' },
  { emoji: '😤', label: 'Charged' },
  { emoji: '😴', label: 'Resting' },
];

export default function DiaryView() {
  const [activeTab, setActiveTab] = useState<'write' | 'calendar' | 'history'>('write');
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('aceora_diary');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [viewMonth, setViewMonth] = useState(new Date());

  // Load entry for current date
  useEffect(() => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const entry = entries.find(e => e.date === dateStr);
    if (entry) {
      setContent(entry.content);
      setSelectedMood(entry.mood);
    } else {
      setContent('');
      setSelectedMood(undefined);
    }
  }, [currentDate, entries]);

  // Auto-save
  useEffect(() => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const saveTimeout = setTimeout(() => {
      if (content.trim()) {
        const existingIdx = entries.findIndex(e => e.date === dateStr);
        if (existingIdx >= 0) {
          const updated = [...entries];
          updated[existingIdx] = {
            ...updated[existingIdx],
            content,
            mood: selectedMood,
            updatedAt: new Date().toISOString()
          };
          setEntries(updated);
          localStorage.setItem('aceora_diary', JSON.stringify(updated));
        } else {
          const newEntry: DiaryEntry = {
            id: crypto.randomUUID(),
            date: dateStr,
            content,
            mood: selectedMood,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const updated = [...entries, newEntry];
          setEntries(updated);
          localStorage.setItem('aceora_diary', JSON.stringify(updated));
        }
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [content, selectedMood, currentDate]);

  const monthDays = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth)
  });

  const getDayEntry = (date: Date) => {
    return entries.find(e => e.date === format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden rounded-[32px]">
      
      {/* Internal Nav - High Tech Glass Bar */}
      <div className="flex items-center justify-center gap-14 py-6 glass-nav sticky top-0 z-20">
        <button 
          onClick={() => setActiveTab('write')}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all group",
            activeTab === 'write' ? "text-blue-accent drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "text-white/30 hover:text-white/50"
          )}
        >
          <motion.div animate={{ scale: activeTab === 'write' ? 1.1 : 1 }}>
            <PenTool size={22} className={activeTab === 'write' ? "scale-110" : ""} />
          </motion.div>
          <span className="text-[9px] uppercase font-black tracking-[0.2em]">Scribe</span>
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all group",
            activeTab === 'calendar' ? "text-blue-accent drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "text-white/30 hover:text-white/50"
          )}
        >
          <motion.div animate={{ scale: activeTab === 'calendar' ? 1.1 : 1 }}>
            <CalendarIcon size={22} className={activeTab === 'calendar' ? "scale-110" : ""} />
          </motion.div>
          <span className="text-[9px] uppercase font-black tracking-[0.2em]">Cycle</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all group",
            activeTab === 'history' ? "text-blue-accent drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "text-white/30 hover:text-white/50"
          )}
        >
          <motion.div animate={{ scale: activeTab === 'history' ? 1.1 : 1 }}>
            <HistoryIcon size={22} className={activeTab === 'history' ? "scale-110" : ""} />
          </motion.div>
          <span className="text-[9px] uppercase font-black tracking-[0.2em]">Archives</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'write' && (
          <motion.div
            key="write"
            initial={{ rotateY: -15, opacity: 0, scale: 0.95, transformOrigin: "left" }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: 15, opacity: 0, scale: 0.95, transformOrigin: "right" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 relative"
          >
            <NotebookPaper className="p-10 pt-16">
              <div className="flex justify-between items-start mb-12 pl-6">
                <div>
                  <h2 className="text-4xl font-serif italic mb-2">Dear Diary,</h2>
                  <div className="text-[10px] font-black text-blue-accent uppercase tracking-[0.3em] opacity-80">
                    {format(currentDate, 'EEEE, d MMMM yyyy')}
                  </div>
                </div>
                
                {/* Mood Protocol - Pill Shape Glass */}
                <div className="flex gap-1.5 bg-white/5 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl">
                   {MOODS.map(m => (
                     <motion.button
                      key={m.label}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedMood(m.emoji)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all",
                        selectedMood === m.emoji 
                          ? "bg-blue-accent text-white shadow-xl shadow-blue-400/20" 
                          : "hover:bg-white/10 opacity-40 hover:opacity-100"
                      )}
                     >
                       <span className="drop-shadow-sm">{m.emoji}</span>
                     </motion.button>
                   ))}
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Synchronizing thoughts with the digital ledger..."
                className="w-full h-[65vh] bg-transparent resize-none focus:outline-none text-xl leading-[32px] font-medium placeholder:opacity-20 pl-6 no-scrollbar selection:bg-blue-accent/10"
                style={{ caretColor: '#3b82f6' }}
              />

              <div className="absolute bottom-10 right-10">
                <div className="flex items-center gap-4 text-[9px] font-black opacity-30 uppercase tracking-[0.25em]">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-blue-accent/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-3 bg-blue-accent/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-3 bg-blue-accent rounded-full animate-bounce" />
                  </div>
                  Persistence Active
                </div>
              </div>
            </NotebookPaper>
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-8 bg-bg-page"
          >
            <div className="premium-card p-8">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black tracking-tight uppercase tracking-[0.1em]">{format(viewMonth, 'MMMM yyyy')}</h3>
                <div className="flex gap-3">
                  <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="p-3 bg-white/5 hover:bg-white/10 opacity-40 hover:opacity-100 rounded-2xl transition-all active:scale-95">
                    <ChevronLeft size={18} strokeWidth={3} />
                  </button>
                  <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="p-3 bg-white/5 hover:bg-white/10 opacity-40 hover:opacity-100 rounded-2xl transition-all active:scale-95">
                    <ChevronRight size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-6">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-black opacity-20 uppercase py-2 tracking-[0.3em]">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-3">
                {monthDays.map(day => {
                  const entry = getDayEntry(day);
                  const isCurToday = isToday(day);
                  const isSelected = isSameDay(day, currentDate);

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => {
                        setCurrentDate(day);
                        setActiveTab('write');
                      }}
                      className={cn(
                        "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group",
                        isSelected 
                          ? "bg-blue-accent text-white shadow-2xl scale-110 z-10" 
                          : "hover:bg-white/5",
                        isCurToday && !isSelected && "border-2 border-blue-accent/20"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-black tabular-nums transition-colors",
                        isSelected ? "text-white" : "opacity-30 group-hover:opacity-100",
                        isCurToday && !isSelected && "text-blue-accent"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {entry && !isSelected && (
                        <motion.div 
                          layoutId={`dot-${entry.id}`}
                          className="w-1.5 h-1.5 rounded-full bg-blue-accent mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <div className="premium-card p-6 flex items-center justify-between group cursor-pointer hover:border-blue-accent/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-accent/10 flex items-center justify-center group-hover:bg-blue-accent transition-all">
                    <BookOpen className="text-blue-accent group-hover:text-white transition-colors" size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Archive Depth</h4>
                    <p className="text-2xl font-black">{entries.length} <span className="text-xs opacity-20 font-bold tracking-tight">Entries</span></p>
                  </div>
                </div>
                <ChevronRight className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 p-8 overflow-y-auto no-scrollbar pb-32 bg-bg-page"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase tracking-[0.1em]">Archive Scribe</h3>
                <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-1">Chronological history</p>
              </div>
              <button className="w-12 h-12 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center opacity-30 hover:opacity-100 transition-colors">
                 <Search size={22} />
              </button>
            </div>

            <div className="space-y-6">
              {entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, idx) => (
                <motion.button
                  key={entry.id}
                  layoutId={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setCurrentDate(new Date(entry.date));
                    setActiveTab('write');
                  }}
                  className="w-full bg-white/5 border border-white/5 p-8 rounded-[32px] text-left hover:bg-white/10 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[9px] font-black text-blue-accent uppercase tracking-[0.3em] bg-blue-accent/10 px-3 py-1.5 rounded-xl">
                       {format(new Date(entry.date), 'dd MMMM yyyy')}
                    </div>
                    {entry.mood && (
                      <span className="text-2xl w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-50 line-clamp-2 leading-relaxed font-medium">
                    {entry.content}
                  </p>
                  <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] font-black uppercase tracking-widest">Revisit Sequence</span>
                    <ChevronRight size={14} className="text-blue-accent" />
                  </div>
                </motion.button>
              ))}

              {entries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <BookOpen size={32} className="opacity-20" />
                  </div>
                  <p className="opacity-30 font-black uppercase tracking-[0.2em] text-[10px]">The Archive is currently vacant</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
