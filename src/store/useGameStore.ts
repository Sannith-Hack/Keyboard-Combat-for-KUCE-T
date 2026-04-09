import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Participant {
  id: string;
  name: string;
  email: string;
  college: string;
  roll_number: string;
}

interface Attempt {
  level: number;
  wpm: number;
  accuracy: number;
  timeTaken: number;
  combatScore: number;
}

interface GameState {
  participant: Participant | null;
  currentLevel: number;
  attempts: Attempt[];
  isGameComplete: boolean;
  hasSaved: boolean;
  
  // Actions
  setParticipant: (participant: Participant) => void;
  nextLevel: () => void;
  addAttempt: (attempt: Attempt) => void;
  completeGame: () => void;
  setHasSaved: (val: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      participant: null,
      currentLevel: 0, // 0: Entry, 1: Warmup, 2: Paragraph, 3: Break, 4: Code, 5: Break, 6: Precision, 7: Results
      attempts: [],
      isGameComplete: false,
      hasSaved: false,

      setParticipant: (participant) => set({ participant, currentLevel: 1 }),
      nextLevel: () => set((state) => ({ currentLevel: state.currentLevel + 1 })),
      addAttempt: (attempt) => set((state) => ({ 
        attempts: [...state.attempts, attempt] 
      })),
      completeGame: () => set({ isGameComplete: true }),
      setHasSaved: (val) => set({ hasSaved: val }),
      resetGame: () => set({ 
        participant: null, 
        currentLevel: 0, 
        attempts: [], 
        isGameComplete: false,
        hasSaved: false
      }),
    }),
    {
      name: 'keyboard-combat-storage',
    }
  )
);
