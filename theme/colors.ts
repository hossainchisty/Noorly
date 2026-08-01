export const palette = {
  emerald900: '#0B3D2E',
  emerald800: '#0E4A37',
  emerald700: '#0E5A44',
  emerald600: '#146B52',
  emerald500: '#1B8363',
  emerald400: '#2FA17D',
  emerald300: '#6FC5A6',
  emerald100: '#D8EFE6',
  gold700: '#A9841C',
  gold600: '#C9A227',
  gold500: '#D9B53C',
  gold300: '#F0D98A',
  gold100: '#FAF0D0',
  cream: '#FAF6EC',
  creamDark: '#F3EDDD',
  white: '#FFFFFF',
  nearBlack: '#0C0F0E',
  surfaceDark: '#121917',
  surfaceElevDark: '#1A221F',
  charcoal: '#1C1917',
  stone: '#57534E',
  stoneLight: '#A8A29E',
  danger: '#B91C1C',
} as const;

export type ThemeColors = {
  primary: string;
  primarySoft: string;
  primaryText: string;
  accent: string;
  accentSoft: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  success: string;
  danger: string;
  shadow: string;
};

export const lightTheme: ThemeColors = {
  primary: palette.emerald800,
  primarySoft: palette.emerald100,
  primaryText: palette.emerald900,
  accent: palette.gold600,
  accentSoft: palette.gold100,
  background: palette.cream,
  surface: palette.white,
  surfaceElevated: palette.creamDark,
  border: '#E7E0D2',
  text: palette.charcoal,
  textMuted: palette.stone,
  textOnPrimary: palette.white,
  success: palette.emerald500,
  danger: palette.danger,
  shadow: '#1C1917',
};

export const darkTheme: ThemeColors = {
  primary: palette.emerald300,
  primarySoft: '#143027',
  primaryText: palette.emerald300,
  accent: palette.gold300,
  accentSoft: '#3A321C',
  background: palette.nearBlack,
  surface: palette.surfaceDark,
  surfaceElevated: palette.surfaceElevDark,
  border: '#22302B',
  text: '#EDEBE4',
  textMuted: '#9AA39E',
  textOnPrimary: palette.nearBlack,
  success: palette.emerald400,
  danger: '#EF4444',
  shadow: '#000000',
};

export type ColorScheme = 'light' | 'dark';

export function getTheme(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? darkTheme : lightTheme;
}
