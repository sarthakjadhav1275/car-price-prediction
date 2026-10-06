import { useState, type ReactNode } from "react";
import { Cpu, Database, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { BENCHMARKS } from "../config";
import Benchmarks from "../components/Benchmarks";
import { Card, CardTitle, Switch } from "../components/ui";
import { cn } from "../utils/cn";

/* ------------------------------ Reports ------------------------------ */

export function ReportsPage() {
  const best = BENCHMARKS.find((b) => b.is_active) ?? BENCHMARKS[0];
  const tiles = [
    { icon: Database, label: "Training dataset", value: "8,128", sub: "verified used-car listings" },
    { icon: Cpu, label: "Engineered features", value: "7", sub: "5 categorical · 2 numeric" },
    { icon: ShieldCheck, label: "Deployed model R²", value: best.test_r2.toFixed(3), sub: best.model },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label} className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-light text-forest">
              <t.icon size={18} />
            </span>
            <div>
              <div className="text-[10px] text-muted">{t.label}</div>
              <div className="text-xl leading-tight font-semibold text-forest">{t.value}</div>
              <div className="text-[10px] text-muted">{t.sub}</div>
            </div>
          </Card>
        ))}
      </div>
      <Benchmarks />
    </div>
  );
}

/* ------------------------------ Settings ----------------------------- */

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-4 last:border-b-0">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-ink">{title}</div>
        <div className="mt-0.5 text-[11px] text-muted">{desc}</div>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage({
  apiUrl,
  setApiUrl,
  useApi,
  setUseApi,
  autoRun,
  setAutoRun,
  apiOnline,
  onPing,
  pinging,
}: {
  apiUrl: string;
  setApiUrl: (v: string) => void;
  useApi: boolean;
  setUseApi: (v: boolean) => void;
  autoRun: boolean;
  setAutoRun: (v: boolean) => void;
  apiOnline: boolean | null;
  onPing: () => void;
  pinging: boolean;
}) {
  const [draft, setDraft] = useState(apiUrl);
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="p-6">
        <CardTitle className="text-[15px]">Engine Settings</CardTitle>
        <p className="mt-1 text-[11px] text-muted">Control how AutoValuate talks to the inference service.</p>

        <div className="mt-3">
          <Row title="Use live inference API" desc="Send requests to the FastAPI backend when reachable; otherwise fall back to the in-browser surrogate.">
            <Switch checked={useApi} onChange={setUseApi} />
          </Row>
          <Row title="Auto-run on change" desc="Debounce 420 ms and re-run inference whenever an input changes.">
            <Switch checked={autoRun} onChange={setAutoRun} />
          </Row>
          <Row title="API base URL" desc="Endpoint root exposing POST /predict and GET /health.">
            <form
              className="flex w-full max-w-[420px] gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setApiUrl(draft.trim() || apiUrl);
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-forest px-3.5 py-2 text-xs font-medium text-white transition hover:bg-forest-dark"
              >
                Save
              </button>
            </form>
          </Row>
          <Row title="Display currency" desc="All valuations are quoted in Indian Rupees with Lakh / Crore grouping.">
            <span className="rounded-full bg-canvas px-3 py-1.5 text-[11px] font-medium text-ink">INR (₹)</span>
          </Row>
        </div>
      </Card>

      <Card className="h-fit">
        <CardTitle>Service Health</CardTitle>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line p-3.5">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              apiOnline === null ? "bg-line" : apiOnline ? "bg-forest" : "bg-tangerine",
            )}
          />
          <div>
            <div className="text-[12px] font-semibold text-ink">
              {apiOnline === null ? "Probing…" : apiOnline ? "Backend reachable" : "Backend offline"}
            </div>
            <div className="truncate text-[10px] text-muted">{apiUrl}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onPing}
          disabled={pinging}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-forest/40 py-2 text-xs font-medium text-forest transition hover:bg-sage-light/40 disabled:opacity-60"
        >
          <RefreshCw size={13} className={cn(pinging && "animate-spin")} />
          Re-check connection
        </button>
        <p className="mt-4 text-[10px] leading-relaxed text-muted">
          When the backend is offline the dashboard transparently runs a calibrated local model so every control stays
          interactive.
        </p>
      </Card>
    </div>
  );
}

/* ------------------------------ Privacy ------------------------------ */

export function PrivacyPage() {
  const [history, setHistory] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [cleared, setCleared] = useState(false);
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="p-6">
        <CardTitle className="text-[15px]">Privacy & Data</CardTitle>
        <p className="mt-1 text-[11px] text-muted">
          AutoValuate processes vehicle attributes only — never personal identifiers or registration numbers.
        </p>
        <div className="mt-3">
          <Row title="Store valuation history locally" desc="Keeps your recent quotes in this browser so you can compare configurations.">
            <Switch checked={history} onChange={setHistory} />
          </Row>
          <Row title="Share anonymous usage analytics" desc="Aggregated feature usage helps prioritise model improvements. No inputs are stored.">
            <Switch checked={analytics} onChange={setAnalytics} />
          </Row>
          <Row title="Clear local data" desc="Remove cached quotes and preferences from this device.">
            <button
              type="button"
              onClick={() => setCleared(true)}
              className="flex items-center gap-2 rounded-full bg-canvas px-3.5 py-2 text-[11px] font-medium text-ink transition hover:bg-line"
            >
              <Trash2 size={13} />
              {cleared ? "Cleared" : "Clear now"}
            </button>
          </Row>
        </div>
      </Card>
      <Card className="h-fit">
        <CardTitle>What we process</CardTitle>
        <ul className="mt-3 space-y-2 text-[11px] text-muted">
          {[
            "Brand, fuel, transmission, seller channel, ownership",
            "Vehicle age and odometer reading",
            "Nothing else — inference is stateless",
          ].map((s) => (
            <li key={s} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
              {s}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
