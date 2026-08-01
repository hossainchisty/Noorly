import { Stack } from 'expo-router';

import { ThemedStack } from '@/components/ui/themed-stack';

export default function MoreLayout() {
  return (
    <ThemedStack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tasbeeh" options={{ title: 'Tasbeeh' }} />
      <Stack.Screen name="mosque-finder" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="premium" />
    </ThemedStack>
  );
}
