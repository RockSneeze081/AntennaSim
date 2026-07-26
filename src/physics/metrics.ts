import type { AntennaConfig, PatternGrid, PatternMetrics, SphericalGrid } from "./types";
import { discretizeWire, radiationIntensity } from "./farField";
import { waveNumber } from "./constants";

/**
 * Computes the full gain pattern (dBi) over the spherical grid for the given antenna.
 * Ground mode determines both which hemisphere is sampled and whether image elements
 * are summed in (plan A.3/A.4): free space samples the full sphere and normalizes total
 * radiated power over it; a grounded antenna samples only the upper hemisphere but still
 * uses 4*pi as the isotropic reference, which correctly reproduces the ~3 dB "ground gain"
 * boost of e.g. a quarter-wave vertical over perfect ground.
 */
export function computePattern(config: AntennaConfig, grid: SphericalGrid): { pattern: PatternGrid; nearDegenerate: boolean } {
  const k = waveNumber(config.frequencyHz);
  const { elements, nearDegenerate } = discretizeWire(config.wire, k);

  const { thetaSteps, phiSteps, thetaMaxDeg } = grid;
  const thetaMaxRad = (thetaMaxDeg * Math.PI) / 180;
  const dTheta = thetaSteps > 1 ? thetaMaxRad / (thetaSteps - 1) : thetaMaxRad;
  const dPhi = (2 * Math.PI) / phiSteps;

  const uGrid = new Float64Array(thetaSteps * phiSteps);
  for (let i = 0; i < thetaSteps; i++) {
    const theta = i * dTheta;
    for (let j = 0; j < phiSteps; j++) {
      const phi = j * dPhi;
      uGrid[i * phiSteps + j] = radiationIntensity(elements, k, theta, phi, config.ground);
    }
  }

  const gainDbi = gainFromIntensityGrid(uGrid, grid);
  return { pattern: { grid, gainDbi }, nearDegenerate };
}

/**
 * Normalizes a raw radiation-intensity grid into a dBi gain grid (plan A.4). Separated from
 * computePattern so the normalization math can be unit-tested with a contrived U(theta,phi).
 */
export function gainFromIntensityGrid(uGrid: Float64Array, grid: SphericalGrid): Float64Array {
  const { thetaSteps, phiSteps, thetaMaxDeg } = grid;
  const thetaMaxRad = (thetaMaxDeg * Math.PI) / 180;
  const dTheta = thetaSteps > 1 ? thetaMaxRad / (thetaSteps - 1) : thetaMaxRad;
  const dPhi = (2 * Math.PI) / phiSteps;

  let pRad = 0;
  for (let i = 0; i < thetaSteps; i++) {
    const theta = i * dTheta;
    const solidAngleWeight = Math.sin(theta) * dTheta * dPhi;
    for (let j = 0; j < phiSteps; j++) {
      pRad += uGrid[i * phiSteps + j] * solidAngleWeight;
    }
  }

  const safePRad = pRad > 1e-30 ? pRad : 1e-30;
  const gainDbi = new Float64Array(uGrid.length);
  for (let idx = 0; idx < uGrid.length; idx++) {
    const directivity = (4 * Math.PI * uGrid[idx]) / safePRad;
    gainDbi[idx] = 10 * Math.log10(Math.max(directivity, 1e-12));
  }
  return gainDbi;
}

/** Extracts peak gain, takeoff angle and front-to-back ratio from a computed pattern. */
export function extractMetrics(pattern: PatternGrid, nearDegenerate: boolean): PatternMetrics {
  const { grid, gainDbi } = pattern;
  const { thetaSteps, phiSteps, thetaMaxDeg } = grid;

  let peakIdx = 0;
  let peakVal = -Infinity;
  for (let idx = 0; idx < gainDbi.length; idx++) {
    if (gainDbi[idx] > peakVal) {
      peakVal = gainDbi[idx];
      peakIdx = idx;
    }
  }

  const peakI = Math.floor(peakIdx / phiSteps);
  const peakJ = peakIdx % phiSteps;
  const dThetaDeg = thetaSteps > 1 ? thetaMaxDeg / (thetaSteps - 1) : thetaMaxDeg;
  const dPhiDeg = 360 / phiSteps;
  const peakThetaDeg = peakI * dThetaDeg;
  const peakPhiDeg = peakJ * dPhiDeg;
  const takeoffAngleDeg = 90 - peakThetaDeg;

  const oppPhiDeg = (peakPhiDeg + 180) % 360;
  const oppJ = Math.round(oppPhiDeg / dPhiDeg) % phiSteps;
  const oppVal = gainDbi[peakI * phiSteps + oppJ];
  const fbDiff = peakVal - oppVal;
  const frontToBackDb = fbDiff > 0.5 ? fbDiff : null;

  return {
    peakGainDbi: peakVal,
    peakThetaDeg,
    peakPhiDeg,
    takeoffAngleDeg,
    frontToBackDb,
    nearDegenerate,
  };
}
