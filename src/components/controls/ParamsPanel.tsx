import { Slider } from "../common/Slider";
import { getPresetById } from "../../model/presets";
import { useAntennaStore } from "../../state/useAntennaStore";

export function ParamsPanel() {
  const document = useAntennaStore((s) => s.document);
  const setParam = useAntennaStore((s) => s.setParam);
  const setPreset = useAntennaStore((s) => s.setPreset);

  if (document.wireSource.kind !== "preset") {
    return (
      <div className="control-row">
        <div className="control-row-header">
          <span>Hilo editado a mano</span>
        </div>
        <p className="muted-text">
          Has movido puntos de control, así que los sliders de esta plantilla ya no aplican.
        </p>
        <button
          type="button"
          className="preset-button"
          onClick={() => setPreset(getPresetById("dipole")?.id ?? "dipole")}
        >
          Volver a una plantilla
        </button>
      </div>
    );
  }

  const preset = getPresetById(document.wireSource.presetId);
  if (!preset) return null;
  const specs = preset.paramSpecs(document.frequencyHz);
  const params = document.wireSource.params;

  return (
    <div className="control-row">
      <div className="control-row-header">
        <span>Parámetros</span>
      </div>
      {specs.map((spec) => (
        <Slider
          key={spec.key}
          label={spec.label}
          value={params[spec.key]}
          min={spec.min}
          max={spec.max}
          step={spec.step}
          unit={spec.unit}
          onChange={(value) => setParam(spec.key, value)}
        />
      ))}
    </div>
  );
}
