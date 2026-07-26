import { useAntennaStore } from "../../state/useAntennaStore";

const MODES: { id: "move" | "delete" | "feed"; label: string }[] = [
  { id: "move", label: "Mover puntos" },
  { id: "feed", label: "Fijar alimentación" },
  { id: "delete", label: "Eliminar punto" },
];

export function WireEditorControls() {
  const mode = useAntennaStore((s) => s.editorMode);
  const setEditorMode = useAntennaStore((s) => s.setEditorMode);
  const addWireVertex = useAntennaStore((s) => s.addWireVertex);
  const vertexCount = useAntennaStore((s) => s.document.wire.vertices.length);

  return (
    <div className="control-row">
      <div className="control-row-header">
        <span>Editor libre del hilo</span>
      </div>
      <p className="muted-text">Arrastra los puntos sobre el hilo en la escena 3D para darle cualquier forma.</p>
      <div className="preset-buttons">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={m.id === mode ? "preset-button active" : "preset-button"}
            onClick={() => setEditorMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <button type="button" className="preset-button" onClick={addWireVertex}>
        Añadir punto
      </button>
      <p className="muted-text">{vertexCount} puntos · el punto rojo es la alimentación</p>
    </div>
  );
}
