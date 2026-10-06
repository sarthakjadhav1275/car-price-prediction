import type { CarInput, PredictionResult } from "../../config";
import { formatShort, retentionFor } from "../../lib/engine";
import { Card, CardTitle } from "../ui";

const DEMAND_FALLBACK: Record<string, number> = {
  "Very High Demand": 90,
  "High Demand": 72,
  "Moderate Demand": 55,
  "Low Demand": 35,
};

function Donut({ pct, color }: { pct: number; color: string }) {
  const r = 27;
  const C = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <svg width="78" height="78" viewBox="0 0 78 78" className="shrink-0">
      <circle cx="39" cy="39" r={r} fill="none" stroke="#eef1f3" strokeWidth="8" />
      <circle
        cx="39"
        cy="39"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${(clamped / 100) * C} ${C}`}
        transform="rotate(-90 39 39)"
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)" }}
      />
      <text
        x="39"
        y="40"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight="600"
        fill={color}
        fontFamily="inherit"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}

export default function DonutsCard({ result, input }: { result: PredictionResult; input: CarInput }) {
  const bandHalf = ((result.range_high - result.range_low) / 2 / result.predicted_price) * 100;
  const confidence = Math.round(100 - bandHalf * 2);
  const newValue = result.predicted_price / (retentionFor(input.car_age) || 1);
  const lost = Math.max(0, newValue - result.predicted_price);
  const demand = result.demand_score ?? DEMAND_FALLBACK[result.market_demand] ?? 55;

  const items = [
    {
      pct: confidence,
      color: "#f2a541",
      label: "Prediction confidence",
      value: `±${bandHalf.toFixed(1)}% band`,
    },
    {
      pct: result.depreciation_pct,
      color: "#8b3d8f",
      label: "Depreciation to date",
      value: `${formatShort(lost)} lost · ${input.car_age} yrs`,
    },
    {
      pct: demand,
      color: "#9d93e3",
      label: "Market demand index",
      value: result.market_demand,
    },
  ];

  return (
    <Card>
      <CardTitle>Confidence Breakdown</CardTitle>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <Donut pct={it.pct} color={it.color} />
            <div className="min-w-0">
              <div className="text-[10px] text-muted">{it.label}</div>
              <div className="mt-0.5 truncate text-[11px] font-semibold text-ink">{it.value}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
