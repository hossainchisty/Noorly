import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useDuasContentStore } from '@/store/duas-content-store';
import { useDuasStore } from '@/store/duas-store';
import { fontFamily, radius, spacing } from '@/theme';

export default function DuaDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const duas = useDuasContentStore((s) => s.duas);
  const dua = duas.find((d) => d.id === params.id);

  const isFavorite = useDuasStore((s) => s.isFavorite(params.id ?? ''));
  const toggleFavorite = useDuasStore((s) => s.toggleFavorite);

  if (!dua) {
    return (
      <Screen>
        <ThemedText color="muted">{t('common.error')}</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.arabicCard}>
        <ThemedText style={styles.arabic}>{dua.arabic}</ThemedText>
      </Card>

      <Card style={styles.section}>
        <ThemedText variant="body">{dua.translation}</ThemedText>
      </Card>

       {dua.transliteration ? (
         <Card style={styles.section}>
           <ThemedText variant="caption" color="muted" style={{ fontFamily: 'system' }}>
             {dua.transliteration}
           </ThemedText>
         </Card>
       ) : null}

       <View style={styles.metaRow}>
         <Icon name="bookmark-outline" size={16} color={colors.textMuted} />
         <ThemedText variant="caption" color="muted">
           <ThemedText variant="caption" bold color="muted">
             {t('duas.source')}:
           </ThemedText>
           {' '}{dua.source}
         </ThemedText>
         {dua.repeat && dua.repeat > 1 ? (
           <ThemedText variant="caption" color="muted" style={styles.repeatBadge}>
             ×{dua.repeat}
           </ThemedText>
         ) : null}
       </View>

      <Button
        variant={isFavorite ? 'secondary' : 'primary'}
        icon={isFavorite ? 'bookmark' : 'bookmark-outline'}
        title={isFavorite ? t('duas.removeFavorite') : t('duas.addFavorite')}
        onPress={() => toggleFavorite(dua.id)}
        style={styles.favoriteButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  arabicCard: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  arabic: {
    fontFamily: fontFamily.amiri,
    fontSize: 26,
    lineHeight: 46,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  repeatBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  favoriteButton: {
    marginTop: spacing.md,
  },
});
