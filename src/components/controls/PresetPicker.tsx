import { PRESETS } from "../../model/presets";
import { useAntennaStore } from "../../state/useAntennaStore";

export function PresetPicker() {
  const wireSource = useAntennaStore((s) => s.document.wireSource);
  const setPreset = useAntennaStore((s) => s.setPreset);
  const activeId = wireSource.kind === "preset" ? wireSource.presetId : null;

  return (
    <div className="control-row">
      <div className="control-row-header">
        <span>Tipo de antena</span>
      </div>
      <div className="preset-buttons">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={preset.id === activeId ? "preset-button active" : "preset-button"}
            title={preset.description}
            onClick={() => setPreset(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
