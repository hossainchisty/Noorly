import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DeviceMotion, Magnetometer } from 'expo-sensors';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { MapView, Marker, Polyline } from '@/components/map/map';
import { LoadingScreen, Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { getCurrentLocation } from '@/features/location/location';
import {
  getDistanceKm,
  getHeadingFromSensors,
  getQiblaInfo,
  relativeAngleDiff,
} from '@/features/qibla/qibla';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useSettingsStore } from '@/store/settings-store';
import { radius, spacing } from '@/theme';

const KAABA = { latitude: 21.422487, longitude: 39.826206 };

type Loc = { latitude: number; longitude: number };

export default function QiblaScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const savedLocation = useSettingsStore((s) => s.savedLocation);
  const [location, setLocation] = useState<Loc | null>(savedLocation ?? null);
  const [heading, setHeading] = useState(0);
  const [qibla, setQibla] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [sensorOk, setSensorOk] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const magRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const accelRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const qiblaInfoRef = useRef<{ distance: number; bearing: number } | null>(null);

  useEffect(() => {
    let magSub: { remove(): void } | undefined;
    let accelSub: { remove(): void } | undefined;

    (async () => {
      let loc = savedLocation;
      if (!loc) {
        const current = await getCurrentLocation();
        if (current) {
          useSettingsStore.getState().setSavedLocation(current);
          loc = current;
        }
      }
      if (loc) {
        setLocation({ latitude: loc.latitude, longitude: loc.longitude });
        const info = getQiblaInfo(loc.latitude, loc.longitude);
        setQibla(info.bearing);
        qiblaInfoRef.current = info;
      }

      const magnetometerOk = await Magnetometer.isAvailableAsync();
      setSensorOk(magnetometerOk);
      if (!magnetometerOk) {
        setReady(true);
        return;
      }

      Magnetometer.setUpdateInterval(100);
      DeviceMotion.setUpdateInterval(100);
      magSub = Magnetometer.addListener((m) => {
        magRef.current = m;
        if (qiblaInfoRef.current && magRef.current) {
          // Heading computed in tick interval
        }
      });
      accelSub = DeviceMotion.addListener((m) => {
        accelRef.current = m.accelerationIncludingGravity;
      });
      setReady(true);
    })();

    const tick = setInterval(() => {
      if (magRef.current && qiblaInfoRef.current) {
        const heading = getHeadingFromSensors(magRef.current, accelRef.current);
        setHeading(heading);
        setQibla(qiblaInfoRef.current.bearing);
      }
    }, 100);

    return () => {
      magSub?.remove();
      accelSub?.remove();
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const diff = qibla != null ? relativeAngleDiff(heading, qibla) : 0;
  const facingQibla = Math.abs(diff) < 6;

  const needleRotation = useSharedValue(0);
  const roseRotation = useSharedValue(0);

  useEffect(() => {
    needleRotation.value = withTiming(diff, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [diff, needleRotation]);

  useEffect(() => {
    roseRotation.value = withTiming(-heading, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [heading, roseRotation]);

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${needleRotation.value}deg` }],
  }));
  const roseStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${roseRotation.value}deg` }],
  }));

  if (!ready) return <LoadingScreen />;

  return (
    <Screen padded>
      <ThemedText variant="title" bold style={{ marginBottom: spacing.md }}>
        {t('qibla.title')}
      </ThemedText>

      {!sensorOk ? (
        <FlatMapFallback
          location={location}
          qibla={qibla}
          showMap={showMap}
          onToggleMap={() => setShowMap((v) => !v)}
        />
      ) : (
        <>
          <View style={styles.compassWrap}>
            <View
              style={[
                styles.compassCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Animated.View style={[styles.rose, roseStyle]}>
                <Cardinal />
                <KaabaIcon size={60} color={colors.accent} />
              </Animated.View>
              <Animated.View style={[styles.needle, needleStyle]}>
                <View style={[styles.needleHead, { backgroundColor: colors.accent }]} />
                <View
                  style={[
                    styles.needleShaft,
                    { backgroundColor: colors.accent, shadowColor: colors.shadow },
                  ]}
                />
              </Animated.View>
              <View style={styles.fixedMarker} />
              <View style={[styles.centerDot, { backgroundColor: colors.primary }]} />
            </View>
          </View>

          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Icon
                name={facingQibla ? 'checkmark-circle' : 'compass-outline'}
                size={24}
                color={facingQibla ? colors.success : colors.primary}
              />
              <View style={{ flex: 1 }}>
                <ThemedText variant="caption" color="muted">
                  {facingQibla ? t('qibla.pointingTo') : t('qibla.accuracyLow')}
                </ThemedText>
                {qibla != null && (
                  <ThemedText variant="subtitle" bold>
                    {t('qibla.degrees', { value: Math.round(diff) })} {t('qibla.kaaba')} ·{' '}
                    {t('qibla.degrees', { value: Math.round(qibla) })}
                  </ThemedText>
                )}
              </View>
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

function FlatMapFallback({
  location,
  qibla,
  showMap,
  onToggleMap,
}: {
  location: Loc | null;
  qibla: number | null;
  showMap: boolean;
  onToggleMap: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  if (!location) {
    return (
      <Card style={styles.fallbackCard}>
        <ThemedText variant="body" bold>
          {t('qibla.notAvailable')}
        </ThemedText>
        <ThemedText variant="caption" color="muted">
          {t('errors.locationPermission')}
        </ThemedText>
      </Card>
    );
  }

  return (
    <Card style={styles.fallbackCard} padded={false}>
      {showMap ? (
        <View style={styles.mapWrap}>
          <MapView
            style={StyleSheet.absoluteFill}
            region={{
              latitude: (location.latitude + KAABA.latitude) / 2,
              longitude: (location.longitude + KAABA.longitude) / 2,
              latitudeDelta: 60,
              longitudeDelta: 60,
            }}>
            <Marker coordinate={location} title={t('home.location')} />
            <Marker coordinate={KAABA} pinColor={colors.accent} title={t('qibla.kaaba')} />
            <Polyline
              coordinates={[location, KAABA]}
              strokeColor={colors.primary}
              strokeWidth={3}
            />
          </MapView>
        </View>
      ) : null}
      <View style={styles.fallbackBody}>
        <ThemedText variant="body" bold>
          {t('qibla.notAvailable')}
        </ThemedText>
        <ThemedText variant="caption" color="muted">
          {t('qibla.flatMapDesc')}
        </ThemedText>
        {qibla != null && (
          <View style={styles.fallbackDirection}>
            <View
              style={[
                styles.fallbackArrow,
                { backgroundColor: colors.accent },
                { transform: [{ rotate: `${qibla}deg` }] },
              ]}
            />
            <ThemedText variant="subtitle" bold>
              {t('qibla.degrees', { value: Math.round(qibla) })} ·{' '}
              {getDistanceKm(location.latitude, location.longitude).toFixed(0)} km
            </ThemedText>
          </View>
        )}
        <MapToggleButton label={showMap ? t('common.close') : t('qibla.useMap')} onPress={onToggleMap} />
      </View>
    </Card>
  );
}

function MapToggleButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.mapToggle,
        { backgroundColor: colors.primarySoft },
        pressed && { opacity: 0.8 },
      ]}>
      <ThemedText variant="caption" bold color="primary">
        {label}
      </ThemedText>
    </Pressable>
  );
}

function Cardinal() {
  return (
    <View style={styles.roseInner}>
      <View style={[styles.cardinalTick, { top: -36 }]}>
        <ThemedText variant="caption" bold color="muted">
          N
        </ThemedText>
      </View>
      <View style={[styles.cardinalTick, { bottom: -36 }]}>
        <ThemedText variant="caption" bold color="muted">
          S
        </ThemedText>
      </View>
      <View style={[styles.cardinalTick, { left: -36 }]}>
        <ThemedText variant="caption" bold color="muted">
          W
        </ThemedText>
      </View>
      <View style={[styles.cardinalTick, { right: -36 }]}>
        <ThemedText variant="caption" bold color="muted">
          E
        </ThemedText>
      </View>
      <ThemedText variant="caption" bold color="accent" style={styles.qiblaTick}>
        • Q
      </ThemedText>
    </View>
  );
}

function KaabaIcon({ size = 40, color = 'primary' }: { size: number; color: 'primary' | 'accent' | 'muted' | 'success' }) {
  return (
    <View style={styles.kaabaContainer}>
      <ThemedText variant="caption" bold color={color}>
        🕋
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  compassWrap: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  compassCard: {
    width: 300,
    height: 300,
    borderRadius: radius.full,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rose: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roseInner: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: '#9999',
    position: 'relative',
  },
  cardinalTick: {
    position: 'absolute',
    alignItems: 'center',
  },
  qiblaTick: {
    position: 'absolute',
    top: 2,
    alignSelf: 'center',
  },
  needle: {
    position: 'absolute',
    alignItems: 'center',
    width: 20,
    height: 120,
  },
  needleHead: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  needleShaft: {
    width: 4,
    flex: 1,
    borderRadius: 2,
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  kaabaContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  fixedMarker: {
    position: 'absolute',
    top: 22,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#888',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusCard: {
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fallbackCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  fallbackBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  fallbackDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  fallbackArrow: {
    width: 18,
    height: 18,
    borderRadius: 4,
    transformOrigin: 'center',
  },
  mapWrap: {
    height: 280,
    width: '100%',
    overflow: 'hidden',
  },
  mapToggle: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
});
