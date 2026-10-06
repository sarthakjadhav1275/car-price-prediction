import { useState } from "react";
import { BENCHMARKS, FEATURE_WEIGHTS } from "../config";
import { Card, CardTitle, SegmentedToggle } from "./ui";
import { cn } from "../utils/cn";

type Metric = "test_r2" | "cv_r2" | "mae" | "rmse";

const METRICS: { value: Metric; label: string; higherBetter: boolean }[] = [
  { value: "test_r2", label: "Test R²", higherBetter: true },
  { value: "cv_r2", label: "CV R²", higherBetter: true },
  { value: "mae", label: "MAE", higherBetter: false },
  { value: "rmse", label: "RMSE", higherBetter: false },
];

export default function Benchmarks() {
  const [metric, setMetric] = useState<Metric>("test_r2");
  const active = METRICS.find((m) => m.value === metric)!;
  const values = BENCHMARKS.map((b) => b[metric]);
  const max = Math.max(...values);
  const best = active.higherBetter ? Math.max(...values) : Math.min(...values);

  const fmt = (b: (typeof BENCHMARKS)[number]) =>
    metric === "test_r2" || metric === "cv_r2"
      ? b[metric].toFixed(4)
      : `₹${Math.round(b[metric]).toLocaleString("en-IN")}`;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle className="text-[15px]">Model Leaderboard</CardTitle>
          <p className="mt-1 text-[11px] text-muted">
            5 regressors trained on 8,128 listings · 80/20 split · 5-fold cross validation
          </p>
        </div>
        <SegmentedToggle tone="mint" options={METRICS} value={metric} onChange={setMetric} className="w-full sm:w-auto" />
      </div>

      <div className="mt-5 space-y-2.5">
        {BENCHMARKS.map((b, i) => {
          const pct = (b[metric] / max) * 100;
          const isBest = b[metric] === best;
          return (
            <div
              key={b.model}
              className={cn(
                "relative overflow-hidden rounded-xl border px-4 py-3 transition",
                b.is_active ? "border-sage bg-sage-light/30" : "border-line hover:border-sage/60",
              )}
            >
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-[11px] text-muted">0{i + 1}</span>
                  <span className="truncate text-[13px] font-semibold text-ink">{b.model}</span>
                  {b.is_active && (
                    <span className="shrink-0 rounded-full bg-forest px-2 py-0.5 text-[9px] font-semibold tracking-wider text-white uppercase">
                      deployed
                    </span>
                  )}
                  {isBest && !b.is_active && (
                    <span className="shrink-0 rounded-full bg-lavender/20 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-plum uppercase">
                      best {active.label}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-[13px] font-semibold text-forest">{fmt(b)}</span>
              </div>
              <div
                className={cn(
                  "absolute inset-y-0 left-0 transition-all duration-700 ease-out",
                  b.is_active ? "bg-sage/30" : "bg-canvas",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-7 grid gap-6 border-t border-line pt-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 text-[11px] font-semibold text-ink">Feature Importance</h4>
          <div className="space-y-2.5">
            {FEATURE_WEIGHTS.map((f) => (
              <div key={f.feature}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-ink/80">{f.feature}</span>
                  <span className="font-medium text-forest">{(f.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-forest to-sage"
                    style={{ width: `${(f.weight / 0.31) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-[11px] font-semibold text-ink">Training Pipeline</h4>
          <ol className="space-y-2.5">
            {[
              "Outlier clipping at the 1st / 99th price percentile",
              "Log-transform of target + km_driven skew correction",
              "One-hot encoding of 29 brands & categorical channels",
              "StandardScaler on numeric features",
              "GridSearchCV hyper-parameter sweep, scored on R²",
            ].map((s, i) => (
              <li key={s} className="flex gap-3 text-[11px] leading-relaxed text-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-light text-[10px] font-semibold text-forest">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Card>
  );
}
