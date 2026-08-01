import { Platform } from 'react-native';

import i18n from '@/i18n';
import type { PrayerTimings, PrayerKey } from '@/services/aladhan';
import { PRAYER_ORDER, hhmmToMinutes } from '@/features/prayerTimes/helpers';
import { getNotifications } from './sdk';

const PRAYER_CHANNEL_ID = 'prayers';
const DAILY_CHANNEL_ID = 'daily';

export async function ensureNotificationChannels() {
  const Notifications = getNotifications();
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
    name: 'Prayer times',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
  await Notifications.setNotificationChannelAsync(DAILY_CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function getNotificationPermission(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  return current.granted;
}

export type PrayerLabels = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

const PRAYER_NOTIFICATION_PREFIX = 'prayer:';
const JUMUAH_NOTIFICATION_PREFIX = 'jumuah:';
const DHIKR_NOTIFICATION_PREFIX = 'dhikr:';

export async function cancelPrayerReminders() {
  const Notifications = getNotifications();
  if (!Notifications) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = scheduled
    .filter((n) => n.identifier.startsWith(PRAYER_NOTIFICATION_PREFIX))
    .map((n) => n.identifier);
  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

export async function cancelRemindersWithPrefix(prefix: string) {
  const Notifications = getNotifications();
  if (!Notifications) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = scheduled
    .filter((n) => n.identifier.startsWith(prefix))
    .map((n) => n.identifier);
  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

/**
 * Schedules a daily repeating reminder for each prayer, `minutesBefore` minutes
 * before the prayer time. Prayer times shift daily, so callers should cancel
 * and re-schedule whenever timings change.
 */
export async function schedulePrayerReminders(
  timings: PrayerTimings,
  minutesBefore: number,
  labels: PrayerLabels,
): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications) return;
  await cancelPrayerReminders();
  if (!(await getNotificationPermission())) return;

  for (const { key } of PRAYER_ORDER) {
    if (!timings[key]) continue;
    const minutes = hhmmToMinutes(timings[key]) - minutesBefore;
    if (minutes < 0) continue;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    await Notifications.scheduleNotificationAsync({
      identifier: `${PRAYER_NOTIFICATION_PREFIX}${key}`,
      content: {
        title: labels[key.toLowerCase() as keyof PrayerLabels],
        body: i18n.t('settings.minutesBefore', { minutes: minutesBefore }),
        sound: 'default',
        data: { type: 'prayer', key },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: Platform.OS === 'android' ? PRAYER_CHANNEL_ID : undefined,
      },
    });
  }
}

/**
 * Schedules a reminder that repeats weekly on Friday at the given time.
 * Uses a WEEKLY trigger on iOS and explicit one-off scheduling on Android.
 */
export async function scheduleJumuahReminder(hour: number, minute: number, title: string) {
  const Notifications = getNotifications();
  if (!Notifications) return;
  await cancelRemindersWithPrefix(JUMUAH_NOTIFICATION_PREFIX);

  const triggerBase = { hour, minute };

  if (Platform.OS === 'ios') {
    await Notifications.scheduleNotificationAsync({
      identifier: `${JUMUAH_NOTIFICATION_PREFIX}weekly`,
      content: {
        title,
        body: 'Jumu\u2019ah Mubarak',
        sound: 'default',
        data: { type: 'jumuah' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 6,
        ...triggerBase,
      },
    });
    return;
  }

  // Android: schedule the next 52 Fridays explicitly.
  const now = new Date();
  for (let week = 0; week < 52; week++) {
    const date = new Date(now);
    const daysToFriday = (5 - now.getDay() + 7) % 7;
    date.setDate(now.getDate() + daysToFriday + week * 7);
    date.setHours(hour, minute, 0, 0);
    if (date.getTime() <= now.getTime()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `${JUMUAH_NOTIFICATION_PREFIX}${week}`,
      content: {
        title,
        body: 'Jumu\u2019ah Mubarak',
        sound: 'default',
        data: { type: 'jumuah' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: DAILY_CHANNEL_ID,
      },
    });
  }
}

export async function scheduleDailyDhikr(hour: number, minute: number, title: string, body: string) {
  const Notifications = getNotifications();
  if (!Notifications) return;
  await cancelRemindersWithPrefix(DHIKR_NOTIFICATION_PREFIX);
  await Notifications.scheduleNotificationAsync({
    identifier: `${DHIKR_NOTIFICATION_PREFIX}daily`,
    content: {
      title,
      body,
      sound: 'default',
      data: { type: 'dhikr' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? DAILY_CHANNEL_ID : undefined,
    },
  });
}

export async function cancelAllNoorReminders() {
  await cancelPrayerReminders();
  await cancelRemindersWithPrefix(JUMUAH_NOTIFICATION_PREFIX);
  await cancelRemindersWithPrefix(DHIKR_NOTIFICATION_PREFIX);
}
