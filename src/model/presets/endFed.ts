import { wavelength } from "../../physics/constants";
import type { WireModel } from "../../physics/types";
import type { PresetDefinition } from "../presetTypes";

export interface EndFedParams extends Record<string, number> {
  heightM: number;
  lengthM: number;
}

export const endFedPreset: PresetDefinition<EndFedParams> = {
  id: "endFed",
  label: "Hilo alimentado en un extremo",
  description: "Un solo hilo largo ('random wire'), alimentado en uno de sus extremos.",
  defaultGround: "perfectGround",
  defaultParams: (freqHz) => ({ heightM: 8, lengthM: wavelength(freqHz) * 0.66 }),
  paramSpecs: (freqHz) => {
    const lambda = wavelength(freqHz);
    return [
      { key: "lengthM", label: "Longitud del hilo", min: lambda * 0.2, max: lambda * 2, step: 0.1, unit: "m" },
      { key: "heightM", label: "Altura sobre el suelo", min: 1, max: lambda * 1.5, step: 0.1, unit: "m" },
    ];
  },
  generate: (params: Record<string, number>): WireModel => ({
    vertices: [
      { x: 0, y: 0, z: params.heightM },
      { x: params.lengthM, y: 0, z: params.heightM },
    ],
    feedArcLength: 0,
  }),
};
