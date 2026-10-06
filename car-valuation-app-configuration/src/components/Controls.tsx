import { cn } from "../utils/cn";

export function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <label className="text-[11px] font-semibold text-ink">{label}</label>
      {hint && <span className="text-[11px] font-medium text-forest">{hint}</span>}
    </div>
  );
}

export function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      className="av-select w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink outline-none transition hover:border-sage focus:border-forest focus:ring-2 focus:ring-forest/15"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function Pills({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all duration-200",
              active ? "bg-forest text-white shadow-sm" : "bg-canvas text-ink/70 hover:bg-line hover:text-ink",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  const idx = Math.max(0, options.indexOf(value));
  return (
    <div
      className="relative grid rounded-full bg-canvas p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}
    >
      <div
        className="absolute top-1 bottom-1 rounded-full bg-forest shadow-sm transition-all duration-300 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          left: `calc(0.25rem + ${idx} * ((100% - 0.5rem) / ${options.length}))`,
        }}
      />
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "relative z-10 rounded-full py-1.5 text-[11px] font-medium transition-colors",
            o === value ? "text-white" : "text-muted hover:text-ink",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      className="av-range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        // @ts-expect-error custom property
        "--track": `linear-gradient(90deg, #2f7d5f 0%, #8fcab3 ${pct}%, #e3e8ec ${pct}%, #e3e8ec 100%)`,
      }}
    />
  );
}
