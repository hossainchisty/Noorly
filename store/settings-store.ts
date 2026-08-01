import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { changeLanguage, type AppLanguage } from '@/i18n';
import { useQuranStore } from '@/store/quran-store';
import { zustandStorage } from '@/store/storage';
import type { CalcMethodId } from '@/features/prayerTimes/methods';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Madhab = 'shafi' | 'hanafi';

export type SavedLocation = {
  latitude: number;
  longitude: number;
  city?: string | null;
  country?: string | null;
  label?: string | null;
};

type SettingsState = {
  language: AppLanguage;
  theme: ThemePreference;
  calcMethod: CalcMethodId;
  madhab: Madhab;
  use24h: boolean;

  notificationsEnabled: boolean;
  prayerRemindersEnabled: boolean;
  reminderMinutes: number;
  jumuahReminderEnabled: boolean;
  dailyDhikrEnabled: boolean;

  autoLocation: boolean;
  savedLocation: SavedLocation | null;
  manualCity: string | null;
  manualCountry: string | null;

  onboardingComplete: boolean;
  isPremium: boolean;

  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: ThemePreference) => void;
  setCalcMethod: (method: CalcMethodId) => void;
  setMadhab: (madhab: Madhab) => void;
  setUse24h: (use24h: boolean) => void;

  setNotificationsEnabled: (enabled: boolean) => void;
  setPrayerRemindersEnabled: (enabled: boolean) => void;
  setReminderMinutes: (minutes: number) => void;
  setJumuahReminderEnabled: (enabled: boolean) => void;
  setDailyDhikrEnabled: (enabled: boolean) => void;

  setAutoLocation: (enabled: boolean) => void;
  setSavedLocation: (location: SavedLocation | null) => void;
  setManualCity: (city: string, country: string) => void;

  completeOnboarding: () => void;
  resetApp: () => void;
  setPremium: (isPremium: boolean) => void;
};

const DEFAULT_METHOD: CalcMethodId = 'MWL';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'en',
      theme: 'system',
      calcMethod: DEFAULT_METHOD,
      madhab: 'shafi',
      use24h: false,

      notificationsEnabled: true,
      prayerRemindersEnabled: true,
      reminderMinutes: 15,
      jumuahReminderEnabled: true,
      dailyDhikrEnabled: false,

      autoLocation: true,
      savedLocation: null,
      manualCity: null,
      manualCountry: null,

      onboardingComplete: false,
      isPremium: false,

      setLanguage: (language) => {
        set({ language });
        changeLanguage(language);
        if (language === 'bn') {
          const current = useQuranStore.getState().translationLanguage;
          if (current.startsWith('en.')) {
            useQuranStore.getState().setTranslationLanguage('bn.bengali');
          }
        }
      },
      setTheme: (theme) => set({ theme }),
      setCalcMethod: (calcMethod) => {
        set({ calcMethod });
        get().setPrayerRemindersEnabled(get().prayerRemindersEnabled);
      },
      setMadhab: (madhab) => {
        set({ madhab });
        get().setPrayerRemindersEnabled(get().prayerRemindersEnabled);
      },
      setUse24h: (use24h) => set({ use24h }),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setPrayerRemindersEnabled: (enabled) => set({ prayerRemindersEnabled: enabled }),
      setReminderMinutes: (minutes) => set({ reminderMinutes: minutes }),
      setJumuahReminderEnabled: (enabled) => set({ jumuahReminderEnabled: enabled }),
      setDailyDhikrEnabled: (enabled) => set({ dailyDhikrEnabled: enabled }),

      setAutoLocation: (enabled) => set({ autoLocation: enabled }),
      setSavedLocation: (savedLocation) => set({ savedLocation }),
      setManualCity: (city, country) =>
        set({ manualCity: city, manualCountry: country, autoLocation: false }),

      completeOnboarding: () => set({ onboardingComplete: true }),
      resetApp: () => {
        useSettingsStore.persist.clearStorage();
        set({
          language: 'en',
          theme: 'system',
          calcMethod: DEFAULT_METHOD,
          madhab: 'shafi',
          use24h: false,
          notificationsEnabled: true,
          prayerRemindersEnabled: true,
          reminderMinutes: 15,
          jumuahReminderEnabled: true,
          dailyDhikrEnabled: false,
          autoLocation: true,
          savedLocation: null,
          manualCity: null,
          manualCountry: null,
          onboardingComplete: false,
          isPremium: false,
        });
      },
      setPremium: (isPremium) => set({ isPremium }),
    }),
    {
      name: 'noor-settings',
      storage: zustandStorage,
    },
  ),
);
