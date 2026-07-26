import type { Vec3 } from "../../physics/types";

/**
 * Physics uses z-up (z = height above ground). Three.js/drei conventions are y-up, so every
 * position handed to a Three component goes through this swap: physics (x,y,z) -> three (x,z,y).
 */
export function toThree(v: Vec3): [number, number, number] {
  return [v.x, v.z, v.y];
}
