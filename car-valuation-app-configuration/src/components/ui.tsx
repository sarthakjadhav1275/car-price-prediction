import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("card-shadow rounded-2xl bg-white p-5", className)}>{children}</section>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-[13px] font-semibold tracking-tight text-ink", className)}>{children}</h3>;
}

export interface SegOption<T extends string> {
  value: T;
  label: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  tone = "dark",
  className,
}: {
  options: readonly SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  tone?: "dark" | "mint";
  className?: string;
}) {
  return (
    <div
      className={cn("grid rounded-full bg-canvas p-1", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "truncate rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
              active
                ? tone === "dark"
                  ? "bg-forest text-white shadow-sm"
                  : "bg-sage-light text-forest"
                : "text-muted hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-forest" : "bg-line",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

export function TrendPill({ up, label }: { up: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-[10px] font-semibold",
        up ? "text-forest" : "text-tangerine",
      )}
    >
      {label}
      <span className="text-[8px]">{up ? "▲" : "▼"}</span>
    </span>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[15px] leading-tight font-semibold text-forest">{value}</div>
      <div className="mt-0.5 text-[9px] text-muted">{label}</div>
    </div>
  );
}
