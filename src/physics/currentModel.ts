const EPS = 1e-3;

export interface CurrentModel {
  /** Assumed current amplitude (real, signed) at arc length s from the wire's start. */
  currentAt(s: number): number;
  /** True when an arm length landed within epsilon of a resonant null (soft warning). */
  nearDegenerate: boolean;
}

/**
 * Assumed sinusoidal current for a single-feed bent wire of total length L, fed at arc
 * length sf. Each side is referenced from its own nearest free end (open-circuit boundary,
 * current -> 0), and the free scale constant on arm B is fixed by requiring the two arms
 * agree in amplitude at the feedpoint (series current continuity).
 */
export function buildCurrentModel(totalLength: number, feedArcLength: number, k: number): CurrentModel {
  const L = totalLength;
  const sf = feedArcLength;
  const armBLength = L - sf;

  // End-fed at s=0: arm A has zero length and is dropped.
  if (sf <= 1e-9) {
    return { currentAt: (s) => Math.sin(k * (L - s)), nearDegenerate: false };
  }
  // End-fed at s=L: arm B has zero length and is dropped.
  if (armBLength <= 1e-9) {
    return { currentAt: (s) => Math.sin(k * s), nearDegenerate: false };
  }

  const denom = Math.sin(k * armBLength);
  const nearDegenerate = Math.abs(denom) < EPS;
  const safeDenom = nearDegenerate ? (denom >= 0 ? EPS : -EPS) : denom;
  const scale = Math.sin(k * sf) / safeDenom;

  return {
    currentAt: (s) => (s <= sf ? Math.sin(k * s) : scale * Math.sin(k * (L - s))),
    nearDegenerate,
  };
}
