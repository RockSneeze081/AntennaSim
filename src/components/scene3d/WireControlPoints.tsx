import { useAntennaStore } from "../../state/useAntennaStore";
import { ControlPointHandle } from "./ControlPointHandle";

export function WireControlPoints() {
  const vertices = useAntennaStore((s) => s.document.wire.vertices);
  const feedVertexIndex = useAntennaStore((s) => s.document.feedVertexIndex);
  const mode = useAntennaStore((s) => s.editorMode);
  const moveWireVertex = useAntennaStore((s) => s.moveWireVertex);
  const removeWireVertex = useAntennaStore((s) => s.removeWireVertex);
  const setFeedVertexIndex = useAntennaStore((s) => s.setFeedVertexIndex);

  return (
    <>
      {vertices.map((v, i) => (
        <ControlPointHandle
          key={i}
          position={v}
          isFeed={i === feedVertexIndex}
          mode={mode}
          onMove={(pos) => moveWireVertex(i, pos)}
          onClick={() => {
            if (mode === "delete") removeWireVertex(i);
            else if (mode === "feed") setFeedVertexIndex(i);
          }}
        />
      ))}
    </>
  );
}
