import { wavelength } from "../../physics/constants";
import type { WireModel } from "../../physics/types";
import type { PresetDefinition } from "../presetTypes";

export interface InvertedVParams extends Record<string, number> {
  apexHeightM: number;
  armLengthM: number;
  armAngleDeg: number;
}

export const invertedVPreset: PresetDefinition<InvertedVParams> = {
  id: "invertedV",
  label: "V invertida",
  description: "Dos brazos que bajan desde un vértice central; ajusta el ángulo entre ellos.",
  defaultGround: "perfectGround",
  defaultParams: (freqHz) => ({
    apexHeightM: wavelength(freqHz) * 0.5,
    armLengthM: wavelength(freqHz) / 4,
    armAngleDeg: 120,
  }),
  paramSpecs: (freqHz) => {
    const lambda = wavelength(freqHz);
    return [
      { key: "armLengthM", label: "Longitud de cada brazo", min: lambda * 0.1, max: lambda * 0.4, step: 0.05, unit: "m" },
      { key: "apexHeightM", label: "Altura del vértice", min: 1, max: lambda * 1.5, step: 0.1, unit: "m" },
      { key: "armAngleDeg", label: "Ángulo entre brazos", min: 30, max: 180, step: 1, unit: "°" },
    ];
  },
  generate: (params: Record<string, number>): WireModel => {
    const halfAngleRad = (params.armAngleDeg / 2) * (Math.PI / 180);
    const dx = params.armLengthM * Math.sin(halfAngleRad);
    const dz = params.armLengthM * Math.cos(halfAngleRad);
    const tipZ = Math.max(params.apexHeightM - dz, 0);
    return {
      vertices: [
        { x: -dx, y: 0, z: tipZ },
        { x: 0, y: 0, z: params.apexHeightM },
        { x: dx, y: 0, z: tipZ },
      ],
      feedArcLength: params.armLengthM,
    };
  },
};
