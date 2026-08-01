import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from '@/store/storage';

type DuasState = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

export const useDuasStore = create<DuasState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (id) => {
        const { favorites } = get();
        set({
          favorites: favorites.includes(id)
            ? favorites.filter((f) => f !== id)
            : [...favorites, id],
        });
      },

      isFavorite: (id) => get().favorites.includes(id),
    }),
    {
      name: 'noor-duas',
      storage: zustandStorage,
    },
  ),
);
