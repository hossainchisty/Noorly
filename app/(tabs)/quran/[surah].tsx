import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { LoadingScreen, Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  getSurahMeta,
  TRANSLATIONS,
  TAFSIR_EDITIONS,
  getSurahAudioUrl,
  fetchSurah,
  fetchTafsir,
  type Ayah,
  type SurahEditionResponse,
} from '@/services/quran';
import { RECITERS, useQuranStore } from '@/store/quran-store';
import { fontFamily, radius, spacing } from '@/theme';

type ViewMode = 'arabic' | 'translation' | 'both';

export default function QuranReaderScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ surah: string }>();
  const surahNumber = parseInt(params.surah ?? '1', 10);
  const navigation = useNavigation();

  useEffect(() => {
    const meta = getSurahMeta(surahNumber);
    navigation.setOptions({
      headerTitle: meta?.englishName ?? `Surah ${surahNumber}`,
    });
  }, [navigation, surahNumber]);

  const reciter = useQuranStore((s) => s.reciter);
  const translationLanguage = useQuranStore((s) => s.translationLanguage);
  const tafsirEdition = useQuranStore((s) => s.tafsirEdition);
  const setTafsirEdition = useQuranStore((s) => s.setTafsirEdition);
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const addBookmark = useQuranStore((s) => s.addBookmark);
  const removeBookmark = useQuranStore((s) => s.removeBookmark);
  const setLastRead = useQuranStore((s) => s.setLastRead);
  const lastRead = useQuranStore((s) => s.lastRead);

  const [data, setData] = useState<SurahEditionResponse | null>(null);
  const [translationData, setTranslationData] = useState<Ayah[] | null>(null);
  const [mode, setMode] = useState<ViewMode>('both');
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);
  const [playAll, setPlayAll] = useState(false);
  const [expandedTafsir, setExpandedTafsir] = useState<number | null>(null);
  const [tafsirTextCache, setTafsirTextCache] = useState<Record<number, string>>({});
  const [tafsirLoading, setTafsirLoading] = useState(false);

  const listRef = useRef<FlatList<Ayah>>(null);
  const currentAyahRef = useRef<number | null>(null);
  currentAyahRef.current = currentAyah;

  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [arabic, translation] = await Promise.all([
          fetchSurah(surahNumber, 'quran-uthmani'),
          fetchSurah(surahNumber, translationLanguage),
        ]);
        setData(arabic);
        setTranslationData(translation.ayahs);
        navigation.setOptions({
          headerTitle: arabic.englishName ?? `Surah ${surahNumber}`,
        });
      } catch {
        setData(null);
      }
    })();
  }, [navigation, surahNumber, translationLanguage]);

  const playAyah = useCallback(
    (ayahNumber: number, advance: boolean) => {
      if (!data) return;
      const url = getSurahAudioUrl(surahNumber, reciter, ayahNumber);
      player.replace({ uri: url });
      player.seekTo(0);
      player.play();
      setCurrentAyah(ayahNumber);
      setPlayAll(advance);
    },
    [data, player, reciter, surahNumber],
  );

  const stopPlayback = useCallback(() => {
    player.pause();
    setCurrentAyah(null);
    setPlayAll(false);
  }, [player]);

  const toggleTafsir = useCallback(async (ayahNumber: number) => {
    if (!tafsirEdition) return;
    if (expandedTafsir === ayahNumber) {
      setExpandedTafsir(null);
      return;
    }
    const cached = tafsirTextCache[ayahNumber];
    if (cached) {
      setExpandedTafsir(ayahNumber);
      return;
    }
    setTafsirLoading(true);
    setExpandedTafsir(ayahNumber);
    try {
      const text = await fetchTafsir(surahNumber, ayahNumber, tafsirEdition);
      if (text) setTafsirTextCache((prev) => ({ ...prev, [ayahNumber]: text }));
    } finally {
      setTafsirLoading(false);
    }
  }, [tafsirEdition, surahNumber, expandedTafsir, tafsirTextCache]);

  // Advance to next ayah when the current one finishes (play-all mode).
  useEffect(() => {
    if (status.didJustFinish && playAll && currentAyahRef.current && data) {
      const next = currentAyahRef.current + 1;
      if (next <= data.numberOfAyahs) {
        const url = getSurahAudioUrl(surahNumber, reciter, next);
        player.replace({ uri: url });
        player.seekTo(0);
        player.play();
        setCurrentAyah(next);
      } else {
        setPlayAll(false);
        setCurrentAyah(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.didJustFinish, playAll]);

  // Keep the currently-playing ayah visible.
  useEffect(() => {
    if (currentAyah == null) return;
    const index = data ? currentAyah - 1 : -1;
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
    }
  }, [currentAyah, data]);

  const reciterName = RECITERS.find((r) => r.id === reciter)?.name ?? reciter;

  if (!data) return <LoadingScreen />;

  const isBookmarked = (ayah: number) =>
    bookmarks.some((b) => b.surah === surahNumber && b.ayah === ayah);

  const onOpenAyah = (ayah: number) => {
    setLastRead(surahNumber, ayah);
  };

  const initialScrollIndex = lastRead?.surah === surahNumber ? lastRead.ayah - 1 : 0;

  return (
    <Screen padded={false} scrollable={false}>
      <View style={styles.toolbar}>
        {(['arabic', 'translation', 'both'] as ViewMode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={[
              styles.modePill,
              { backgroundColor: mode === m ? colors.primary : colors.surface },
            ]}>
            <ThemedText variant="caption" bold color={mode === m ? 'onPrimary' : 'text'}>
              {t(`quran.${m}`)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.settingsRow}>
        <ReciterPicker
          current={reciter}
          onSelect={(id) => useQuranStore.getState().setReciter(id)}
        />
        <TranslationPicker current={translationLanguage} />
        <TafsirPicker current={tafsirEdition} onSelect={setTafsirEdition} />
      </View>

      <FlatList
        ref={listRef}
        data={data.ayahs}
        keyExtractor={(item) => String(item.number)}
        initialScrollIndex={initialScrollIndex > 0 ? initialScrollIndex : undefined}
        onScrollToIndexFailed={() => {}}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Card style={styles.surahHeader}>
            <ThemedText style={styles.surahBismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</ThemedText>
            <ThemedText variant="subtitle" bold>
              {data.englishName} — {data.name}
            </ThemedText>
            <ThemedText variant="caption" color="muted">
              {data.revelationType === 'Meccan' ? t('quran.meccan') : t('quran.medinan')} ·{' '}
              {t('quran.ayahCount', { count: data.numberOfAyahs })}
            </ThemedText>
          </Card>
        }
        renderItem={({ item }) => {
          const playing = currentAyah === item.numberInSurah;
          const translation = translationData?.find((a) => a.numberInSurah === item.numberInSurah);
          const marked = isBookmarked(item.numberInSurah);
          return (
            <Pressable onPress={() => onOpenAyah(item.numberInSurah)}>
              <View
                style={[
                  styles.ayahCard,
                  { borderColor: colors.border },
                  playing && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                ]}>
                <View style={styles.ayahTopRow}>
                  <View style={[styles.ayahNumber, { backgroundColor: colors.primarySoft }]}>
                    <ThemedText variant="caption" bold color="primary">
                      {item.numberInSurah}
                    </ThemedText>
                  </View>
                  <View style={styles.ayahActions}>
                    <Pressable
                      onPress={() => playAyah(item.numberInSurah, true)}
                      style={styles.actionButton}>
                      <Icon
                        name={playing && status.playing ? 'pause-circle' : 'play-circle-outline'}
                        size={22}
                        color={colors.primary}
                      />
                    </Pressable>
                     <Pressable
                       onPress={() =>
                         marked
                           ? removeBookmark(surahNumber, item.numberInSurah)
                           : addBookmark(surahNumber, item.numberInSurah)
                       }
                       style={styles.actionButton}>
                       <Icon
                         name={marked ? 'bookmark' : 'bookmark-outline'}
                         size={20}
                         color={marked ? colors.accent : colors.textMuted}
                       />
                     </Pressable>
                     {tafsirEdition ? (
                       <Pressable onPress={() => toggleTafsir(item.numberInSurah)} style={styles.actionButton}>
                         <Icon
                           name={expandedTafsir === item.numberInSurah ? 'book' : 'book-outline'}
                           size={20}
                           color={expandedTafsir === item.numberInSurah ? colors.primary : colors.textMuted}
                         />
                       </Pressable>
                     ) : null}
                   </View>
                </View>

                {mode !== 'translation' ? (
                  <ThemedText style={styles.ayahText}>{item.text}</ThemedText>
                ) : null}

                {mode !== 'arabic' && translation ? (
                  <View style={[styles.translationBlock, { borderTopColor: colors.border }]}>
                    <ThemedText variant="body" color="muted" style={styles.translationText}>
                      {translation.text}
                    </ThemedText>
                  </View>
                ) : null}

                 {item.sajda ? (
                   <ThemedText variant="caption" color="accent" style={styles.sajda}>
                     ۩ {t('quran.sajda')}
                   </ThemedText>
                 ) : null}

                 {expandedTafsir === item.numberInSurah ? (
                   <Card style={[styles.tafsirCard, { borderTopColor: colors.border }]}>
                     {tafsirLoading && !tafsirTextCache[item.numberInSurah] ? (
                       <ThemedText variant="caption" color="muted">
                         {t('quran.loadingTafsir')}
                       </ThemedText>
                     ) : (
                       <ThemedText variant="body" color="muted" style={styles.tafsirText}>
                         {tafsirTextCache[item.numberInSurah] ?? t('quran.noTafsir')}
                       </ThemedText>
                     )}
                   </Card>
                 ) : null}
               </View>
            </Pressable>
          );
        }}
      />

      {currentAyah != null ? (
        <View style={[styles.playerBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Pressable onPress={status.playing ? () => player.pause() : () => player.play()}>
            <Icon
              name={status.playing ? 'pause-circle' : 'play-circle'}
              size={36}
              color={colors.primary}
            />
          </Pressable>
          <View style={{ flex: 1 }}>
            <ThemedText variant="caption" bold>
              {reciterName}
            </ThemedText>
            <ThemedText variant="caption" color="muted">
              {t('quran.ayahs')} {currentAyah}
            </ThemedText>
          </View>
          <Pressable onPress={stopPlayback}>
            <Icon name="close-circle" size={24} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

function ReciterPicker({ current, onSelect }: { current: string; onSelect: (id: string) => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() =>
        Alert.alert(t('quran.reciter'), undefined, [
          ...RECITERS.map((r) => ({
            text: r.name,
            onPress: () => onSelect(r.id),
            style: r.id === current ? ('destructive' as const) : ('default' as const),
          })),
          { text: t('common.cancel'), style: 'cancel' },
        ])
      }
      style={[styles.settingsPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon name="person-outline" size={16} color={colors.textMuted} />
      <ThemedText variant="caption" numberOfLines={1} style={{ maxWidth: 140 }}>
        {RECITERS.find((r) => r.id === current)?.name ?? current}
      </ThemedText>
    </Pressable>
  );
}

function TranslationPicker({ current }: { current: string }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => router.push('/quran/translations' as never)}
      style={[styles.settingsPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon name="language-outline" size={16} color={colors.textMuted} />
      <ThemedText variant="caption" numberOfLines={1} style={{ maxWidth: 140 }}>
        {TRANSLATIONS.find((tr) => tr.id === current)?.name ?? current}
      </ThemedText>
    </Pressable>
  );
}

function TafsirPicker({
  current,
  onSelect,
}: {
  current: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const options = [{ id: '', name: t('quran.tafsirOff') }, ...TAFSIR_EDITIONS];
  return (
    <Pressable
      onPress={() =>
        Alert.alert(t('quran.tafsir'), undefined, [
          ...options.map((tr) => ({
            text: tr.name,
            onPress: () => onSelect(tr.id),
            style: tr.id === current ? ('destructive' as const) : ('default' as const),
          })),
          { text: t('common.cancel'), style: 'cancel' },
        ])
      }
      style={[styles.settingsPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon name="book-outline" size={16} color={colors.textMuted} />
      <ThemedText variant="caption" numberOfLines={1} style={{ maxWidth: 140 }}>
        {options.find((tr) => tr.id === current)?.name ?? t('quran.tafsirOff')}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  settingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  modePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  surahHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  surahBismillah: {
    fontFamily: fontFamily.amiri,
    fontSize: 20,
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  ayahCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  ayahTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ayahNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: 2,
  },
  ayahText: {
    fontFamily: fontFamily.amiri,
    fontSize: 24,
    lineHeight: 46,
    textAlign: 'right',
  },
  translationBlock: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  translationText: {
    lineHeight: 22,
  },
  tafsirCard: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  tafsirText: {
    lineHeight: 22,
  },
  sajda: {
    marginTop: spacing.sm,
  },
  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
});
