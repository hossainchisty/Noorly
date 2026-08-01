import * as Location from 'expo-location';

export type ResolvedLocation = {
  latitude: number;
  longitude: number;
  city?: string | null;
  country?: string | null;
  label?: string | null;
};

export const DEFAULT_LOCATION: ResolvedLocation = {
  latitude: 21.422487,
  longitude: 39.826206,
  city: 'Makkah',
  country: 'Saudi Arabia',
  label: 'Makkah, Saudi Arabia',
};

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export async function geocodeCity(city: string, country: string): Promise<ResolvedLocation | null> {
  try {
    const params = new URLSearchParams({
      q: `${city}${country ? `, ${country}` : ''}`,
      format: 'json',
      limit: '1',
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { 'User-Agent': 'NoorlyApp/1.0 (prayer times lookup)' },
    });
    if (!res.ok) return null;
    const results = (await res.json()) as NominatimResult[];
    const first = results[0];
    if (!first) return null;
    return {
      latitude: Number(first.lat),
      longitude: Number(first.lon),
      city,
      country,
      label: first.display_name,
    };
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Location request timed out (${ms}ms)`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export async function getCurrentLocation(): Promise<ResolvedLocation | null> {
  let hasPermission = false;
  try {
    hasPermission = await withTimeout(requestLocationPermission(), 10000);
  } catch {
    return null;
  }
  if (!hasPermission) return null;

  let position: Location.LocationObject | null = null;
  try {
    position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      15000,
    );
  } catch {
    try {
      position = await withTimeout(Location.getLastKnownPositionAsync(), 5000);
    } catch {
      position = null;
    }
  }
  if (!position) return null;

  const { latitude, longitude } = position.coords;
  let place: Location.LocationGeocodedAddress[] = [];
  try {
    place = await Location.reverseGeocodeAsync({ latitude, longitude });
  } catch {
    place = [];
  }

  const first = place[0];
  return {
    latitude,
    longitude,
    city: first?.city ?? first?.region,
    country: first?.country,
    label: first?.city ? `${first.city}${first.country ? `, ${first.country}` : ''}` : undefined,
  };
}

export function getDistanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
