import { describe, expect, it } from "vitest";
import { gainFromIntensityGrid } from "../metrics";
import type { SphericalGrid } from "../types";

describe("gain normalization", () => {
  it("gives ~0 dBi everywhere for a uniform (isotropic) intensity pattern over the full sphere", () => {
    const grid: SphericalGrid = { thetaSteps: 91, phiSteps: 180, thetaMaxDeg: 180 };
    const uGrid = new Float64Array(grid.thetaSteps * grid.phiSteps).fill(1);
    const gainDbi = gainFromIntensityGrid(uGrid, grid);

    for (const v of gainDbi) {
      expect(v).toBeGreaterThan(-0.05);
      expect(v).toBeLessThan(0.05);
    }
  });
});
