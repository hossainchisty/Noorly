import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from '@/store/storage';

export type TasbeehEntry = {
  id: string;
  phrase: string;
  count: number;
  target: number;
  completedAt: string;
};

type TasbeehState = {
  currentPhrase: string;
  count: number;
  target: number;
  history: TasbeehEntry[];
  customPhrases: string[];

  setPhrase: (phrase: string) => void;
  setTarget: (target: number) => void;
  increment: () => void;
  reset: () => void;
  completeAndLog: (autoReset?: boolean) => void;
  addCustomPhrase: (phrase: string) => void;
  removeCustomPhrase: (phrase: string) => void;
  clearHistory: () => void;
};

export const DEFAULT_TASBEEH_PHRASES = [
  'SubhanAllah',
  'Alhamdulillah',
  'Allahu Akbar',
  'La ilaha illallah',
  'Astaghfirullah',
];

export const useTasbeehStore = create<TasbeehState>()(
  persist(
    (set, get) => ({
      currentPhrase: DEFAULT_TASBEEH_PHRASES[0],
      count: 0,
      target: 33,
      history: [],
      customPhrases: [],

      setPhrase: (currentPhrase) => set({ currentPhrase, count: 0 }),
      setTarget: (target) => set({ target: Math.max(1, target) }),

      increment: () => {
        const { count, target, currentPhrase, completeAndLog } = get();
        const next = count + 1;
        if (next >= target) {
          set({ count: next });
          completeAndLog(true);
        } else {
          set({ count: next });
        }
      },

      reset: () => set({ count: 0 }),

      completeAndLog: (autoReset = false) => {
        const { count, target, currentPhrase, history } = get();
        const entry: TasbeehEntry = {
          id: `${Date.now()}`,
          phrase: currentPhrase,
          count: Math.max(count, target),
          target,
          completedAt: new Date().toISOString(),
        };
        set({
          history: [entry, ...history].slice(0, 200),
          count: autoReset ? 0 : count,
        });
      },

      addCustomPhrase: (phrase) => {
        const trimmed = phrase.trim();
        if (!trimmed) return;
        if (get().customPhrases.includes(trimmed)) return;
        set({ customPhrases: [...get().customPhrases, trimmed] });
      },

      removeCustomPhrase: (phrase) =>
        set({ customPhrases: get().customPhrases.filter((p) => p !== phrase) }),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'noor-tasbeeh',
      storage: zustandStorage,
    },
  ),
);
