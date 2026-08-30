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
export function getHeadingFromSensors(
  magnetometer: { x: number; y: number; z: number },
  accelerometer?: { x: number; y: number; z: number } | null,
): number {
  const { x: mx, y: my, z: mz } = magnetometer;

  if (mx === undefined || my === undefined || mz === undefined || mx === null || my === null || mz === null) {
    return NaN;
  }

  if (!accelerometer) {
    let heading = Math.atan2(-mx, my) * RAD;
    return (heading + 360) % 360;
  }

  const { x: gx, y: gy, z: gz } = accelerometer;

  if (gx === undefined || gy === undefined || gz === undefined || gx === null || gy === null || gz === null) {
    // Fall back to magnetometer-only heading
    let heading = Math.atan2(-mx, my) * RAD;
    return (heading + 360) % 360;
  }

  // Avoid division by zero
  const magNorm = Math.sqrt(gy * gy + gz * gz);
  const pitch = Math.atan2(-gx, magNorm !== 0 ? magNorm : 1);
  const roll = Math.atan2(gy === undefined || gz === undefined ? 0 : gy, gz === undefined ? 1 : gz);

  // Rotate magnetic vector by pitch and roll for tilt compensation
  const cx = mx * Math.cos(pitch) + mz * Math.sin(pitch);
  const cy =
    mx * Math.sin(roll) * Math.sin(pitch) +
    my * Math.cos(roll) -
    (mz === undefined ? 0 : mz) * Math.sin(roll) * Math.cos(pitch);

  if (cx === undefined || cy === undefined || cx === null || cy === null) {
    // Fall back to magnetometer-only heading
    let heading = Math.atan2(-mx, my) * RAD;
    return (heading + 360) % 360;
  }

  let heading = Math.atan2(-cy, cx) * RAD;
  return (heading + 360) % 360;
}

export function relativeAngleDiff(from: number, to: number): number {
  let diff = (to - from) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

/**
 * Calculate the Qibla direction showing distance and direction info.
 */
export function getQiblaInfo(latitude: number, longitude: number) {
  const distance = getDistanceKm(latitude, longitude);
  const bearing = getQiblaBearing(latitude, longitude);
  return { distance, bearing };
}
