import type { CutPoint } from "./patternSampling";

interface PolarPatternPlotProps {
  title: string;
  points: CutPoint[];
  minDbi: number;
  maxDbi: number;
  /** "compass": full circle, 0deg=up/N, clockwise. "elevation": half circle, 0=horizon, 90=zenith. */
  angleConvention: "compass" | "elevation";
  size?: number;
}

export function PolarPatternPlot({ title, points, minDbi, maxDbi, angleConvention, size = 220 }: PolarPatternPlotProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 22;
  const span = Math.max(maxDbi - minDbi, 1e-6);

  function radiusFor(gainDbi: number): number {
    const t = Math.max(0, Math.min(1, (gainDbi - minDbi) / span));
    return t * R;
  }

  function project(angleDeg: number, r: number): [number, number] {
    if (angleConvention === "compass") {
      const rad = (angleDeg - 90) * (Math.PI / 180);
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    }
    const rad = angleDeg * (Math.PI / 180);
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  }

  const curvePoints = points.map((p) => project(p.angleDeg, radiusFor(p.gainDbi)));
  const pathD =
    angleConvention === "compass"
      ? `M ${curvePoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ")} Z`
      : `M ${cx},${cy} L ${curvePoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ")} Z`;

  const guideRings = [0.25, 0.5, 0.75, 1];
  const guideAngles = angleConvention === "compass" ? [0, 90, 180, 270] : [0, 90, 180];

  return (
    <div className="polar-plot">
      <div className="polar-plot-title">{title}</div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {guideRings.map((f) => (
          <circle
            key={f}
            cx={cx}
            cy={cy}
            r={R * f}
            fill="none"
            stroke="#3a5568"
            strokeWidth={1}
            strokeDasharray={f === 1 ? undefined : "2,3"}
          />
        ))}
        {guideAngles.map((a) => {
          const [x, y] = project(a, R);
          return <line key={a} x1={cx} y1={cy} x2={x} y2={y} stroke="#3a5568" strokeWidth={1} />;
        })}
        <path d={pathD} fill="#f2c14e33" stroke="#f2c14e" strokeWidth={2} />
      </svg>
      <div className="polar-plot-scale muted-text">
        {minDbi.toFixed(0)} a {maxDbi.toFixed(0)} dBi
      </div>
    </div>
  );
}
