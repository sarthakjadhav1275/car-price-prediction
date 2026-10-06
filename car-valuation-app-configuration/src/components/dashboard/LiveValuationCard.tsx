import { useState } from "react";
import type { CarInput, PredictionResult } from "../../config";
import { smoothPath } from "../../lib/charts";
import { depreciationCurve, formatShort } from "../../lib/engine";
import { Card, CardTitle, SegmentedToggle, Stat } from "../ui";
import { cn } from "../../utils/cn";

type Horizon = "5" | "10" | "25";

const HORIZONS = [
  { value: "5", label: "5 Years" },
  { value: "10", label: "10 Years" },
  { value: "25", label: "25 Years" },
] as const;

const TRANSMISSION = [
  { value: "Manual", label: "Manual" },
  { value: "Automatic", label: "Automatic" },
] as const;

export default function LiveValuationCard({
  input,
  result,
  loading,
  onTransmission,
}: {
  input: CarInput;
  result: PredictionResult;
  loading: boolean;
  onTransmission: (v: string) => void;
}) {
  const [horizon, setHorizon] = useState<Horizon>("10");
  const h = Number(horizon);

  const pts = depreciationCurve(input, result.predicted_price, h);
  const W = 300;
  const H = 112;
  const px = 10;
  const py = 12;
  const vals = pts.map((p) => p.value);
  const maxV = Math.max(...vals);
  const minV = Math.min(...vals);
  const lo = minV - (maxV - minV) * 0.18;
  const hi = maxV + (maxV - minV) * 0.08;
  const x = (age: number) => px + (age / h) * (W - px * 2);
  const y = (v: number) => py + (1 - (v - lo) / (hi - lo || 1)) * (H - py * 2);
  const d = smoothPath(pts.map((p) => ({ x: x(p.age), y: y(p.value) })));

  const ticks = h === 5 ? [0, 1, 2, 3, 4, 5] : h === 10 ? [0, 2, 4, 6, 8, 10] : [0, 5, 10, 15, 20, 25];
  const cur = input.car_age <= h ? pts[input.car_age] : null;

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <Card className={cn("transition-opacity", loading && "opacity-70")}>
      <div className="flex items-center justify-between">
        <CardTitle>Live Valuation</CardTitle>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase",
            result.source === "api" ? "bg-sage-light text-forest" : "bg-canvas text-muted",
          )}
        >
          {result.source === "api" ? "live api" : "local engine"}
        </span>
      </div>

      <SegmentedToggle
        className="mt-3"
        options={TRANSMISSION}
        value={input.transmission as "Manual" | "Automatic"}
        onChange={onTransmission}
      />

      <div className="mt-4 truncate text-[12px] font-semibold text-ink">
        {input.brand} · {input.fuel} · {input.owner}
      </div>

      <div className="mt-2.5 rounded-xl border border-line p-3">
        <div className="text-[9px] text-muted">{today}</div>
        <div className="mt-1.5 grid grid-cols-3 gap-2 text-center">
          <Stat value={formatShort(result.predicted_price)} label="Fair value" />
          <Stat value={`${result.depreciation_pct.toFixed(0)}%`} label="Depreciation" />
          <Stat value={result.km_per_year.toLocaleString("en-IN")} label="km / year" />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" style={{ height: 112 }} preserveAspectRatio="none">
        <path d={d} fill="none" stroke="#2f7d5f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {cur && (
          <>
            <circle cx={x(cur.age)} cy={y(cur.value)} r="7" fill="rgba(47,125,95,0.16)" />
            <circle cx={x(cur.age)} cy={y(cur.value)} r="3.4" fill="#2f7d5f" stroke="#fff" strokeWidth="1.6" />
          </>
        )}
      </svg>
      <div className="flex justify-between px-1 text-[9px] text-muted">
        {ticks.map((t) => (
          <span key={t}>{t}y</span>
        ))}
      </div>

      <SegmentedToggle tone="mint" className="mt-4" options={HORIZONS} value={horizon} onChange={setHorizon} />
    </Card>
  );
}
