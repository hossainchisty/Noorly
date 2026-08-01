import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';

import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { LoadingScreen, Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import {
  PRAYER_ORDER,
  computeNextPrayer,
  formatClock,
  formatCountdown,
  prayerI18nKey,
} from '@/features/prayerTimes/helpers';
import { usePrayerSync } from '@/features/prayerTimes/usePrayerSync';
import { DEFAULT_LOCATION } from '@/features/location/location';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePrayerTimesStore } from '@/store/prayer-times-store';
import { useSettingsStore } from '@/store/settings-store';
import { fontFamily, letterSpacing, palette, radius, spacing } from '@/theme';

type Tile = {
  route: string;
  icon: IconName;
  labelKey: string;
  tint: 'primary' | 'accent';
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();

  const day = usePrayerTimesStore((s) => s.day);
  const hijri = usePrayerTimesStore((s) => s.hijri);
  const loading = usePrayerTimesStore((s) => s.loading);
  const error = usePrayerTimesStore((s) => s.error);

  const use24h = useSettingsStore((s) => s.use24h);
  const savedLocation = useSettingsStore((s) => s.savedLocation);
  const manualCity = useSettingsStore((s) => s.manualCity);

  const { sync } = usePrayerSync();
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextPrayer = useMemo(() => {
    if (!day) return null;
    return computeNextPrayer(day.timings, now);
  }, [day, now]);

  const progress = useMemo(() => {
    if (!nextPrayer?.current) return 0;
    const total = nextPrayer.next.time.getTime() - nextPrayer.current.time.getTime();
    if (total <= 0) return 0;
    const elapsed = now.getTime() - nextPrayer.current.time.getTime();
    return Math.min(1, Math.max(0, elapsed / total));
  }, [nextPrayer, now]);

  const greetingKey = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return 'home.greeting.morning';
    if (h < 17) return 'home.greeting.afternoon';
    if (h < 21) return 'home.greeting.evening';
    return 'home.greeting.night';
  }, [now]);

  const onRefresh = async () => {
    setRefreshing(true);
    await sync();
    setRefreshing(false);
  };

  const tiles: Tile[] = [
    { route: '/quran', icon: 'book-outline', labelKey: 'home.quran', tint: 'primary' },
    { route: '/qibla', icon: 'compass-outline', labelKey: 'home.qibla', tint: 'accent' },
    { route: '/duas', icon: 'heart-outline', labelKey: 'home.duas', tint: 'primary' },
    { route: '/more/tasbeeh', icon: 'ellipsis-horizontal-circle-outline', labelKey: 'home.tasbeeh', tint: 'accent' },
    { route: '/more/calendar', icon: 'calendar-outline', labelKey: 'home.calendar', tint: 'primary' },
    { route: '/more/mosque-finder', icon: 'business-outline', labelKey: 'home.mosques', tint: 'accent' },
  ];

  const heroGradient: [string, string] = isDark
    ? [palette.emerald900, '#0D624A']
    : [palette.emerald900, palette.emerald500];

  const locationLabel =
    savedLocation?.label ??
    savedLocation?.city ??
    manualCity ??
    DEFAULT_LOCATION.label ??
    t('home.location');

  if (loading && !day) return <LoadingScreen />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <ThemedView style={styles.header}>
        <Image source={require('@/assets/images/logo.png')} style={styles.brandMark} />
        <View style={styles.headerText}>
          <ThemedText variant="title" bold>
            {t(greetingKey)}
          </ThemedText>
          <ThemedText variant="caption" color="muted">
            {hijri
              ? `${hijri.weekday.en}, ${hijri.day} ${hijri.month.en} ${hijri.year}`
              : day?.date.gregorian.weekday.en}
          </ThemedText>
        </View>
      </ThemedView>

      {error && !day ? (
        <Card style={styles.errorCard}>
          <ThemedText color="danger" variant="body">
            {t('errors.network')}
          </ThemedText>
          <ThemedText variant="caption" color="muted">
            {error}
          </ThemedText>
        </Card>
      ) : null}

      {day && nextPrayer ? (
        <LinearGradient
          colors={heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroDecorTop} />
          <View style={styles.heroDecorBottom} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroChip}>
              <Icon name="sunny-outline" size={13} color="#FFFFFF" />
              <ThemedText variant="caption" bold style={styles.heroChipText}>
                {t('home.nextPrayer')}
              </ThemedText>
            </View>
            <View style={[styles.heroChip, styles.heroChipLocation]}>
              <Icon name="location-outline" size={13} color="#FFFFFF" />
              <ThemedText variant="caption" bold numberOfLines={1} style={[styles.heroChipText, styles.heroChipLocationText]}>
                {locationLabel}
              </ThemedText>
            </View>
          </View>

          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ring}>
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                stroke={isDark ? palette.gold300 : palette.gold500}
                strokeWidth={RING_STROKE}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
                transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <ThemedText style={styles.heroPrayerName} numberOfLines={1}>
                {t(`prayers.${prayerI18nKey(nextPrayer.next.key)}`)}
              </ThemedText>
              <CountdownValue target={nextPrayer.next.time} now={now} />
              <ThemedText style={styles.heroCaption}>{t('home.remaining')}</ThemedText>
            </View>
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatLabel}>{t('home.now')}</ThemedText>
              <ThemedText style={styles.heroStatValue} numberOfLines={1}>
                {nextPrayer.current
                  ? `${t(`prayers.${prayerI18nKey(nextPrayer.current.key)}`)} · ${formatClock(day.timings[nextPrayer.current.key], use24h)}`
                  : '—'}
              </ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={[styles.heroStat, styles.heroStatRight]}>
              <ThemedText style={styles.heroStatLabel}>{t('home.upNext')}</ThemedText>
              <ThemedText style={styles.heroStatValue} numberOfLines={1}>
                {formatClock(day.timings[nextPrayer.next.key], use24h)}
              </ThemedText>
            </View>
          </View>
        </LinearGradient>
      ) : null}

      <SectionHeader
        title={t('home.todaySchedule')}
        right={
          <ThemedText variant="caption" color="muted">
            {day?.date.readable}
          </ThemedText>
        }
      />
      <Card padded={false}>
        {day
          ? PRAYER_ORDER.map(({ key, i18nKey }, idx) => {
              const isNext = nextPrayer?.next.key === key && !nextPrayer.isNext;
              const isCurrent = nextPrayer?.current?.key === key;
              return (
                <View
                  key={key}
                  style={[
                    styles.scheduleRow,
                    isNext && { backgroundColor: colors.primarySoft },
                    idx < PRAYER_ORDER.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}>
                  <View style={styles.scheduleNameWrap}>
                    {isCurrent ? (
                      <View style={[styles.scheduleBadge, { backgroundColor: colors.accentSoft }]}>
                        <ThemedText variant="label" color="accent">
                          {t('home.now')}
                        </ThemedText>
                      </View>
                    ) : null}
                    <ThemedText variant="body" bold={isNext} color={isNext ? 'primary' : 'text'}>
                      {t(`prayers.${i18nKey}`)}
                    </ThemedText>
                  </View>
                  <View style={styles.scheduleTimeWrap}>
                    <ThemedText variant="body" bold color={isNext ? 'primary' : 'text'}>
                      {formatClock(day.timings[key], use24h)}
                    </ThemedText>
                    {isNext ? (
                      <ThemedText variant="label" color="primary">
                        {t('home.nextPrayer')}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
              );
            })
          : null}
      </Card>

      <SectionHeader title={t('home.quickAccess')} />
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <PressableCard key={tile.route} tile={tile} />
        ))}
      </View>
    </Screen>
  );
}

const RING_SIZE = 200;
const RING_STROKE = 10;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function CountdownValue({ target, now }: { target: Date; now: Date }) {
  const { hours, minutes, seconds } = formatCountdown(target, now);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <View style={styles.countdownWrap}>
      <ThemedText style={styles.heroCountdown}>
        {hours > 0 ? `${hours}h ` : ''}
        {pad(minutes)}
        <ThemedText style={styles.heroCountdownUnit}>m</ThemedText>{' '}
        {pad(seconds)}
        <ThemedText style={styles.heroCountdownUnit}>s</ThemedText>
      </ThemedText>
    </View>
  );
}

function PressableCard({ tile }: { tile: Tile }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const tint = tile.tint === 'accent' ? colors.accent : colors.primary;
  const tintSoft = tile.tint === 'accent' ? colors.accentSoft : colors.primarySoft;

  return (
    <Pressable
      onPress={() => router.push(tile.route as never)}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
      ]}>
      <View style={[styles.tileIcon, { backgroundColor: tintSoft }]}>
        <Icon name={tile.icon} size={24} color={tint} />
      </View>
      <ThemedText variant="caption" bold style={styles.tileLabel}>
        {t(tile.labelKey)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    paddingTop: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroDecorTop: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroDecorBottom: {
    position: 'absolute',
    bottom: -90,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: spacing.md,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  heroChipLocation: {
    flexShrink: 1,
  },
  heroChipLocationText: {
    maxWidth: 130,
  },
  heroChipText: {
    color: '#FFFFFF',
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  ring: {
    position: 'absolute',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  heroPrayerName: {
    fontFamily: fontFamily.amiriBold,
    fontSize: 30,
    lineHeight: 38,
    color: '#FFFFFF',
    maxWidth: RING_SIZE - 48,
  },
  countdownWrap: {
    marginTop: spacing.xs,
  },
  heroCountdown: {
    fontFamily: fontFamily.sans,
    fontSize: 30,
    lineHeight: 36,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: letterSpacing.tight,
  },
  heroCountdownUnit: {
    fontFamily: fontFamily.sans,
    fontSize: 16,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
  heroCaption: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: spacing.md,
  },
  heroStat: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 2,
  },
  heroStatRight: {
    alignItems: 'flex-end',
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: spacing.lg,
  },
  errorCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  scheduleNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  scheduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  scheduleTimeWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    flexBasis: '31%',
    flexGrow: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 90,
  },
  tileIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    textAlign: 'center',
  },
});
