import { describe, expect, it } from "vitest";
import { computePattern, extractMetrics } from "../metrics";
import { wavelength } from "../constants";
import type { AntennaConfig, SphericalGrid, WireModel } from "../types";

const FREQ_HZ = 14_175_000; // 20m

const FREE_SPACE_GRID: SphericalGrid = { thetaSteps: 91, phiSteps: 180, thetaMaxDeg: 180 };
const GROUND_GRID: SphericalGrid = { thetaSteps: 46, phiSteps: 180, thetaMaxDeg: 90 };

function halfWaveDipole(freqHz: number, heightZ = 0): WireModel {
  const halfLen = wavelength(freqHz) / 4; // each arm is quarter-wave -> total half-wave
  return {
    vertices: [
      { x: -halfLen, y: 0, z: heightZ },
      { x: 0, y: 0, z: heightZ },
      { x: halfLen, y: 0, z: heightZ },
    ],
    feedArcLength: halfLen,
  };
}

function quarterWaveVertical(freqHz: number): WireModel {
  const len = wavelength(freqHz) / 4;
  return {
    vertices: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: len },
    ],
    feedArcLength: 0,
  };
}

function invertedV(freqHz: number, armAngleDeg: number, apexHeight: number): WireModel {
  const armLen = wavelength(freqHz) / 4;
  const halfAngle = (armAngleDeg / 2) * (Math.PI / 180);
  // Apex at (0,0,apexHeight); arms slope down and outward in the x-z plane.
  const dx = armLen * Math.sin(halfAngle);
  const dz = armLen * Math.cos(halfAngle);
  const tipZ = Math.max(apexHeight - dz, 0);
  return {
    vertices: [
      { x: -dx, y: 0, z: tipZ },
      { x: 0, y: 0, z: apexHeight },
      { x: dx, y: 0, z: tipZ },
    ],
    feedArcLength: armLen,
  };
}

describe("half-wave dipole in free space", () => {
  it("peaks near 2.15 dBi broadside (any direction perpendicular to the wire), with a deep null along the wire axis", () => {
    const wire = halfWaveDipole(FREQ_HZ, 50); // high enough that ground is irrelevant
    const config: AntennaConfig = { wire, frequencyHz: FREQ_HZ, ground: "freeSpace" };
    const { pattern, nearDegenerate } = computePattern(config, FREE_SPACE_GRID);
    const metrics = extractMetrics(pattern, nearDegenerate);

    expect(metrics.peakGainDbi).toBeGreaterThan(1.8);
    expect(metrics.peakGainDbi).toBeLessThan(2.5);

    // A dipole along the x-axis is rotationally symmetric about its own axis, so the peak
    // isn't confined to theta=90 -- it appears anywhere perpendicular to the wire, including
    // straight overhead (theta=0). Confirm zenith reaches essentially the same peak value.
    const { thetaSteps, phiSteps } = FREE_SPACE_GRID;
    const zenithGain = pattern.gainDbi[0 * phiSteps + 0];
    expect(Math.abs(zenithGain - metrics.peakGainDbi)).toBeLessThan(0.1);

    // Null along the wire's own axis (phi=0, theta=90): should be far below the peak.
    const thetaIdx = Math.round((90 / 180) * (thetaSteps - 1));
    const axisGain = pattern.gainDbi[thetaIdx * phiSteps + 0];
    expect(metrics.peakGainDbi - axisGain).toBeGreaterThan(15);
  });
});

describe("quarter-wave vertical over perfect ground", () => {
  it("peaks near 5.15 dBi at the horizon", () => {
    const wire = quarterWaveVertical(FREQ_HZ);
    const config: AntennaConfig = { wire, frequencyHz: FREQ_HZ, ground: "perfectGround" };
    const { pattern, nearDegenerate } = computePattern(config, GROUND_GRID);
    const metrics = extractMetrics(pattern, nearDegenerate);

    expect(metrics.peakGainDbi).toBeGreaterThan(4.6);
    expect(metrics.peakGainDbi).toBeLessThan(5.6);
    expect(metrics.takeoffAngleDeg).toBeLessThan(5); // horizon
  });
});

describe("inverted-V at 180 degrees matches a straight dipole of equal length", () => {
  it("produces a near-identical pattern to the flat-arm case", () => {
    const flat = invertedV(FREQ_HZ, 180, 20);
    const bent = invertedV(FREQ_HZ, 120, 20);

    const flatConfig: AntennaConfig = { wire: flat, frequencyHz: FREQ_HZ, ground: "freeSpace" };
    const straightDipole: AntennaConfig = { wire: halfWaveDipole(FREQ_HZ, 20), frequencyHz: FREQ_HZ, ground: "freeSpace" };

    const { pattern: flatPattern, nearDegenerate: nd1 } = computePattern(flatConfig, FREE_SPACE_GRID);
    const { pattern: dipolePattern, nearDegenerate: nd2 } = computePattern(straightDipole, FREE_SPACE_GRID);
    const flatMetrics = extractMetrics(flatPattern, nd1);
    const dipoleMetrics = extractMetrics(dipolePattern, nd2);

    expect(Math.abs(flatMetrics.peakGainDbi - dipoleMetrics.peakGainDbi)).toBeLessThan(0.2);

    // Sanity: the 120 degree bend should differ from the 180 degree (flat) case.
    const bentConfig: AntennaConfig = { wire: bent, frequencyHz: FREQ_HZ, ground: "freeSpace" };
    const { pattern: bentPattern, nearDegenerate: nd3 } = computePattern(bentConfig, FREE_SPACE_GRID);
    const bentMetrics = extractMetrics(bentPattern, nd3);
    expect(bentMetrics.peakGainDbi).not.toBeCloseTo(flatMetrics.peakGainDbi, 1);
  });
});

describe("inverted-V arm angle sweep over ground", () => {
  it("raises the takeoff angle as the arms fold down (180 -> 90 -> 60)", () => {
    // Apex at 0.5 wavelength: high enough that the flat (180 deg) case already has a genuine
    // low-angle lobe (below quarter-wave height, radiation is pinned straight up regardless
    // of angle, which would mask the trend this test is checking).
    const apexHeight = wavelength(FREQ_HZ) * 0.5;
    const angles = [180, 120, 90, 60];
    const takeoffs = angles.map((angle) => {
      const wire = invertedV(FREQ_HZ, angle, apexHeight);
      const config: AntennaConfig = { wire, frequencyHz: FREQ_HZ, ground: "perfectGround" };
      const { pattern, nearDegenerate } = computePattern(config, GROUND_GRID);
      return extractMetrics(pattern, nearDegenerate).takeoffAngleDeg;
    });

    // Known trend: folding the arms down concentrates more radiation toward higher angles.
    for (let i = 1; i < takeoffs.length; i++) {
      expect(takeoffs[i]).toBeGreaterThanOrEqual(takeoffs[i - 1] - 1e-6);
    }
    expect(takeoffs[takeoffs.length - 1]).toBeGreaterThan(takeoffs[0]);
  });
});

describe("long wire (>1 wavelength) produces multiple lobes", () => {
  it("has more than one local maximum in the azimuth cut", () => {
    const freq = FREQ_HZ;
    const totalLen = wavelength(freq) * 1.5;
    const wire: WireModel = {
      vertices: [
        { x: 0, y: 0, z: 30 },
        { x: totalLen, y: 0, z: 30 },
      ],
      feedArcLength: 0,
    };
    const config: AntennaConfig = { wire, frequencyHz: freq, ground: "freeSpace" };
    const { pattern } = computePattern(config, FREE_SPACE_GRID);

    const { thetaSteps, phiSteps } = FREE_SPACE_GRID;
    const equatorTheta = Math.round(0.5 * (thetaSteps - 1)); // theta=90
    const row: number[] = [];
    for (let j = 0; j < phiSteps; j++) row.push(pattern.gainDbi[equatorTheta * phiSteps + j]);

    let localMaxima = 0;
    for (let j = 0; j < phiSteps; j++) {
      const prev = row[(j - 1 + phiSteps) % phiSteps];
      const next = row[(j + 1) % phiSteps];
      if (row[j] > prev && row[j] > next) localMaxima++;
    }
    expect(localMaxima).toBeGreaterThan(1);
  });
});

describe("edge cases don't blow up", () => {
  it("handles feed exactly at a free end (end-fed)", () => {
    const wire: WireModel = {
      vertices: [
        { x: 0, y: 0, z: 20 },
        { x: wavelength(FREQ_HZ) * 0.5, y: 0, z: 20 },
      ],
      feedArcLength: 0,
    };
    const config: AntennaConfig = { wire, frequencyHz: FREQ_HZ, ground: "freeSpace" };
    const { pattern, nearDegenerate } = computePattern(config, FREE_SPACE_GRID);
    expect(nearDegenerate).toBe(false);
    expect(pattern.gainDbi.some((v) => Number.isNaN(v))).toBe(false);
  });

  it("handles a near-resonant denominator without producing NaNs", () => {
    const halfWave = wavelength(FREQ_HZ) / 2;
    const armA = 0.3 * halfWave;
    const totalLen = armA + halfWave; // arm B (from feed to far end) is exactly one half-wavelength
    const wire: WireModel = {
      vertices: [
        { x: 0, y: 0, z: 20 },
        { x: totalLen, y: 0, z: 20 },
      ],
      feedArcLength: armA, // sin(k * armB) = sin(k * halfWave) = sin(PI) = 0
    };
    const config: AntennaConfig = { wire, frequencyHz: FREQ_HZ, ground: "freeSpace" };
    const { pattern, nearDegenerate } = computePattern(config, FREE_SPACE_GRID);
    expect(nearDegenerate).toBe(true);
    expect(pattern.gainDbi.some((v) => Number.isNaN(v) || !Number.isFinite(v))).toBe(false);
  });

  it("handles a zero-length arm at an interior feed gracefully", () => {
    const wire: WireModel = {
      vertices: [
        { x: -1e-10, y: 0, z: 20 },
        { x: 5, y: 0, z: 20 },
      ],
      feedArcLength: 0,
    };
    const config: AntennaConfig = { wire, frequencyHz: FREQ_HZ, ground: "freeSpace" };
    const { pattern } = computePattern(config, FREE_SPACE_GRID);
    expect(pattern.gainDbi.some((v) => Number.isNaN(v))).toBe(false);
  });
});
