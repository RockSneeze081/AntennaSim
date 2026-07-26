import type { GroundMode, WireModel } from "../physics/types";
import { BANDS } from "../physics/constants";
import { dipolePreset, getPresetById } from "./presets";
import { deriveFeedVertexIndex } from "./wireEditing";

/**
 * How the current wire came to be: generated from a preset's parametric sliders, or
 * hand-edited by dragging control points (which decouples it from further slider changes).
 */
export type WireSource = { kind: "preset"; presetId: string; params: Record<string, number> } | { kind: "custom" };

export interface AntennaDocument {
  wire: WireModel;
  wireSource: WireSource;
  frequencyHz: number;
  bandId: string;
  ground: GroundMode;
  /** Which vertex acts as the feedpoint anchor; dragging other points keeps the feed attached to it. */
  feedVertexIndex: number;
}

export function createDefaultDocument(bandId = "20m"): AntennaDocument {
  const band = BANDS.find((b) => b.id === bandId) ?? BANDS[4];
  const preset = dipolePreset;
  const params = preset.defaultParams(band.defaultFreqHz);
  const wire = preset.generate(params);
  return {
    wire,
    wireSource: { kind: "preset", presetId: preset.id, params },
    frequencyHz: band.defaultFreqHz,
    bandId: band.id,
    ground: preset.defaultGround,
    feedVertexIndex: deriveFeedVertexIndex(wire),
  };
}

export function createDocumentFromPreset(presetId: string, freqHz: number): AntennaDocument {
  const preset = getPresetById(presetId) ?? dipolePreset;
  const band = BANDS.find((b) => freqHz >= b.minFreqHz && freqHz <= b.maxFreqHz) ?? BANDS[4];
  const params = preset.defaultParams(freqHz);
  const wire = preset.generate(params);
  return {
    wire,
    wireSource: { kind: "preset", presetId: preset.id, params },
    frequencyHz: freqHz,
    bandId: band.id,
    ground: preset.defaultGround,
    feedVertexIndex: deriveFeedVertexIndex(wire),
  };
}
