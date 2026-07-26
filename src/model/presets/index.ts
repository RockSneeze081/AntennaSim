import { dipolePreset } from "./dipole";
import { invertedVPreset } from "./invertedV";
import { verticalPreset } from "./verticalGroundMounted";
import { endFedPreset } from "./endFed";
import type { PresetDefinition } from "../presetTypes";

export const PRESETS: PresetDefinition[] = [dipolePreset, invertedVPreset, verticalPreset, endFedPreset];

export function getPresetById(id: string): PresetDefinition | undefined {
  return PRESETS.find((p) => p.id === id);
}

export { dipolePreset, invertedVPreset, verticalPreset, endFedPreset };
export type { DipoleParams } from "./dipole";
export type { InvertedVParams } from "./invertedV";
export type { VerticalParams } from "./verticalGroundMounted";
export type { EndFedParams } from "./endFed";
