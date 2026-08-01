import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useSettingsStore } from '@/store/settings-store';
import { radius, spacing } from '@/theme';

const FEATURES: { icon: IconName; labelKey: string }[] = [
  { icon: 'rocket-outline', labelKey: 'premium.features.early' },
  { icon: 'eye-off-outline', labelKey: 'premium.features.ads' },
  { icon: 'text-outline', labelKey: 'premium.features.fonts' },
  { icon: 'heart-outline', labelKey: 'premium.features.support' },
];

export default function PremiumScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const isPremium = useSettingsStore((s) => s.isPremium);
  const setPremium = useSettingsStore((s) => s.setPremium);
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const onSubscribe = () => {
    if (isPremium) {
      Alert.alert(t('premium.thankYou'));
      return;
    }
    Alert.alert(t('premium.notAvailable'), t('premium.subtitle'), [
      { text: t('common.ok'), onPress: () => setPremium(true) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
          <Icon name="diamond" size={32} color={colors.accent} />
        </View>
        <ThemedText variant="display" bold style={styles.title}>
          {t('premium.title')}
        </ThemedText>
        <ThemedText variant="body" color="muted" style={styles.subtitle}>
          {t('premium.subtitle')}
        </ThemedText>
      </View>

      <View style={styles.periodRow}>
        {(['monthly', 'yearly'] as const).map((p) => (
          <View
            key={p}
            onTouchEnd={() => setPeriod(p)}
            style={[
              styles.periodPill,
              {
                backgroundColor: period === p ? colors.primary : colors.surface,
                borderColor: period === p ? colors.primary : colors.border,
              },
            ]}>
            <ThemedText variant="caption" bold color={period === p ? 'onPrimary' : 'text'}>
              {t(`premium.${p}`)}
            </ThemedText>
          </View>
        ))}
      </View>

      <Card style={styles.priceCard}>
        <ThemedText variant="display" bold color="primary" style={styles.price}>
          {period === 'yearly' ? t('premium.price', { price: '19.99' }) : t('premium.price', { price: '2.49' })}
        </ThemedText>
        <ThemedText variant="caption" color="muted">
          {t(`premium.${period === 'yearly' ? 'perYear' : 'perMonth'}`)}
        </ThemedText>
        <ThemedText variant="caption" color="muted" style={styles.trial}>
          {t('premium.freeTrial', {
            price: period === 'yearly' ? '19.99' : '2.49',
            period: t(`premium.${period === 'yearly' ? 'perYear' : 'perMonth'}`),
          })}
        </ThemedText>
      </Card>

      <View style={styles.features}>
        {FEATURES.map((feature) => (
          <View key={feature.labelKey} style={styles.featureRow}>
            <Icon name={feature.icon} size={20} color={colors.primary} />
            <ThemedText variant="body" style={{ flex: 1 }}>
              {t(feature.labelKey)}
            </ThemedText>
          </View>
        ))}
      </View>

      <Button
        title={isPremium ? t('premium.thankYou') : t('premium.subscribe', { period: t(`premium.${period}`) })}
        size="lg"
        onPress={onSubscribe}
        style={styles.cta}
      />
      <Button
        variant="ghost"
        title={t('premium.restore')}
        onPress={() => Alert.alert(t('premium.notAvailable'))}
      />
      <View style={styles.legalRow}>
        <ThemedText variant="caption" color="muted">
          {t('premium.terms')}
        </ThemedText>
        <ThemedText variant="caption" color="muted">
          {t('premium.privacy')}
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  periodPill: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  priceCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  price: {
    fontSize: 40,
  },
  trial: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  features: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cta: {
    marginBottom: spacing.sm,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
});
