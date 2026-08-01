import { EMBEDDED_SURAHS } from '@/services/quran-data';

const BASE_URL = 'https://api.alquran.cloud/v1';
export const AUDIO_CDN = 'https://cdn.islamic.network/quran/audio/64';

const EVERYAYAH_BASE = 'https://everyayah.com/data';

const EVERYAYAH_RECITERS: Record<string, string> = {
  'ar.alafasy': 'Alafasy_128kbps',
  'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_64kbps',
  'ar.husary': 'Husary_128kbps',
  'ar.mahermuaiqly': 'Maher_AlMuaiqly_64kbps',
  'ar.ahmedajamy': 'ahmed_ibn_ali_al_ajamy_128kbps',
  'ar.saoodshuraym': 'Saood_ash-Shuraym_128kbps',
};

const pad3 = (n: number) => String(n).padStart(3, '0');

export type SurahMeta = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
};

export type Ayah = {
  number: number;
  numberInSurah: number;
  juz: number;
  text: string;
  sajda?: { id: number; recommended: boolean; obligatory: boolean };
};

export type TafsirEdition = {
  id: string;
  name: string;
  language: 'ar';
};

export const TAFSIR_EDITIONS: TafsirEdition[] = [
  { id: 'ar.muyassar', name: 'Tafsir al-Muyassar', language: 'ar' },
  { id: 'ar.jalalayn', name: 'Tafsir al-Jalalayn', language: 'ar' },
  { id: 'ar.qurtubi', name: 'Tafsir al-Qurtubi', language: 'ar' },
  { id: 'ar.baghawi', name: 'Tafsir al-Baghawi', language: 'ar' },
  { id: 'ar.miqbas', name: 'Tafsir al-Miqbas', language: 'ar' },
  { id: 'ar.waseet', name: 'Tafsir al-Waseet', language: 'ar' },
];

export type SurahEditionResponse = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
  edition: { identifier: string; language: string; type: string };
};

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Quran API request failed: ${res.status}`);
    const json = (await res.json()) as { code: number; status: string; data: T };
    if (json.code !== 200) throw new Error(`Quran API error: ${json.status}`);
    return json.data;
  } finally {
    clearTimeout(timer);
  }
}

let surahListCache: SurahMeta[] | null = EMBEDDED_SURAHS;

export async function fetchSurahList(): Promise<SurahMeta[]> {
  try {
    const data = await request<{ count?: number; surahs?: SurahMeta[] }>('/surah');
    const list = Array.isArray(data?.surahs) ? data.surahs : null;
    if (list) surahListCache = list;
    return list ?? surahListCache ?? EMBEDDED_SURAHS;
  } catch {
    return surahListCache ?? EMBEDDED_SURAHS;
  }
}

export function fetchSurahListCached(): Promise<SurahMeta[]> {
  return Promise.resolve(surahListCache ?? EMBEDDED_SURAHS);
}

export function getSurahMeta(surahNumber: number): SurahMeta | null {
  return surahListCache?.find((s) => s.number === surahNumber) ?? null;
}

export async function fetchSurah(
  surahNumber: number,
  edition: string = 'quran-uthmani',
): Promise<SurahEditionResponse> {
  return request<SurahEditionResponse>(`/surah/${surahNumber}/${edition}`);
}

export async function fetchSurahAudio(surahNumber: number, reciter: string) {
  return request<{ surah: { number: number; ayahs: { number: number }[] }; audio: { segments: number[][][] } }>(
    `/surah/${surahNumber}/ar.alafasy`,
  ).catch(() => null);
}

const tafsirCache = new Map<string, string>();

type TafsirResponse = { text: string; edition: { identifier: string } };

export async function fetchTafsir(
  surahNumber: number,
  ayahNumber: number,
  edition: string,
): Promise<string | null> {
  if (!edition) return null;
  const key = `${edition}|${surahNumber}:${ayahNumber}`;
  if (tafsirCache.has(key)) return tafsirCache.get(key) ?? null;
  const text = await request<TafsirResponse>(
    `/ayah/${surahNumber}:${ayahNumber}/${edition}`,
  ).then((d) => d?.text ?? null).catch(() => null);
  if (text) tafsirCache.set(key, text);
  return text;
}


export function getSurahAudioUrl(surahNumber: number, reciter: string, ayah?: number): string {
  if (ayah != null) {
    const folder = EVERYAYAH_RECITERS[reciter];
    if (folder) {
      return `${EVERYAYAH_BASE}/${folder}/${pad3(surahNumber)}${pad3(ayah)}.mp3`;
    }
  }
  return `${AUDIO_CDN}/${reciter}/${surahNumber}.mp3`;
}

export async function searchQuran(
  keyword: string,
  language: string = 'en',
): Promise<{ count: number; matches: { text: string; surah: { number: number; englishName: string }; numberInSurah: number }[] }> {
  const data = await request<{ count: number; matches: { text: string; surah: { number: number; englishName: string }; numberInSurah: number }[] }>(
    `/search/${encodeURIComponent(keyword)}/${language}`,
  );
  return data;
}

export const TRANSLATIONS = [
  { id: 'en.sahih', language: 'en', name: 'Saheeh International' },
  { id: 'en.pickthall', language: 'en', name: 'Pickthall' },
  { id: 'en.yusufali', language: 'en', name: 'Yusuf Ali' },
  { id: 'en.asad', language: 'en', name: 'Muhammad Asad' },
  { id: 'bn.bengali', language: 'bn', name: 'Bengali (Muhiuddin Khan)' },
  { id: 'bn.hoque', language: 'bn', name: 'Bengali (Zohurul Hoque)' },
  { id: 'ur.jalandhry', language: 'ur', name: 'Jalandhry (Urdu)' },
  { id: 'fr.hamidullah', language: 'fr', name: 'Hamidullah (French)' },
  { id: 'de.bubenheim', language: 'de', name: 'Bubenheim (German)' },
  { id: 'tr.diyanet', language: 'tr', name: 'Diyanet (Turkish)' },
] as const;
