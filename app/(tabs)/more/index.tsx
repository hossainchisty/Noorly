import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useSettingsStore } from '@/store/settings-store';
import { radius, spacing } from '@/theme';

const ITEMS: { route: string; icon: IconName; labelKey: string; tint: 'primary' | 'accent' }[] = [
  { route: '/more/tasbeeh', icon: 'ellipsis-horizontal-circle-outline', labelKey: 'home.tasbeeh', tint: 'primary' },
  { route: '/more/mosque-finder', icon: 'business-outline', labelKey: 'home.mosques', tint: 'primary' },
  { route: '/more/calendar', icon: 'calendar-outline', labelKey: 'home.calendar', tint: 'accent' },
  { route: '/more/settings', icon: 'settings-outline', labelKey: 'settings.title', tint: 'primary' },
  { route: '/more/premium', icon: 'diamond-outline', labelKey: 'settings.premium', tint: 'accent' },
];

export default function MoreIndexScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const isPremium = useSettingsStore((s) => s.isPremium);

  return (
    <Screen>
      <ThemedText variant="title" bold style={styles.title}>
        {t('home.more')}
      </ThemedText>

      <View style={styles.list}>
        {ITEMS.map((item) => {
          const tint = item.tint === 'accent' ? colors.accent : colors.primary;
          const tintSoft = item.tint === 'accent' ? colors.accentSoft : colors.primarySoft;
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.85 },
              ]}>
              <View style={[styles.rowIcon, { backgroundColor: tintSoft }]}>
                <Icon name={item.icon} size={22} color={tint} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" bold>
                  {t(item.labelKey)}
                </ThemedText>
                {item.route === '/more/premium' && isPremium && (
                  <ThemedText variant="caption" color="primary">
                    ✓ {t('premium.thankYou')}
                  </ThemedText>
                )}
              </View>
              <Icon name="chevron-forward" size={18} color={colors.textMuted} />
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
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
