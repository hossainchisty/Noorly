import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DEFAULT_LOCATION,
  geocodeCity,
  getCurrentLocation,
  type ResolvedLocation,
} from '@/features/location/location';
import {
  cancelAllNoorReminders,
  ensureNotificationChannels,
  scheduleJumuahReminder,
  schedulePrayerReminders,
} from '@/features/notifications/prayer-reminders';
import { usePrayerTimesStore } from '@/store/prayer-times-store';
import { useSettingsStore } from '@/store/settings-store';

export function usePrayerSync() {
  const { t } = useTranslation();

  const day = usePrayerTimesStore((s) => s.day);
  const fetchTimes = usePrayerTimesStore((s) => s.fetchTimes);
  const clearTimes = usePrayerTimesStore((s) => s.clear);

  const calcMethod = useSettingsStore((s) => s.calcMethod);
  const madhab = useSettingsStore((s) => s.madhab);
  const autoLocation = useSettingsStore((s) => s.autoLocation);
  const savedLocation = useSettingsStore((s) => s.savedLocation);
  const manualCity = useSettingsStore((s) => s.manualCity);
  const manualCountry = useSettingsStore((s) => s.manualCountry);
  const prayerRemindersEnabled = useSettingsStore((s) => s.prayerRemindersEnabled);
  const reminderMinutes = useSettingsStore((s) => s.reminderMinutes);
  const jumuahReminderEnabled = useSettingsStore((s) => s.jumuahReminderEnabled);
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const lastScheduledKey = useRef<string | null>(null);

  const sync = useCallback(async () => {
    if (!useSettingsStore.getState().onboardingComplete) return;

    let input:
      | { latitude: number; longitude: number; city?: string | null; country?: string | null } =
      DEFAULT_LOCATION;
    let locationPromise: Promise<ResolvedLocation | null> | null = null;

    if (!autoLocation && manualCity) {
      const geocoded = await geocodeCity(manualCity, manualCountry ?? '').catch(() => null);
      if (geocoded) {
        input = { ...geocoded, city: manualCity, country: manualCountry ?? '' };
      }
    } else if (savedLocation) {
      input = {
        latitude: savedLocation.latitude,
        longitude: savedLocation.longitude,
        city: savedLocation.city,
        country: savedLocation.country,
      };
    } else {
      locationPromise = getCurrentLocation().catch(() => null);
    }

    await fetchTimes({ ...input, method: calcMethod, madhab });

    if (locationPromise) {
      const current = await locationPromise;
      if (current) {
        useSettingsStore.getState().setSavedLocation(current);
        await fetchTimes({
          latitude: current.latitude,
          longitude: current.longitude,
          city: current.city,
          country: current.country,
          method: calcMethod,
          madhab,
        });
      }
    }
  }, [autoLocation, calcMethod, madhab, manualCity, manualCountry, savedLocation, fetchTimes]);

  useEffect(() => {
    if (!onboardingComplete) return;
    ensureNotificationChannels().catch(() => {});
    sync().catch(() => {});
  }, [sync, onboardingComplete]);

  useEffect(() => {
    if (!day || !onboardingComplete) return;
    const scheduleKey = JSON.stringify([
      day.date.gregorian.date,
      prayerRemindersEnabled,
      reminderMinutes,
      jumuahReminderEnabled,
      calcMethod,
      madhab,
    ]);
    if (lastScheduledKey.current === scheduleKey) return;
    lastScheduledKey.current = scheduleKey;

    const labels = {
      fajr: t('prayers.fajr'),
      sunrise: t('prayers.sunrise'),
      dhuhr: t('prayers.dhuhr'),
      asr: t('prayers.asr'),
      maghrib: t('prayers.maghrib'),
      isha: t('prayers.isha'),
    };

    const run = async () => {
      if (!prayerRemindersEnabled) {
        await cancelAllNoorReminders();
        return;
      }
      await schedulePrayerReminders(day.timings, reminderMinutes, labels);
      if (jumuahReminderEnabled) {
        await scheduleJumuahReminder(12, 0, t('prayers.dhuhr'));
      }
    };
    run().catch(() => {});
  }, [day, calcMethod, madhab, t, prayerRemindersEnabled, reminderMinutes, jumuahReminderEnabled, onboardingComplete]);

  return { day, sync, clearTimes };
}
