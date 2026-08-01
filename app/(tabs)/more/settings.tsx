import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '@/i18n';
import { CALC_METHODS, type CalcMethodId } from '@/features/prayerTimes/methods';
import {
  cancelAllNoorReminders,
  ensureNotificationPermissions,
} from '@/features/notifications/prayer-reminders';
import { useSettingsStore } from '@/store/settings-store';
import { radius, spacing } from '@/theme';

const REMINDER_MINUTES = [5, 10, 15, 20, 30];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const settings = useSettingsStore();
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    calcMethod,
    setCalcMethod,
    madhab,
    setMadhab,
    use24h,
    setUse24h,
    notificationsEnabled,
    setNotificationsEnabled,
    prayerRemindersEnabled,
    setPrayerRemindersEnabled,
    reminderMinutes,
    setReminderMinutes,
    jumuahReminderEnabled,
    setJumuahReminderEnabled,
    dailyDhikrEnabled,
    setDailyDhikrEnabled,
    autoLocation,
    setAutoLocation,
    manualCity,
    manualCountry,
    setManualCity,
    savedLocation,
    resetApp,
  } = settings;

  const [city, setCity] = useState(manualCity ?? '');
  const [country, setCountry] = useState(manualCountry ?? '');

  const pickOption = (
    title: string,
    options: string[],
    currentIndex: number,
    onSelect: (index: number) => void,
  ) => {
    Alert.alert(title, undefined, [
      ...options.map((option, index) => ({
        text: option,
        onPress: () => onSelect(index),
        style: index === currentIndex ? ('destructive' as const) : ('default' as const),
      })),
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const togglePrayerReminders = async (enabled: boolean) => {
    setPrayerRemindersEnabled(enabled);
    if (enabled) {
      await ensureNotificationPermissions();
    } else {
      await cancelAllNoorReminders();
    }
  };

  return (
    <Screen>
      <ThemedText variant="title" bold style={styles.title}>
        {t('settings.title')}
      </ThemedText>

      <Section title={t('settings.appearance')}>
        <SettingRow
          icon="language-outline"
          label={t('settings.language')}
          value={LANGUAGE_LABELS[language]}
          onPress={() =>
            pickOption(
              t('settings.language'),
              SUPPORTED_LANGUAGES.map((l) => LANGUAGE_LABELS[l]),
              SUPPORTED_LANGUAGES.indexOf(language),
              (i) => setLanguage(SUPPORTED_LANGUAGES[i]),
            )
          }
        />
        <SettingRow
          icon="color-palette-outline"
          label={t('settings.theme')}
          value={t(`settings.${theme}`)}
          onPress={() =>
            pickOption(
              t('settings.theme'),
              [t('settings.system'), t('settings.light'), t('settings.dark')],
              ['system', 'light', 'dark'].indexOf(theme),
              (i) => setTheme((['system', 'light', 'dark'] as const)[i]),
            )
          }
        />
        <SettingRow
          icon="time-outline"
          label={t('settings.use24h')}
          right={<Switch value={use24h} onValueChange={setUse24h} trackColor={{ true: colors.primary }} />}
        />
      </Section>

      <Section title={t('settings.calcMethod')}>
        <SettingRow
          icon="calculator-outline"
          label={t('settings.calcMethod')}
          value={t(`methods.${calcMethod}`)}
          onPress={() =>
            pickOption(
              t('settings.calcMethod'),
              CALC_METHODS.map((m) => t(`methods.${m.id}`)),
              CALC_METHODS.findIndex((m) => m.id === calcMethod),
              (i) => setCalcMethod(CALC_METHODS[i].id as CalcMethodId),
            )
          }
        />
        <SettingRow
          icon="school-outline"
          label={t('settings.madhab')}
          value={t(`madhabs.${madhab}`)}
          onPress={() =>
            pickOption(
              t('settings.madhab'),
              [t('madhabs.shafi'), t('madhabs.hanafi')],
              madhab === 'shafi' ? 0 : 1,
              (i) => setMadhab(i === 0 ? 'shafi' : 'hanafi'),
            )
          }
        />
      </Section>

      <Section title={t('settings.notifications')}>
        <SettingRow
          icon="notifications-outline"
          label={t('settings.notifications')}
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: colors.primary }}
            />
          }
        />
        <SettingRow
          icon="alarm-outline"
          label={t('settings.prayerReminders')}
          right={
            <Switch
              value={prayerRemindersEnabled}
              onValueChange={togglePrayerReminders}
              trackColor={{ true: colors.primary }}
            />
          }
        />
        <SettingRow
          icon="timer-outline"
          label={t('settings.reminderMinutes')}
          value={`${reminderMinutes} min`}
          onPress={() =>
            pickOption(
              t('settings.reminderMinutes'),
              REMINDER_MINUTES.map((m) => `${m} min`),
              REMINDER_MINUTES.indexOf(reminderMinutes),
              (i) => setReminderMinutes(REMINDER_MINUTES[i]),
            )
          }
        />
        <SettingRow
          icon="calendar-outline"
          label={t('settings.jumuahReminder')}
          right={
            <Switch
              value={jumuahReminderEnabled}
              onValueChange={setJumuahReminderEnabled}
              trackColor={{ true: colors.primary }}
            />
          }
        />
        <SettingRow
          icon="sunny-outline"
          label={t('settings.dailyDhikr')}
          right={
            <Switch
              value={dailyDhikrEnabled}
              onValueChange={setDailyDhikrEnabled}
              trackColor={{ true: colors.primary }}
            />
          }
        />
      </Section>

      <Section title={t('settings.location')}>
        <SettingRow
          icon="navigate-outline"
          label={t('settings.autoLocation')}
          right={
            <Switch
              value={autoLocation}
              onValueChange={setAutoLocation}
              trackColor={{ true: colors.primary }}
            />
          }
        />
        {savedLocation?.label ? (
          <SettingRow icon="location-outline" label={savedLocation.label} />
        ) : null}
        <View style={styles.cityRow}>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('settings.city')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
          <TextInput
            value={country}
            onChangeText={setCountry}
            placeholder={t('settings.country')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
          <Button
            variant="outline"
            size="sm"
            title={t('common.save')}
            onPress={() => {
              if (city) {
                setManualCity(city, country);
                Alert.alert(t('common.done'));
              }
            }}
          />
        </View>
      </Section>

      <Section title={t('settings.about')}>
        <SettingRow
          icon="diamond-outline"
          label={t('settings.premium')}
          value={settings.isPremium ? `✓` : undefined}
          onPress={() => router.push('/more/premium' as never)}
        />
        <SettingRow
          icon="information-circle-outline"
          label={t('settings.dataSources')}
          value="Aladhan · AlQuran.Cloud · OpenStreetMap"
          onPress={() =>
            Alert.alert(t('settings.dataSources'), 'Aladhan API · AlQuran Cloud API · Overpass (OpenStreetMap)')
          }
        />
        <SettingRow
          icon="apps-outline"
          label={t('settings.version')}
          value="1.0.0"
        />
        <Button
          variant="ghost"
          title={t('settings.resendOnboarding')}
          onPress={() => {
            resetApp();
            router.replace('/onboarding');
          }}
        />
        <Button
          variant="danger"
          title={t('settings.resetApp')}
          onPress={() => {
            Alert.alert(t('settings.resetApp'), t('settings.resetConfirm'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.ok'),
                style: 'destructive',
                onPress: () => {
                  resetApp();
                  cancelAllNoorReminders();
                  router.replace('/onboarding');
                },
              },
            ]);
          }}
        />
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.section}>
      <ThemedText variant="label" color="muted" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <Card padded={false}>
        <View style={{ backgroundColor: colors.surface }}>{children}</View>
      </Card>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  right,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !right}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && onPress && { backgroundColor: colors.surfaceElevated },
      ]}>
      <Icon name={icon} size={20} color={colors.textMuted} />
      <ThemedText variant="body" style={{ flex: 1 }}>
        {label}
      </ThemedText>
      {value ? (
        <ThemedText variant="caption" color="muted">
          {value}
        </ThemedText>
      ) : null}
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cityRow: {
    padding: spacing.md,
    gap: spacing.md,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
