const KAABA_LAT = 21.422487;
const KAABA_LON = 39.826206;

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const EARTH_RADIUS_KM = 6371.0;

/**
 * Calculate the initial bearing from a start point to a destination point
 * following the great circle path, in degrees clockwise from north.
 */
export function getQiblaBearing(latitude: number, longitude: number): number {
  const lat1 = latitude * DEG;
  const lat2 = KAABA_LAT * DEG;
  const dLon = ((KAABA_LON - longitude) * DEG + 540) % 360 - 180; // normalize to [-180, 180]

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * RAD;
  bearing = (bearing + 360) % 360;
  return bearing;
}

/**
 * Calculate the great-circle distance between two points in kilometers.
 */
export function getDistanceKm(latitude: number, longitude: number): number {
  const lat1 = latitude * DEG;
  const lat2 = KAABA_LAT * DEG;
  const dLat = (KAABA_LAT - latitude) * DEG;
  const dLon = (KAABA_LON - longitude) * DEG;

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Get the relative angle between the device heading and the Qibla direction.
 * Returns a positive value if the Qibla is to the right, negative if to the left.
 */
export function getQiblaRelativeAngle(deviceHeading: number, latitude: number, longitude: number): number {
  const qiblaBearing = getQiblaBearing(latitude, longitude);
  return relativeAngleDiff(qiblaBearing, deviceHeading);
}

/**
 * Calculate the Qibla direction showing distance and direction info.
 */
export function getQiblaInfo(latitude: number, longitude: number) {
  const distance = getDistanceKm(latitude, longitude);
  const bearing = getQiblaBearing(latitude, longitude);
  return { distance, bearing };
}
