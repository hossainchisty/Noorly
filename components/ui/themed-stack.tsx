import { Stack } from 'expo-router';

import { useAppTheme } from '@/hooks/use-app-theme';

export function ThemedStack({ children }: { children?: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      {children}
    </Stack>
  );
}
