import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import type { DuaCategory } from '@/features/duas/data';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useDuasContentStore } from '@/store/duas-content-store';
import { fontFamily, spacing } from '@/theme';

export default function DuaCategoryScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ category: string }>();
  const category = (params.category ?? 'morning') as DuaCategory;
  const navigation = useNavigation();
  const duas = useDuasContentStore((s) => s.duas);
  const refresh = useDuasContentStore((s) => s.refresh);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  useEffect(() => {
    navigation.setOptions({ headerTitle: t(`duas.${category}`) });
  }, [navigation, category, t]);

  const filtered = duas.filter((d) => d.category === category);

  return (
    <Screen>
      {filtered.map((dua) => (
        <Pressable
          key={dua.id}
          onPress={() => router.push(`/duas/dua/${dua.id}` as never)}
          style={({ pressed }) => pressed && { opacity: 0.85 }}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText variant="body" bold style={styles.arabic}>
                {dua.arabic}
              </ThemedText>
              <Icon name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
            <ThemedText variant="caption" color="muted" numberOfLines={2}>
              {dua.translation}
            </ThemedText>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  arabic: {
    fontFamily: fontFamily.amiri,
    fontSize: 20,
    flex: 1,
    lineHeight: 34,
  },
});
