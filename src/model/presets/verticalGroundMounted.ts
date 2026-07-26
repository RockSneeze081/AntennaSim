import { wavelength } from "../../physics/constants";
import type { WireModel } from "../../physics/types";
import type { PresetDefinition } from "../presetTypes";

export interface VerticalParams extends Record<string, number> {
  lengthM: number;
}

export const verticalPreset: PresetDefinition<VerticalParams> = {
  id: "verticalGroundMounted",
  label: "Vertical a tierra",
  description: "Un hilo vertical alimentado en la base, típicamente un cuarto de onda, sobre tierra.",
  defaultGround: "perfectGround",
  defaultParams: (freqHz) => ({ lengthM: wavelength(freqHz) / 4 }),
  paramSpecs: (freqHz) => {
    const lambda = wavelength(freqHz);
    return [{ key: "lengthM", label: "Longitud del hilo", min: lambda * 0.1, max: lambda * 0.4, step: 0.05, unit: "m" }];
  },
  generate: (params: Record<string, number>): WireModel => ({
    vertices: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: params.lengthM },
    ],
    feedArcLength: 0,
  }),
};
