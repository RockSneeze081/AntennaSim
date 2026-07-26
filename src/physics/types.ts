export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type GroundMode = "freeSpace" | "perfectGround";

/** A single continuous wire: ordered vertices in meters, z >= 0 always. */
export interface WireModel {
  vertices: Vec3[];
  /** Arc length (meters) from vertices[0] where the feedpoint sits. */
  feedArcLength: number;
}

export interface AntennaConfig {
  wire: WireModel;
  frequencyHz: number;
  ground: GroundMode;
}

/** theta: polar angle from +z zenith [0, PI]. phi: azimuth in xy-plane [0, 2*PI). */
export interface SphericalGrid {
  thetaSteps: number;
  phiSteps: number;
  /** thetaMaxDeg: 90 when ground is active (upper hemisphere only), 180 for free space. */
  thetaMaxDeg: number;
}

export interface PatternGrid {
  grid: SphericalGrid;
  /** Flat array of length thetaSteps*phiSteps, row-major by theta then phi, in dBi. */
  gainDbi: Float64Array;
}

export interface PatternMetrics {
  peakGainDbi: number;
  peakThetaDeg: number;
  peakPhiDeg: number;
  /** Elevation above horizon, 0 = horizon, 90 = zenith. */
  takeoffAngleDeg: number;
  /** Front-to-back ratio in dB, or null when not meaningful (near-symmetric pattern). */
  frontToBackDb: number | null;
  /** True when at least one arm landed within epsilon of a resonant null (soft warning). */
  nearDegenerate: boolean;
}
