import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { fetchSurahList, type SurahMeta } from '@/services/quran';
import { EMBEDDED_SURAHS } from '@/services/quran-data';
import { fontFamily, radius, spacing } from '@/theme';
import { useQuranStore } from '@/store/quran-store';

export default function QuranIndexScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const [surahs, setSurahs] = useState<SurahMeta[]>(() => (Array.isArray(EMBEDDED_SURAHS) ? EMBEDDED_SURAHS : []));
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const lastRead = useQuranStore((s) => s.lastRead);

  const load = useCallback(async () => {
    try {
      const data = await fetchSurahList();
      if (Array.isArray(data)) setSurahs(data);
    } catch {
      // keep the embedded list
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const list = Array.isArray(surahs) ? surahs : [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.number.toString() === q ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.name.includes(query.trim()),
    );
  }, [surahs, query]);

  return (
    <Screen
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
      refreshing={refreshing}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <ThemedText variant="title" bold>
            {t('quran.title')}
          </ThemedText>
          <Pressable
            onPress={() => router.push('/quran/bookmarks' as never)}
            style={({ pressed }) => [
              styles.headerAction,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}>
            <Icon name="bookmark-outline" size={20} color={colors.primary} />
          </Pressable>
        </View>
        {lastRead ? (
          <Pressable
            onPress={() => router.push(`/quran/${lastRead.surah}` as never)}
            style={[styles.lastRead, { backgroundColor: colors.primarySoft }]}>
            <Icon name="play-circle-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <ThemedText variant="caption" color="muted">
                {t('quran.lastRead')}
              </ThemedText>
              <ThemedText variant="caption" bold>
                {t('quran.title')} {lastRead.surah} · {lastRead.ayah}
              </ThemedText>
            </View>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('quran.searchSurah')}
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <View style={styles.list}>
        {filtered.map((surah) => (
          <Pressable
            key={surah.number}
            onPress={() => router.push(`/quran/${surah.number}` as never)}
            style={({ pressed }) => pressed && { opacity: 0.85 }}>
            <Card style={styles.surahCard}>
              <View style={[styles.surahNumber, { backgroundColor: colors.primarySoft }]}>
                <ThemedText variant="caption" bold color="primary">
                  {surah.number}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" bold>
                  {surah.englishName}
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  {surah.englishNameTranslation}
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  {surah.revelationType === 'Meccan' ? t('quran.meccan') : t('quran.medinan')} ·{' '}
                  {t('quran.ayahCount', { count: surah.numberOfAyahs })}
                </ThemedText>
              </View>
              <ThemedText style={styles.arabicName}>{surah.name}</ThemedText>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  lastRead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  surahNumber: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicName: {
    fontFamily: fontFamily.amiri,
    fontSize: 22,
  },
});
