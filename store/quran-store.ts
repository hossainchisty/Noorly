import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from '@/store/storage';

export type QuranLocation = {
  surah: number;
  ayah: number;
  timestamp: number;
};

export type QuranBookmark = QuranLocation & {
  id: string;
};

type QuranState = {
  bookmarks: QuranBookmark[];
  lastRead: QuranLocation | null;
  reciter: string;
  translationLanguage: string;
  tafsirEdition: string;

  addBookmark: (surah: number, ayah: number) => void;
  removeBookmark: (surah: number, ayah: number) => void;
  setLastRead: (surah: number, ayah: number) => void;
  setReciter: (reciter: string) => void;
  setTranslationLanguage: (language: string) => void;
  setTafsirEdition: (tafsirEdition: string) => void;
};

export const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman as-Sudais' },
  { id: 'ar.husary', name: 'Mahmoud Khalil al-Husary' },
  { id: 'ar.mahermuaiqly', name: 'Maher al-Muaiqly' },
  { id: 'ar.ahmedajamy', name: 'Ahmed al-Ajmi' },
  { id: 'ar.saoodshuraym', name: 'Saud ash-Shuraym' },
] as const;

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      lastRead: null,
      reciter: RECITERS[0].id,
      translationLanguage: 'en.sahih',
      tafsirEdition: '',

      addBookmark: (surah, ayah) => {
        const { bookmarks } = get();
        if (bookmarks.some((b) => b.surah === surah && b.ayah === ayah)) return;
        set({
          bookmarks: [
            { id: `b-${surah}-${ayah}`, surah, ayah, timestamp: Date.now() },
            ...bookmarks,
          ],
        });
      },

      removeBookmark: (surah, ayah) =>
        set({
          bookmarks: get().bookmarks.filter((b) => !(b.surah === surah && b.ayah === ayah)),
        }),

      setLastRead: (surah, ayah) => set({ lastRead: { surah, ayah, timestamp: Date.now() } }),
      setReciter: (reciter) => set({ reciter }),
      setTranslationLanguage: (translationLanguage) => set({ translationLanguage }),
      setTafsirEdition: (tafsirEdition) => set({ tafsirEdition }),
    }),
    {
      name: 'noor-quran',
      storage: zustandStorage,
    },
  ),
);
