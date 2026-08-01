import { getMadhabId, getApiMethodId } from '@/features/prayerTimes/methods';
import type { CalcMethodId } from '@/features/prayerTimes/methods';

const BASE_URL = 'https://api.aladhan.com/v1';

export type PrayerKey =
  | 'Fajr'
  | 'Sunrise'
  | 'Dhuhr'
  | 'Asr'
  | 'Maghrib'
  | 'Isha'
  | 'Imsak'
  | 'Midnight'
  | 'Firstthird'
  | 'Lastthird'
  | 'Sunset';

export type PrayerTimings = Record<PrayerKey, string>;

export type HijriDate = {
  date: string;
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  holidays?: string[];
};

export type GregorianDate = {
  date: string;
  day: string;
  weekday: { en: string };
  month: { number: number; en: string };
  year: string;
};

export type AladhanDay = {
  timings: PrayerTimings;
  date: {
    readable: string;
    timestamp: string;
    gregorian: GregorianDate;
    hijri: HijriDate;
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: { name: string };
    school: number;
  };
};

type LocationInput =
  | { latitude: number; longitude: number }
  | { city: string; country: string };

type QueryOptions = {
  method: CalcMethodId;
  madhab: 'shafi' | 'hanafi';
};

function buildParams(input: LocationInput, options: QueryOptions) {
  const params = new URLSearchParams();
  if ('latitude' in input) {
    params.set('latitude', String(input.latitude));
    params.set('longitude', String(input.longitude));
  } else {
    params.set('city', input.city);
    params.set('country', input.country);
  }
  params.set('method', String(getApiMethodId(options.method)));
  params.set('school', String(getMadhabId(options.madhab)));
  return params;
}

function formatDateParam(date: Date): string {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
}

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new Error(`Aladhan request failed: ${res.status}`);
  }
  const json = (await res.json()) as { code: number; status: string; data: T };
  if (json.code !== 200) {
    throw new Error(`Aladhan API error: ${json.status}`);
  }
  return json.data;
}

export async function fetchDailyPrayerTimes(
  input: LocationInput,
  options: QueryOptions,
  date: Date = new Date(),
): Promise<AladhanDay> {
  const params = buildParams(input, options);
  return request<AladhanDay>(`/timings/${formatDateParam(date)}?${params.toString()}`);
}

export async function fetchMonthlyPrayerTimes(
  input: LocationInput,
  options: QueryOptions,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1,
): Promise<AladhanDay[]> {
  const params = buildParams(input, options);
  return request<AladhanDay[]>(
    `/calendar/${year}/${month}?${params.toString()}`,
  );
}

export async function fetchHijriForGregorian(date: Date): Promise<AladhanDay['date']['hijri']> {
  const data = await request<AladhanDay['date']>(`/gToH/${formatDateParam(date)}`);
  return data.hijri;
}

export async function fetchGregorianForHijri(day: number, month: number, year: number) {
  return request<{ hijri: HijriDate; gregorian: GregorianDate; readable: string }>(
    `/hToG/${day}-${month}-${year}`,
  );
}

export type RamadanDay = AladhanDay & { ramadanDay: number };

export async function fetchRamadanData(
  input: LocationInput,
  options: QueryOptions,
  ramadanYear: number,
  month: number,
): Promise<RamadanDay[]> {
  const params = buildParams(input, options);
  return request<AladhanDay[]>(
    `/calendar/${ramadanYear}/${month}?${params.toString()}`,
  ).then((days) => days.map((day, i) => ({ ...day, ramadanDay: i + 1 })));
}
