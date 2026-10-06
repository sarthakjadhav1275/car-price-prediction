import { useCallback, useEffect, useMemo, useState } from "react";
import { APP, BRANDS, DEFAULT_INPUT, type CarInput, type PredictionResult } from "./config";
import { pingApi, predict, predictLocally } from "./lib/engine";
import Sidebar, { MobileNav, NAV, type Page } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardPage from "./pages/DashboardPage";
import ValuatePage from "./pages/ValuatePage";
import { PrivacyPage, ReportsPage, SettingsPage } from "./pages/MiscPages";

const SUBTITLES: Record<Page, string> = {
  dashboard: "Overview of engine activity and your live valuation",
  valuate: "Configure a vehicle and get a model-backed fair value",
  reports: "Benchmarks for every regressor in the training run",
  settings: "Inference service and workspace preferences",
  privacy: "How AutoValuate handles your data",
};

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [input, setInputState] = useState<CarInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<PredictionResult>(() => predictLocally(DEFAULT_INPUT));
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState(0);
  const [query, setQuery] = useState("");

  const [apiUrl, setApiUrl] = useState(APP.apiBaseUrl);
  const [useApi, setUseApi] = useState(true);
  const [autoRun, setAutoRun] = useState(true);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [pinging, setPinging] = useState(false);

  const ping = useCallback(async () => {
    setPinging(true);
    setApiOnline(null);
    const ok = await pingApi(apiUrl);
    setApiOnline(ok);
    setPinging(false);
  }, [apiUrl]);

  useEffect(() => {
    void ping();
  }, [ping]);

  const run = useCallback(
    async (payload: CarInput) => {
      setLoading(true);
      const res = await predict(payload, useApi && apiOnline === true, apiUrl);
      setResult(res);
      setRuns((r) => r + 1);
      setLoading(false);
    },
    [useApi, apiOnline, apiUrl],
  );

  // Debounced auto-inference
  useEffect(() => {
    if (!autoRun) return;
    const t = window.setTimeout(() => void run(input), 420);
    return () => window.clearTimeout(t);
  }, [input, run, autoRun]);

  const setInput = useCallback((updater: (prev: CarInput) => CarInput) => setInputState(updater), []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return BRANDS.filter((b) => b.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const pickBrand = (brand: string) => {
    setInputState((p) => ({ ...p, brand }));
    setQuery("");
    setPage("valuate");
  };

  const current = NAV.find((n) => n.key === page)!;

  return (
    <div className="flex min-h-screen items-stretch justify-center bg-page p-3 sm:p-5 lg:p-7">
      <div className="flex w-full max-w-[1380px] flex-col overflow-hidden rounded-[28px] bg-forest shadow-[0_30px_80px_-30px_rgba(31,86,65,0.55)] lg:flex-row">
        <Sidebar page={page} onNavigate={setPage} />
        <MobileNav page={page} onNavigate={setPage} />

        <main className="m-2 min-w-0 flex-1 rounded-[22px] bg-canvas p-4 sm:p-5 lg:ml-0 lg:p-6">
          <Topbar query={query} onQuery={setQuery} matches={matches} onPick={pickBrand} onNew={() => setPage("valuate")} />

          <div className="mt-6 mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-ink">{current.label}</h1>
              <p className="text-[11px] text-muted">{SUBTITLES[page]}</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <span className="rounded-full bg-white px-2.5 py-1 font-medium text-ink">
                {runs} run{runs === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-medium text-ink">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    apiOnline === null ? "bg-line" : apiOnline && useApi ? "bg-forest" : "bg-tangerine"
                  }`}
                />
                {apiOnline === null ? "probing api" : apiOnline && useApi ? "live api" : "simulation mode"}
              </span>
            </div>
          </div>

          <div key={page} className="animate-fade-up">
            {page === "dashboard" && (
              <DashboardPage
                input={input}
                result={result}
                loading={loading}
                runs={runs}
                onTransmission={(v) => setInputState((p) => ({ ...p, transmission: v }))}
                onPickBrand={pickBrand}
              />
            )}
            {page === "valuate" && (
              <ValuatePage input={input} setInput={setInput} result={result} loading={loading} onRun={() => void run(input)} />
            )}
            {page === "reports" && <ReportsPage />}
            {page === "settings" && (
              <SettingsPage
                apiUrl={apiUrl}
                setApiUrl={setApiUrl}
                useApi={useApi}
                setUseApi={setUseApi}
                autoRun={autoRun}
                setAutoRun={setAutoRun}
                apiOnline={apiOnline}
                onPing={() => void ping()}
                pinging={pinging}
              />
            )}
            {page === "privacy" && <PrivacyPage />}
          </div>

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[10px] text-muted">
            <span>
              {APP.title} · {APP.tagline}
            </span>
            <span>
              {APP.currency} · active model {result.best_model}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
