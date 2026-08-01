import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getSurahMeta } from '@/services/quran';
import { useQuranStore } from '@/store/quran-store';
import { radius, spacing } from '@/theme';

export default function QuranBookmarksScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const removeBookmark = useQuranStore((s) => s.removeBookmark);

  return (
    <Screen>
      {bookmarks.length === 0 ? (
        <Card style={styles.empty}>
          <Icon name="bookmark-outline" size={28} color={colors.textMuted} />
          <ThemedText variant="body" color="muted">
            {t('quran.noBookmarks')}
          </ThemedText>
        </Card>
      ) : (
        <View style={styles.list}>
          {bookmarks.map((bookmark) => {
            const meta = getSurahMeta(bookmark.surah);
            return (
              <Card key={bookmark.id} style={styles.row}>
                <Pressable
                  onPress={() => router.push(`/quran/${bookmark.surah}` as never)}
                  style={styles.rowMain}>
                  <View style={[styles.numberBadge, { backgroundColor: colors.primarySoft }]}>
                    <ThemedText variant="caption" bold color="primary">
                      {bookmark.surah}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" bold>
                      {meta?.englishName ?? `Surah ${bookmark.surah}`}
                    </ThemedText>
                    <ThemedText variant="caption" color="muted">
                      {t('quran.ayahs')} {bookmark.ayah}
                    </ThemedText>
                  </View>
                </Pressable>
                <Pressable onPress={() => removeBookmark(bookmark.surah, bookmark.ayah)}>
                  <Icon name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
