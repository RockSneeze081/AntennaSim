import type { Vec3, WireModel } from "./types";

const EPS_LEN = 1e-9;

export interface ArcLengthTable {
  /** Original vertices, with a feed vertex inserted if it didn't land on one exactly. */
  vertices: Vec3[];
  /** Cumulative arc length at each vertex, same length as vertices. */
  cumulative: number[];
  /** Index into vertices/cumulative of the feedpoint. */
  feedIndex: number;
  /** Clamped feed arc length (equals cumulative[feedIndex]). */
  feedArcLength: number;
  totalLength: number;
}

function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

/**
 * Builds an arc-length parameterization of the wire, inserting an explicit vertex at the
 * feedpoint (splitting whichever segment it falls inside) so the current model always has
 * an exact node to split arms A/B at.
 */
export function buildArcLengthTable(wire: WireModel): ArcLengthTable {
  const raw = wire.vertices;
  if (raw.length < 2) {
    throw new Error("Wire must have at least two vertices");
  }

  const cumRaw: number[] = [0];
  for (let i = 1; i < raw.length; i++) {
    cumRaw.push(cumRaw[i - 1] + dist(raw[i - 1], raw[i]));
  }
  const totalLength = cumRaw[cumRaw.length - 1];
  const sf = Math.min(Math.max(wire.feedArcLength, 0), totalLength);

  for (let i = 0; i < cumRaw.length; i++) {
    if (Math.abs(cumRaw[i] - sf) < EPS_LEN) {
      return { vertices: raw, cumulative: cumRaw, feedIndex: i, feedArcLength: cumRaw[i], totalLength };
    }
  }

  const i = cumRaw.findIndex((c) => c > sf);
  const a = raw[i - 1];
  const b = raw[i];
  const segLen = cumRaw[i] - cumRaw[i - 1];
  const t = (sf - cumRaw[i - 1]) / segLen;
  const feedVertex: Vec3 = {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };

  const vertices = [...raw.slice(0, i), feedVertex, ...raw.slice(i)];
  const cumulative = [...cumRaw.slice(0, i), sf, ...cumRaw.slice(i)];

  return { vertices, cumulative, feedIndex: i, feedArcLength: sf, totalLength };
}
