import { useState } from "react";
import { Bell, Plus, Search } from "lucide-react";

export default function Topbar({
  query,
  onQuery,
  matches,
  onPick,
  onNew,
}: {
  query: string;
  onQuery: (q: string) => void;
  matches: string[];
  onPick: (brand: string) => void;
  onNew: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Search */}
      <div className="relative w-full max-w-[330px]">
        <div className="card-shadow flex h-11 items-center rounded-full bg-white pr-4 pl-5">
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search brand or manufacturer…"
            className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted"
          />
          <Search size={15} strokeWidth={2.4} className="shrink-0 text-ink" />
        </div>
        {focused && query.trim() && (
          <div className="card-shadow absolute inset-x-0 top-12 z-30 overflow-hidden rounded-2xl bg-white p-1.5">
            {matches.length ? (
              matches.map((b) => (
                <button
                  key={b}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPick(b)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-ink transition hover:bg-canvas"
                >
                  {b}
                  <span className="text-[10px] text-muted">valuate →</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-muted">No brands match “{query}”</div>
            )}
          </div>
        )}
      </div>

      {/* Actions pill */}
      <div className="flex items-center gap-3 rounded-full bg-forest py-1.5 pr-1.5 pl-3">
        <button
          type="button"
          onClick={onNew}
          className="flex items-center gap-1 rounded-md border border-dashed border-white/80 px-2.5 py-1 text-[10px] font-medium text-white transition hover:bg-white/10"
        >
          <Plus size={11} strokeWidth={2.6} />
          New valuation
        </button>
        <button type="button" className="relative text-white" aria-label="Notifications">
          <Bell size={16} fill="currentColor" strokeWidth={1.5} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-tangerine ring-2 ring-forest" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-bold text-forest">
          AV
        </div>
      </div>
    </div>
  );
}
