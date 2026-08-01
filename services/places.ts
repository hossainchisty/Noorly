const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export type Mosque = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string | null;
};

type OverpassElement = {
  type: 'node' | 'way';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function buildQuery(latitude: number, longitude: number, radiusMeters: number): string {
  return `[out:json][timeout:25];
(
  node["amenity"="mosque"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"="mosque"](around:${radiusMeters},${latitude},${longitude});
);
out center tags;`;
}

export async function findMosques(
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
): Promise<Mosque[]> {
  const query = buildQuery(latitude, longitude, radiusKm * 1000);

  let lastError: unknown = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) {
        lastError = new Error(`Overpass request failed: ${res.status}`);
        continue;
      }
      const json = (await res.json()) as { elements: OverpassElement[] };

      return json.elements
        .map((el): Mosque | null => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (lat == null || lon == null) return null;
          return {
            id: `${el.type}-${el.id}`,
            name: el.tags?.name?.trim() || 'Mosque',
            latitude: lat,
            longitude: lon,
            address: el.tags?.['addr:street'] ?? null,
          };
        })
        .filter((m): m is Mosque => m !== null);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error('Could not reach Overpass API');
}

export function getDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
