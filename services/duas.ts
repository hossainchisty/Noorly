import { DUAS } from '@/features/duas/data';
import type { Dua, DuaCategory } from '@/features/duas/data';

const BASE_URL = 'https://www.ummahapi.com/api/duas';

const API_TO_APP_CATEGORY: Record<string, DuaCategory> = {
  morning: 'morning',
  evening: 'evening',
  wudu: 'wudu',
  prayer: 'prayer',
  after_prayer: 'afterPrayer',
  sleep: 'sleeping',
  food: 'food',
  travel: 'travel',
  home: 'home',
  masjid: 'enteringMosque',
  distress: 'distress',
  forgiveness: 'forgiveness',
  illness: 'illness',
  weather: 'weather',
  knowledge: 'knowledge',
  parents: 'parents',
  guidance: 'guidance',
  gratitude: 'gratitude',
  protection: 'protection',
  dhikr: 'dhikr',
  marriage: 'marriage',
  hajj: 'hajj',
  grief: 'grief',
  children: 'children',
  business: 'business',
  night_prayer: 'nightPrayer',
  quran_recitation: 'quran',
};

function normalize(raw: any): Dua | null {
  const category = API_TO_APP_CATEGORY[raw?.category];
  if (!category) return null;
  return {
    id: `${category}-${raw.id}`,
    category,
    title: raw.title,
    arabic: raw.arabic,
    translation: raw.translation,
    source: raw.source ?? '',
    transliteration: raw.transliteration,
    repeat: raw.repeat,
  };
}

async function fetchWithTimeout(input: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(input, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export function getDuas(): Dua[] {
  return DUAS;
}

const DUAS_API_CATEGORY_IDS = [
  'morning', 'evening', 'wudu', 'prayer', 'after_prayer', 'sleep', 'food', 'travel',
  'home', 'masjid', 'distress', 'forgiveness', 'illness', 'weather', 'knowledge',
  'parents', 'guidance', 'gratitude', 'protection', 'dhikr', 'marriage', 'hajj',
  'grief', 'children', 'business', 'night_prayer', 'quran_recitation',
];

export async function fetchDuasOnline(): Promise<Dua[]> {
  const results = await Promise.allSettled(
    DUAS_API_CATEGORY_IDS.map((id) => fetchWithTimeout(`${BASE_URL}/category/${id}`, 12000)),
  );
  const duas: Dua[] = [];
  for (const r of results) {
    if (r.status !== 'fulfilled' || !r.value.ok) continue;
    const json = (await r.value.json()) as {
      success: boolean;
      data?: { duas?: any[] };
    };
    if (json.success && Array.isArray(json.data?.duas)) {
      for (const d of json.data.duas) {
        const norm = normalize(d);
        if (norm) duas.push(norm);
      }
    }
  }
  return duas;
}
