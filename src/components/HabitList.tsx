import { motion } from 'motion/react';
import { Habit } from '../types';
import { CheckCircle2, Circle, Flame, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  isManageMode?: boolean;
}

export default function HabitList({ habits, onToggle, onEdit, onDelete, isManageMode }: HabitListProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-[40%] bg-white/5 flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-8 h-8 opacity-20" />
        </div>
        <div className="space-y-1">
          <p className="font-black uppercase tracking-[0.1em] text-sm">Strategic Silence</p>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest leading-relaxed">No directives pending.<br/>Initiate a new quest to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit, idx) => {
        const isCompleted = habit.completedDates.some(d => d.startsWith(todayStr));
        const isDeleting = deletingId === habit.id;
        
        return (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => !isDeleting && !isManageMode && onToggle(habit.id)}
            className={cn(
              "premium-card p-4 cursor-pointer flex items-center justify-between group transition-all relative overflow-hidden",
              isCompleted && !isDeleting && !isManageMode ? "bg-white/5" : "hover:shadow-xl hover:shadow-blue-900/5 active:scale-[0.98]",
              isDeleting && "border-red-500/20 bg-red-500/10",
              isManageMode && "border-white/10"
            )}
          >
            {/* Background progress indicator on check */}
            {isCompleted && !isDeleting && !isManageMode && (
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: '100%' }}
                 className="absolute inset-0 bg-blue-accent/5 -z-10"
               />
            )}

            <div className="flex items-center gap-4">
              <div className="relative">
                {isDeleting ? (
                  <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                ) : isCompleted && !isManageMode ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-lg bg-blue-accent flex items-center justify-center shadow-lg shadow-blue-400/30"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                ) : (
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    isManageMode ? "border-slate-100" : "border-slate-200 group-hover:border-blue-accent group-hover:bg-blue-accent/5"
                  )}>
                    {!isManageMode && <div className="w-2 h-2 rounded-sm bg-blue-accent opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all",
                  isCompleted && !isDeleting && !isManageMode ? "bg-white/5 opacity-60" : "bg-white/5 shadow-inner group-hover:bg-white/10 transition-all"
                )}>
                  {habit.icon}
                </div>
                
                <div>
                  <h4 className={cn(
                    "text-sm font-black tracking-tight transition-all",
                    isCompleted && !isDeleting && !isManageMode ? "line-through opacity-30" : "",
                    isDeleting && "text-red-500"
                  )}>
                    {isDeleting ? "Execute Purge?" : habit.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-black opacity-40 uppercase tracking-[0.15em]">
                      {isDeleting ? "Protocol cannot be reversed" : isManageMode ? "Modify tactical objective" : `+${habit.xpReward || 0} XP • ${habit.difficulty}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setDeletingId(null)}
                    className="px-4 py-2 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase hover:bg-slate-100 transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={() => onDelete(habit.id)}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Purge
                  </button>
                </div>
              ) : (
                <>
                  {!isManageMode && (
                    <div className="flex items-center gap-3 mr-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-xl">
                        <span className="text-[10px] font-black text-orange-600">🔥 {habit.streak || 0}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex items-center gap-2 transition-all",
                    isManageMode ? "opacity-100" : "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                  )}>
                    <button 
                      onClick={() => onEdit(habit)}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        isManageMode ? "bg-slate-100 text-navy-primary" : "text-slate-300 hover:text-blue-accent hover:bg-blue-50"
                      )}
                    >
                      <Pencil size={15} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => setDeletingId(habit.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={15} strokeWidth={3} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
