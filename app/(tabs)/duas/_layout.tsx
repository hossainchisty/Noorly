import { Stack } from 'expo-router';

import { ThemedStack } from '@/components/ui/themed-stack';

export default function DuasLayout() {
  return (
    <ThemedStack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[category]" />
      <Stack.Screen name="dua/[id]" />
    </ThemedStack>
  );
}
