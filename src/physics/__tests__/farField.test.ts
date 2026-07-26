import { describe, expect, it } from "vitest";
import { imageCurrentVector, imagePosition } from "../farField";

function expectVecCloseTo(actual: { x: number; y: number; z: number }, expected: { x: number; y: number; z: number }) {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
  expect(actual.z).toBeCloseTo(expected.z);
}

describe("PEC ground image theory transform", () => {
  it("inverts horizontal current components and keeps vertical in phase", () => {
    const horizontal = { x: 1, y: 2, z: 0 };
    const vertical = { x: 0, y: 0, z: 1 };
    const mixed = { x: 3, y: -4, z: 5 };

    expectVecCloseTo(imageCurrentVector(horizontal), { x: -1, y: -2, z: 0 });
    expectVecCloseTo(imageCurrentVector(vertical), { x: 0, y: 0, z: 1 });
    expectVecCloseTo(imageCurrentVector(mixed), { x: -3, y: 4, z: 5 });
  });

  it("mirrors position across the z=0 ground plane", () => {
    expectVecCloseTo(imagePosition({ x: 1, y: 2, z: 3 }), { x: 1, y: 2, z: -3 });
    expectVecCloseTo(imagePosition({ x: 0, y: 0, z: 0 }), { x: 0, y: 0, z: 0 });
  });
});
