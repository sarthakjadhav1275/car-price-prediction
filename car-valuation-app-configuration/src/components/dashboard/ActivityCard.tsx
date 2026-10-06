import { BENCHMARKS } from "../../config";
import { seriesToPoints, smoothPath } from "../../lib/charts";
import { SPARK_LISTINGS, SPARK_VALUATIONS } from "../../lib/mock";
import { Card, CardTitle, TrendPill } from "../ui";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 72;
  const H = 28;
  const d = smoothPath(seriesToPoints(data, W, H, 3));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0 overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ActivityCard({ runs }: { runs: number }) {
  const active = BENCHMARKS.find((b) => b.is_active) ?? BENCHMARKS[0];
  const base = 12900 + runs;
  const stats = [
    {
      value: `${(base / 1000).toFixed(1)}K`,
      label: "Valuations this month",
      spark: { data: SPARK_VALUATIONS, color: "#7fb069" },
    },
    {
      value: `${(active.test_r2 * 100).toFixed(1)}%`,
      label: "Model R² accuracy",
      pill: { up: true, label: "UP" },
    },
    {
      value: "212.9K",
      label: "Listings indexed",
      spark: { data: SPARK_LISTINGS, color: "#3d8bfd" },
    },
    {
      value: "1m 45s",
      label: "Avg. time to quote",
      pill: { up: false, label: "DOWN" },
    },
  ];

  return (
    <Card>
      <CardTitle>Engine Activity</CardTitle>
      <div className="mt-4 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[22px] leading-none font-semibold text-forest">{s.value}</div>
              <div className="mt-1.5 text-[10px] text-muted">{s.label}</div>
            </div>
            {s.spark ? <Sparkline data={s.spark.data} color={s.spark.color} /> : null}
            {s.pill ? <TrendPill up={s.pill.up} label={s.pill.label} /> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
