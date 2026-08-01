export const CALC_METHODS = [
  { id: 'MWL', name: 'Muslim World League', apiId: 3 },
  { id: 'ISNA', name: 'Islamic Society of North America', apiId: 2 },
  { id: 'Egyptian', name: 'Egyptian General Authority', apiId: 5 },
  { id: 'Umm Al-Qura', name: 'Umm al-Qura (Makkah)', apiId: 4 },
  { id: 'Karachi', name: 'University of Islamic Sciences, Karachi', apiId: 1 },
  { id: 'Tehran', name: 'Institute of Geophysics, Tehran', apiId: 7 },
  { id: 'Jafari', name: 'Jafari (Shia)', apiId: 0 },
  { id: 'Gulf', name: 'Gulf Region', apiId: 8 },
  { id: 'Kuwait', name: 'Kuwait', apiId: 9 },
  { id: 'Qatar', name: 'Qatar', apiId: 10 },
  { id: 'Singapore', name: 'Majlis Ugama Islam Singapura', apiId: 11 },
  { id: 'Turkey', name: 'Diyanet İşleri Başkanlığı', apiId: 13 },
] as const;

export type CalcMethodId = (typeof CALC_METHODS)[number]['id'];

export function getApiMethodId(methodId: CalcMethodId): number {
  return CALC_METHODS.find((m) => m.id === methodId)?.apiId ?? 3;
}

export function getMethodName(methodId: CalcMethodId): string {
  return CALC_METHODS.find((m) => m.id === methodId)?.name ?? 'Muslim World League';
}

export const MADHAB = {
  shafi: 0,
  hanafi: 1,
} as const;

export type MadhabId = keyof typeof MADHAB;

export function getMadhabId(madhab: 'shafi' | 'hanafi'): number {
  return MADHAB[madhab];
}
