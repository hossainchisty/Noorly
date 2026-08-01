import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from '@/store/storage';

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

type CalendarState = {
  fastedDays: string[];
  toggleFastingDay: (isoDate: string) => void;
  isFasted: (isoDate: string) => boolean;
};

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      fastedDays: [],

      toggleFastingDay: (isoDate) => {
        const { fastedDays } = get();
        set({
          fastedDays: fastedDays.includes(isoDate)
            ? fastedDays.filter((d) => d !== isoDate)
            : [...fastedDays, isoDate],
        });
      },

      isFasted: (isoDate) => get().fastedDays.includes(isoDate),
    }),
    {
      name: 'noor-calendar',
      storage: zustandStorage,
    },
  ),
);
