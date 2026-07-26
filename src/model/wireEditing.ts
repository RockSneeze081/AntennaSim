import type { Vec3, WireModel } from "../physics/types";
import { buildArcLengthTable } from "../physics/wireGeometry";

/** Finds which vertex index the wire's current feedArcLength lands on exactly (as our presets do). */
export function deriveFeedVertexIndex(wire: WireModel): number {
  return buildArcLengthTable(wire).feedIndex;
}

function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

/** Recomputes feedArcLength from scratch so it keeps tracking feedVertexIndex after any edit. */
function withFeedArcLength(vertices: Vec3[], feedVertexIndex: number): WireModel {
  let acc = 0;
  for (let i = 1; i <= feedVertexIndex; i++) {
    acc += dist(vertices[i - 1], vertices[i]);
  }
  return { vertices, feedArcLength: acc };
}

/** Moves a single vertex (e.g. from a 3D drag), keeping the feedpoint attached to its vertex. */
export function moveVertex(wire: WireModel, feedVertexIndex: number, index: number, newPos: Vec3): WireModel {
  const vertices = wire.vertices.map((v, i) => (i === index ? newPos : v));
  return withFeedArcLength(vertices, feedVertexIndex);
}

/** Inserts a new vertex at the midpoint of the wire's longest segment. */
export function addVertexOnLongestSegment(wire: WireModel, feedVertexIndex: number): { wire: WireModel; feedVertexIndex: number } {
  const { vertices } = wire;
  let longestIdx = 0;
  let longestLen = -Infinity;
  for (let i = 0; i < vertices.length - 1; i++) {
    const len = dist(vertices[i], vertices[i + 1]);
    if (len > longestLen) {
      longestLen = len;
      longestIdx = i;
    }
  }
  const a = vertices[longestIdx];
  const b = vertices[longestIdx + 1];
  const mid: Vec3 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
  const nextVertices = [...vertices.slice(0, longestIdx + 1), mid, ...vertices.slice(longestIdx + 1)];
  const nextFeedIndex = feedVertexIndex > longestIdx ? feedVertexIndex + 1 : feedVertexIndex;
  return { wire: withFeedArcLength(nextVertices, nextFeedIndex), feedVertexIndex: nextFeedIndex };
}

/** Removes a vertex (refusing to go below 2 points, the minimum for a wire). */
export function removeVertex(wire: WireModel, feedVertexIndex: number, index: number): { wire: WireModel; feedVertexIndex: number } {
  const { vertices } = wire;
  if (vertices.length <= 2) return { wire, feedVertexIndex };

  const nextVertices = vertices.filter((_, i) => i !== index);
  let nextFeedIndex = feedVertexIndex;
  if (index === feedVertexIndex) {
    nextFeedIndex = Math.max(0, index - 1);
  } else if (index < feedVertexIndex) {
    nextFeedIndex = feedVertexIndex - 1;
  }
  return { wire: withFeedArcLength(nextVertices, nextFeedIndex), feedVertexIndex: nextFeedIndex };
}

export function setFeedVertex(wire: WireModel, feedVertexIndex: number): WireModel {
  return withFeedArcLength(wire.vertices, feedVertexIndex);
}
