import { create } from 'zustand';

import {
  fetchDailyPrayerTimes,
  fetchHijriForGregorian,
  type AladhanDay,
  type HijriDate,
} from '@/services/aladhan';
import type { CalcMethodId } from '@/features/prayerTimes/methods';
import type { Madhab } from '@/store/settings-store';

type FetchInput = {
  latitude: number;
  longitude: number;
  method: CalcMethodId;
  madhab: Madhab;
  city?: string | null;
  country?: string | null;
};

type PrayerTimesState = {
  day: AladhanDay | null;
  hijri: HijriDate | null;
  loading: boolean;
  error: string | null;
  lastFetchedKey: string | null;

  fetchTimes: (input: FetchInput) => Promise<void>;
  clear: () => void;
};

function inputKey(input: FetchInput): string {
  return JSON.stringify([input.latitude, input.longitude, input.method, input.madhab]);
}

export const usePrayerTimesStore = create<PrayerTimesState>((set, get) => ({
  day: null,
  hijri: null,
  loading: false,
  error: null,
  lastFetchedKey: null,

  fetchTimes: async (input) => {
    const key = inputKey(input);
    if (get().loading || get().lastFetchedKey === key) return;

    set({ loading: true, error: null, lastFetchedKey: key });

    try {
      const location = { latitude: input.latitude, longitude: input.longitude };
      const [day, hijri] = await Promise.all([
        fetchDailyPrayerTimes(location, { method: input.method, madhab: input.madhab }),
        fetchHijriForGregorian(new Date()),
      ]);
      set({ day, hijri, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        lastFetchedKey: null,
      });
    }
  },

  clear: () => set({ day: null, hijri: null, error: null, lastFetchedKey: null }),
}));
