import { useMemo, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { valuationVolume, type Range } from "../../lib/mock";
import { Card, CardTitle } from "../ui";
import { cn } from "../../utils/cn";

const RANGES: Range[] = [3, 6, 12];

export default function AnalyticsCard() {
  const [range, setRange] = useState<Range>(3);
  const groups = useMemo(() => valuationVolume(range), [range]);

  const all = groups.flatMap((g) => g.bars);
  const max = Math.max(...all);
  const total = all.reduce((a, b) => a + b, 0);
  const target = Math.round(max * 0.84);
  const targetPct = (target / max) * 100;

  const cycle = () => setRange(RANGES[(RANGES.indexOf(range) + 1) % RANGES.length]);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>Valuation Analytics</CardTitle>
          <p className="mt-0.5 text-[10px] text-muted">
            {total.toLocaleString("en-IN")} valuations · weekly volume
          </p>
        </div>
        <button
          type="button"
          onClick={cycle}
          className="flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-[10px] font-medium text-white transition hover:bg-forest-dark"
        >
          <Calendar size={12} strokeWidth={2.4} />
          {range} Months
          <ChevronDown size={11} strokeWidth={2.6} className="opacity-80" />
        </button>
      </div>

      <div className="relative mt-6 h-[176px]">
        {/* target line */}
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-tangerine"
          style={{ bottom: `${targetPct}%` }}
        >
          <span className="absolute -top-4 right-0 text-[9px] font-semibold text-tangerine">
            Target {target.toLocaleString("en-IN")}/wk
          </span>
        </div>

        <div className="flex h-full items-end justify-around">
          {groups.map((g) => {
            const peak = Math.max(...g.bars);
            return (
              <div key={g.label} className="flex h-full items-end gap-2">
                {g.bars.map((v, i) => (
                  <div key={i} className="group relative flex h-full items-end">
                    <div
                      className={cn(
                        "w-3.5 rounded-t-[3px] transition-all duration-500 ease-out",
                        v === peak ? "bg-sage" : "bg-bar group-hover:bg-sage/60",
                      )}
                      style={{ height: `${(v / max) * 100}%` }}
                    />
                    <div className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 rounded-md bg-ink px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
                      {v.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2.5 flex justify-around text-[11px] font-medium text-forest">
        {groups.map((g) => (
          <span key={g.label}>{g.label}</span>
        ))}
      </div>
    </Card>
  );
}
