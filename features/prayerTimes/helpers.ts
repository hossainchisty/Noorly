import type { PrayerTimings, PrayerKey } from '@/services/aladhan';

export const PRAYER_ORDER: { key: PrayerKey; i18nKey: string; isPrayer: boolean }[] = [
  { key: 'Fajr', i18nKey: 'fajr', isPrayer: true },
  { key: 'Sunrise', i18nKey: 'sunrise', isPrayer: false },
  { key: 'Dhuhr', i18nKey: 'dhuhr', isPrayer: true },
  { key: 'Asr', i18nKey: 'asr', isPrayer: true },
  { key: 'Maghrib', i18nKey: 'maghrib', isPrayer: true },
  { key: 'Isha', i18nKey: 'isha', isPrayer: true },
];

export function parseTimeToDate(hhmm: string, onDate: Date = new Date()): Date {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  const d = new Date(onDate);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export function formatClock(hhmm: string, use24h: boolean): string {
  const [hRaw, mRaw] = hhmm.split(':').map((n) => parseInt(n, 10));
  const h = hRaw ?? 0;
  const m = mRaw ?? 0;
  if (use24h) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export type NextPrayerInfo = {
  current: { key: PrayerKey; time: Date } | null;
  next: { key: PrayerKey; time: Date };
  isNext: boolean;
};

export function computeNextPrayer(timings: PrayerTimings, now: Date = new Date()): NextPrayerInfo {
  const schedule = PRAYER_ORDER.map(({ key }) => ({
    key,
    time: parseTimeToDate(timings[key], now),
  }));

  let current: NextPrayerInfo['current'] = null;
  let next = schedule[0];

  for (let i = 0; i < schedule.length; i++) {
    const item = schedule[i];
    const prev = i > 0 ? schedule[i - 1] : null;
    if (now >= item.time && (i === schedule.length - 1 || now < schedule[i + 1].time)) {
      current = item;
      next = i < schedule.length - 1 ? schedule[i + 1] : schedule[0];
      break;
    }
    if (now < item.time) {
      next = item;
      break;
    }
  }

  if (!current && now < schedule[0].time) {
    next = schedule[0];
  }

  // Handle past Isha: roll over to tomorrow's Fajr
  if (current && current.key === 'Isha') {
    next = { key: 'Fajr', time: parseTimeToDate(timings.Fajr, new Date(now.getTime() + 86400000)) };
  }

  return { current, next, isNext: current === null };
}

export function formatCountdown(target: Date, now: Date = new Date()): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  let diff = target.getTime() - now.getTime();
  if (diff < 0) diff = 0;
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / 60000) % 60;
  const hours = Math.floor(diff / 3600000);
  return { hours, minutes, seconds };
}

export function countdownString(target: Date, now: Date = new Date()): string {
  const { hours, minutes, seconds } = formatCountdown(target, now);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  if (hours === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
}

export function minutesAgoInMinutes(hhmm: string, now: Date = new Date()): number {
  const target = parseTimeToDate(hhmm, now);
  return Math.floor((target.getTime() - now.getTime()) / 60000);
}

export function prayerI18nKey(key: PrayerKey): string {
  return PRAYER_ORDER.find((p) => p.key === key)?.i18nKey ?? '';
}
