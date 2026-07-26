import { useMemo } from "react";
import * as THREE from "three";
import type { PatternGrid } from "../../physics/types";
import { gainToColorHsl } from "../../utils/colorScale";

/** Clamp floor for the radius mapping so deep nulls shrink toward the center instead of vanishing to a point. */
const GAIN_FLOOR_DBI = -15;
/** Visual scale of the lobe in scene units; independent of the antenna's physical size. */
const MAX_RADIUS = 8;

export function GainLobeSurface({ pattern }: { pattern: PatternGrid }) {
  const geometry = useMemo(() => buildLobeGeometry(pattern), [pattern]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} transparent opacity={0.85} />
    </mesh>
  );
}

function buildLobeGeometry(pattern: PatternGrid): THREE.BufferGeometry {
  const { grid, gainDbi } = pattern;
  const { thetaSteps, phiSteps, thetaMaxDeg } = grid;

  let maxGain = -Infinity;
  for (const g of gainDbi) if (g > maxGain) maxGain = g;
  const span = Math.max(maxGain - GAIN_FLOOR_DBI, 1e-6);

  const thetaMaxRad = (thetaMaxDeg * Math.PI) / 180;
  const dTheta = thetaSteps > 1 ? thetaMaxRad / (thetaSteps - 1) : thetaMaxRad;
  const dPhi = (2 * Math.PI) / phiSteps;

  const positions: number[] = [];
  const colors: number[] = [];

  for (let i = 0; i < thetaSteps; i++) {
    const theta = i * dTheta;
    for (let j = 0; j < phiSteps; j++) {
      const phi = j * dPhi;
      const g = gainDbi[i * phiSteps + j];
      const t = Math.max(0, Math.min(1, (g - GAIN_FLOOR_DBI) / span));
      const r = t * MAX_RADIUS;

      // Spherical (physics z-up) -> three (y-up): (x,y,z) -> (x,z,y).
      const px = r * Math.sin(theta) * Math.cos(phi);
      const py = r * Math.sin(theta) * Math.sin(phi);
      const pz = r * Math.cos(theta);
      positions.push(px, pz, py);

      const color = new THREE.Color(gainToColorHsl(t));
      colors.push(color.r, color.g, color.b);
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < thetaSteps - 1; i++) {
    for (let j = 0; j < phiSteps; j++) {
      const jNext = (j + 1) % phiSteps;
      const a = i * phiSteps + j;
      const b = i * phiSteps + jNext;
      const c = (i + 1) * phiSteps + j;
      const d = (i + 1) * phiSteps + jNext;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
