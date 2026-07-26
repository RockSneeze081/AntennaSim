import type { GroundMode, Vec3, WireModel } from "./types";
import { buildCurrentModel } from "./currentModel";
import { buildArcLengthTable } from "./wireGeometry";

/** Sub-elements per half wavelength when discretizing each straight segment. */
const ELEMENTS_PER_HALF_WAVELENGTH = 18;

export interface SubElement {
  position: Vec3;
  /** Unit tangent, direction of increasing arc length. */
  tangent: Vec3;
  length: number;
  /** Signed real current amplitude at this sub-element's midpoint arc length. */
  current: number;
}

export interface DiscretizedWire {
  elements: SubElement[];
  nearDegenerate: boolean;
}

function vsub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function vscale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}
function vlerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}
function vlen(a: Vec3): number {
  return Math.hypot(a.x, a.y, a.z);
}

/** Splits the wire into small straight sub-elements carrying the assumed current (plan A.1/A.2). */
export function discretizeWire(wire: WireModel, k: number): DiscretizedWire {
  const table = buildArcLengthTable(wire);
  const { vertices, cumulative, totalLength, feedArcLength } = table;
  const currentModel = buildCurrentModel(totalLength, feedArcLength, k);
  const halfWavelength = Math.PI / k;
  const targetSubLen = halfWavelength / ELEMENTS_PER_HALF_WAVELENGTH;

  const elements: SubElement[] = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    const a = vertices[i];
    const b = vertices[i + 1];
    const sA = cumulative[i];
    const sB = cumulative[i + 1];
    const segLen = sB - sA;
    if (segLen < 1e-12) continue;

    const diff = vsub(b, a);
    const tangent = vscale(diff, 1 / vlen(diff));
    const n = Math.max(1, Math.ceil(segLen / targetSubLen));
    const subLen = segLen / n;

    for (let j = 0; j < n; j++) {
      const t = (j + 0.5) / n;
      const sMid = sA + t * segLen;
      elements.push({
        position: vlerp(a, b, t),
        tangent,
        length: subLen,
        current: currentModel.currentAt(sMid),
      });
    }
  }

  return { elements, nearDegenerate: currentModel.nearDegenerate };
}

function directionVector(thetaRad: number, phiRad: number): Vec3 {
  return {
    x: Math.sin(thetaRad) * Math.cos(phiRad),
    y: Math.sin(thetaRad) * Math.sin(phiRad),
    z: Math.cos(thetaRad),
  };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** PEC ground image of a position at z=0. */
export function imagePosition(p: Vec3): Vec3 {
  return { x: p.x, y: p.y, z: -p.z };
}

/** PEC ground image of a current-contribution vector: horizontal flips, vertical stays in phase. */
export function imageCurrentVector(c: Vec3): Vec3 {
  return { x: -c.x, y: -c.y, z: c.z };
}

/**
 * Relative radiation intensity U(theta,phi) for the given direction, summing direct (and,
 * when grounded, image) contributions from every sub-element (plan A.2/A.3).
 */
export function radiationIntensity(
  elements: SubElement[],
  k: number,
  thetaRad: number,
  phiRad: number,
  ground: GroundMode,
): number {
  const rHat = directionVector(thetaRad, phiRad);

  let Fre: Vec3 = { x: 0, y: 0, z: 0 };
  let Fim: Vec3 = { x: 0, y: 0, z: 0 };

  const accumulate = (c: Vec3, pos: Vec3) => {
    const phase = k * dot(rHat, pos);
    const cosP = Math.cos(phase);
    const sinP = Math.sin(phase);
    Fre = { x: Fre.x + c.x * cosP, y: Fre.y + c.y * cosP, z: Fre.z + c.z * cosP };
    Fim = { x: Fim.x + c.x * sinP, y: Fim.y + c.y * sinP, z: Fim.z + c.z * sinP };
  };

  for (const el of elements) {
    const c = vscale(el.tangent, el.current * el.length);
    accumulate(c, el.position);
    if (ground === "perfectGround") {
      accumulate(imageCurrentVector(c), imagePosition(el.position));
    }
  }

  const FreDotR = dot(Fre, rHat);
  const FimDotR = dot(Fim, rHat);
  const FtRe = vsub(Fre, vscale(rHat, FreDotR));
  const FtIm = vsub(Fim, vscale(rHat, FimDotR));

  return dot(FtRe, FtRe) + dot(FtIm, FtIm);
}
