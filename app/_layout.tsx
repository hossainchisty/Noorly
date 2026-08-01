import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { usePrayerSync } from '@/features/prayerTimes/usePrayerSync';
import {
  getNotifications,
  type NotificationResponse,
} from '@/features/notifications/sdk';
import { useAppTheme } from '@/hooks/use-app-theme';
import { changeLanguage, initI18n } from '@/i18n';
import { useSettingsStore } from '@/store/settings-store';

initI18n(useSettingsStore.getState().language);

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
  });

  const { colors, isDark } = useAppTheme();
  const language = useSettingsStore((s) => s.language);

  usePrayerSync();
  useNotificationObserver();

  useEffect(() => {
    changeLanguage(language);
  }, [language]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  const navTheme = (isDark ? DarkTheme : DefaultTheme) as typeof DarkTheme;
  navTheme.colors = {
    ...navTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  };

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function useNotificationObserver() {
  useEffect(() => {
    const Notifications = getNotifications();
    if (!Notifications) return;

    function redirect(response: NotificationResponse) {
      const data = response.notification.request.content.data as { url?: string } | undefined;
      const url = data?.url;
      if (typeof url === 'string' && url.startsWith('/')) {
        router.push(url as never);
      }
    }

    Notifications.getLastNotificationResponseAsync?.().then((response) => {
      if (response) redirect(response);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(redirect);

    return () => subscription.remove();
  }, []);
}
