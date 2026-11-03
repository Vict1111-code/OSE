import * as THREE from 'three';

export const EARTH_BASE_RADIUS = 100;
export const MAX_EARTH_DEPTH_KM = 700;
export const MAX_DEPTH_SHELL_DISPLACEMENT = 28; // Radial displacement at 700 km

/**
 * Converts Geographic coordinates (Lat, Lon) and focal Depth (km)
 * to 3D Cartesian Vector3 with negative Z-axis depth scaling.
 */
export function geoToCartesian(
  lat: number,
  lon: number,
  depthKm: number = 0,
  verticalExaggeration: number = 1.0,
  baseRadius: number = EARTH_BASE_RADIUS
): THREE.Vector3 {
  // Clamp depth to 0 - 700 km
  const clampedDepth = Math.max(0, Math.min(depthKm, MAX_EARTH_DEPTH_KM));
  
  // Negative-Z inward radial offset
  const depthFactor = (clampedDepth / MAX_EARTH_DEPTH_KM) * (MAX_DEPTH_SHELL_DISPLACEMENT * verticalExaggeration);
  const effectiveRadius = Math.max(10, baseRadius - depthFactor);

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -effectiveRadius * Math.sin(phi) * Math.cos(theta);
  const z = effectiveRadius * Math.sin(phi) * Math.sin(theta);
  const y = effectiveRadius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Maps focal depth in kilometers to a calibrated scientific RGB color
 * Shallow (0-35km): Terracotta / Ember Red
 * Intermediate (35-300km): Amber / Gold / Teal
 * Deep mantle Benioff zone (300-700km): Deep Cobalt / Violet
 */
export function getDepthColor(depthKm: number): THREE.Color {
  const norm = Math.max(0, Math.min(depthKm / MAX_EARTH_DEPTH_KM, 1));
  const color = new THREE.Color();
  
  if (norm < 0.08) {
    // 0 - 56 km: Upper brittle crust (Red-Orange #f97316)
    color.setRGB(0.98, 0.45, 0.08);
  } else if (norm < 0.25) {
    // 56 - 175 km: Lithosphere / Asthenosphere boundary (Gold #eab308)
    color.setRGB(0.92, 0.70, 0.03);
  } else if (norm < 0.5) {
    // 175 - 350 km: Upper mantle transition (Cyan #06b6d4)
    color.setRGB(0.02, 0.71, 0.83);
  } else {
    // 350 - 700 km: Deep subduction slab / Lower mantle (Indigo #6366f1)
    color.setRGB(0.39, 0.40, 0.95);
  }
  
  return color;
}

/**
 * Calculates acoustic frequency (Hz) from subsurface focal depth.
 * Implements the OSE Sonification specification:
 * Shallow fracturing -> Higher pitch (380 - 450 Hz)
 * Deep mantle tremor -> Sub-harmonic hum (45 - 90 Hz)
 */
export function depthToFrequency(depthKm: number): number {
  const norm = Math.max(0, Math.min(depthKm / MAX_EARTH_DEPTH_KM, 1));
  // Non-linear exponential decay for richer low-end resolution
  const minFreq = 42; // Deep mantle sub-bass hum
  const maxFreq = 460; // Upper crust fracture tone
  return maxFreq - Math.pow(norm, 0.8) * (maxFreq - minFreq);
}
