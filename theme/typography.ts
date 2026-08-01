import { Platform } from 'react-native';

export const fontFamily = {
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
  amiri: 'Amiri_400Regular',
  amiriBold: 'Amiri_700Bold',
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 44,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
};

export const letterSpacing = {
  tight: -0.4,
  normal: 0,
  wide: 0.6,
};

export type FontSizeKey = keyof typeof fontSize;
