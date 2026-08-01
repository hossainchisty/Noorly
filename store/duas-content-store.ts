import { create } from 'zustand';

import { DUAS } from '@/features/duas/data';
import type { Dua } from '@/features/duas/data';
import { fetchDuasOnline } from '@/services/duas';

type DuasContentState = {
  duas: Dua[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const useDuasContentStore = create<DuasContentState>((set, get) => ({
  duas: DUAS,
  loading: false,
  error: null,
  refresh: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const online = await fetchDuasOnline();
      set({ duas: online.length ? online : DUAS, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  },
}));
