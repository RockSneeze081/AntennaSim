import { Line } from "@react-three/drei";
import type { WireModel } from "../../physics/types";
import { toThree } from "./coords";

export function WireMesh({ wire }: { wire: WireModel }) {
  const points = wire.vertices.map((v) => toThree(v));
  if (points.length < 2) return null;
  return <Line points={points} color="#f2c14e" lineWidth={3} />;
}
