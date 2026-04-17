import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles, Flame, Trophy, Swords } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: () => void;
}

const SCREENS = [
  {
    title: "Tactical Monitoring",
    desc: "Transform your daily performance into measurable data. Elevate your strategic discipline.",
    icon: Sparkles,
    color: "bg-blue-accent"
  },
  {
    title: "Momentum Protocol",
    desc: "Sustain consistency to maximize efficiency. Unlock advanced potential via daily streaks.",
    icon: Flame,
    color: "bg-orange-500"
  },
  {
    title: "Elite Ascension",
    desc: "Analyze trajectory, earn credentials, and optimize your path to operational mastery.",
    icon: Trophy,
    color: "bg-yellow-500"
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < SCREENS.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-primary/98 backdrop-blur-2xl flex flex-col z-[200]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-accent/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 flex flex-col items-center justify-center px-10 text-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className={cn(
              "w-36 h-36 rounded-[48px] flex items-center justify-center mb-14 shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden",
              SCREENS[current].color
            )}
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
            {React.createElement(SCREENS[current].icon, { className: "w-16 h-16 text-white relative z-10" })}
          </motion.div>
          
          <h2 className="text-4xl font-black tracking-tight text-white mb-6 uppercase tracking-[0.05em]">{SCREENS[current].title}</h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm px-4">{SCREENS[current].desc}</p>
        </motion.div>
      </AnimatePresence>

      <div className="px-10 pb-20 relative z-10">
        <div className="flex justify-center gap-3 mb-14">
          {SCREENS.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 transition-all duration-500 rounded-full",
                i === current ? "w-10 bg-blue-accent" : "w-2 bg-white/10"
              )} 
            />
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={next}
          className="w-full bg-white text-navy-primary py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl active:bg-slate-100 transition-all"
        >
          {current === SCREENS.length - 1 ? 'Commence Operation' : 'Advance Sequence'}
          <ChevronRight className="w-5 h-5 text-blue-accent" strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
}

