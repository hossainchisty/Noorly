import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapView, Marker, PROVIDER_DEFAULT } from '@/components/map/map';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { LoadingScreen, Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { getCurrentLocation, getDistanceMeters } from '@/features/location/location';
import { findMosques, type Mosque } from '@/services/places';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useSettingsStore } from '@/store/settings-store';
import { radius, spacing } from '@/theme';

type Loc = { latitude: number; longitude: number };

export default function MosqueFinderScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const savedLocation = useSettingsStore((s) => s.savedLocation);

  const [location, setLocation] = useState<Loc | null>(savedLocation ?? null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'list'>('map');

  useEffect(() => {
    (async () => {
      let loc = location;
      if (!loc) {
        const current = await getCurrentLocation();
        if (current) {
          useSettingsStore.getState().setSavedLocation(current);
          loc = { latitude: current.latitude, longitude: current.longitude };
        }
      }
      if (!loc) {
        setLoading(false);
        return;
      }
      setLocation(loc);
      try {
        const found = await findMosques(loc.latitude, loc.longitude, 10);
        setMosques(found);
      } catch {
        setMosques([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingScreen />;

  if (!location) {
    return (
      <Screen>
        <ThemedText color="muted">{t('errors.locationPermission')}</ThemedText>
      </Screen>
    );
  }

  const openDirections = (lat: number, lon: number) => {
    const url =
      Platform.select({
        ios: `http://maps.apple.com/?daddr=${lat},${lon}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
      }) ?? '';
    Linking.openURL(url);
  };

  return (
    <Screen padded scrollable={false}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => setView('map')}
          style={[styles.segment, { backgroundColor: view === 'map' ? colors.primary : colors.surface }]}>
          <ThemedText variant="caption" bold color={view === 'map' ? 'onPrimary' : 'text'}>
            {t('mosqueFinder.map')}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setView('list')}
          style={[styles.segment, { backgroundColor: view === 'list' ? colors.primary : colors.surface }]}>
          <ThemedText variant="caption" bold color={view === 'list' ? 'onPrimary' : 'text'}>
            {t('mosqueFinder.list')} ({mosques.length})
          </ThemedText>
        </Pressable>
      </View>

      {view === 'map' ? (
        <View style={styles.mapWrap}>
          <MapView
            style={StyleSheet.absoluteFill}
            provider={Platform.OS === 'android' ? PROVIDER_DEFAULT : undefined}
            initialRegion={{
              ...location,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            showsUserLocation>
            {mosques.map((m) => (
              <Marker
                key={m.id}
                coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                title={m.name}
                description={m.address ?? undefined}
                pinColor={colors.accent}
              />
            ))}
          </MapView>
        </View>
      ) : (
        <View style={styles.listWrap}>
          <ThemedText variant="caption" color="muted" style={styles.listHint}>
            {t('mosqueFinder.showWithin', { km: 10 })}
          </ThemedText>
          {mosques.length === 0 ? (
            <Card>
              <ThemedText color="muted">{t('mosqueFinder.noResults')}</ThemedText>
            </Card>
          ) : (
            mosques.map((m) => {
              const dist = getDistanceMeters(location, m);
              return (
                <Card key={m.id} style={styles.mosqueCard}>
                  <View style={styles.mosqueHeader}>
                    <View style={[styles.mosqueIcon, { backgroundColor: colors.primarySoft }]}>
                      <Icon name="business" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="body" bold>
                        {m.name}
                      </ThemedText>
                      {m.address ? (
                        <ThemedText variant="caption" color="muted" numberOfLines={1}>
                          {m.address}
                        </ThemedText>
                      ) : null}
                      {m.phone ? (
                        <ThemedText variant="caption" color="muted">
                          {m.phone}
                        </ThemedText>
                      ) : null}
                      {m.website ? (
                        <ThemedText variant="caption" color="muted">
                          <Icon name="globe-outline" size={14} color="muted" />
                          {m.website}
                        </ThemedText>
                      ) : null}
                      {m.capacity !== undefined && m.capacity !== null ? (
                        <ThemedText variant="caption" color="muted">
                          {t('mosqueFinder.capacity', { capacity: m.capacity }) }
                        </ThemedText>
                      ) : null}
                      <ThemedText variant="caption" color="muted">
                        {dist < 1000
                          ? t('mosqueFinder.distanceM', { distance: Math.round(dist) })
                          : t('mosqueFinder.distanceKm', { distance: (dist / 1000).toFixed(1) })}
                      </ThemedText>
                    </View>
                    <Button
                      variant="outline"
                      size="sm"
                      title={t('mosqueFinder.directions')}
                      icon="navigate-outline"
                      onPress={() => openDirections(m.latitude, m.longitude)}
                    />
                  </View>
                </Card>
              );
            })
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  mapWrap: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00000022',
  },
  listWrap: {
    flex: 1,
  },
  listHint: {
    marginBottom: spacing.sm,
  },
  mosqueCard: {
    marginBottom: spacing.md,
  },
  mosqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mosqueIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
