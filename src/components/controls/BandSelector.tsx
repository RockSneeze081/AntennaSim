import { BANDS } from "../../physics/constants";
import { useAntennaStore } from "../../state/useAntennaStore";

export function BandSelector() {
  const bandId = useAntennaStore((s) => s.document.bandId);
  const setBand = useAntennaStore((s) => s.setBand);

  return (
    <label className="control-row">
      <div className="control-row-header">
        <span>Banda</span>
      </div>
      <select value={bandId} onChange={(e) => setBand(e.target.value)}>
        {BANDS.map((band) => (
          <option key={band.id} value={band.id}>
            {band.label}
          </option>
        ))}
      </select>
    </label>
  );
}
