import { addDays, format, isSameDay, startOfWeek, subDays } from 'date-fns';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Category = 'Fitness' | 'Study' | 'Productivity' | 'Health' | 'Personal';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  difficulty: Difficulty;
  category: Category;
  monthlyGoal: number;
  xpReward: number;
  streak: number;
  completedDates: string[]; // ISO strings
  createdAt: string;
}

export interface UserProgress {
  level: number;
  xp: number;
  coins: number;
  dailyScore: number;
  lastActive: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  Easy: 10,
  Medium: 20,
  Hard: 40,
};

export function calculateXpForLevel(level: number): number {
  return level * 100 + (level - 1) * 50;
}

export function getWeeklyGrid() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
}

export function getStreakColor(streak: number) {
  if (streak >= 30) return 'text-orange-500';
  if (streak >= 7) return 'text-yellow-500';
  return 'text-white/60';
}
