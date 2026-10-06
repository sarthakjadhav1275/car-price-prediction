import type { CarInput, PredictionResult } from "../config";
import { depreciationCurve, formatINR, formatLakh } from "../lib/engine";
import { useCountUp } from "../lib/useCountUp";
import DepreciationChart from "./DepreciationChart";
import { Card, CardTitle } from "./ui";
import { cn } from "../utils/cn";

const demandTone: Record<string, string> = {
  "Very High Demand": "bg-sage-light text-forest",
  "High Demand": "bg-sage-light text-forest",
  "Moderate Demand": "bg-tangerine text-white",
  "Low Demand": "bg-rose-400 text-white",
};

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card-shadow rounded-2xl bg-white px-4 py-3.5">
      <div className="text-[10px] text-muted">{label}</div>
      <div className="mt-1 text-lg leading-tight font-semibold text-forest">{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-muted">{sub}</div>}
    </div>
  );
}

export default function ResultPanel({
  result,
  input,
  loading,
}: {
  result: PredictionResult;
  input: CarInput;
  loading: boolean;
}) {
  const animated = useCountUp(result.predicted_price);
  const curve = depreciationCurve(input, result.predicted_price, 25);
  const span = result.range_high - result.range_low;
  const markerPct = ((result.predicted_price - result.range_low) / (span || 1)) * 100;

  return (
    <div className={cn("space-y-4 transition-opacity duration-300", loading && "opacity-60")}>
      {/* Headline valuation */}
      <div className="relative overflow-hidden rounded-2xl bg-forest p-6 text-white lg:p-7">
        <div className="pointer-events-none absolute -top-20 -right-12 h-56 w-56 rounded-full bg-white/[0.07]" />
        <div className="pointer-events-none absolute -bottom-24 -left-8 h-48 w-48 rounded-full bg-white/[0.05]" />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] font-medium tracking-[0.18em] text-white/70 uppercase">
            Estimated fair value
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold",
              demandTone[result.market_demand] ?? demandTone["Moderate Demand"],
            )}
          >
            {result.market_demand}
          </span>
        </div>

        <div className="relative mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
          <div className="text-4xl leading-none font-bold tracking-tight lg:text-5xl">{formatLakh(animated)}</div>
          <div className="pb-1 text-sm text-white/70">{formatINR(animated)}</div>
        </div>

        <div className="relative mt-6">
          <div className="mb-2 flex justify-between text-[11px] text-white/80">
            <span>{result.range_low_formatted}</span>
            <span className="text-white/55">± 7.5% confidence band</span>
            <span>{result.range_high_formatted}</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-white/20">
            <div className="absolute inset-y-0 left-0 rounded-full bg-sage" style={{ width: `${markerPct}%` }} />
            <div
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-forest bg-white shadow transition-all duration-700"
              style={{ left: `${markerPct}%` }}
            />
          </div>
          <div className="mt-2 text-center text-[11px] text-white/60">{result.range_text}</div>
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Depreciation" value={`${result.depreciation_pct.toFixed(1)}%`} sub={`over ${input.car_age} yrs`} />
        <Tile label="Usage rate" value={result.km_per_year.toLocaleString("en-IN")} sub="km / year" />
        <Tile label="Active model" value={result.best_model.split(" ")[0]} sub={result.best_model} />
        <Tile
          label="Inference"
          value={result.source === "api" ? "Live API" : "Local"}
          sub={result.source === "api" ? "FastAPI backend" : "in-browser surrogate"}
        />
      </div>

      {/* Curve */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <CardTitle>Projected Value Curve</CardTitle>
          <span className="text-[10px] text-muted">9.75% annual decay model</span>
        </div>
        <DepreciationChart points={curve} currentAge={input.car_age} currentValue={result.predicted_price} />
      </Card>

      {/* Insights */}
      <Card>
        <CardTitle className="mb-4">Valuation Drivers</CardTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {result.insights.map((ins, i) => (
            <div
              key={ins.title}
              className="animate-fade-up flex items-start gap-3 rounded-xl border border-line p-3.5 transition hover:border-sage hover:bg-sage-light/20"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-light text-base">
                {ins.icon}
              </span>
              <div>
                <div className="text-[12px] font-semibold text-ink">{ins.title}</div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{ins.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
