import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAntennaStore } from "../../state/useAntennaStore";
import { GroundPlane } from "./GroundPlane";
import { WireMesh } from "./WireMesh";
import { WireControlPoints } from "./WireControlPoints";
import { GainLobeSurface } from "./GainLobeSurface";

export function WireEditorScene() {
  const wire = useAntennaStore((s) => s.document.wire);
  const ground = useAntennaStore((s) => s.document.ground);
  const pattern = useAntennaStore((s) => s.pattern);

  return (
    <Canvas camera={{ position: [14, 10, 14], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 15, 8]} intensity={0.6} />
      {ground === "perfectGround" && <GroundPlane />}
      <WireMesh wire={wire} />
      <WireControlPoints />
      {pattern && <GainLobeSurface pattern={pattern} />}
      <OrbitControls makeDefault target={[0, 2, 0]} />
    </Canvas>
  );
}
