import { describe, expect, it } from "vitest";
import { buildCurrentModel } from "../currentModel";

describe("buildCurrentModel", () => {
  it("matches amplitude on both arms at the feedpoint (continuity)", () => {
    const k = 1.3;
    const L = 5;
    const sf = 1.8;
    const model = buildCurrentModel(L, sf, k);
    const justBelow = model.currentAt(sf - 1e-6);
    const justAbove = model.currentAt(sf + 1e-6);
    expect(justBelow).toBeCloseTo(justAbove, 3);
  });

  it("vanishes at both free ends for a center-fed wire", () => {
    const k = 1.1;
    const L = 4;
    const model = buildCurrentModel(L, L / 2, k);
    expect(Math.abs(model.currentAt(0))).toBeLessThan(1e-9);
    expect(Math.abs(model.currentAt(L))).toBeLessThan(1e-9);
  });

  it("drops the zero-length arm for end-fed at s=0", () => {
    const k = 0.9;
    const L = 3;
    const model = buildCurrentModel(L, 0, k);
    expect(model.nearDegenerate).toBe(false);
    expect(Math.abs(model.currentAt(L))).toBeLessThan(1e-9);
    expect(Number.isFinite(model.currentAt(L / 2))).toBe(true);
  });

  it("drops the zero-length arm for end-fed at s=L", () => {
    const k = 0.9;
    const L = 3;
    const model = buildCurrentModel(L, L, k);
    expect(model.nearDegenerate).toBe(false);
    expect(Math.abs(model.currentAt(0))).toBeLessThan(1e-9);
  });

  it("flags near-degenerate resonance and stays finite", () => {
    const k = Math.PI; // so that an arm length of 1 => k*armB = PI => sin=0
    const L = 2;
    const sf = 1; // armB length = 1 -> sin(k*1) = sin(PI) = 0
    const model = buildCurrentModel(L, sf, k);
    expect(model.nearDegenerate).toBe(true);
    expect(Number.isFinite(model.currentAt(1.999))).toBe(true);
    expect(Number.isNaN(model.currentAt(1.999))).toBe(false);
  });
});
