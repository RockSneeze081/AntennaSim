import type { GroundMode, WireModel } from "../physics/types";

export interface ParamSpec {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface PresetDefinition<P extends Record<string, number> = Record<string, number>> {
  id: string;
  label: string;
  description: string;
  /** Sensible default ground mode for this antenna type (user can still override). */
  defaultGround: GroundMode;
  defaultParams: (freqHz: number) => P;
  /** Slider ranges depend on wavelength, so these are computed per-frequency too. */
  paramSpecs: (freqHz: number) => ParamSpec[];
  /**
   * Takes a plain params record (not the narrower P) so heterogeneous presets can share one
   * PresetDefinition[] registry without generic-variance friction on this method.
   */
  generate: (params: Record<string, number>) => WireModel;
}
