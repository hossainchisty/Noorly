import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { LoadingScreen, Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemedText } from '@/components/ui/themed-text';
import {
  RAMADAN_MONTH,
  getUpcomingOccasions,
  type Occasion,
} from '@/features/hijri/occasions';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCalendarStore, toIsoDate } from '@/store/calendar-store';
import { usePrayerTimesStore } from '@/store/prayer-times-store';
import {
  fetchGregorianForHijri,
  fetchHijriForGregorian,
  type HijriDate,
} from '@/services/aladhan';
import { formatClock } from '@/features/prayerTimes/helpers';
import { useSettingsStore } from '@/store/settings-store';
import { radius, spacing } from '@/theme';

type OccasionResult = { occasion: Occasion; date: Date; hijriYear: number };

export default function CalendarScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const day = usePrayerTimesStore((s) => s.day);
  const hijri = usePrayerTimesStore((s) => s.hijri);
  const use24h = useSettingsStore((s) => s.use24h);

  const [occasions, setOccasions] = useState<OccasionResult[]>([]);
  const [loadingOccasions, setLoadingOccasions] = useState(true);

  const isFasted = useCalendarStore((s) => s.isFasted(toIsoDate(new Date())));
  const toggleFastingDay = useCalendarStore((s) => s.toggleFastingDay);

  const inRamadan = hijri ? hijri.month.number === RAMADAN_MONTH : false;

  useEffect(() => {
    if (!hijri) return;
    (async () => {
      const year = parseInt(hijri.year, 10);
      const upcoming = await getUpcomingOccasions(year);
      setOccasions(upcoming);
      setLoadingOccasions(false);
    })();
  }, [hijri]);

  if (!day || !hijri) return <LoadingScreen />;

  const daysUntilRamadan = occasions.find((o) => o.occasion.key === 'firstRamadan')
    ? Math.ceil(
        (occasions.find((o) => o.occasion.key === 'firstRamadan')!.date.getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <Screen>
      <Card style={styles.headerCard}>
        <ThemedText variant="label" color="accent">
          {t('calendar.hijri')}
        </ThemedText>
        <ThemedText variant="subtitle" bold style={styles.hijriDate}>
          {hijri.day} {hijri.month.en} {hijri.year}
        </ThemedText>
        <ThemedText variant="caption" color="muted">
          {hijri.weekday.en} · {day.date.gregorian.weekday.en} {day.date.gregorian.day}{' '}
          {day.date.gregorian.month.en} {day.date.gregorian.year}
        </ThemedText>
      </Card>

      {inRamadan ? (
        <RamadanActiveCard
          hijri={hijri}
          suhoorTime={formatClock(day.timings.Fajr, use24h)}
          iftarTime={formatClock(day.timings.Maghrib, use24h)}
          isFasted={isFasted}
          onToggleFasting={() => toggleFastingDay(toIsoDate(new Date()))}
        />
      ) : (
        <Card style={styles.ramadanCard}>
          <View style={styles.ramadanRow}>
            <View style={[styles.ramadanIcon, { backgroundColor: colors.accentSoft }]}>
              <Icon name="moon-outline" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="body" bold>
                {t('calendar.ramadan')}
              </ThemedText>
              {daysUntilRamadan != null && (
                <ThemedText variant="caption" color="muted">
                  {t('calendar.daysUntilRamadan', { days: daysUntilRamadan })}
                </ThemedText>
              )}
            </View>
          </View>
        </Card>
      )}

      <SectionHeader title={t('calendar.islamicHolidays')} />
      {loadingOccasions ? (
        <LoadingScreen />
      ) : (
        <Card padded={false}>
          {occasions.map(({ occasion, date, hijriYear }) => {
            const days = Math.ceil(
              (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            );
            return (
              <View key={occasion.key} style={[styles.occasionRow, { borderBottomColor: colors.border }]}>
                <ThemedText variant="body" style={{ flex: 1 }}>
                  {t(`calendar.${occasion.key}`)}
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  {date.toLocaleDateString()} · {t('calendar.daysUntilRamadan', { days })}
                </ThemedText>
              </View>
            );
          })}
        </Card>
      )}

      <SectionHeader title={t('calendar.convert')} />
      <DateConverter />
    </Screen>
  );
}

function RamadanActiveCard({
  hijri,
  suhoorTime,
  iftarTime,
  isFasted,
  onToggleFasting,
}: {
  hijri: HijriDate;
  suhoorTime: string;
  iftarTime: string;
  isFasted: boolean;
  onToggleFasting: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const ramadanDay = parseInt(hijri.day, 10);

  return (
    <Card style={styles.ramadanCard}>
      <View style={styles.ramadanRow}>
        <View style={[styles.ramadanIcon, { backgroundColor: colors.accentSoft }]}>
          <Icon name="moon" size={22} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText variant="body" bold>
            {t('calendar.ramadan')} — {ramadanDay}
          </ThemedText>
          <ThemedText variant="caption" color="muted">
            {hijri.month.en}
          </ThemedText>
        </View>
      </View>

      <View style={styles.fastingRow}>
        <View style={styles.fastingTime}>
          <ThemedText variant="caption" color="muted">
            {t('calendar.suhoor')}
          </ThemedText>
          <ThemedText variant="subtitle" bold>
            {suhoorTime}
          </ThemedText>
        </View>
        <View style={styles.fastingTime}>
          <ThemedText variant="caption" color="muted">
            {t('calendar.iftar')}
          </ThemedText>
          <ThemedText variant="subtitle" bold>
            {iftarTime}
          </ThemedText>
        </View>
      </View>

      <View style={styles.fastingToggle}>
        <ThemedText variant="body" bold>
          {t('calendar.fasting')}
        </ThemedText>
        <Switch
          value={isFasted}
          onValueChange={onToggleFasting}
          trackColor={{ true: colors.accent }}
        />
      </View>
      {isFasted ? (
        <ThemedText variant="caption" color="success">
          {t('calendar.fastingDone')}
        </ThemedText>
      ) : null}
    </Card>
  );
}

function DateConverter() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [mode, setMode] = useState<'h2g' | 'g2h'>('g2h');
  const [result, setResult] = useState<string | null>(null);
  const [d, setD] = useState('1');
  const [m, setM] = useState('1');
  const [y, setY] = useState(String(new Date().getFullYear()));

  const convert = async () => {
    try {
      if (mode === 'g2h') {
        const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        if (isNaN(date.getTime())) throw new Error();
        const hijri = await fetchHijriForGregorian(date);
        setResult(`${hijri.day} ${hijri.month.en} ${hijri.year} (H) · ${hijri.weekday.en}`);
      } else {
        const greg = await fetchGregorianForHijri(parseInt(d), parseInt(m), parseInt(y));
        setResult(`${greg.gregorian.day} ${greg.gregorian.month.en} ${greg.gregorian.year} (G)`);
      }
    } catch {
      Alert.alert(t('common.error'));
    }
  };

  const input = (value: string, setter: (v: string) => void, placeholder: string) => (
    <TextInput
      value={value}
      onChangeText={setter}
      placeholder={placeholder}
      keyboardType="number-pad"
      placeholderTextColor={colors.textMuted}
      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
    />
  );

  return (
    <Card>
      <View style={styles.convertToggle}>
        {(['g2h', 'h2g'] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => {
              setMode(m);
              setResult(null);
            }}
            style={[
              styles.convertOption,
              { backgroundColor: mode === m ? colors.primary : colors.surface },
            ]}>
            <ThemedText variant="caption" bold color={mode === m ? 'onPrimary' : 'text'}>
              {m === 'g2h' ? 'G → H' : 'H → G'}
            </ThemedText>
          </Pressable>
        ))}
      </View>
      <View style={styles.convertInputs}>
        {input(d, setD, 'DD')}
        {input(m, setM, 'MM')}
        {input(y, setY, 'YYYY')}
        <Button variant="primary" icon="swap-horizontal" onPress={convert} />
      </View>
      {result ? (
        <ThemedText variant="body" bold style={styles.convertResult}>
          {result}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  hijriDate: {
    textAlign: 'center',
  },
  ramadanCard: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.lg,
  },
  ramadanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ramadanIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastingRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fastingTime: {
    flex: 1,
    gap: spacing.xs,
  },
  fastingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  occasionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  convertToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  convertOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  convertInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  convertResult: {
    marginTop: spacing.lg,
  },
});
