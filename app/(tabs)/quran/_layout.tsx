import { Stack } from 'expo-router';

import { ThemedStack } from '@/components/ui/themed-stack';

export default function QuranLayout() {
  return (
    <ThemedStack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[surah]" />
      <Stack.Screen name="bookmarks" />
      <Stack.Screen name="translations" options={{ title: 'Translations' }} />
    </ThemedStack>
  );
}
