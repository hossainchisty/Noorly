import { useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { getTheme, type ThemeColors, type ColorScheme } from '@/theme';
import { useSettingsStore } from '@/store/settings-store';

export type AppTheme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
};

export function useAppTheme(): AppTheme {
  const system = useSystemColorScheme();
  const preference = useSettingsStore((s) => s.theme);

  return useMemo(() => {
    const scheme: ColorScheme =
      preference === 'system' ? (system ?? 'light') : preference;
    return { scheme, colors: getTheme(scheme), isDark: scheme === 'dark' };
  }, [preference, system]);
}
