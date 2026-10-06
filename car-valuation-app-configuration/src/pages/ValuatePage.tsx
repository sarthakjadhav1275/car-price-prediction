import { RotateCcw } from "lucide-react";
import {
  AGE_RANGE,
  BRANDS,
  DEFAULT_INPUT,
  FUELS,
  KM_PRESETS,
  KM_RANGE,
  OWNERS,
  SELLER_TYPES,
  TRANSMISSIONS,
  type CarInput,
  type PredictionResult,
} from "../config";
import { FieldLabel, Pills, SelectField, Segmented, Slider } from "../components/Controls";
import ResultPanel from "../components/ResultPanel";
import { Card } from "../components/ui";
import { cn } from "../utils/cn";

export default function ValuatePage({
  input,
  setInput,
  result,
  loading,
  onRun,
}: {
  input: CarInput;
  setInput: (updater: (prev: CarInput) => CarInput) => void;
  result: PredictionResult;
  loading: boolean;
  onRun: () => void;
}) {
  const set = <K extends keyof CarInput>(key: K, value: CarInput[K]) =>
    setInput((p) => ({ ...p, [key]: value }));

  return (
    <div className="grid gap-4 xl:grid-cols-[370px_minmax(0,1fr)]">
      <Card className="h-fit xl:sticky xl:top-4">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Vehicle Configuration</h2>
            <p className="mt-0.5 text-[11px] text-muted">7 input features · auto-inference on change</p>
          </div>
          <button
            type="button"
            onClick={() => setInput(() => DEFAULT_INPUT)}
            className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-[10px] font-medium text-muted transition hover:bg-line hover:text-ink"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <FieldLabel label="Brand / Manufacturer" hint={`${BRANDS.length} brands`} />
            <SelectField value={input.brand} options={BRANDS} onChange={(v) => set("brand", v)} />
          </div>

          <div>
            <FieldLabel label="Fuel Type" />
            <Pills value={input.fuel} options={FUELS} onChange={(v) => set("fuel", v)} />
          </div>

          <div>
            <FieldLabel label="Transmission" />
            <Segmented value={input.transmission} options={TRANSMISSIONS} onChange={(v) => set("transmission", v)} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
            <div>
              <FieldLabel label="Seller Channel" />
              <SelectField value={input.seller_type} options={SELLER_TYPES} onChange={(v) => set("seller_type", v)} />
            </div>
            <div>
              <FieldLabel label="Ownership History" />
              <SelectField value={input.owner} options={OWNERS} onChange={(v) => set("owner", v)} />
            </div>
          </div>

          <div>
            <FieldLabel label="Vehicle Age" hint={`${input.car_age} ${input.car_age === 1 ? "Year" : "Years"}`} />
            <Slider
              value={input.car_age}
              min={AGE_RANGE.min}
              max={AGE_RANGE.max}
              step={AGE_RANGE.step}
              onChange={(v) => set("car_age", v)}
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>{AGE_RANGE.min}</span>
              <span>{AGE_RANGE.max} yrs</span>
            </div>
          </div>

          <div>
            <FieldLabel label="Kilometres Driven" hint={`${input.km_driven.toLocaleString("en-IN")} km`} />
            <Slider
              value={input.km_driven}
              min={KM_RANGE.min}
              max={KM_RANGE.max}
              step={KM_RANGE.step}
              onChange={(v) => set("km_driven", v)}
            />
            <div className="mt-1 flex flex-wrap gap-2">
              {KM_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set("km_driven", p)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-medium transition",
                    input.km_driven === p ? "bg-sage-light text-forest" : "bg-canvas text-muted hover:bg-line hover:text-ink",
                  )}
                >
                  {(p / 1000).toFixed(0)}k km
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRun}
          disabled={loading}
          className="relative mt-6 w-full overflow-hidden rounded-full bg-forest py-3 text-[13px] font-semibold text-white transition hover:bg-forest-dark disabled:opacity-70"
        >
          {loading && <span className="sweep absolute inset-0" />}
          <span className="relative">{loading ? "Running inference…" : "Run Valuation"}</span>
        </button>
      </Card>

      <ResultPanel result={result} input={input} loading={loading} />
    </div>
  );
}
