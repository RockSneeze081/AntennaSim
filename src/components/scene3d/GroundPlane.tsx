export function GroundPlane() {
  return (
    <group>
      <gridHelper args={[60, 30, "#3a6b8a", "#1f3b4d"]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#0b2233" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
