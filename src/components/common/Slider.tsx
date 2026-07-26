interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  return (
    <label className="control-row">
      <div className="control-row-header">
        <span>{label}</span>
        <span className="control-row-value">
          {value.toFixed(2)} {unit ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
