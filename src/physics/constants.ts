/** Speed of light, m/s. */
export const C = 299_792_458;

export interface Band {
  id: string;
  label: string;
  /** Representative frequency used for default dimensioning (Hz). */
  defaultFreqHz: number;
  minFreqHz: number;
  maxFreqHz: number;
}

/** IARU Region 1 amateur bands, 160m through 6m, with a representative default frequency. */
export const BANDS: Band[] = [
  { id: "160m", label: "160 m", defaultFreqHz: 1_890_000, minFreqHz: 1_810_000, maxFreqHz: 2_000_000 },
  { id: "80m", label: "80 m", defaultFreqHz: 3_650_000, minFreqHz: 3_500_000, maxFreqHz: 3_800_000 },
  { id: "40m", label: "40 m", defaultFreqHz: 7_100_000, minFreqHz: 7_000_000, maxFreqHz: 7_200_000 },
  { id: "30m", label: "30 m", defaultFreqHz: 10_130_000, minFreqHz: 10_100_000, maxFreqHz: 10_150_000 },
  { id: "20m", label: "20 m", defaultFreqHz: 14_175_000, minFreqHz: 14_000_000, maxFreqHz: 14_350_000 },
  { id: "17m", label: "17 m", defaultFreqHz: 18_118_000, minFreqHz: 18_068_000, maxFreqHz: 18_168_000 },
  { id: "15m", label: "15 m", defaultFreqHz: 21_225_000, minFreqHz: 21_000_000, maxFreqHz: 21_450_000 },
  { id: "12m", label: "12 m", defaultFreqHz: 24_940_000, minFreqHz: 24_890_000, maxFreqHz: 24_990_000 },
  { id: "10m", label: "10 m", defaultFreqHz: 28_500_000, minFreqHz: 28_000_000, maxFreqHz: 29_700_000 },
  { id: "6m", label: "6 m", defaultFreqHz: 50_150_000, minFreqHz: 50_000_000, maxFreqHz: 52_000_000 },
];

export function wavelength(freqHz: number): number {
  return C / freqHz;
}

export function waveNumber(freqHz: number): number {
  return (2 * Math.PI * freqHz) / C;
}
