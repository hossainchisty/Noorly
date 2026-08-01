import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { DUA_CATEGORIES } from '@/features/duas/data';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useDuasContentStore } from '@/store/duas-content-store';
import { radius, spacing } from '@/theme';

const CATEGORY_ICONS: Record<string, IconName> = {
  morning: 'sunny-outline',
  evening: 'moon-outline',
  wudu: 'water-outline',
  prayer: 'hourglass-outline',
  afterPrayer: 'ellipse-outline',
  sleeping: 'bed-outline',
  food: 'restaurant-outline',
  travel: 'airplane-outline',
  home: 'home-outline',
  enteringMosque: 'business-outline',
  distress: 'shield-checkmark-outline',
  forgiveness: 'water-outline',
  illness: 'medical-outline',
  weather: 'cloudy-outline',
  knowledge: 'book-outline',
  parents: 'people-outline',
  guidance: 'compass-outline',
  gratitude: 'heart-outline',
  protection: 'shield-outline',
  dhikr: 'sparkles-outline',
  marriage: 'heart-circle-outline',
  hajj: 'walk-outline',
  grief: 'water-outline',
  children: 'person-outline',
  business: 'briefcase-outline',
  nightPrayer: 'moon-outline',
  quran: 'book-outline',
};

export default function DuasIndexScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const duas = useDuasContentStore((s) => s.duas);
  const refresh = useDuasContentStore((s) => s.refresh);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  return (
    <Screen>
      <ThemedText variant="title" bold style={styles.title}>
        {t('duas.title')}
      </ThemedText>
      <ThemedText variant="caption" color="muted" style={styles.subtitle}>
        {t('duas.categories')}
      </ThemedText>

      <View style={styles.grid}>
        {DUA_CATEGORIES.map((category) => {
          const count = duas.filter((d) => d.category === category).length;
          const tint = category === 'morning' || category === 'evening' ? colors.accent : colors.primary;
          const tintSoft = category === 'morning' || category === 'evening' ? colors.accentSoft : colors.primarySoft;
          return (
            <Pressable
              key={category}
              onPress={() => router.push(`/duas/${category}` as never)}
              style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.categoryIcon, { backgroundColor: tintSoft }]}>
                <Icon name={CATEGORY_ICONS[category] ?? 'sparkles-outline'} size={22} color={tint} />
              </View>
              <ThemedText variant="caption" bold style={styles.categoryName}>
                {t(`duas.${category}`)}
              </ThemedText>
              <ThemedText variant="caption" color="muted">
                {count}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    marginTop: spacing.xs,
  },
});
