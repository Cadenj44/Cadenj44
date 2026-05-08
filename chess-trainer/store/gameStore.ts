import { create } from 'zustand';
import { UserProgress } from '@/types';
import { MAX_HEARTS, XP_PER_LEVEL, getLevelFromXP } from '@/constants/curriculum';

interface GameState {
  progress: UserProgress | null;
  isLoading: boolean;
  setProgress: (p: UserProgress) => void;
  addXP: (amount: number) => void;
  useHeart: () => boolean;
  regenHearts: () => void;
  incrementStreak: () => void;
  completeLesson: (lessonId: string, xp: number) => void;
  completePuzzle: (puzzleId: string, xp: number) => void;
  unlockUnit: (unitId: string) => void;
  reset: () => void;
}

const DEFAULT_PROGRESS: UserProgress = {
  userId: '',
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: '',
  completedLessons: [],
  completedPuzzles: [],
  unlockedUnits: ['basics'],
  hearts: MAX_HEARTS,
  maxHearts: MAX_HEARTS,
  gems: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  progress: null,
  isLoading: true,

  setProgress: (p) => set({ progress: p, isLoading: false }),

  addXP: (amount) => set((state) => {
    if (!state.progress) return state;
    const newXP = state.progress.xp + amount;
    return {
      progress: {
        ...state.progress,
        xp: newXP,
        level: getLevelFromXP(newXP),
      },
    };
  }),

  useHeart: () => {
    const { progress } = get();
    if (!progress || progress.hearts <= 0) return false;
    set({ progress: { ...progress, hearts: progress.hearts - 1 } });
    return true;
  },

  regenHearts: () => set((state) => {
    if (!state.progress) return state;
    return { progress: { ...state.progress, hearts: MAX_HEARTS } };
  }),

  incrementStreak: () => set((state) => {
    if (!state.progress) return state;
    const today = new Date().toISOString().slice(0, 10);
    const last = state.progress.lastActiveDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = last === yesterday
      ? state.progress.streak + 1
      : last === today
        ? state.progress.streak
        : 1;
    return {
      progress: {
        ...state.progress,
        streak: newStreak,
        lastActiveDate: today,
      },
    };
  }),

  completeLesson: (lessonId, xp) => set((state) => {
    if (!state.progress) return state;
    const already = state.progress.completedLessons.includes(lessonId);
    if (already) return state;
    const newXP = state.progress.xp + xp;
    return {
      progress: {
        ...state.progress,
        xp: newXP,
        level: getLevelFromXP(newXP),
        completedLessons: [...state.progress.completedLessons, lessonId],
      },
    };
  }),

  completePuzzle: (puzzleId, xp) => set((state) => {
    if (!state.progress) return state;
    const already = state.progress.completedPuzzles.includes(puzzleId);
    const bonus = already ? Math.floor(xp * 0.25) : xp;
    const newXP = state.progress.xp + bonus;
    return {
      progress: {
        ...state.progress,
        xp: newXP,
        level: getLevelFromXP(newXP),
        completedPuzzles: already
          ? state.progress.completedPuzzles
          : [...state.progress.completedPuzzles, puzzleId],
      },
    };
  }),

  unlockUnit: (unitId) => set((state) => {
    if (!state.progress) return state;
    if (state.progress.unlockedUnits.includes(unitId)) return state;
    return {
      progress: {
        ...state.progress,
        unlockedUnits: [...state.progress.unlockedUnits, unitId],
      },
    };
  }),

  reset: () => set({ progress: { ...DEFAULT_PROGRESS }, isLoading: false }),
}));
