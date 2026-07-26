import type { PatternGrid } from "../../physics/types";

export interface CutPoint {
  angleDeg: number;
  gainDbi: number;
}

/** Azimuth cut at a fixed theta (elevation slice), full 360 deg sweep, compass angle = phi. */
export function sampleAzimuthCut(pattern: PatternGrid, thetaDeg: number): CutPoint[] {
  const { grid, gainDbi } = pattern;
  const { thetaSteps, phiSteps, thetaMaxDeg } = grid;
  const dTheta = thetaMaxDeg / (thetaSteps - 1);
  const i = Math.max(0, Math.min(thetaSteps - 1, Math.round(thetaDeg / dTheta)));

  const points: CutPoint[] = [];
  for (let j = 0; j < phiSteps; j++) {
    points.push({ angleDeg: (j / phiSteps) * 360, gainDbi: gainDbi[i * phiSteps + j] });
  }
  points.push({ angleDeg: 360, gainDbi: points[0].gainDbi });
  return points;
}

/**
 * Elevation cut through a fixed azimuth (front) and its opposite (back), presented as a
 * half-circle: angleDeg 0 = horizon (front), 90 = zenith, 180 = horizon (back). Only the
 * upper hemisphere is shown even in free-space mode, matching how hams read elevation plots.
 */
export function sampleElevationCut(pattern: PatternGrid, phiDeg: number): CutPoint[] {
  const { grid, gainDbi } = pattern;
  const { thetaSteps, phiSteps, thetaMaxDeg } = grid;
  const dTheta = thetaMaxDeg / (thetaSteps - 1);
  const upperThetaMax = Math.min(thetaMaxDeg, 90);
  const maxIndex = Math.round(upperThetaMax / dTheta);

  const jFor = (deg: number) => {
    const norm = ((deg % 360) + 360) % 360;
    return Math.round((norm / 360) * phiSteps) % phiSteps;
  };
  const jFront = jFor(phiDeg);
  const jBack = jFor(phiDeg + 180);

  const points: CutPoint[] = [];
  for (let i = maxIndex; i >= 0; i--) {
    const elevation = 90 - i * dTheta;
    points.push({ angleDeg: elevation, gainDbi: gainDbi[i * phiSteps + jFront] });
  }
  for (let i = 1; i <= maxIndex; i++) {
    const elevation = 90 - i * dTheta;
    points.push({ angleDeg: 180 - elevation, gainDbi: gainDbi[i * phiSteps + jBack] });
  }
  return points;
}
