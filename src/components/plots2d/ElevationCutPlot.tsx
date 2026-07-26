import { useMemo } from "react";
import { useAntennaStore } from "../../state/useAntennaStore";
import { PolarPatternPlot } from "./PolarPatternPlot";
import { sampleElevationCut } from "./patternSampling";

export function ElevationCutPlot() {
  const pattern = useAntennaStore((s) => s.pattern);
  const metrics = useAntennaStore((s) => s.metrics);

  const points = useMemo(() => {
    if (!pattern || !metrics) return null;
    return sampleElevationCut(pattern, metrics.peakPhiDeg);
  }, [pattern, metrics]);

  if (!points || !metrics) return null;

  const maxDbi = Math.ceil(metrics.peakGainDbi / 3) * 3;
  const minDbi = maxDbi - 24;

  return (
    <PolarPatternPlot
      title="Corte de elevación (vista de perfil)"
      points={points}
      minDbi={minDbi}
      maxDbi={maxDbi}
      angleConvention="elevation"
    />
  );
}
