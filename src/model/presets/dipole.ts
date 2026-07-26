import { wavelength } from "../../physics/constants";
import type { WireModel } from "../../physics/types";
import type { PresetDefinition } from "../presetTypes";

export interface DipoleParams extends Record<string, number> {
  heightM: number;
  totalLengthM: number;
}

export const dipolePreset: PresetDefinition<DipoleParams> = {
  id: "dipole",
  label: "Dipolo horizontal",
  description: "Un solo hilo recto, alimentado en el centro, tendido horizontalmente.",
  defaultGround: "perfectGround",
  defaultParams: (freqHz) => ({ heightM: 10, totalLengthM: wavelength(freqHz) / 2 }),
  paramSpecs: (freqHz) => {
    const lambda = wavelength(freqHz);
    return [
      { key: "totalLengthM", label: "Longitud total", min: lambda * 0.2, max: lambda * 0.9, step: 0.05, unit: "m" },
      { key: "heightM", label: "Altura sobre el suelo", min: 1, max: lambda * 1.5, step: 0.1, unit: "m" },
    ];
  },
  generate: (params: Record<string, number>): WireModel => {
    const half = params.totalLengthM / 2;
    return {
      vertices: [
        { x: -half, y: 0, z: params.heightM },
        { x: 0, y: 0, z: params.heightM },
        { x: half, y: 0, z: params.heightM },
      ],
      feedArcLength: half,
    };
  },
};
