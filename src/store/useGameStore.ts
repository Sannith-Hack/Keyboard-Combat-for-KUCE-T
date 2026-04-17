import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Participant {
  id: string;
  name: string;
  roll_number: string;
  email: string;
  college: string;
  competition_id?: string;
}

export interface Attempt {
  level: number;
  wpm: number;
  accuracy: number;
  timeTaken: number;
  combatScore: number;
  competition_id?: string;
}

export interface Competition {
  id: string;
  name: string;
  status: 'draft' | 'live' | 'ended';
  scheduled_start: string;
  created_at?: string;
}

interface GameState {
  // Participant State
  participant: Participant | null;
  currentLevel: number;
  attempts: Attempt[];
  isGameComplete: boolean;
  hasSaved: boolean;
  hasCompletedWarmup: boolean;
  levelTexts: { [key: number]: string };
  selectedWarmupMode: 'game' | 'paragraph';
  
  // Admin & Competition State
  isAdminAuthenticated: boolean;
  activeCompetition: Competition | null;
  
  // Actions
  setParticipant: (participant: Participant) => void;
  nextLevel: () => void;
  addAttempt: (attempt: Attempt) => void;
  completeGame: () => void;
  setHasSaved: (val: boolean) => void;
  setHasCompletedWarmup: (val: boolean) => void;
  resetGame: () => void;
  setLevelText: (level: number, text: string) => void;
  setWarmupMode: (mode: 'game' | 'paragraph') => void;
  
  // Admin Actions
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  setActiveCompetition: (comp: Competition | null) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      participant: null,
      currentLevel: 0,
      attempts: [],
      isGameComplete: false,
      hasSaved: false,
      hasCompletedWarmup: false,
      levelTexts: {},
      selectedWarmupMode: 'game',
      
      isAdminAuthenticated: false,
      activeCompetition: null,

      setParticipant: (participant) => set({ participant, currentLevel: 1 }),
      nextLevel: () => set((state) => ({ currentLevel: state.currentLevel + 1 })),
      addAttempt: (attempt) => set((state) => ({ 
        attempts: [...state.attempts, attempt] 
      })),
      completeGame: () => set({ isGameComplete: true }),
      setHasSaved: (val) => set({ hasSaved: val }),
      setHasCompletedWarmup: (val) => set({ hasCompletedWarmup: val }),
      setLevelText: (level, text) => set((state) => ({
        levelTexts: { ...state.levelTexts, [level]: text }
      })),
      setWarmupMode: (mode) => set({ selectedWarmupMode: mode }),
      resetGame: () => set({ 
        participant: null, 
        currentLevel: 0, 
        attempts: [], 
        isGameComplete: false, 
        hasSaved: false,
        hasCompletedWarmup: false,
        levelTexts: {},
        selectedWarmupMode: 'game'
      }),

      login: (user, pass) => {
        const adminUser = import.meta.env.VITE_ADMIN_USER;
        const adminPass = import.meta.env.VITE_ADMIN_PASS;
        if (user === adminUser && pass === adminPass) {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAdminAuthenticated: false }),
      setActiveCompetition: (comp) => set({ activeCompetition: comp }),
    }),
    {
      name: 'keyboard-combat-storage',
      partialize: (state) => ({ 
        participant: state.participant,
        currentLevel: state.currentLevel,
        attempts: state.attempts,
        isGameComplete: state.isGameComplete,
        isAdminAuthenticated: state.isAdminAuthenticated,
        activeCompetition: state.activeCompetition,
        levelTexts: state.levelTexts,
        selectedWarmupMode: state.selectedWarmupMode,
        hasCompletedWarmup: state.hasCompletedWarmup
      }),
    }
  )
);
