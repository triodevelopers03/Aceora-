import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Habit } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { cn } from '../lib/utils';
import { Settings, Info, TrendingUp, Calendar, Target, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface HabitDashboardProps {
  habits: Habit[];
  onToggleDate: (habitId: string, date: Date) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Fitness: 'bg-blue-accent/10 text-blue-400',
  Study: 'bg-indigo-400/10 text-indigo-400',
  Productivity: 'bg-emerald-400/10 text-emerald-400',
  Health: 'bg-rose-400/10 text-rose-400',
  Personal: 'bg-white/5 opacity-60 text-white'
};

const CHART_COLORS = ['#60A5FA', '#A78BFA', '#34D399', '#F472B6', '#FBBF24'];

export default function HabitDashboard({ habits, onToggleDate }: HabitDashboardProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate overall stats
  const totalMonthlyGoals = habits.reduce((acc, h) => acc + h.monthlyGoal, 0);
  const totalCompletionsThisMonth = habits.reduce((acc, h) => {
    const monthCompletions = h.completedDates.filter(d => {
      const date = new Date(d);
      return date >= monthStart && date <= monthEnd;
    }).length;
    return acc + monthCompletions;
  }, 0);

  const overallCompletionRate = totalMonthlyGoals > 0 
    ? Math.round((totalCompletionsThisMonth / totalMonthlyGoals) * 100) 
    : 0;

  // Weekly stats
  const weeklyStats = useMemo(() => {
    return [1, 2, 3].map(weekNum => {
      const start = new Date(monthStart);
      start.setDate(start.getDate() + (weekNum - 1) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      const totalPossible = habits.length * 7;
      let completed = 0;
      
      habits.forEach(h => {
        h.completedDates.forEach(d => {
          const date = new Date(d);
          if (date >= start && date <= end) completed++;
        });
      });
      
      return {
        name: `Week ${weekNum}`,
        percentage: totalPossible > 0 ? Math.min(100, Math.round((completed / totalPossible) * 100)) : 0
      };
    });
  }, [habits, monthStart]);

  // Bar chart data (Daily completions)
  const barData = useMemo(() => {
    return daysInMonth.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = habits.filter(h => h.completedDates.some(d => d.startsWith(dayStr))).length;
      return {
        day: format(day, 'd'),
        count
      };
    });
  }, [habits, daysInMonth]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-page min-h-screen p-4 pb-32"
    >
      <header className="mb-10 p-4">
        <h1 className="text-2xl font-black tracking-tight">Analytical Grid</h1>
        <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.2em]">Data-driven habit optimization</p>
      </header>

      {/* 1. Top Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card p-8 flex items-center gap-8 group"
        >
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: totalCompletionsThisMonth },
                    { value: Math.max(0, totalMonthlyGoals - totalCompletionsThisMonth) }
                  ]}
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={8}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  stroke="none"
                >
                  <Cell fill="#3b82f6" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                  <Cell fill="rgba(255,255,255,0.05)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{overallCompletionRate}%</span>
              <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">Quota</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-1">Efficiency</h3>
            <p className="opacity-40 text-xs font-medium leading-relaxed">
              <span className="text-blue-accent font-black">{totalCompletionsThisMonth}</span> units achieved from <span className="font-black">{totalMonthlyGoals}</span> planned directives.
            </p>
            <div className="mt-4 flex gap-2">
               <span className="px-2 py-1 bg-blue-accent/10 text-blue-400 text-[9px] font-black rounded-lg uppercase tracking-widest border border-blue-400/20">Optimal</span>
            </div>
          </div>
        </motion.div>

        {/* 2. Weekly Progress */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-8"
        >
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-8">Temporal Momentum</h3>
          <div className="flex justify-around items-center">
            {weeklyStats.map((week, idx) => (
              <div key={week.name} className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" className="stroke-white/5" strokeWidth="5" />
                    <motion.circle 
                      initial={{ strokeDashoffset: 175.9 }}
                      animate={{ strokeDashoffset: 175.9 - (175.9 * week.percentage / 100) }}
                      transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1), ease: "easeOut" }}
                      cx="32" cy="32" r="28" fill="none" 
                      className="stroke-blue-accent" 
                      strokeWidth="5" 
                      strokeDasharray="175.9" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                    {week.percentage}%
                  </div>
                </div>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">{week.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 3. Daily Habit Tracker Table */}
        <div className="lg:col-span-3 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Tactical Matrix</h3>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-white/5" />
                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Idle</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-blue-accent" />
                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Active</span>
                 </div>
              </div>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="sticky left-0 bg-[#0b1f3a] border-r border-white/5 p-5 text-left text-[9px] font-black opacity-30 uppercase tracking-[0.2em] min-w-[170px] z-10">Directive</th>
                    <th className="p-5 text-[9px] font-black opacity-30 uppercase tracking-widest min-w-[100px]">Class</th>
                    <th className="p-5 text-[9px] font-black opacity-30 uppercase tracking-widest min-w-[70px]">Quota</th>
                    {daysInMonth.map(day => (
                      <th key={day.toString()} className="p-2 text-[9px] font-black opacity-30 min-w-[34px]">
                        {format(day, 'd')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit, hIdx) => (
                    <motion.tr 
                      key={habit.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: hIdx * 0.05 }}
                      className="border-t border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="sticky left-0 bg-[#040b15] border-r border-white/5 p-5 font-black text-xs z-10">
                        <div className="flex items-center gap-3">
                          <span className="text-xl opacity-80">{habit.icon}</span>
                          {habit.name}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          habit.category === 'Fitness' ? 'bg-blue-accent/10 text-blue-400 border-blue-400/20' :
                          habit.category === 'Study' ? 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20' :
                          habit.category === 'Productivity' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                          habit.category === 'Health' ? 'bg-rose-400/10 text-rose-400 border-rose-400/20' :
                          'bg-white/5 text-white/40 border-white/10'
                        )}>
                          {habit.category}
                        </span>
                      </td>
                      <td className="p-5 text-center font-black text-[10px] opacity-40 uppercase tracking-tighter">{habit.monthlyGoal} Days</td>
                      {daysInMonth.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isCompleted = habit.completedDates.some(d => d.startsWith(dateStr));
                        return (
                          <td key={day.toString()} className="p-1.5 text-center">
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => onToggleDate(habit.id, day)}
                              className={cn(
                                "w-7 h-7 rounded-xl flex items-center justify-center transition-all",
                                isCompleted 
                                  ? "bg-blue-accent text-white shadow-xl shadow-blue-400/30" 
                                  : "bg-white/5 text-transparent hover:bg-white/10"
                              )}
                            >
                              <Check className={cn("w-3.5 h-3.5 transition-transform", isCompleted ? "scale-100" : "scale-0")} strokeWidth={4} />
                            </motion.button>
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* 6. Bar Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-8"
          >
             <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest mb-1">Volumetric Throughput</h3>
                   <p className="text-[10px] opacity-30 font-black uppercase tracking-[0.2em]">Operational consistency analysis</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex gap-3">
                   <TrendingUp className="w-4 h-4 text-blue-accent" />
                   <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">Daily Metrics</span>
                </div>
             </div>
             <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <defs>
                      <linearGradient id="mainBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      fontSize={9} 
                      tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: 900 }} 
                      interval={2}
                      dy={10}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 6 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#040b15] border border-white/10 p-4 rounded-[20px] shadow-2xl backdrop-blur-md">
                              <p className="text-[9px] font-black opacity-30 mb-1.5 uppercase tracking-widest">Cycle Day {payload[0].payload.day}</p>
                              <p className="text-lg font-black">{payload[0].value} Directives</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      radius={[6, 6, 6, 6]} 
                      barSize={14}
                      fill="url(#mainBar)"
                    />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </motion.div>
        </div>

        {/* 7. Side Progress Panel */}
        <div className="flex flex-col gap-8">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="premium-card p-8"
           >
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30 mb-8 px-1">Mastery Gradient</h3>
              <div className="space-y-8">
                {habits.map((habit, idx) => {
                  const monthCompletions = habit.completedDates.filter(d => {
                    const date = new Date(d);
                    return date >= monthStart && date <= monthEnd;
                  }).length;
                  const progress = habit.monthlyGoal > 0 
                    ? Math.min(100, Math.round((monthCompletions / habit.monthlyGoal) * 100)) 
                    : 0;
                  
                  return (
                    <div key={habit.id} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{habit.icon}</span>
                          <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[100px]">{habit.name}</span>
                        </div>
                        <span className="text-[9px] font-black opacity-30 uppercase tracking-widest tabular-nums">
                          {monthCompletions} / {habit.monthlyGoal || 0}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.3 + (idx * 0.05) }}
                          className={cn(
                            "h-full rounded-full transition-colors",
                            progress >= 100 ? "bg-emerald-400" : "bg-blue-accent"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4 }}
             className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 relative overflow-hidden group shadow-2xl"
           >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-blue-accent" />
                </div>
                <h4 className="text-lg font-black leading-tight mb-3 tracking-tight">Executive Protocol</h4>
                <p className="opacity-40 text-[11px] font-medium leading-relaxed tracking-wide">
                  Prioritize <span className="opacity-100 text-white font-black">"Deep Work"</span> sequences. You are approaching a critical momentum milestone.
                </p>
                <button className="mt-8 w-full bg-blue-accent hover:bg-blue-600 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20">
                  Optimize Flow
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-accent/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
           </motion.div>
        </div>
      </div>

    </motion.div>
  );
}
