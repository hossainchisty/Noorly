import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { TRANSLATIONS } from '@/services/quran';
import { useQuranStore } from '@/store/quran-store';
import { spacing } from '@/theme';

export default function TranslationsScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const translationLanguage = useQuranStore((s) => s.translationLanguage);

  const onSelect = (id: string) => {
    useQuranStore.getState().setTranslationLanguage(id);
    router.back();
  };

  return (
    <Screen padded>
      <FlatList
        data={TRANSLATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
            <ThemedText variant="title" bold>
              {t('quran.translation')}
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const selected = item.id === translationLanguage;
          return (
            <Pressable onPress={() => onSelect(item.id)}>
              <Card style={styles.row}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" bold>
                    {item.name}
                  </ThemedText>
                  <ThemedText variant="caption" color="muted">
                    {item.id}
                  </ThemedText>
                </View>
                <Icon
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selected ? colors.primary : colors.border}
                />
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});