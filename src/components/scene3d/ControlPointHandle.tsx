import { useMemo, useRef } from "react";
import * as THREE from "three";
import { DragControls } from "@react-three/drei";
import type { Vec3 } from "../../physics/types";
import type { EditorMode } from "../../state/useAntennaStore";
import { toThree } from "./coords";

interface ControlPointHandleProps {
  position: Vec3;
  isFeed: boolean;
  mode: EditorMode;
  onMove: (physicsPos: Vec3) => void;
  onClick: () => void;
}

const tmpPos = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpScale = new THREE.Vector3();

export function ControlPointHandle({ position, isFeed, mode, onMove, onClick }: ControlPointHandleProps) {
  const [tx, ty, tz] = toThree(position);
  // Re-created only when the committed position changes, so DragControls (matrix prop) picks it up.
  const matrix = useMemo(() => new THREE.Matrix4().makeTranslation(tx, ty, tz), [tx, ty, tz]);
  const didDrag = useRef(false);

  const color = isFeed ? "#ff4d4d" : mode === "delete" ? "#ff9d4d" : "#4dd2ff";

  return (
    <DragControls
      matrix={matrix}
      dragLimits={[undefined, [0, 200], undefined]}
      onDragStart={() => {
        didDrag.current = false;
      }}
      onDrag={(localMatrix) => {
        didDrag.current = true;
        localMatrix.decompose(tmpPos, tmpQuat, tmpScale);
        // three (x,y,z) -> physics (x,z,y)
        onMove({ x: tmpPos.x, y: tmpPos.z, z: tmpPos.y });
      }}
    >
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (!didDrag.current) onClick();
        }}
      >
        <sphereGeometry args={[isFeed ? 0.32 : 0.26, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </DragControls>
  );
}
