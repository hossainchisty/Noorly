import { fetchGregorianForHijri } from '@/services/aladhan';

export type Occasion = {
  key:
    | 'islamicNewYear'
    | 'ashura'
    | 'mawlid'
    | 'israWalMiraj'
    | 'firstRamadan'
    | 'laylatulQadr'
    | 'eidAlFitr'
    | 'arafah'
    | 'eidAlAdha';
  month: number;
  day: number;
};

export const OCCASIONS: Occasion[] = [
  { key: 'islamicNewYear', month: 1, day: 1 },
  { key: 'ashura', month: 1, day: 10 },
  { key: 'mawlid', month: 3, day: 12 },
  { key: 'israWalMiraj', month: 7, day: 27 },
  { key: 'firstRamadan', month: 9, day: 1 },
  { key: 'laylatulQadr', month: 9, day: 27 },
  { key: 'eidAlFitr', month: 10, day: 1 },
  { key: 'arafah', month: 12, day: 9 },
  { key: 'eidAlAdha', month: 12, day: 10 },
];

export const RAMADAN_MONTH = 9;
export const SHAWWAL_MONTH = 10;

function fromApiDate(dateStr: string): Date {
  const [d, m, y] = dateStr.split('-').map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

export async function getUpcomingOccasions(
  todayHijriYear: number,
  today: Date = new Date(),
  limit: number = 5,
): Promise<{ occasion: Occasion; date: Date; hijriYear: number }[]> {
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const candidates: { occasion: Occasion; date: Date; hijriYear: number }[] = [];

  for (const hijriYear of [todayHijriYear, todayHijriYear + 1]) {
    const results = await Promise.all(
      OCCASIONS.map((occasion) =>
        fetchGregorianForHijri(occasion.day, occasion.month, hijriYear).then(
          (data) => ({ occasion, date: fromApiDate(data.gregorian.date), hijriYear }),
          () => null,
        ),
      ),
    );
    candidates.push(...results.filter((r): r is NonNullable<typeof r> => r !== null));
  }

  return candidates
    .filter((c) => c.date.getTime() >= todayStart.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}

export function isRamadanMonth(hijriMonth: number): boolean {
  return hijriMonth === RAMADAN_MONTH;
}
