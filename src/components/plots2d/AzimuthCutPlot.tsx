import { useMemo } from "react";
import { useAntennaStore } from "../../state/useAntennaStore";
import { PolarPatternPlot } from "./PolarPatternPlot";
import { sampleAzimuthCut } from "./patternSampling";

export function AzimuthCutPlot() {
  const pattern = useAntennaStore((s) => s.pattern);
  const metrics = useAntennaStore((s) => s.metrics);

  const points = useMemo(() => {
    if (!pattern || !metrics) return null;
    return sampleAzimuthCut(pattern, metrics.peakThetaDeg);
  }, [pattern, metrics]);

  if (!points || !metrics) return null;

  const maxDbi = Math.ceil(metrics.peakGainDbi / 3) * 3;
  const minDbi = maxDbi - 24;

  return (
    <PolarPatternPlot
      title="Corte de azimut (vista desde arriba)"
      points={points}
      minDbi={minDbi}
      maxDbi={maxDbi}
      angleConvention="compass"
    />
  );
}
