const KAABA_LAT = 21.422487;
const KAABA_LON = 39.826206;

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export function getQiblaBearing(latitude: number, longitude: number): number {
  const lat1 = latitude * DEG;
  const lat2 = KAABA_LAT * DEG;
  const dLon = (KAABA_LON - longitude) * DEG;

  const y = Math.sin(dLon);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * RAD;
  bearing = (bearing + 360) % 360;
  return bearing;
}

export function getDistanceKm(latitude: number, longitude: number): number {
  const R = 6371;
  const dLat = (KAABA_LAT - latitude) * DEG;
  const dLon = (KAABA_LON - longitude) * DEG;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latitude * DEG) * Math.cos(KAABA_LAT * DEG) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Compass heading (degrees clockwise from north) that the top of the device
 * points toward.
 *
 * With the device held flat, the magnetometer x-axis points right, the y-axis
 * toward the top of the screen, and z out of the screen. Heading is therefore
 * atan2(-mx, my). When accelerometer data is available we tilt-compensate by
 * first rotating the magnetic vector by the device pitch and roll.
 */
export function getHeadingFromSensors(
  magnetometer: { x: number; y: number; z: number },
  accelerometer?: { x: number; y: number; z: number } | null,
): number {
  const { x: mx, y: my, z: mz } = magnetometer;

  if (!accelerometer) {
    let heading = Math.atan2(-mx, my) * RAD;
    return (heading + 360) % 360;
  }

  const { x: gx, y: gy, z: gz } = accelerometer;

  const pitch = Math.atan2(-gx, Math.sqrt(gy * gy + gz * gz));
  const roll = Math.atan2(gy, gz);

  const cx = mx * Math.cos(pitch) + mz * Math.sin(pitch);
  const cy =
    mx * Math.sin(roll) * Math.sin(pitch) +
    my * Math.cos(roll) -
    mz * Math.sin(roll) * Math.cos(pitch);

  let heading = Math.atan2(-cy, cx) * RAD;
  return (heading + 360) % 360;
}

export function relativeAngleDiff(from: number, to: number): number {
  let diff = (to - from) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}
