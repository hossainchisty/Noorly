import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { ensureNotificationPermissions } from '@/features/notifications/prayer-reminders';
import { requestLocationPermission } from '@/features/location/location';
import { useAppTheme } from '@/hooks/use-app-theme';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n';
import { useSettingsStore } from '@/store/settings-store';
import { radius, spacing } from '@/theme';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setAutoLocation = useSettingsStore((s) => s.setAutoLocation);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const [language, setLang] = useState<AppLanguage>(
    useSettingsStore.getState().language as AppLanguage,
  );
  const [locationDone, setLocationDone] = useState(false);
  const [notificationsDone, setNotificationsDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const requestLocation = async () => {
    setBusy(true);
    const granted = await requestLocationPermission();
    if (granted) {
      setAutoLocation(true);
    } else {
      setAutoLocation(false);
    }
    setLocationDone(true);
    setBusy(false);
  };

  const requestNotifications = async () => {
    setBusy(true);
    const granted = await ensureNotificationPermissions();
    useSettingsStore.getState().setNotificationsEnabled(granted);
    useSettingsStore.getState().setPrayerRemindersEnabled(granted);
    setNotificationsDone(true);
    setBusy(false);
  };

  const finish = () => {
    setLanguage(language);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <Screen scrollable padded>
      <ThemedView style={styles.hero}>
        <Image source={require('@/assets/images/logo.png')} style={styles.brandBadge} />
        <ThemedText variant="display" bold style={styles.title}>
          {t('common.appName')}
        </ThemedText>
        <ThemedText variant="body" color="muted" style={styles.tagline}>
          {t('onboarding.tagline')}
        </ThemedText>
      </ThemedView>

      <View style={styles.section}>
        <ThemedText variant="subtitle" bold>
          {t('onboarding.languageTitle')}
        </ThemedText>
        <ThemedText variant="caption" color="muted">
          {t('onboarding.languageDesc')}
        </ThemedText>
        <View style={styles.languageRow}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Pressable
              key={lang}
              onPress={() => setLang(lang)}
              style={[
                styles.languagePill,
                {
                  backgroundColor: language === lang ? colors.primary : colors.surface,
                  borderColor: language === lang ? colors.primary : colors.border,
                },
              ]}>
              <ThemedText
                bold
                color={language === lang ? 'onPrimary' : 'text'}
                style={{ textAlign: 'center' }}>
                {LANGUAGE_LABELS[lang]}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Card>
          <View style={styles.permissionRow}>
            <View style={[styles.permissionIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name="location-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.permissionText}>
              <ThemedText bold>{t('onboarding.locationTitle')}</ThemedText>
              <ThemedText variant="caption" color="muted">
                {t('onboarding.locationDesc')}
              </ThemedText>
            </View>
          </View>
          <View style={styles.permissionActions}>
            <Button
              variant={locationDone ? 'ghost' : 'primary'}
              title={locationDone ? t('common.done') : t('common.ok')}
              size="sm"
              onPress={requestLocation}
              disabled={busy || locationDone}
            />
            <Button
              variant="ghost"
              title={t('onboarding.locationLater')}
              size="sm"
              onPress={() => setLocationDone(true)}
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Card>
          <View style={styles.permissionRow}>
            <View style={[styles.permissionIcon, { backgroundColor: colors.accentSoft }]}>
              <Icon name="notifications-outline" size={22} color={colors.accent} />
            </View>
            <View style={styles.permissionText}>
              <ThemedText bold>{t('onboarding.notificationsTitle')}</ThemedText>
              <ThemedText variant="caption" color="muted">
                {t('onboarding.notificationsDesc')}
              </ThemedText>
            </View>
          </View>
          <View style={styles.permissionActions}>
            <Button
              variant={notificationsDone ? 'ghost' : 'primary'}
              title={notificationsDone ? t('common.done') : t('common.ok')}
              size="sm"
              onPress={requestNotifications}
              disabled={busy || notificationsDone}
            />
            <Button
              variant="ghost"
              title={t('onboarding.notificationsLater')}
              size="sm"
              onPress={() => setNotificationsDone(true)}
            />
          </View>
        </Card>
      </View>

      <Button
        title={t('onboarding.getStarted')}
        size="lg"
        icon="arrow-forward"
        onPress={finish}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  brandBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 320,
  },
  section: {
    marginBottom: spacing.xl,
  },
  languageRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  languagePill: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  permissionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  permissionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    flex: 1,
    gap: spacing.xs,
  },
  permissionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cta: {
    marginTop: spacing.sm,
  },
});
