import { useAntennaStore } from "../../state/useAntennaStore";

export function GroundToggle() {
  const ground = useAntennaStore((s) => s.document.ground);
  const setGround = useAntennaStore((s) => s.setGround);

  return (
    <div className="control-row">
      <div className="control-row-header">
        <span>Suelo</span>
      </div>
      <div className="preset-buttons">
        <button
          type="button"
          className={ground === "freeSpace" ? "preset-button active" : "preset-button"}
          onClick={() => setGround("freeSpace")}
        >
          Espacio libre
        </button>
        <button
          type="button"
          className={ground === "perfectGround" ? "preset-button active" : "preset-button"}
          onClick={() => setGround("perfectGround")}
        >
          Tierra perfecta
        </button>
      </div>
    </div>
  );
}
